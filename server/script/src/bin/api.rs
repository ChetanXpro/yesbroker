use alloy_sol_types::SolType;
use alloy::{
    network::EthereumWallet,
    primitives::{Address, Bytes, U256},
    providers::{Provider, ProviderBuilder},
    rpc::types::TransactionReceipt,
    signers::{local::PrivateKeySigner, Signer},
    sol,
    transports::http::{Client, Http},
};
use axum::{
    response::Html,
    routing::{get, post},
    serve, Json, Router,
};
use clap::ValueEnum;
use serde::{Deserialize, Serialize};
use sp1_sdk::{include_elf, ProverClient, SP1ProofWithPublicValues, SP1Stdin};
use sp1_sdk::{HashableKey, SP1VerifyingKey};
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};
use zkpdf_template_lib::PublicValuesStruct;

pub const ZKPDF_ELF: &[u8] = include_elf!("zkpdf-template-program");

// Define the contract interface using alloy's sol! macro
sol! {
    #[allow(missing_docs)]
    #[sol(rpc)]
    contract GSTVerifier {
        function verifyAndStoreProperty(bytes calldata _publicValues, bytes calldata _proofBytes)
            external
            returns (string memory, string memory, bool, bytes32, bytes32);
    }
}

#[derive(Deserialize)]
struct ProofRequest {
    pdf_bytes: Vec<u8>,
}

#[derive(Serialize)]
struct VerifyResponse {
    valid: bool,
    error: Option<String>,
}

/// Enum representing the available proof systems
#[derive(Copy, Clone, PartialEq, Eq, PartialOrd, Ord, ValueEnum, Debug)]
enum ProofSystem {
    Plonk,
    Groth16,
}


async fn prove(Json(body): Json<ProofRequest>) -> Result<Json<SP1ProofWithPublicValues>, String> {
    let client = ProverClient::from_env();
    let (pk, vk) = client.setup(ZKPDF_ELF);

    let ProofRequest { pdf_bytes } = body;

    let mut stdin = SP1Stdin::new();
    stdin.write(&pdf_bytes);

    let proof = client
        .prove(&pk, &stdin)
        .groth16()
        .run()
        .map_err(|e| format!("Proof generation failed: {}", e))?;

    // Call the contract to verify and store the property proof
    match verify_and_store_property(&proof, &vk, ProofSystem::Groth16).await {
        Ok(receipt) => {
            println!("✅ Successfully verified and stored property proof on-chain!");
            println!("   Transaction Hash: {:?}", receipt.transaction_hash);
        }
        Err(e) => {
            println!("❌ Failed to verify and store property proof: {}", e);
            return Err(format!("Contract interaction failed: {}", e));
        }
    }

    Ok(Json(proof))
}

async fn verify(Json(proof): Json<SP1ProofWithPublicValues>) -> Json<VerifyResponse> {
    let client = ProverClient::from_env();
    let (_pk, vk) = client.setup(ZKPDF_ELF);

    match client.verify(&proof, &vk) {
        Ok(_) => Json(VerifyResponse {
            valid: true,
            error: None,
        }),
        Err(e) => Json(VerifyResponse {
            valid: false,
            error: Some(format!("Verification failed: {}", e)),
        }),
    }
}

async fn index() -> Html<&'static str> {
    Html(include_str!("../../index.html"))
}

#[tokio::main]
async fn main() {
    sp1_sdk::utils::setup_logger();
    dotenv::dotenv().ok();

    let prover = std::env::var("SP1_PROVER").unwrap_or_default();
    let key = std::env::var("NETWORK_PRIVATE_KEY").unwrap_or_default();

    println!("prover: {}", prover);
    println!("key: {}", key);

    assert_eq!(prover, "network", "SP1_PROVER must be set to 'network'");
    assert!(
        key.starts_with("0x") && key.len() > 10,
        "Invalid or missing NETWORK_PRIVATE_KEY"
    );

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(index))
        .route("/prove", post(prove))
        .route("/verify", post(verify))
        .layer(cors);

    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(3000);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!("listening on {}", addr);

    let listener = TcpListener::bind(addr).await.unwrap();
    serve(listener, app.into_make_service()).await.unwrap();
}

/// Call the contract to verify and store the property proof.
async fn verify_and_store_property(
    proof: &SP1ProofWithPublicValues,
    vk: &SP1VerifyingKey,
    system: ProofSystem,
) -> Result<TransactionReceipt, Box<dyn std::error::Error>> {
    // Deserialize the public values.
    let bytes = proof.public_values.as_slice();
    let decoded = PublicValuesStruct::abi_decode(bytes).unwrap();

    // Print the values for logging
    println!("Verification Key: {}", vk.bytes32().to_string());
    println!(
        "Property Number: {}\nOwner Name: {}\nSignature Valid: {}\nDocument Commitment: 0x{}\nPublic Key Hash: 0x{}",
        decoded.property_number,
        decoded.owner_name,
        decoded.signature_valid,
        hex::encode(decoded.document_commitment.as_slice()),
        hex::encode(decoded.public_key_hash.as_slice())
    );
    println!("Public Values: 0x{}", hex::encode(bytes));
    println!("Proof Bytes: 0x{}", hex::encode(proof.bytes()));

    // Get contract address, RPC URL, and private key from environment variables
    let contract_address = std::env::var("CONTRACT_ADDRESS")
        .expect("CONTRACT_ADDRESS environment variable not set")
        .parse::<Address>()?;
    
    let rpc_url = std::env::var("RPC_URL")
        .unwrap_or_else(|_| "http://localhost:8545".to_string());

    let private_key = std::env::var("PRIVATE_KEY")
        .unwrap_or_else(|_| "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80".to_string());

    // Create signer from private key
    let signer: PrivateKeySigner = private_key.parse()
        .map_err(|e| format!("Invalid private key: {}", e))?;

    // Create provider with signer
    let wallet = EthereumWallet::from(signer);
    let provider = ProviderBuilder::new()
        .with_recommended_fillers()
        .wallet(wallet)
        .on_http(rpc_url.parse()?);

    // Create contract instance
    let contract = GSTVerifier::new(contract_address, provider);

    // Prepare the call data
    let public_values = Bytes::from(bytes.to_vec());
    let proof_bytes = Bytes::from(proof.bytes().to_vec());

    // Call the contract function
    println!("Calling contract at address: {}", contract_address);
    let call = contract.verifyAndStoreProperty(public_values, proof_bytes);
    
    // Execute the transaction
    println!("Sending transaction to blockchain...");
    let pending_tx = call.send().await
        .map_err(|e| format!("Failed to send transaction: {}", e))?;
    
    println!("Transaction sent! Hash: {:?}", pending_tx.tx_hash());
    
    // Wait for the transaction to be mined
    let receipt = pending_tx.get_receipt().await
        .map_err(|e| format!("Failed to get transaction receipt: {}", e))?;
    
    println!("Transaction successful!");
    println!("  Transaction Hash: {:?}", receipt.transaction_hash);
    println!("  Block Number: {:?}", receipt.block_number);
    println!("  Gas Used: {:?}", receipt.gas_used);
    
    if receipt.status() {
        println!("  Status: Success ✅");
    } else {
        println!("  Status: Failed ❌");
        return Err("Transaction failed on-chain".into());
    }
    
    Ok(receipt)
}
