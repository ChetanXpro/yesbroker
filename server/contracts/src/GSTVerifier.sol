// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ISP1Verifier} from "@sp1-contracts/ISP1Verifier.sol";

struct PublicValuesStruct {
    string gst_number;
    string legal_name;
    bool signature_valid;
    bytes32 document_commitment;
    bytes32 public_key_hash;
}

struct PropertyPublicValuesStruct {
    string property_number;
    string owner_name;
    bool signature_valid;
    bytes32 document_commitment;
    bytes32 public_key_hash;
}

/// @title CertificateVerifier.
/// @author Succinct Labs
/// @notice This contract implements certificate verification (GST and Property Ownership) using SP1 zkVM proofs.
contract CertificateVerifier {
    /// @notice The address of the SP1 verifier contract.
    /// @dev This can either be a specific SP1Verifier for a specific version, or the
    ///      SP1VerifierGateway which can be used to verify proofs for any version of SP1.
    ///      For the list of supported verifiers on each chain, see:
    ///      https://github.com/succinctlabs/sp1-contracts/tree/main/contracts/deployments
    address public verifier;

    /// @notice The verification key for the GST verification program.
    bytes32 public gstProgramVKey;

    /// @notice The verification key for the Property Ownership verification program.
    bytes32 public propertyProgramVKey;

    /// @notice Mapping to store verified certificates (both GST and Property)
    mapping(bytes32 => bool) public verifiedCertificates;

    /// @notice Mapping to store verified public key hashes
    mapping(bytes32 => bool) public verifiedPublicKeys;

    /// @notice Mapping to store verified property ownership certificates
    mapping(bytes32 => bool) public verifiedPropertyCertificates;

    /// @notice Event emitted when a GST certificate is verified
    event GSTCertificateVerified(
        string indexed gst_number,
        string legal_name,
        bytes32 document_commitment,
        bytes32 public_key_hash
    );

    /// @notice Event emitted when a Property Ownership certificate is verified
    event PropertyCertificateVerified(
        string indexed property_number,
        string owner_name,
        bytes32 document_commitment,
        bytes32 public_key_hash
    );

    constructor(address _verifier, bytes32 _propertyProgramVKey) {
        verifier = _verifier;
     
        propertyProgramVKey = _propertyProgramVKey;
    }

    /// @notice The entrypoint for verifying the proof of a GST certificate.
    /// @param _publicValues The encoded public values.
    /// @param _proofBytes The encoded proof.
    function verifyGSTProof(bytes calldata _publicValues, bytes calldata _proofBytes)
        public
        view
        returns (string memory, string memory, bool, bytes32, bytes32)
    {
        ISP1Verifier(verifier).verifyProof(gstProgramVKey, _publicValues, _proofBytes);
        PublicValuesStruct memory publicValues = abi.decode(_publicValues, (PublicValuesStruct));
        return (
            publicValues.gst_number,
            publicValues.legal_name,
            publicValues.signature_valid,
            publicValues.document_commitment,
            publicValues.public_key_hash
        );
    }

    /// @notice Verify GST certificate and store the verification result
    /// @param _publicValues The encoded public values.
    /// @param _proofBytes The encoded proof.
    function verifyAndStoreGST(bytes calldata _publicValues, bytes calldata _proofBytes)
        external
        returns (string memory, string memory, bool, bytes32, bytes32)
    {
        ISP1Verifier(verifier).verifyProof(gstProgramVKey, _publicValues, _proofBytes);
        PublicValuesStruct memory publicValues = abi.decode(_publicValues, (PublicValuesStruct));
        
        // Store verification results
        verifiedCertificates[publicValues.document_commitment] = true;
        verifiedPublicKeys[publicValues.public_key_hash] = true;

        // Emit event
        emit GSTCertificateVerified(
            publicValues.gst_number,
            publicValues.legal_name,
            publicValues.document_commitment,
            publicValues.public_key_hash
        );

        return (
            publicValues.gst_number,
            publicValues.legal_name,
            publicValues.signature_valid,
            publicValues.document_commitment,
            publicValues.public_key_hash
        );
    }

    /// @notice Check if a document commitment has been verified
    /// @param _documentCommitment The document commitment to check
    function isDocumentVerified(bytes32 _documentCommitment) external view returns (bool) {
        return verifiedCertificates[_documentCommitment];
    }

    /// @notice Check if a public key hash has been verified
    /// @param _publicKeyHash The public key hash to check
    function isPublicKeyVerified(bytes32 _publicKeyHash) external view returns (bool) {
        return verifiedPublicKeys[_publicKeyHash];
    }

    /// @notice The entrypoint for verifying the proof of a Property Ownership certificate.
    /// @param _publicValues The encoded public values.
    /// @param _proofBytes The encoded proof.
    function verifyPropertyProof(bytes calldata _publicValues, bytes calldata _proofBytes)
        public
        view
        returns (string memory, string memory, bool, bytes32, bytes32)
    {
        ISP1Verifier(verifier).verifyProof(propertyProgramVKey, _publicValues, _proofBytes);
        PropertyPublicValuesStruct memory publicValues = abi.decode(_publicValues, (PropertyPublicValuesStruct));
        return (
            publicValues.property_number,
            publicValues.owner_name,
            publicValues.signature_valid,
            publicValues.document_commitment,
            publicValues.public_key_hash
        );
    }

    /// @notice Verify Property Ownership certificate and store the verification result
    /// @param _publicValues The encoded public values.
    /// @param _proofBytes The encoded proof.
    function verifyAndStoreProperty(bytes calldata _publicValues, bytes calldata _proofBytes)
        external
        returns (string memory, string memory, bool, bytes32, bytes32)
    {
        ISP1Verifier(verifier).verifyProof(propertyProgramVKey, _publicValues, _proofBytes);
        PropertyPublicValuesStruct memory publicValues = abi.decode(_publicValues, (PropertyPublicValuesStruct));
        
        // Store verification results
        verifiedPropertyCertificates[publicValues.document_commitment] = true;
        verifiedPublicKeys[publicValues.public_key_hash] = true;

        // Emit event
        emit PropertyCertificateVerified(
            publicValues.property_number,
            publicValues.owner_name,
            publicValues.document_commitment,
            publicValues.public_key_hash
        );

        return (
            publicValues.property_number,
            publicValues.owner_name,
            publicValues.signature_valid,
            publicValues.document_commitment,
            publicValues.public_key_hash
        );
    }

    /// @notice Check if a property certificate has been verified
    /// @param _documentCommitment The document commitment to check
    function isPropertyVerified(bytes32 _documentCommitment) external view returns (bool) {
        return verifiedPropertyCertificates[_documentCommitment];
    }
}
