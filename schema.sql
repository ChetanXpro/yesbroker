-- Create renter table
CREATE TABLE IF NOT EXISTS renter (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_owner
        FOREIGN KEY(owner_id)
        REFERENCES renter(id)
        ON DELETE CASCADE
);

-- Create index on owner_id for faster queries
CREATE INDEX idx_properties_owner_id ON properties(owner_id);

-- Create index on status for faster filtering
CREATE INDEX idx_properties_status ON properties(status);

-- Create index on city for location-based queries
CREATE INDEX idx_properties_city ON properties(city);