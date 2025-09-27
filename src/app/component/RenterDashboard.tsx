// components/RenterDashboard.tsx
"use client";
import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { userAtom } from "@/app/atoms/auth";
import { api, Property } from "@/app/libs/api";

export default function RenterDashboard() {
    const [user] = useAtom(userAtom);
    const [properties, setProperties] = useState<Property[]>([]);
    const [myInterests, setMyInterests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"browse" | "interests">("browse");
    const [filters, setFilters] = useState({
        city: "",
        maxPrice: "",
        bedrooms: "",
    });

    useEffect(() => {
        fetchProperties();
        fetchMyInterests();
    }, [filters]);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const params: any = { status: "available" };

            if (filters.city) params.city = filters.city;
            // Add other filters as needed

            const response = await api.getProperties(params);
            if (response.success) {
                setProperties(response.data || []);
            }
        } catch (error) {
            console.error("Error fetching properties:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyInterests = async () => {
        try {
            const response = await api.getMyInterests();
            if (response.success) {
                setMyInterests(response.data || []);
            }
        } catch (error) {
            console.error("Error fetching interests:", error);
        }
    };

    const handleShowInterest = async (propertyId: number) => {
        try {
            const response = await api.showInterest(propertyId);
            if (response.success) {
                alert("Interest recorded successfully! The owner will be notified.");
                fetchMyInterests(); // Refresh interests
            } else {
                alert(response.error || "Failed to record interest");
            }
        } catch (error) {
            console.error("Error showing interest:", error);
            alert("Failed to record interest");
        }
    };

    const handleRemoveInterest = async (interestId: number) => {
        try {
            const response = await api.removeInterest(interestId);
            if (response.success) {
                fetchMyInterests(); // Refresh interests
            }
        } catch (error) {
            console.error("Error removing interest:", error);
        }
    };

    const isInterested = (propertyId: number) => {
        return myInterests.some((interest) => interest.property_id === propertyId);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Find Your Next Home</h1>
                    <p className="text-gray-600">Welcome back, {user?.name}</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="text-sm font-medium text-gray-500">Available Properties</h3>
                    <p className="text-3xl font-bold text-gray-900">{properties.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="text-sm font-medium text-gray-500">My Interests</h3>
                    <p className="text-3xl font-bold text-indigo-600">{myInterests.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="text-sm font-medium text-gray-500">Cities Available</h3>
                    <p className="text-3xl font-bold text-green-600">
                        {new Set(properties.map((p) => p.city)).size}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab("browse")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "browse"
                                    ? "border-indigo-500 text-indigo-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            Browse Properties
                        </button>
                        <button
                            onClick={() => setActiveTab("interests")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "interests"
                                    ? "border-indigo-500 text-indigo-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            My Interests ({myInterests.length})
                        </button>
                    </nav>
                </div>

                {activeTab === "browse" && (
                    <div className="p-6">
                        {/* Filters */}
                        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="Search by city..."
                                value={filters.city}
                                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <input
                                type="number"
                                placeholder="Max rent..."
                                value={filters.maxPrice}
                                onChange={(e) =>
                                    setFilters({ ...filters, maxPrice: e.target.value })
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <select
                                value={filters.bedrooms}
                                onChange={(e) =>
                                    setFilters({ ...filters, bedrooms: e.target.value })
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Any bedrooms</option>
                                <option value="1">1 BHK</option>
                                <option value="2">2 BHK</option>
                                <option value="3">3 BHK</option>
                                <option value="4">4+ BHK</option>
                            </select>
                        </div>

                        {/* Properties Grid */}
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : properties.length === 0 ? (
                            <div className="text-center py-12">
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
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No properties found
                                </h3>
                                <p className="text-gray-600">Try adjusting your filters</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {properties.map((property) => (
                                    <div
                                        key={property.id}
                                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                                    >
                                        <div className="h-48 bg-gray-200 flex items-center justify-center">
                                            <span className="text-gray-400">Property Image</span>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                                {property.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-2">
                                                {property.address}
                                            </p>
                                            <p className="text-gray-600 text-sm mb-3">
                                                {property.city}
                                            </p>

                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-2xl font-bold text-gray-900">
                                                    ₹{property.price}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    /month
                                                </span>
                                            </div>

                                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                                                <span>{property.bedrooms} bed</span>
                                                <span>{property.bathrooms} bath</span>
                                                <span className="capitalize">
                                                    {property.property_type}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => handleShowInterest(property.id)}
                                                disabled={isInterested(property.id)}
                                                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                                                    isInterested(property.id)
                                                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                                                }`}
                                            >
                                                {isInterested(property.id)
                                                    ? "Interest Shown"
                                                    : "Show Interest"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "interests" && (
                    <div className="p-6">
                        {myInterests.length === 0 ? (
                            <div className="text-center py-12">
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
                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No interests yet
                                </h3>
                                <p className="text-gray-600">
                                    Start browsing properties to show your interest
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myInterests.map((interest) => (
                                    <div
                                        key={interest.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg text-gray-900">
                                                    {interest.title}
                                                </h3>
                                                <p className="text-gray-600">
                                                    {interest.address}, {interest.city}
                                                </p>
                                                <p className="text-xl font-bold text-gray-900 mt-2">
                                                    ₹{interest.price}/month
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        interest.status === "available"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {interest.status}
                                                </span>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Interested on{" "}
                                                    {new Date(
                                                        interest.created_at
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                                            <button
                                                onClick={() => handleRemoveInterest(interest.id)}
                                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                                            >
                                                Remove Interest
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
