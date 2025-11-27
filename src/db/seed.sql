-- ===============================================
-- SEED DATA FOR DEVELOPMENT
-- ===============================================

-- Clear tables (optional for dev)
-- TRUNCATE users CASCADE;
-- TRUNCATE exchanges CASCADE;

-------------------------------------------------
-- USER
-------------------------------------------------
INSERT INTO users (id, name, email, password_hash)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Usuario Demo',
    'demo@example.com',
    '$2b$10$9pvh0GRFeWihTzBxWw7NUuNUSdVwKoYVLXeaV3Y/dJkYpYJ9HRPqO' -- password: 123456
)
ON CONFLICT DO NOTHING;


-------------------------------------------------
-- EXCHANGE
-------------------------------------------------
INSERT INTO exchanges (id, owner_id, name, event_date, invite_code)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Intercambio Navideño',
    '2025-12-24',
    'ABC123'
)
ON CONFLICT DO NOTHING;


-------------------------------------------------
-- PARTICIPANTS
-------------------------------------------------
INSERT INTO exchange_participants (exchange_id, user_id)
VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;


-------------------------------------------------
-- SECOND USER (OPTIONAL)
-------------------------------------------------
INSERT INTO users (id, name, email, password_hash)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    'Invitado Demo',
    'guest@example.com',
    '$2b$10$OIj6NjsTC/0qBzRkn6GfYeSW6FxQ1rAMu8Deihdj5Z9WuCwYlTWvW' -- password: 123456
)
ON CONFLICT DO NOTHING;


INSERT INTO exchange_participants (exchange_id, user_id)
VALUES
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;
