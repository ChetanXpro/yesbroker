"use client";
import { useState } from "react";

interface ImageUploadProps {
    propertyId: number;
    onImagesUploaded: (urls: string[]) => void;
    maxImages?: number;
}

export function ImageUpload({ propertyId, onImagesUploaded, maxImages = 4 }: ImageUploadProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (files.length + selectedFiles.length > maxImages) {
            setError(`Maximum ${maxImages} images allowed`);
            return;
        }

        // Validate file types and sizes
        const validFiles: File[] = [];
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                setError(`Invalid file type: ${file.name}. Only JPEG, PNG, and WebP allowed.`);
                return;
            }
            if (file.size > maxSize) {
                setError(`File too large: ${file.name}. Maximum 5MB allowed.`);
                return;
            }
            validFiles.push(file);
        }

        const newFiles = [...selectedFiles, ...validFiles];
        setSelectedFiles(newFiles);
        setError(null);

        // Create previews
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);

        // Revoke the object URL to prevent memory leaks
        URL.revokeObjectURL(previews[index]);

        setSelectedFiles(newFiles);
        setPreviews(newPreviews);
    };

    const uploadImages = async () => {
        if (selectedFiles.length === 0) {
            setError('Please select at least one image');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append('images', file);
            });

            const response = await fetch(`/api/properties/${propertyId}/images`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                const newUrls = result.data.uploaded_images;
                setUploadedImages(prev => [...prev, ...newUrls]);
                onImagesUploaded(newUrls);

                // Clear selected files and previews
                previews.forEach(preview => URL.revokeObjectURL(preview));
                setSelectedFiles([]);
                setPreviews([]);

                setError(null);
            } else {
                setError(result.error || 'Failed to upload images');
            }
        } catch (err) {
            setError('Network error while uploading images');
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    const deleteUploadedImage = async (imageUrl: string) => {
        try {
            const response = await fetch(
                `/api/properties/${propertyId}/images?url=${encodeURIComponent(imageUrl)}`,
                { method: 'DELETE' }
            );

            const result = await response.json();

            if (result.success) {
                setUploadedImages(prev => prev.filter(url => url !== imageUrl));
            } else {
                setError(result.error || 'Failed to delete image');
            }
        } catch (err) {
            setError('Network error while deleting image');
            console.error('Delete error:', err);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Property Images ({uploadedImages.length + selectedFiles.length}/{maxImages})
                </h3>

                {/* File Input */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="image-upload"
                        disabled={uploading || uploadedImages.length + selectedFiles.length >= maxImages}
                    />
                    <label
                        htmlFor="image-upload"
                        className={`cursor-pointer ${uploading || uploadedImages.length + selectedFiles.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        <p className="text-gray-600 mb-1">Click to select images</p>
                        <p className="text-sm text-gray-500">JPEG, PNG, WebP up to 5MB each</p>
                    </label>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
                <div>
                    <h4 className="font-medium text-gray-900 mb-3">Selected Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        {previews.map((preview, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg border"
                                />
                                <button
                                    onClick={() => removeFile(index)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ×
                                </button>
                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                    {selectedFiles[index].name}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={uploadImages}
                        disabled={uploading || selectedFiles.length === 0}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {uploading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                                Uploading...
                            </div>
                        ) : (
                            `Upload ${selectedFiles.length} Image${selectedFiles.length > 1 ? 's' : ''}`
                        )}
                    </button>
                </div>
            )}

            {/* Uploaded Images */}
            {uploadedImages.length > 0 && (
                <div>
                    <h4 className="font-medium text-gray-900 mb-3">Uploaded Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {uploadedImages.map((imageUrl, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={imageUrl}
                                    alt={`Uploaded ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg border"
                                />
                                <button
                                    onClick={() => deleteUploadedImage(imageUrl)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ×
                                </button>
                                <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                    ✓ Uploaded
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}