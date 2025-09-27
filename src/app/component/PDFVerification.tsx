"use client";
import { loadWasm } from "@/app/libs/wasm";
import React, { useState, useCallback, useMemo } from "react";

// Simple PDF Drop Zone Component
export function PDFDropZone({
    onFileProcessed,
    accept = ".pdf",
    label = "Property Documents",
}: any) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<any>(null);

    const processFile = useCallback(
        async (file: any) => {
            if (!file || file.type !== "application/pdf") {
                setError("Please upload a PDF file");
                return;
            }

            setIsProcessing(true);
            setError(null);

            try {
                const buffer = await file.arrayBuffer();
                const uint8 = new Uint8Array(buffer);

                // Basic WASM verification
                const wasm = await loadWasm();
                const result = wasm.wasm_verify_and_extract(uint8);

                onFileProcessed({
                    file,
                    buffer: uint8,
                    result,
                    isValid: result?.signature?.is_valid || false,
                    extractedText: result?.pages || [],
                });
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsProcessing(false);
            }
        },
        [onFileProcessed]
    );

    const onDrop = useCallback(
        async (e: any) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) await processFile(file);
        },
        [processFile]
    );

    const onFileChange = async (e: any) => {
        const file = e.target.files?.[0];
        if (file) await processFile(file);
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">{label} *</label>

            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                    isDragOver
                        ? "border-indigo-400 bg-indigo-50"
                        : "border-gray-300 hover:border-gray-400"
                } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
                onDrop={onDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                }}
            >
                <input
                    type="file"
                    accept={accept}
                    onChange={onFileChange}
                    className="hidden"
                    id="pdf-upload"
                    disabled={isProcessing}
                />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                    {isProcessing ? (
                        <div className="flex items-center justify-center">
                            <svg
                                className="animate-spin h-6 w-6 text-indigo-600 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                ></path>
                            </svg>
                            <span className="text-gray-600">Verifying PDF...</span>
                        </div>
                    ) : (
                        <>
                            <svg
                                className="w-10 h-10 text-gray-400 mx-auto mb-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                ></path>
                            </svg>
                            <p className="text-gray-600 mb-1">
                                Upload Property Registration/Sale Deed
                            </p>
                            <p className="text-sm text-gray-500">
                                Click to browse or drag and drop PDF
                            </p>
                        </>
                    )}
                </label>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}
        </div>
    );
}

// Verification Status Component
export function VerificationStatus({ verificationResult, fileName }: any) {
    if (!verificationResult) return null;

    const { isValid, result } = verificationResult;

    return (
        <div className="space-y-3">
            <div
                className={`border rounded-lg p-4 ${
                    isValid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                }`}
            >
                <div className="flex items-center space-x-2">
                    {isValid ? (
                        <svg
                            className="w-5 h-5 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            ></path>
                        </svg>
                    ) : (
                        <svg
                            className="w-5 h-5 text-red-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            ></path>
                        </svg>
                    )}
                    <span className={`font-medium ${isValid ? "text-green-800" : "text-red-800"}`}>
                        {isValid ? "Document Verified" : "Verification Failed"}
                    </span>
                </div>

                <div className={`mt-2 text-sm ${isValid ? "text-green-700" : "text-red-700"}`}>
                    <p>
                        <strong>File:</strong> {fileName}
                    </p>
                    <p>
                        <strong>Digital Signature:</strong>{" "}
                        {isValid ? "Valid" : "Invalid or Missing"}
                    </p>
                    {result?.pages && (
                        <p>
                            <strong>Pages Extracted:</strong> {result.pages.length}
                        </p>
                    )}
                </div>

                {isValid && (
                    <div className="mt-3 text-xs text-green-600">
                        ✅ This document can be used for zkPDF proofs
                    </div>
                )}
            </div>
        </div>
    );
}

// Simple Property Document Upload Component (for your modal)
export function PropertyDocumentUpload({ onDocumentVerified, propertyId }: any) {
    const [verificationData, setVerificationData] = useState<any>(null);
    const [proofData, setProofData] = useState<string | null>(null);
    const [proofLoading, setProofLoading] = useState(false);
    const [proofError, setProofError] = useState<string | null>(null);


    const handleFileProcessed = useCallback(
        async (data: any) => {
            setVerificationData(data);
            onDocumentVerified?.(data);

            // Automatically generate proof if document is valid
            if (data.isValid && data.buffer) {
                setProofLoading(true);
                setProofError(null);
                setProofData(null);

                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_PROOF_API_BASE_URL || 'https://rhode-leslie-bags-chicken.trycloudflare.com'}/prove`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            pdf_bytes: Array.from(data.buffer),
                            property_id: propertyId?.toString() || "1"
                        }),
                    });

                    if (!response.ok) throw new Error(`Status ${response.status}`);

                    const proofResult = await response.json();
                    setProofData(JSON.stringify(proofResult, null, 2));
                } catch (error: any) {
                    if (error.message.includes("fetch") || error.message.includes("Failed to fetch")) {
                        setProofError("Prover API not running. Start the prover server.");
                    } else {
                        setProofError(error.message);
                    }
                } finally {
                    setProofLoading(false);
                }
            }
        },
        [onDocumentVerified, propertyId]
    );

    return (
        <div className="space-y-4">
            <PDFDropZone
                onFileProcessed={handleFileProcessed}
                label="Property Ownership Document"
            />

            {verificationData && (
                <VerificationStatus
                    verificationResult={verificationData}
                    fileName={verificationData.file?.name}
                />
            )}

            {/* Proof Generation Status */}
            {proofLoading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <svg
                            className="animate-spin h-5 w-5 text-blue-600 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                        </svg>
                        <span className="text-blue-800 font-medium">Generating zkProof...</span>
                    </div>
                </div>
            )}

            {proofError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm font-medium">Proof Generation Error:</p>
                    <p className="text-red-600 text-xs mt-1">{proofError}</p>
                </div>
            )}

            {proofData && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-800 font-medium mb-2">Generated zkProof:</p>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                        {proofData}
                    </pre>
                </div>
            )}
        </div>
    );
}

// Advanced Property Document Verification (for separate page)
export function AdvancedPropertyVerification() {
    const [verificationData, setVerificationData] = useState<any>(null);
    const [selectedText, setSelectedText] = useState("");
    const [textVerificationResult, setTextVerificationResult] = useState<any>(null);

    const handleFileProcessed = useCallback((data: any) => {
        setVerificationData(data);
    }, []);

    const verifySelectedText = async () => {
        if (!verificationData || !selectedText) return;

        try {
            const wasm = await loadWasm();
            const result = wasm.wasm_verify_text(
                verificationData.buffer,
                0, // page 0
                selectedText,
                0 // offset - you might want to calculate this
            );
            setTextVerificationResult(result);
        } catch (error) {
            console.error("Text verification failed:", error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Property Document Verification
                </h2>

                <PDFDropZone
                    onFileProcessed={handleFileProcessed}
                    label="Upload Property Document"
                />

                {verificationData && (
                    <div className="mt-6">
                        <VerificationStatus
                            verificationResult={verificationData}
                            fileName={verificationData.file?.name}
                        />
                    </div>
                )}
            </div>

            {verificationData?.extractedText?.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Extracted Document Text
                    </h3>

                    <div className="space-y-4">
                        <textarea
                            className="w-full h-40 p-3 border border-gray-300 rounded-lg resize-none font-mono text-sm"
                            value={verificationData.extractedText[0] || ""}
                            readOnly
                            onSelect={(e: any) => {
                                const target = e.target;
                                const selectedText = target.value.substring(
                                    target.selectionStart,
                                    target.selectionEnd
                                );
                                setSelectedText(selectedText);
                            }}
                            placeholder="Document text will appear here..."
                        />

                        {selectedText && (
                            <div className="space-y-3">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-blue-800 text-sm">
                                        <strong>Selected Text:</strong> &quot;{selectedText}&quot;
                                    </p>
                                </div>

                                <button
                                    onClick={verifySelectedText}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Verify Selected Text
                                </button>
                            </div>
                        )}

                        {textVerificationResult && (
                            <div
                                className={`border rounded-lg p-3 ${
                                    textVerificationResult.success
                                        ? "bg-green-50 border-green-200"
                                        : "bg-red-50 border-red-200"
                                }`}
                            >
                                <p
                                    className={`font-medium ${
                                        textVerificationResult.success
                                            ? "text-green-800"
                                            : "text-red-800"
                                    }`}
                                >
                                    Text Verification:{" "}
                                    {textVerificationResult.success ? "✅ Verified" : "❌ Failed"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
