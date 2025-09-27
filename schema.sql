-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(42) UNIQUE NOT NULL, -- Ethereum address
    phone VARCHAR(20),
    verified BOOLEAN DEFAULT FALSE,
    user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('renter', 'owner')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zipcode VARCHAR(20),
    price DECIMAL(12, 2) NOT NULL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    square_feet INTEGER,
    property_type VARCHAR(50), -- apartment, house, condo, etc.
    status VARCHAR(50) DEFAULT 'available', -- available, rented, maintenance
    owner_id INTEGER NOT NULL,
    image_urls TEXT[] DEFAULT '{}', -- Array of S3 URLs for property images (max 4)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_owner
        FOREIGN KEY(owner_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Create property_interests table
CREATE TABLE IF NOT EXISTS property_interests (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_property
        FOREIGN KEY(property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    -- Ensure one user can only show interest once per property
    UNIQUE(property_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_verified ON users(verified);
CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_property_interests_property_id ON property_interests(property_id);
CREATE INDEX idx_property_interests_user_id ON property_interests(user_id);