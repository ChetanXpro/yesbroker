interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    count?: number;
}

interface Property {
    id: number;
    title: string;
    description?: string;
    address: string;
    city: string;
    state: string;
    zipcode?: string;
    price: number;
    bedrooms?: number;
    bathrooms?: number;
    square_feet?: number;
    property_type?: string;
    status: string;
    owner_id: number;
    image_urls?: string[];
    created_at: string;
    updated_at: string;
}

interface PropertyInterest {
    id: number;
    property_id: number;
    user_id: number;
    created_at: string;
}

interface User {
    id: number;
    name: string;
    wallet_address: string;
    phone?: string;
    verified: boolean;
    user_type: "renter" | "owner";
    created_at: string;
    updated_at: string;
}

// Base API client class
class ApiClient {
    private baseURL: string;

    constructor(baseURL: string = "/api") {
        this.baseURL = baseURL;
    }

    private getAuthToken(): string | null {
        if (typeof window === "undefined") return null;
        return localStorage.getItem("yesbroker_token");
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        const token = this.getAuthToken();

        const config: RequestInit = {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, config);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("API request failed:", error);
            throw error;
        }
    }

    // Auth methods
    async login(walletAddress: string): Promise<ApiResponse<any>> {
        return this.request("/auth/session", {
            method: "POST",
            body: JSON.stringify({ walletAddress }),
        });
    }

    // Property methods
    async getProperties(params?: {
        owner_id?: number;
        status?: string;
        city?: string;
    }): Promise<ApiResponse<Property[]>> {
        const searchParams = new URLSearchParams();
        if (params?.owner_id) searchParams.append("owner_id", params.owner_id.toString());
        if (params?.status) searchParams.append("status", params.status);
        if (params?.city) searchParams.append("city", params.city);

        const query = searchParams.toString();
        return this.request(`/properties${query ? `?${query}` : ""}`);
    }

    async getProperty(id: number): Promise<ApiResponse<Property>> {
        return this.request(`/properties/${id}`);
    }

    async createProperty(
        property: Omit<Property, "id" | "created_at" | "updated_at">
    ): Promise<ApiResponse<Property>> {
        return this.request("/properties", {
            method: "POST",
            body: JSON.stringify(property),
        });
    }

    async updateProperty(id: number, property: Partial<Property>): Promise<ApiResponse<Property>> {
        return this.request(`/properties/${id}`, {
            method: "PUT",
            body: JSON.stringify(property),
        });
    }

    async deleteProperty(id: number): Promise<ApiResponse<Property>> {
        return this.request(`/properties/${id}`, {
            method: "DELETE",
        });
    }

    // Property interest methods
    async showInterest(propertyId: number): Promise<ApiResponse<PropertyInterest>> {
        return this.request("/property-interests", {
            method: "POST",
            body: JSON.stringify({ property_id: propertyId }),
        });
    }

    async getMyInterests(): Promise<ApiResponse<PropertyInterest[]>> {
        return this.request("/property-interests");
    }

    async getPropertyInterests(propertyId: number): Promise<ApiResponse<PropertyInterest[]>> {
        return this.request(`/property-interests?property_id=${propertyId}`);
    }

    async removeInterest(interestId: number): Promise<ApiResponse<void>> {
        return this.request(`/property-interests/${interestId}`, {
            method: "DELETE",
        });
    }

    // User methods
    async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
        return this.request("/users/profile", {
            method: "PUT",
            body: JSON.stringify(userData),
        });
    }

    async getProfile(): Promise<ApiResponse<User>> {
        return this.request("/users/profile");
    }
}

// Create singleton instance
export const api = new ApiClient();

// Export types
export type { Property, PropertyInterest, User, ApiResponse };
