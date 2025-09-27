"use client";
import { useState, useEffect } from "react";
import { api, PropertyInterest } from "@/app/libs/api";

interface InterestsModalProps {
    propertyId: number;
    propertyTitle: string;
    onClose: () => void;
}

interface InterestWithUser extends PropertyInterest {
    user_name?: string;
    user_wallet?: string;
}

export function InterestsModal({ propertyId, propertyTitle, onClose }: InterestsModalProps) {
    const [interests, setInterests] = useState<InterestWithUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchInterests();
    }, [propertyId]);

    const fetchInterests = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await api.getPropertyInterests(propertyId);

            if (response.success) {
                setInterests(response.data || []);
            } else {
                setError(response.error || "Failed to load interests");
            }
        } catch (err) {
            console.error("Error fetching interests:", err);
            setError("Failed to load interests");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Property Interests</h2>
                        <p className="text-sm text-gray-600 mt-1">{propertyTitle}</p>
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
                            />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <span className="ml-2 text-gray-600">Loading interests...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <div className="text-red-500 mb-2">
                                <svg
                                    className="w-12 h-12 mx-auto"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <p className="text-gray-600">{error}</p>
                            <button
                                onClick={fetchInterests}
                                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : interests.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No interests yet
                            </h3>
                            <p className="text-gray-600">
                                When renters show interest in this property, theyll appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {interests.length}{" "}
                                    {interests.length === 1 ? "Person" : "People"} Interested
                                </h3>
                            </div>

                            {interests.map((interest) => (
                                <div
                                    key={interest.id}
                                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                <svg
                                                    className="w-5 h-5 text-indigo-600"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {interest.user_name || "Anonymous User"}
                                                </p>
                                                <p className="text-sm text-gray-500 font-mono">
                                                    {interest.user_wallet
                                                        ? `${interest.user_wallet.slice(
                                                              0,
                                                              6
                                                          )}...${interest.user_wallet.slice(-4)}`
                                                        : `User ID: ${interest.user_id}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Interested on</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {new Date(interest.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center space-x-2">
                                        <button className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-indigo-700 transition-colors">
                                            Contact Renter
                                        </button>
                                        <button className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm hover:bg-gray-300 transition-colors">
                                            View Profile
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
