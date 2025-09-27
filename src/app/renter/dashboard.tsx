import { useState } from "react";

export default function RenterDashboard() {
    const [activeTab, setActiveTab] = useState("overview");

    // Mock data
    const renterData = {
        name: "Priya Sharma",
        kycStatus: "verified",
        savedProperties: 5,
        activeInterests: 3,
        budgetRange: "₹20,000 - ₹35,000",
        preferredLocation: "Koramangala, Bangalore",
    };

    const featuredProperties = [
        {
            id: 1,
            title: "2BHK Apartment in Koramangala",
            address: "Koramangala 5th Block, Bangalore",
            rent: 25000,
            owner: "Rajesh Kumar",
            ownerVerified: true,
            bedrooms: 2,
            bathrooms: 2,
            area: "1200 sq ft",
            amenities: ["Parking", "Gym", "Security"],
            images: ["https://via.placeholder.com/400x250"],
            isLiked: false,
        },
        {
            id: 2,
            title: "1BHK Studio in HSR Layout",
            address: "HSR Layout Sector 2, Bangalore",
            rent: 18000,
            owner: "Meera Patel",
            ownerVerified: true,
            bedrooms: 1,
            bathrooms: 1,
            area: "600 sq ft",
            amenities: ["Parking", "Security", "Power Backup"],
            images: ["https://via.placeholder.com/400x250"],
            isLiked: true,
        },
        {
            id: 3,
            title: "3BHK House in Indiranagar",
            address: "Indiranagar 1st Stage, Bangalore",
            rent: 35000,
            owner: "Suresh Kumar",
            ownerVerified: true,
            bedrooms: 3,
            bathrooms: 2,
            area: "1800 sq ft",
            amenities: ["Parking", "Garden", "Security"],
            images: ["https://via.placeholder.com/400x250"],
            isLiked: false,
        },
    ];

    const myInterests = [
        {
            id: 1,
            propertyTitle: "2BHK Apartment in Koramangala",
            owner: "Rajesh Kumar",
            status: "pending",
            appliedDate: "2 days ago",
            rent: 25000,
        },
        {
            id: 2,
            propertyTitle: "3BHK Villa in Whitefield",
            owner: "Amit Gupta",
            status: "accepted",
            appliedDate: "5 days ago",
            rent: 45000,
        },
        {
            id: 3,
            propertyTitle: "1BHK Studio in BTM Layout",
            owner: "Kavita Singh",
            status: "declined",
            appliedDate: "1 week ago",
            rent: 16000,
        },
    ];

    const toggleLike = (propertyId: number) => {
        // Mock toggle like functionality
        console.log(`Toggled like for property ${propertyId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">YB</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">
                                    Welcome back, {renterData.name}!
                                </h1>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500">Renter</span>
                                    {renterData.kycStatus === "verified" && (
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
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            Browse Properties
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Saved Properties
                                </p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {renterData.savedProperties}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-red-600"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                        clipRule="evenodd"
                                    ></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Active Interests
                                </p>
                                <p className="text-3xl font-bold text-blue-600">
                                    {renterData.activeInterests}
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
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    ></path>
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    ></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Budget Range</p>
                                <p className="text-lg font-bold text-green-600">
                                    {renterData.budgetRange}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {renterData.preferredLocation}
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
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
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
                                { id: "recommended", label: "Recommended for You" },
                                { id: "interests", label: "My Interests" },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === tab.id
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === "overview" && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Quick Actions
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group">
                                            <div className="text-center">
                                                <svg
                                                    className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2"
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
                                                <p className="text-sm font-medium text-gray-600 group-hover:text-blue-600">
                                                    Browse Properties
                                                </p>
                                            </div>
                                        </button>
                                        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="text-center">
                                                <svg
                                                    className="w-8 h-8 text-gray-400 mx-auto mb-2"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                                        clipRule="evenodd"
                                                    ></path>
                                                </svg>
                                                <p className="text-sm font-medium text-gray-600">
                                                    Saved Properties
                                                </p>
                                            </div>
                                        </button>
                                        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="text-center">
                                                <svg
                                                    className="w-8 h-8 text-gray-400 mx-auto mb-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                    ></path>
                                                </svg>
                                                <p className="text-sm font-medium text-gray-600">
                                                    Update Profile
                                                </p>
                                            </div>
                                        </button>
                                        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="text-center">
                                                <svg
                                                    className="w-8 h-8 text-gray-400 mx-auto mb-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                                    ></path>
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    ></path>
                                                </svg>
                                                <p className="text-sm font-medium text-gray-600">
                                                    Preferences
                                                </p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Recent Activity
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                                <svg
                                                    className="w-4 h-4 text-green-600"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    ></path>
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    Interest accepted!
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Amit Gupta accepted your interest in 3BHK Villa
                                                    • 1 day ago
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                <svg
                                                    className="w-4 h-4 text-blue-600"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                                        clipRule="evenodd"
                                                    ></path>
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    Property saved
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    You saved 1BHK Studio in HSR Layout • 2 days ago
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                                <svg
                                                    className="w-4 h-4 text-purple-600"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                        clipRule="evenodd"
                                                    ></path>
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    New property alert
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    3 new properties match your preferences • 3 days
                                                    ago
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "recommended" && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Recommended Properties
                                    </h3>
                                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                                        View All Properties →
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {featuredProperties.map((property) => (
                                        <div
                                            key={property.id}
                                            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
                                        >
                                            <div className="relative">
                                                <img
                                                    src={property.images[0]}
                                                    alt={property.title}
                                                    className="w-full h-48 object-cover bg-gray-200"
                                                />
                                                <button
                                                    onClick={() => toggleLike(property.id)}
                                                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
                                                >
                                                    <svg
                                                        className={`w-5 h-5 ${
                                                            property.isLiked
                                                                ? "text-red-500 fill-current"
                                                                : "text-gray-400"
                                                        }`}
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
                                                </button>
                                            </div>
                                            <div className="p-4">
                                                <h4 className="font-semibold text-gray-900 mb-2">
                                                    {property.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    {property.address}
                                                </p>

                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-xl font-bold text-blue-600">
                                                        ₹{property.rent.toLocaleString()}/mo
                                                    </span>
                                                    <div className="text-sm text-gray-500">
                                                        {property.bedrooms}BHK • {property.area}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <span>Owner: {property.owner}</span>
                                                        {property.ownerVerified && (
                                                            <svg
                                                                className="w-4 h-4 text-green-500 ml-1"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                    clipRule="evenodd"
                                                                ></path>
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-1 mb-4">
                                                    {property.amenities
                                                        .slice(0, 3)
                                                        .map((amenity, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                                            >
                                                                {amenity}
                                                            </span>
                                                        ))}
                                                    {property.amenities.length > 3 && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            +{property.amenities.length - 3} more
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex space-x-2">
                                                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                                                        Express Interest
                                                    </button>
                                                    <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "interests" && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                                    My Interests
                                </h3>
                                <div className="space-y-4">
                                    {myInterests.map((interest) => (
                                        <div
                                            key={interest.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900 mb-1">
                                                        {interest.propertyTitle}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        Owner: {interest.owner}
                                                    </p>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <span>Applied {interest.appliedDate}</span>
                                                        <span>
                                                            ₹{interest.rent.toLocaleString()}/month
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <span
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                            interest.status === "pending"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : interest.status === "accepted"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}
                                                    >
                                                        {interest.status === "pending" &&
                                                            "⏳ Pending"}
                                                        {interest.status === "accepted" &&
                                                            "✓ Accepted"}
                                                        {interest.status === "declined" &&
                                                            "✗ Declined"}
                                                    </span>
                                                    {interest.status === "accepted" && (
                                                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                                            Contact Owner
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
