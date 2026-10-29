
INSERT INTO categories (name, type)
VALUES
  (U&'Sal\00E1rio', 'receita'),
  ('Freelance', 'receita'),
  ('Investimentos', 'receita'),
  ('Outras receitas', 'receita'),

  (U&'Alimenta\00E7\00E3o', 'despesa'),
  ('Moradia', 'despesa'),
  ('Transporte', 'despesa'),
  (U&'Sa\00FAde', 'despesa'),
  (U&'Educa\00E7\00E3o', 'despesa'),
  ('Lazer', 'despesa'),
  ('Outras despesas', 'despesa')

ON CONFLICT (name, type) DO NOTHING;
