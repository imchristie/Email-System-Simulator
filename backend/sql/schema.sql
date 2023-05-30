--
-- All SQL statements must be on a single line and end in a semicolon.
--

-- Your database schema goes here --
DROP TABLE IF EXISTS users;
CREATE TABLE users(username VARCHAR(32), pw VARCHAR(60), n VARCHAR(32));

DROP TABLE IF EXISTS mail;
CREATE TABLE mail(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), mailbox VARCHAR(32), mail jsonb);