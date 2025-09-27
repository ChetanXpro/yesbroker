"use client";
import { useState } from "react";

export default function Home() {
    const [showRoleSelection, setShowRoleSelection] = useState(false);

    if (showRoleSelection) {
        return <RoleSelection onBack={() => setShowRoleSelection(false)} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">YB</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-800">YesBroker</span>
                    </div>
                    <button
                        onClick={() => setShowRoleSelection(true)}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Get Started
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <main className="container mx-auto px-6 py-16">
                <div className="text-center max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
                        Skip the Broker,
                        <span className="text-indigo-600"> Find Your Home</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                        Connect directly with property owners. No middleman, no extra fees. Just
                        transparent, verified property rentals.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                        <button
                            onClick={() => setShowRoleSelection(true)}
                            className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                        >
                            List Your Property
                        </button>
                        <button
                            onClick={() => setShowRoleSelection(true)}
                            className="w-full sm:w-auto bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
                        >
                            Find Properties
                        </button>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mt-20">
                    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                            <svg
                                className="w-8 h-8 text-green-600"
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
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Verified Owners</h3>
                        <p className="text-gray-600">
                            All property owners go through KYC verification and property ownership
                            verification.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                            <svg
                                className="w-8 h-8 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                ></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">No Broker Fees</h3>
                        <p className="text-gray-600">
                            Connect directly with property owners. Save thousands in broker
                            commissions.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                            <svg
                                className="w-8 h-8 text-purple-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                ></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Instant Connect</h3>
                        <p className="text-gray-600">
                            Express interest and get direct contact with property owners
                            immediately.
                        </p>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="mt-20 text-center">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <div className="text-3xl font-bold text-indigo-600">1000+</div>
                            <div className="text-gray-600">Properties Listed</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-indigo-600">500+</div>
                            <div className="text-gray-600">Verified Owners</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-indigo-600">2000+</div>
                            <div className="text-gray-600">Happy Renters</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-indigo-600">₹50L+</div>
                            <div className="text-gray-600">Savings in Broker Fees</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function RoleSelection({ onBack }: { onBack: () => void }) {
    const [selectedRole, setSelectedRole] = useState(null);

    const handleRoleSelect = (role: any) => {
        setSelectedRole(role);
        // In real app, this would navigate to registration
        setTimeout(() => {
            alert(`Selected: ${role}. Next: Registration screen!`);
        }, 500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-6">
            <div className="max-w-4xl w-full">
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="mb-8 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 19l-7-7 7-7"
                        ></path>
                    </svg>
                    Back to Home
                </button>

                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">Choose Your Role</h2>
                    <p className="text-xl text-gray-600">
                        Are you looking to rent out your property or find a place to rent?
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Property Owner Card */}
                    <div
                        className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer border-4 ${
                            selectedRole === "owner" ? "border-indigo-500" : "border-transparent"
                        }`}
                        onClick={() => handleRoleSelect("owner")}
                    >
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg
                                    className="w-10 h-10 text-green-600"
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
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                Property Owner
                            </h3>
                            <p className="text-gray-600 mb-6">
                                List your properties and connect directly with verified renters
                            </p>

                            <div className="text-left space-y-3">
                                <div className="flex items-center">
                                    <svg
                                        className="w-5 h-5 text-green-500 mr-3"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                    <span className="text-gray-700">List unlimited properties</span>
                                </div>
                                <div className="flex items-center">
                                    <svg
                                        className="w-5 h-5 text-green-500 mr-3"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                    <span className="text-gray-700">
                                        View all interested renters
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <svg
                                        className="w-5 h-5 text-green-500 mr-3"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                    <span className="text-gray-700">Direct communication</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Renter Card */}
                    <div
                        className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer border-4 ${
                            selectedRole === "renter" ? "border-indigo-500" : "border-transparent"
                        }`}
                        onClick={() => handleRoleSelect("renter")}
                    >
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg
                                    className="w-10 h-10 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    ></path>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Renter</h3>
                            <p className="text-gray-600 mb-6">
                                Find your perfect home directly from verified property owners
                            </p>

                            <div className="text-left space-y-3">
                                <div className="flex items-center">
                                    <svg
                                        className="w-5 h-5 text-blue-500 mr-3"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                    <span className="text-gray-700">
                                        Browse verified properties
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <svg
                                        className="w-5 h-5 text-blue-500 mr-3"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                    <span className="text-gray-700">
                                        Connect with owners instantly
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <svg
                                        className="w-5 h-5 text-blue-500 mr-3"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                    <span className="text-gray-700">Save on broker fees</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-8">
                    <p className="text-gray-500">
                        You can always switch roles later in your profile settings
                    </p>
                </div>
            </div>
        </div>
    );
}
