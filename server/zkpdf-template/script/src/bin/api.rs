use alloy_sol_types::SolType;
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
use std::path::PathBuf;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};
use zkpdf_template_lib::PublicValuesStruct;

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

    create_proof_fixture(&proof, &vk, ProofSystem::Groth16);

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
) {
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
}
