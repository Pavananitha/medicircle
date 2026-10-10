-- ==============================================================================
-- MediCircle Database Initialization Script
-- Database: medicircle
-- ==============================================================================

-- 1. Create database if it does not already exist
-- Run in psql or pgAdmin connected to postgres default database:
-- CREATE DATABASE medicircle;

SELECT 'CREATE DATABASE medicircle'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'medicircle')\gexec

-- 2. Connect to medicircle
\c medicircle;

-- 3. Enable pgcrypto extension for UUID generation and cryptographic utilities
CREATE EXTENSION IF NOT EXISTS pgcrypto;
