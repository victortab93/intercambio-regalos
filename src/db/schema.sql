-- ===============================================
-- DATABASE SCHEMA FOR GIFT EXCHANGE APP
-- ===============================================

-- Reset (optional during development)
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-------------------------------------------------
-- USERS
-------------------------------------------------
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(120) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   TEXT,
    google_id       TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);


-------------------------------------------------
-- EXCHANGES
-------------------------------------------------
CREATE TABLE exchanges (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name          VARCHAR(120) NOT NULL,
    event_date    DATE NOT NULL,
    invite_code   VARCHAR(20) NOT NULL UNIQUE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exchanges_owner ON exchanges(owner_id);


-------------------------------------------------
-- PARTICIPANTS
-------------------------------------------------
CREATE TABLE exchange_participants (
    exchange_id   UUID NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at     TIMESTAMP NOT NULL DEFAULT NOW(),

    PRIMARY KEY (exchange_id, user_id)
);

CREATE INDEX idx_participants_exchange ON exchange_participants(exchange_id);


-------------------------------------------------
-- PAIRING RUN (only one active at a time)
-------------------------------------------------
CREATE TABLE pairing_runs (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exchange_id   UUID NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_pairing_runs_exchange ON pairing_runs(exchange_id);


-------------------------------------------------
-- PAIRING PAIRS (giver -> receiver)
-------------------------------------------------
CREATE TABLE pairing_pairs (
    pairing_run_id UUID NOT NULL REFERENCES pairing_runs(id) ON DELETE CASCADE,
    giver_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    PRIMARY KEY (pairing_run_id, giver_id)
);

CREATE INDEX idx_pairing_giver ON pairing_pairs(giver_id);


-------------------------------------------------
-- WISHLIST ITEMS
-------------------------------------------------
CREATE TABLE wishlist_items (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exchange_id   UUID NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    url           TEXT,
    price         NUMERIC(12,2),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wishlist_exchange_user ON wishlist_items(exchange_id, user_id);


-------------------------------------------------
-- LOGS (optional, useful for debugging/invites)
-------------------------------------------------
CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id    UUID REFERENCES users(id),
    action      TEXT NOT NULL,
    details     JSONB,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
