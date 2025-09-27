"use client";
import { useState, useEffect } from "react";
import { useAtom } from "jotai";

import { AddPropertyModal } from "@/app/component/AddPropertyModal";
import { InterestsModal } from "@/app/component/InterestsModal";
import { userAtom } from "@/app/atoms/auth";
import { api, Property } from "@/app/libs/api";

export default function OwnerDashboard() {
    const [user] = useAtom(userAtom);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [showInterestsModal, setShowInterestsModal] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        rented: 0,
        interests: 0,
    });

    useEffect(() => {
        fetchMyProperties();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchMyProperties = async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            const response = await api.getProperties({ owner_id: user.id });
            if (response.success) {
                const props = response.data || [];
                setProperties(props);

                // Calculate stats
                setStats({
                    total: props.length,
                    available: props.filter(
                        (p) =>
                            p.status === "available" ||
                            p.status === "for_sale" ||
                            p.status === "for_rent"
                    ).length,
                    rented: props.filter((p) => p.status === "rented").length,
                    interests: 0, // TODO: Add interests count from API
                });
            }
        } catch (error) {
            console.error("Error fetching properties:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProperty = async (propertyData: any) => {
        try {
            const propertyPayload = {
                title: propertyData.title,
                description: `${propertyData.bedrooms} BHK ${propertyData.propertyType}`,
                address: propertyData.address,
                city: propertyData.city,
                state: "Karnataka", // Default or add to form
                price: parseFloat(propertyData.rent),
                bedrooms: parseInt(propertyData.bedrooms),
                property_type: propertyData.propertyType,
                status: "available",
            };

            const response = await api.createProperty(propertyPayload as any);

            if (response.success) {
                setShowAddModal(false);
                fetchMyProperties(); // Refresh list
                alert("Property added successfully!");
            } else {
                alert("Failed to add property: " + response.error);
            }
        } catch (error) {
            console.error("Error adding property:", error);
            alert("Failed to add property");
        }
    };

    const handleViewInterests = (property: Property) => {
        setSelectedProperty(property);
        setShowInterestsModal(true);
    };

    const handleCloseInterestsModal = () => {
        setShowInterestsModal(false);
        setSelectedProperty(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Property Dashboard</h1>
                    <p className="text-gray-600">Welcome back, {user?.name}</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    + Add Property
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="text-sm font-medium text-gray-500">Total Properties</h3>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="text-sm font-medium text-gray-500">Available</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.available}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="text-sm font-medium text-gray-500">Rented</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.rented}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="text-sm font-medium text-gray-500">Total Interests</h3>
                    <p className="text-3xl font-bold text-orange-600">{stats.interests}</p>
                </div>
            </div>

            {/* Properties List */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">My Properties</h2>
                </div>

                {properties.length === 0 ? (
                    <div className="p-8 text-center">
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
                            No properties yet
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Start by adding your first property listing
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Add Your First Property
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {properties.map((property) => (
                            <div
                                key={property.id}
                                className="p-6 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {property.title}
                                        </h3>
                                        <p className="text-gray-600">
                                            {property.address}, {property.city}
                                        </p>
                                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                            <span>{property.bedrooms} bed</span>
                                            <span>{property.bathrooms} bath</span>
                                            <span>{property.property_type}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-gray-900">
                                            ₹{property.price?.toLocaleString()}/month
                                        </p>
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                property.status === "available" ||
                                                property.status === "for_sale" ||
                                                property.status === "for_rent"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {property.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-500">
                                        Listed {new Date(property.created_at).toLocaleDateString()}
                                    </p>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleViewInterests(property)}
                                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors"
                                        >
                                            View Interests
                                        </button>
                                        <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Property Modal */}
            {showAddModal && (
                <AddPropertyModal
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleAddProperty}
                />
            )}

            {/* Interests Modal */}
            {showInterestsModal && selectedProperty && (
                <InterestsModal
                    propertyId={selectedProperty.id}
                    propertyTitle={selectedProperty.title}
                    onClose={handleCloseInterestsModal}
                />
            )}
        </div>
    );
}
