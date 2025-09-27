"use client";
import { useAuth } from "@/app/hook/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function Home() {
    const router = useRouter();

    const handleGetStarted = () => {
        router.push("/auth");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <img src={"/assets/logo.png"} alt={"Logo"} className="w-50" />
                    </div>
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
                        Connect directly with property owners. List your property or find your dream
                        home. No middleman, no extra fees. Secure verification powered by Self
                        Protocol.
                    </p>

                    {/* Single CTA */}
                    <div className="mb-16">
                        <button
                            onClick={handleGetStarted}
                            className="bg-indigo-600 text-white px-12 py-4 rounded-xl text-xl font-semibold hover:bg-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                        >
                            Get Started with Self Verification
                        </button>
                        <p className="text-sm text-gray-500 mt-4">
                            Verify your identity first, then choose to list or rent properties
                        </p>
                    </div>

                    {/* Quick Preview of Actions */}
                    <div className="grid md:grid-cols-2 gap-8 mt-16 max-w-3xl mx-auto">
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
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
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                    ></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">
                                List Your Property
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Upload property documents with zkPDF verification
                            </p>
                        </div>

                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
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
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    ></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">
                                Find Properties
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Browse verified listings from trusted owners
                            </p>
                        </div>
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
                                    d="M9 12l2 2 4-4m5.25-4.5L12 3l-9.75 8.25L3 11.25l9-8.25 9 8.25-0.75 0.75z"
                                ></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                            Self Protocol Verified
                        </h3>
                        <p className="text-gray-600">
                            All users verified through Self Protocols zero-knowledge identity
                            verification. No fake profiles, complete privacy protection.
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
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Zero Fees</h3>
                        <p className="text-gray-600">
                            No broker commissions, no hidden charges. Direct connection between
                            property owners and renters.
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
                                    d="M9 12V8.5a2.5 2.5 0 115 0V12m-7.5 0h7.5m-7.5 0v8a2 2 0 002 2h3.5a2 2 0 002-2v-8"
                                ></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">zkPDF Verification</h3>
                        <p className="text-gray-600">
                            Property documents verified using zero-knowledge proofs. Cryptographic
                            security without revealing sensitive data.
                        </p>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="mt-20 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8">Why Choose YesBroker?</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <div className="text-3xl font-bold text-indigo-600">100%</div>
                            <div className="text-gray-600">Verified Users</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-indigo-600">0%</div>
                            <div className="text-gray-600">Broker Fees</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-indigo-600">zkProof</div>
                            <div className="text-gray-600">Document Security</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-indigo-600">Direct</div>
                            <div className="text-gray-600">Owner Contact</div>
                        </div>
                    </div>
                </div>

                {/* Self Protocol Badge */}
                <div className="mt-16 text-center">
                    <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/50">
                        <span className="text-sm text-gray-600 mr-2">Secured by</span>
                        <span className="font-bold text-gray-800">Self Protocol</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                    </div>
                </div>
            </main>
        </div>
    );
}
