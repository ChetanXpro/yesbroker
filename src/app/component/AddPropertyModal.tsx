import { PropertyDocumentUpload } from "@/app/component/PDFVerification";
import { useState } from "react";

export function AddPropertyModal({ onClose, onSubmit }: any) {
    const [formData, setFormData] = useState({
        title: "",
        propertyType: "",
        bedrooms: "",
        rent: "",
        city: "",
        address: "",
    });
    const [documentVerification, setDocumentVerification] = useState<any>(null);
    const [showDocumentUpload, setShowDocumentUpload] = useState(false);

    const handleSubmit = (e: any) => {
        e.preventDefault();

        // Include document verification data in submission
        const submissionData = {
            ...formData,
            documentVerification: documentVerification
                ? {
                      isVerified: documentVerification.isValid,
                      fileName: documentVerification.file?.name,
                      verificationResult: documentVerification.result,
                  }
                : null,
        };

        onSubmit(submissionData);
    };

    const handleInputChange = (field: any, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleDocumentVerified = (verificationData: any) => {
        setDocumentVerification(verificationData);
        console.log("Document verification result:", verificationData);
    };

    const isFormValid =
        formData.title &&
        formData.propertyType &&
        formData.bedrooms &&
        formData.rent &&
        formData.city &&
        formData.address;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Add New Property</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            ></path>
                        </svg>
                    </button>
                </div>

                {/* Modal Content */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Property Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleInputChange("title", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="2BHK Apartment in Koramangala"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Property Type *
                            </label>
                            <select
                                value={formData.propertyType}
                                onChange={(e) => handleInputChange("propertyType", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                required
                            >
                                <option value="">Select Type</option>
                                <option value="apartment">Apartment</option>
                                <option value="house">House</option>
                                <option value="villa">Villa</option>
                                <option value="pg">PG</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bedrooms *
                            </label>
                            <select
                                value={formData.bedrooms}
                                onChange={(e) => handleInputChange("bedrooms", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                required
                            >
                                <option value="">Select</option>
                                <option value="1">1 BHK</option>
                                <option value="2">2 BHK</option>
                                <option value="3">3 BHK</option>
                                <option value="4">4 BHK</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Monthly Rent (₹) *
                            </label>
                            <input
                                type="number"
                                value={formData.rent}
                                onChange={(e) => handleInputChange("rent", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="25000"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                City *
                            </label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => handleInputChange("city", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="Bangalore"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address *
                            </label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => handleInputChange("address", e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                                placeholder="Complete address with area, landmark"
                                required
                            />
                        </div>
                    </div>

                    {/* Document Verification Section */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Property Ownership Verification
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowDocumentUpload(!showDocumentUpload)}
                                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                            >
                                {showDocumentUpload ? "Hide Upload" : "Upload Document"}
                            </button>
                        </div>

                        {showDocumentUpload && (
                            <PropertyDocumentUpload onDocumentVerified={handleDocumentVerified} />
                        )}

                        {documentVerification && (
                            <div className="mt-4">
                                {documentVerification.isValid ? (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <svg
                                                className="w-5 h-5 text-green-600 mr-2"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                ></path>
                                            </svg>
                                            <span className="text-green-800 font-medium">
                                                Document Verified Successfully
                                            </span>
                                        </div>
                                        <p className="text-green-700 text-sm mt-1">
                                            File: {documentVerification.file?.name}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <svg
                                                className="w-5 h-5 text-yellow-600 mr-2"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                ></path>
                                            </svg>
                                            <span className="text-yellow-800 font-medium">
                                                Document uploaded but not digitally signed
                                            </span>
                                        </div>
                                        <p className="text-yellow-700 text-sm mt-1">
                                            You can still proceed, but verification features will be
                                            limited.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                        <div className="flex items-start">
                            <svg
                                className="w-5 h-5 text-blue-600 mt-0.5 mr-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                            <div>
                                <h4 className="font-medium text-blue-800 mb-1">
                                    About Document Verification
                                </h4>
                                <p className="text-sm text-blue-700">
                                    Upload your property registration or sale deed for verification.
                                    Digitally signed documents provide enhanced security and can be
                                    used for zero-knowledge proofs.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex space-x-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!isFormValid}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            Add Property
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
