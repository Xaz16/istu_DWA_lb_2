-- Default admin: login `admin`, password `admin` (change in production).
INSERT INTO users (login, password_hash, role)
VALUES (
  'admin',
  '$2b$10$x55gxWMquuUxBwCpm6yq0e1Nt52LsMtw2MUB4bbVjzJSLoVTukzri',
  'admin'
)
ON CONFLICT (login) DO NOTHING;
