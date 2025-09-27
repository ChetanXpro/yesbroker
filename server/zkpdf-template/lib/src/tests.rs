
use crate::{GSTCertificate, PropertyOwnershipCertificate};

#[test]
fn test_property_ownership_verification() {
    // Create a mock PDF content that contains property ownership information
    // For testing purposes, we'll use a simple text-based approach
    let test_pdf_content =
        b"Property Document\nThe property no: 1 belong to Mr. Ajay.\nEnd of document";

    // This is a simplified test - in reality, you'd need proper PDF with signature
    // For now, we just test that the regex patterns work correctly
    let full_text = String::from_utf8_lossy(test_pdf_content);

    // Test the property pattern regex
    let property_pattern = regex::Regex::new(r"(?im)(?:the\s+)?property\s*:?\s*(?:no\.?:?\s*)?([^\s]+)\s+belong[s]?\s+to\s+(.+?)(?:\.$|\n|$)").unwrap();

    if let Some(captures) = property_pattern.captures(&full_text) {
        let property_number = captures
            .get(1)
            .map(|m| m.as_str().trim().to_string())
            .unwrap();
        let owner_name = captures
            .get(2)
            .map(|m| m.as_str().trim().to_string())
            .unwrap();

        assert_eq!(property_number, "1");
        assert_eq!(owner_name, "Mr. Ajay");
    } else {
        panic!("Property pattern did not match the test content");
    }
}

#[test]
fn test_property_regex_variations() {
    // Test different variations of property ownership text
    let test_cases = vec![
        (
            "The property no: 123 belong to John Doe.",
            "123",
            "John Doe",
        ),
        (
            "property no 456 belongs to Jane Smith.",
            "456",
            "Jane Smith",
        ),
        (
            "The property 789 belong to Mr. & Mrs. Brown.",
            "789",
            "Mr. & Mrs. Brown",
        ),
        (
            "Property: ABC123 belong to Company Ltd.",
            "ABC123",
            "Company Ltd",
        ),
    ];

    let property_pattern = regex::Regex::new(r"(?im)(?:the\s+)?property\s*:?\s*(?:no\.?:?\s*)?([^\s]+)\s+belong[s]?\s+to\s+(.+?)(?:\.$|\n|$)").unwrap();

    for (text, expected_number, expected_owner) in test_cases {
        if let Some(captures) = property_pattern.captures(text) {
            let property_number = captures
                .get(1)
                .map(|m| m.as_str().trim().to_string())
                .unwrap();
            let owner_name = captures
                .get(2)
                .map(|m| m.as_str().trim().to_string())
                .unwrap();

            assert_eq!(
                property_number, expected_number,
                "Failed for text: {}",
                text
            );
            assert_eq!(owner_name, expected_owner, "Failed for text: {}", text);
        } else {
            panic!("Property pattern did not match the text: {}", text);
        }
    }
}

#[test]
fn test_commitment_generation() {
    use crate::utils::{generate_commitment, generate_property_commitment};
    use zkpdf_lib::PdfSignatureResult;

    // Create mock certificate data
    let mock_signature = PdfSignatureResult {
        message_digest: vec![1, 2, 3, 4, 5],
        public_key: vec![6, 7, 8, 9, 10],
        is_valid: true,
    };

    let gst_cert = GSTCertificate {
        gst_number: "07AAATC0869P1ZB".to_string(),
        legal_name: "Test Company".to_string(),
        signature: mock_signature.clone(),
    };

    let property_cert = PropertyOwnershipCertificate {
        property_number: "1".to_string(),
        owner_name: "Mr. Ajay".to_string(),
        signature: mock_signature,
    };

    // Test that commitment generation works
    let gst_commitment = generate_commitment(&gst_cert);
    let property_commitment = generate_property_commitment(&property_cert);

    // Commitments should be different for different data
    assert_ne!(gst_commitment, property_commitment);

    // Commitments should be 32 bytes
    assert_eq!(gst_commitment.len(), 32);
    assert_eq!(property_commitment.len(), 32);
}
