import { PropertyDocumentUpload } from "@/app/component/PDFVerification";
import { ImageUpload } from "@/app/component/ImageUpload";
import { useState } from "react";
import { api } from "@/app/libs/api";
import { useAtom } from "jotai";
import { userAtom } from "@/app/atoms/auth";

export function AddPropertyModal({ onClose, onSubmit }: any) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        property_type: "",
        bedrooms: "",
        bathrooms: "",
        square_feet: "",
        price: "",
        city: "",
        state: "",
        zipcode: "",
        address: "",
    });
    const [documentVerification, setDocumentVerification] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdPropertyId, setCreatedPropertyId] = useState<number | null>(null);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isVerificationRequired, setIsVerificationRequired] = useState(true);

    const [user] = useAtom(userAtom);

    const handleStep1Submit = async (e: any) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Get auth token from localStorage (in real app)
            // const token = localStorage.getItem('auth_token');
            // if (!token) {
            //     setError('Authentication required. Please login.');
            //     return;
            // }

            // Prepare property data for API
            const propertyData = {
                title: formData.title,
                description: formData.description,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zipcode: formData.zipcode,
                price: parseFloat(formData.price),
                owner_id: user?.id || 1,
                bedrooms: parseInt(formData.bedrooms),
                bathrooms: parseInt(formData.bathrooms),
                square_feet: formData.square_feet ? parseInt(formData.square_feet) : 100,
                property_type: formData.property_type,
                status: "available",
                is_doc_signed: false,
                is_verified: false,
                verification_transaction_hash: null,
            };

            const result = await api.createProperty(propertyData);

            if (result.success) {
                setCreatedPropertyId(result.data?.id || null);
                setCurrentStep(2); // Move to image upload step
            } else {
                setError(result.error || "Failed to create property");
            }
        } catch (err) {
            setError("Network error. Please try again.");
            console.error("Property creation error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: any, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleDocumentVerified = (verificationData: any) => {
        setDocumentVerification(verificationData);
        console.log("Document verification result:", verificationData);
    };

    const isStep1Valid =
        formData.title &&
        formData.property_type &&
        formData.bedrooms &&
        formData.bathrooms &&
        formData.price &&
        formData.city &&
        formData.state &&
        formData.address;

    const handleImagesUploaded = (urls: string[]) => {
        setUploadedImages(prev => [...prev, ...urls]);
    };

    // const handleDocumentVerified = (verificationData: any) => {
    //     setDocumentVerification(verificationData);
    //     console.log('Document verification result:', verificationData);
    // };

    const canProceedToStep3 = uploadedImages.length > 0;
    const canFinalize = documentVerification?.isValid === true;

    const handleFinalize = () => {
        const submissionData = {
            id: createdPropertyId,
            ...formData,
            images: uploadedImages,
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

    const goToNextStep = () => {
        if (currentStep === 2 && canProceedToStep3) {
            setCurrentStep(3);
        }
    };

    const goToPrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {currentStep === 1 ? "Property Details" :
                                currentStep === 2 ? "Upload Images" :
                                    "Document Verification"}
                        </h2>
                        <div className="flex items-center mt-2 space-x-2">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    currentStep >= 1 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
                                }`}>
                                1
                            </div>
                            <div className={`w-12 h-1 ${
                                currentStep >= 2 ? "bg-indigo-600" : "bg-gray-200"
                            }`}></div>
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    currentStep >= 2 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
                                }`}>
                                2
                            </div>
                            <div className={`w-12 h-1 ${
                                currentStep >= 3 ? "bg-indigo-600" : "bg-gray-200"
                            }`}></div>
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    currentStep >= 3 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
                                }`}>
                                3
                            </div>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            {currentStep === 1 ? "Step 1 of 3: Basic Information" :
                                currentStep === 2 ? "Step 2 of 3: Property Images" :
                                    "Step 3 of 3: Document Verification"}
                        </div>
                    </div>
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
                <div className="p-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Step 1: Property Details */}
                    {currentStep === 1 && (
                        <form onSubmit={handleStep1Submit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
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
                                        value={formData.property_type}
                                        onChange={(e) => handleInputChange("property_type", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        <option value="apartment">Apartment</option>
                                        <option value="house">House</option>
                                        <option value="condo">Condo</option>
                                        <option value="townhouse">Townhouse</option>
                                        <option value="studio">Studio</option>
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
                                        <option value="1">1 Bedroom</option>
                                        <option value="2">2 Bedrooms</option>
                                        <option value="3">3 Bedrooms</option>
                                        <option value="4">4 Bedrooms</option>
                                        <option value="5">5+ Bedrooms</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bathrooms *
                                    </label>
                                    <select
                                        value={formData.bathrooms}
                                        onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        required
                                    >
                                        <option value="">Select</option>
                                        <option value="1">1 Bathroom</option>
                                        <option value="2">2 Bathrooms</option>
                                        <option value="3">3 Bathrooms</option>
                                        <option value="4">4+ Bathrooms</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Monthly Rent (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => handleInputChange("price", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        placeholder="25000"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Square Feet
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.square_feet}
                                        onChange={(e) => handleInputChange("square_feet", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        placeholder="1200"
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        State *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={(e) => handleInputChange("state", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        placeholder="Karnataka"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Zip Code
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.zipcode}
                                        onChange={(e) => handleInputChange("zipcode", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        placeholder="560001"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange("description", e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                                        placeholder="Describe your property, amenities, nearby facilities..."
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address *
                                    </label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => handleInputChange("address", e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                                        placeholder="Complete address with area, landmark"
                                        required
                                    />
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Step 2: Image Upload */}
                    {currentStep === 2 && createdPropertyId && (
                        <div>
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Property Images</h3>
                                <p className="text-gray-600 text-sm mb-4">Add up to 4 high-quality images of your
                                    property. Good photos help attract more potential renters.</p>
                            </div>

                            <ImageUpload
                                propertyId={createdPropertyId}
                                onImagesUploaded={handleImagesUploaded}
                                maxImages={4}
                            />

                            {uploadedImages.length > 0 && (
                                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor"
                                             viewBox="0 0 20 20">
                                            <path fillRule="evenodd"
                                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                  clipRule="evenodd"></path>
                                        </svg>
                                        <span className="text-green-800 font-medium">
                                            {uploadedImages.length} image{uploadedImages.length > 1 ? "s" : ""} uploaded successfully
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Document Verification */}
                    {currentStep === 3 && (
                        <div>
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Property Document
                                    Verification</h3>
                                <p className="text-gray-600 text-sm mb-4">Upload your property ownership documents for
                                    verification. This step is required to complete your listing.</p>
                            </div>

                            <PropertyDocumentUpload
                                onDocumentVerified={handleDocumentVerified}
                                propertyId={createdPropertyId}
                            />

                            {documentVerification && (
                                <div className="mt-6">
                                    {documentVerification.isValid ? (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                                <span className="text-green-800 font-medium">Document Verified Successfully</span>
                                            </div>
                                            <p className="text-green-700 text-sm mt-1">Your property listing is ready to
                                                be published!</p>
                                        </div>
                                    ) : (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                                <span
                                                    className="text-red-800 font-medium">Document Verification Failed</span>
                                            </div>
                                            <p className="text-red-700 text-sm mt-1">Please upload a valid digitally
                                                signed document to complete verification.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor"
                                         viewBox="0 0 20 20">
                                        <path fillRule="evenodd"
                                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                              clipRule="evenodd"></path>
                                    </svg>
                                    <div>
                                        <h4 className="font-medium text-blue-800 mb-1">Why Document Verification?</h4>
                                        <p className="text-sm text-blue-700">Document verification ensures property
                                            ownership authenticity and builds trust with potential renters. Only
                                            digitally signed documents can be verified.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal Footer */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                        >
                            Cancel
                        </button>

                        <div className="flex space-x-3">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={goToPrevStep}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                                >
                                    Back
                                </button>
                            )}

                            {currentStep === 1 && (
                                <button
                                    type="submit"
                                    disabled={!isStep1Valid || isSubmitting}
                                    onClick={handleStep1Submit}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center">
                                            <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10"
                                                        stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor"
                                                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                            </svg>
                                            Creating...
                                        </div>
                                    ) : (
                                        "Next: Upload Images"
                                    )}
                                </button>
                            )}

                            {currentStep === 2 && (
                                <button
                                    type="button"
                                    disabled={!canProceedToStep3}
                                    onClick={goToNextStep}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    Next: Verify Documents
                                </button>
                            )}

                            {currentStep === 3 && (
                                <button
                                    type="button"
                                    disabled={!canFinalize}
                                    onClick={handleFinalize}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    Complete Listing
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
