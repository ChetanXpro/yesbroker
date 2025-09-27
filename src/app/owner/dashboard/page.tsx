"use client";
import { AddPropertyModal } from "@/app/component/AddPropertyModal";
import { PropertyImageSlider } from "@/app/component/PropertyImageSlider";
import { useState, useEffect } from "react";

// PDF Verification Components
function PDFDropZone({ onFileProcessed, accept = ".pdf", label = "Property Documents" }: any) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<any>(null);

    const processFile = async (file: any) => {
        if (!file || file.type !== "application/pdf") {
            setError("Please upload a PDF file");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const buffer = await file.arrayBuffer();
            const uint8 = new Uint8Array(buffer);

            // Mock verification for demo (replace with actual WASM call)
            const mockResult = {
                success: true,
                signature: { is_valid: Math.random() > 0.3 }, // 70% chance of valid
                pages: ["Mock extracted text from document..."],
            };

            onFileProcessed({
                file,
                buffer: uint8,
                result: mockResult,
                isValid: mockResult?.signature?.is_valid || false,
                extractedText: mockResult?.pages || [],
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const onDrop = async (e: any) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) await processFile(file);
    };

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

function VerificationStatus({ verificationResult, fileName }: any) {
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

function PropertyDocumentUpload({ onDocumentVerified }: any) {
    const [verificationData, setVerificationData] = useState<any>(null);

    const handleFileProcessed = (data: any) => {
        setVerificationData(data);
        onDocumentVerified?.(data);
    };

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
        </div>
    );
}

export default function OwnerDashboard() {
    const [activeTab, setActiveTab] = useState("properties");
    const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // Mock authentication - in real app, get from auth context
    const mockAuthToken = () => {
        // For demo purposes, create a mock token
        if (!localStorage.getItem('auth_token')) {
            localStorage.setItem('auth_token', 'mock-token-for-demo');
        }
        return localStorage.getItem('auth_token');
    };

    // Mock data for owner (in real app, get from authentication)
    const ownerData = {
        id: 1, // This should come from auth
        name: "Property Owner",
        kycStatus: "verified",
        totalProperties: properties.length,
        activeListings: properties.filter(p => p.status === 'available').length,
        totalInterests: 0,
        pendingInterests: 0,
    };

    // Fetch properties from API
    useEffect(() => {
        fetchProperties();
    }, [refreshKey]);

    const fetchProperties = async () => {
        setLoading(true);
        setError(null);
        try {
            // In real app, get owner_id from authentication
            const response = await fetch(`/api/properties?owner_id=${ownerData.id}`);
            const result = await response.json();

            if (result.success) {
                setProperties(result.data);
            } else {
                setError(result.error || 'Failed to fetch properties');
            }
        } catch (err) {
            setError('Network error while fetching properties');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePropertyAdded = (propertyData: any) => {
        console.log("Property added:", propertyData);
        setShowAddPropertyModal(false);
        // Refresh properties list
        setRefreshKey(prev => prev + 1);
    };

    const handleDeleteProperty = async (propertyId: number) => {
        if (!window.confirm('Are you sure you want to delete this property?')) {
            return;
        }

        try {
            const token = mockAuthToken();
            const response = await fetch(`/api/properties/${propertyId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (result.success) {
                // Refresh properties list
                setRefreshKey(prev => prev + 1);
            } else {
                alert(result.error || 'Failed to delete property');
            }
        } catch (err) {
            alert('Network error while deleting property');
            console.error('Delete error:', err);
        }
    };

    const recentInterests: any[] = [];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">YB</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">
                                    Welcome back, {ownerData.name}!
                                </h1>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500">Property Owner</span>
                                    {ownerData.kycStatus === "verified" && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <svg
                                                className="w-3 h-3 mr-1"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                ></path>
                                            </svg>
                                            KYC Verified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAddPropertyModal(true)}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        >
                            Add New Property
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Total Properties
                                </p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {ownerData.totalProperties}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                    ></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Listings</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {ownerData.activeListings}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    ></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Interests</p>
                                <p className="text-3xl font-bold text-purple-600">
                                    {ownerData.totalInterests}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-purple-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    ></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Pending Interests
                                </p>
                                <p className="text-3xl font-bold text-orange-600">
                                    {ownerData.pendingInterests}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-orange-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    ></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white rounded-xl shadow-sm border mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            {[
                                { id: "overview", label: "Overview" },
                                { id: "properties", label: "My Properties" },
                                { id: "interests", label: "Recent Interests" },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === tab.id
                                            ? "border-indigo-500 text-indigo-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
                {/* Tab Content */}
                <div className="container mx-auto px-6">
                    {activeTab === 'properties' && (
                        <div>
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                    </svg>
                                    <span className="ml-2 text-gray-600">Loading properties...</span>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-700">{error}</p>
                                    <button
                                        onClick={() => setRefreshKey(prev => prev + 1)}
                                        className="mt-2 text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : properties.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                    </svg>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Properties Yet</h3>
                                    <p className="text-gray-600 mb-4">Start by adding your first property listing</p>
                                    <button
                                        onClick={() => setShowAddPropertyModal(true)}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Add Your First Property
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {properties.map((property) => (
                                        <div key={property.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-shadow">
                                            {/* Property Image Slider */}
                                            <div className="relative">
                                                <PropertyImageSlider
                                                    images={property.image_urls || []}
                                                    title={property.title}
                                                    className="rounded-t-xl"
                                                />

                                                {/* Status Badge */}
                                                <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium shadow-sm ${
                                                    property.status === 'available'
                                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                                        : property.status === 'rented'
                                                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                                                }`}>
                                                    {property.status}
                                                </div>
                                            </div>

                                            {/* Property Details */}
                                            <div className="p-4">
                                                <h3 className="font-semibold text-gray-900 mb-1">{property.title}</h3>
                                                <p className="text-sm text-gray-600 mb-2">{property.address}</p>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-2xl font-bold text-indigo-600">₹{property.price}</span>
                                                    <span className="text-sm text-gray-500">/month</span>
                                                </div>
                                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                                                    {property.bedrooms && (
                                                        <div className="flex items-center">
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                                                            </svg>
                                                            {property.bedrooms} Bed
                                                        </div>
                                                    )}
                                                    {property.bathrooms && (
                                                        <div className="flex items-center">
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h.01M12 7h.01M16 7h.01M12 12h.01M8 16h.01M12 16h.01M16 16h.01"></path>
                                                            </svg>
                                                            {property.bathrooms} Bath
                                                        </div>
                                                    )}
                                                    {property.square_feet && (
                                                        <div className="flex items-center">
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                                                            </svg>
                                                            {property.square_feet} sqft
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            // TODO: Implement edit functionality
                                                            alert('Edit functionality coming soon!');
                                                        }}
                                                        className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProperty(property.id)}
                                                        className="flex-1 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'overview' && (
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Overview</h2>
                            <p className="text-gray-600">Welcome to your property management dashboard. Use the navigation above to manage your properties and view interest from potential renters.</p>
                        </div>
                    )}

                    {activeTab === 'interests' && (
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Interests</h2>
                            {recentInterests.length === 0 ? (
                                <p className="text-gray-600">No interests yet. Once you list properties, renter interests will appear here.</p>
                            ) : (
                                <div className="space-y-4">
                                    {/* Interest list would go here */}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Property Modal */}
            {showAddPropertyModal && (
                <AddPropertyModal
                    onClose={() => setShowAddPropertyModal(false)}
                    onSubmit={handlePropertyAdded}
                />
            )}
        </div>
    );
}
