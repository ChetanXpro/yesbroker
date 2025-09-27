use alloy_sol_types::SolType;
use axum::{
    response::Html,
    routing::{get, post},
    serve, Json, Router,
};
use clap::ValueEnum;
use serde::{Deserialize, Serialize};
use sp1_sdk::{
    include_elf, EnvProver, ProverClient, SP1ProofWithPublicValues, SP1ProvingKey, SP1Stdin,
};
use sp1_sdk::{HashableKey, SP1VerifyingKey};
use std::net::SocketAddr;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};
use zkpdf_template_lib::PublicValuesStruct;

use alloy::{
    primitives::{Address, Bytes},
    providers::{Provider, ProviderBuilder},
    sol,
    transports::http::{Http},
};
use std::str::FromStr;

// Define the contract interface using Alloy's sol! macro
sol! {
    #[allow(missing_docs)]
    #[sol(rpc)]
    contract PdfVerifier {
        struct PublicValuesStruct {
            bool result;
        }

        function verifyPdfProof(
            bytes calldata _publicValues,
            bytes calldata _proofBytes
        ) public view returns (bool);
    }
}

async fn verify_with_raw_hex(
    provider_url: &str,
    contract_address: &str,
    public_values_hex: &str,
    proof_bytes_hex: &str,
) -> Result<bool, Box<dyn std::error::Error>> {
    let provider = ProviderBuilder::new().on_http(provider_url.parse()?);

    let contract_addr = Address::from_str(contract_address)?;
    let contract = PdfVerifier::new(contract_addr, &provider);

    let public_values = Bytes::from_str(public_values_hex)?;
    let proof_bytes = Bytes::from_str(proof_bytes_hex)?;

    let result = contract.verifyPdfProof(public_values, proof_bytes).call().await?;
    Ok(result._0)
}

pub const ZKPDF_ELF: &[u8] = include_elf!("zkpdf-template-program");

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

/// A fixture that can be used to test the verification of SP1 zkVM proofs inside Solidity.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SP1PropertyProofFixture {
    property_number: String,
    owner_name: String,
    signature_valid: bool,
    document_commitment: String,
    public_key_hash: String,
    vkey: String,
    public_values: String,
    proof: String,
}

async fn prove_and_register(
    Json(body): Json<ProofRequest>,
) -> Result<Json<SP1ProofWithPublicValues>, String> {
    let client = ProverClient::from_env();
    let (pk, vk) = client.setup(ZKPDF_ELF);
    let proof = prove(Json(body), pk, client).await?;
    let fixture = create_proof_fixture(&proof, &vk, ProofSystem::Groth16)?;
    match verify_with_raw_hex(
        &std::env::var("RPC_URL").expect("Failed to read RPC_URL env variable"),
        &std::env::var("VERIFIER_CONTRACT").expect("Failed to read VERIFIER_CONTRACT env variable"),
        &fixture.public_values,
        &fixture.proof,
    )
    .await
    .expect("failed to verify proof on chain")
    {
        true => Ok(proof),
        false => Err(String::from("Proof verification failed on chain")),
    }
}

async fn prove(
    Json(body): Json<ProofRequest>,
    pk: SP1ProvingKey,
    client: EnvProver,
) -> Result<Json<SP1ProofWithPublicValues>, String> {
    let ProofRequest { pdf_bytes } = body;

    let mut stdin = SP1Stdin::new();
    stdin.write(&pdf_bytes);

    let proof = client
        .prove(&pk, &stdin)
        .groth16()
        .run()
        .map_err(|e| format!("Proof generation failed: {}", e))?;

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
        .route("/proof_and_register", post(prove_and_register))
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

/// Create a fixture for the given proof.
fn create_proof_fixture(
    proof: &SP1ProofWithPublicValues,
    vk: &SP1VerifyingKey,
    system: ProofSystem,
) -> Result<SP1PropertyProofFixture, String> {
    // Deserialize the public values.
    let bytes = proof.public_values.as_slice();
    let decoded = PublicValuesStruct::abi_decode(bytes).unwrap();

    // Create the testing fixture so we can test things end-to-end.
    let fixture = SP1PropertyProofFixture {
        property_number: decoded.property_number,
        owner_name: decoded.owner_name,
        signature_valid: decoded.signature_valid,
        document_commitment: format!("0x{}", hex::encode(decoded.document_commitment.as_slice())),
        public_key_hash: format!("0x{}", hex::encode(decoded.public_key_hash.as_slice())),
        vkey: vk.bytes32().to_string(),
        public_values: format!("0x{}", hex::encode(bytes)),
        proof: format!("0x{}", hex::encode(proof.bytes())),
    };

    // The verification key is used to verify that the proof corresponds to the execution of the
    // program on the given input.
    println!("Verification Key: {}", fixture.vkey);
    println!(
        "Property Number: {}\nOwner Name: {}\nSignature Valid: {}\nDocument Commitment: {}\nPublic Key Hash: {}",
        fixture.property_number,
        fixture.owner_name,
        fixture.signature_valid,
        fixture.document_commitment,
        fixture.public_key_hash
    );
    println!("Public Values: {}", fixture.public_values);
    println!("Proof Bytes: {}", fixture.proof);

    // Save the fixture to a file.
    let fixture_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../contracts/src/fixtures");
    std::fs::create_dir_all(&fixture_path).expect("failed to create fixture path");
    std::fs::write(
        fixture_path.join(format!("{:?}-fixture.json", system).to_lowercase()),
        serde_json::to_string_pretty(&fixture).unwrap(),
    )
    .expect("failed to write fixture");

    Ok(fixture)
}
