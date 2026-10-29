
CREATE TABLE categories (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  name VARCHAR(80) NOT NULL,

  type VARCHAR(10) NOT NULL,

  CONSTRAINT categories_name_not_blank
    CHECK (LENGTH(TRIM(name)) > 0),

  CONSTRAINT categories_type_valid
    CHECK (type IN ('receita', 'despesa')),

  CONSTRAINT categories_name_type_unique
    UNIQUE (name, type),

  CONSTRAINT categories_id_type_unique
    UNIQUE (id, type)
);
