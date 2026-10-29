
CREATE TABLE users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  name VARCHAR(120) NOT NULL,

  email VARCHAR(255) NOT NULL UNIQUE,

  password_hash TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT users_name_not_blank
    CHECK (LENGTH(TRIM(name)) > 0),

  CONSTRAINT users_email_not_blank
    CHECK (LENGTH(TRIM(email)) > 0),

  CONSTRAINT users_password_hash_not_blank
    CHECK (LENGTH(TRIM(password_hash)) > 0)
);
