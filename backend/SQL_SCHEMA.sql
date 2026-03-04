-- ==========================================
-- SCRAPAIR DATABASE SCHEMA
-- Database: scrapair_dev (local) / scrapair_prod (production)
-- DBMS: MariaDB / MySQL
-- ==========================================

-- ==========================================
-- USERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique user identifier',
  `type` ENUM('business', 'recycler') NOT NULL COMMENT 'User type: business owner or recycler',
  `email` VARCHAR(100) NOT NULL UNIQUE COMMENT 'User email address',
  `password` VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed password',
  `businessName` VARCHAR(150) NULL COMMENT 'Business name (for business users)',
  `companyName` VARCHAR(150) NULL COMMENT 'Company name (for recycler users)',
  `phone` VARCHAR(20) NOT NULL COMMENT 'Contact phone number',
  `specialization` VARCHAR(200) NULL COMMENT 'Specialization (for recycler users - e.g., Metals, Plastics)',
  `isActive` BOOLEAN DEFAULT TRUE COMMENT 'Account active status',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Account creation timestamp',
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  
  -- Indexes for performance
  INDEX idx_email (`email`),
  INDEX idx_type (`type`),
  INDEX idx_createdAt (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User accounts for business owners and recyclers';

-- ==========================================
-- MATERIALS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS `materials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique material post identifier',
  `businessUserId` INT NOT NULL COMMENT 'Reference to business user who posted',
  `materialType` VARCHAR(100) NOT NULL COMMENT 'Type of material (Bronze, Copper, Plastic, etc.)',
  `quantity` DECIMAL(10, 2) NOT NULL COMMENT 'Quantity of material',
  `unit` VARCHAR(50) DEFAULT 'kg' COMMENT 'Unit of measurement (kg, lbs, pieces, etc.)',
  `description` TEXT NULL COMMENT 'Detailed description of the material',
  `contactEmail` VARCHAR(100) NOT NULL COMMENT 'Email to contact about this material',
  `status` ENUM('available', 'reserved', 'sold') DEFAULT 'available' COMMENT 'Current status of the material post',
  `isRecommendedForArtists` BOOLEAN DEFAULT FALSE COMMENT 'Whether this material is recommended for artists',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Post creation timestamp',
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  
  -- Foreign Key
  CONSTRAINT fk_materials_businessUserId FOREIGN KEY (`businessUserId`) 
    REFERENCES `users`(`id`) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_businessUserId (`businessUserId`),
  INDEX idx_materialType (`materialType`),
  INDEX idx_status (`status`),
  INDEX idx_isRecommendedForArtists (`isRecommendedForArtists`),
  INDEX idx_createdAt (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Material posts by business owners';

-- ==========================================
-- DATA RELATIONSHIPS
-- ==========================================
-- One Business User has Many Materials
-- One Material belongs to One Business User

-- ==========================================
-- RECOMMENDED MATERIAL TYPES FOR ARTISTS
-- ==========================================
-- Bronze - Highly sought after for sculptures
-- Copper - Valuable for various art projects
-- Aluminum - Lightweight for installations
-- Stainless Steel - Durable for modern art

-- ==========================================
-- SAMPLE QUERIES
-- ==========================================

-- Get all available materials
SELECT * FROM materials WHERE status = 'available' ORDER BY createdAt DESC;

-- Get materials recommended for artists
SELECT * FROM materials WHERE isRecommendedForArtists = TRUE AND status = 'available';

-- Get all materials from a specific business
SELECT m.* FROM materials m 
JOIN users u ON m.businessUserId = u.id 
WHERE u.email = 'business@example.com' AND m.status = 'available';

-- Get materials by type
SELECT * FROM materials WHERE materialType = 'Bronze' AND status = 'available';

-- Count materials by status
SELECT status, COUNT(*) as count FROM materials GROUP BY status;

-- Get active business users
SELECT * FROM users WHERE type = 'business' AND isActive = TRUE;

-- Get recyclers by specialization
SELECT * FROM users WHERE type = 'recycler' AND specialization LIKE '%Metals%';
