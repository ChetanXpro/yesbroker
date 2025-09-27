//! Property Ownership Certificate Verification Program
//!
//! This program verifies Property Ownership certificate PDFs and extracts key information:
//! - Property number
//! - Owner name
//! - Digital signature validity
//! - Document commitment hash
//! - Public key hash
//!
//! The program runs inside the SP1 zkVM to generate zero-knowledge proofs
//! that prove the document is valid without revealing sensitive data.

// These two lines are necessary for the program to properly compile.
//
// Under the hood, we wrap your main function with some extra code so that it behaves properly
// inside the zkVM.
#![no_main]
sp1_zkvm::entrypoint!(main);

use alloy_primitives::keccak256;
use alloy_sol_types::SolType;

use zkpdf_template_lib::{
    utils::generate_property_commitment, verify_property_ownership_certificate, PublicValuesStruct,
};

pub fn main() {
    // Read PDF bytes as input to the program.
    // Behind the scenes, this compiles down to a custom system call which handles reading inputs
    // from the prover.
    let pdf_bytes = sp1_zkvm::io::read::<Vec<u8>>();

    // Verify the Property Ownership certificate and extract information.
    let property_cert = verify_property_ownership_certificate(pdf_bytes)
        .expect("Failed to verify Property Ownership certificate");

    // Generate commitment hash using the new function
    let document_commitment = generate_property_commitment(&property_cert);
    let public_key_hash = keccak256(&property_cert.signature.public_key);

    // Encode the public values of the program using property data
    let bytes = PublicValuesStruct::abi_encode(&PublicValuesStruct {
        property_number: property_cert.property_number,
        owner_name: property_cert.owner_name,
        signature_valid: property_cert.signature.is_valid,
        document_commitment: document_commitment
            .as_slice()
            .try_into()
            .expect("Failed to convert document commitment to FixedBytes"),
        public_key_hash: public_key_hash
            .as_slice()
            .try_into()
            .expect("Failed to convert public key hash to FixedBytes"),
    });

    // Commit to the public values of the program. The final proof will have a commitment to all the
    // bytes that were committed to.
    sp1_zkvm::io::commit_slice(&bytes);
}
