
CREATE TABLE transactions (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  user_id INTEGER NOT NULL,

  category_id INTEGER NOT NULL,

  description VARCHAR(200) NOT NULL,

  amount NUMERIC(12,2) NOT NULL,

  type VARCHAR(10) NOT NULL,

  date DATE NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT transactions_user_fk
    FOREIGN KEY (user_id)
    REFERENCES users(id),

  CONSTRAINT transactions_category_type_fk
    FOREIGN KEY (category_id, type)
    REFERENCES categories(id, type),

  CONSTRAINT transactions_description_not_blank
    CHECK (LENGTH(TRIM(description)) > 0),

  CONSTRAINT transactions_amount_positive
    CHECK (amount > 0),

  CONSTRAINT transactions_type_valid
    CHECK (type IN ('receita', 'despesa'))
);

CREATE INDEX transactions_user_date_idx
  ON transactions (user_id, date DESC);
