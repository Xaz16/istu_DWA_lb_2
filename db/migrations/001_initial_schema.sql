-- Menu
CREATE TABLE menu_sections (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE dishes (
  id SERIAL PRIMARY KEY,
  section_id INT NOT NULL REFERENCES menu_sections (id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  weight_g INT,
  calories INT,
  has_allergens BOOLEAN NOT NULL DEFAULT FALSE,
  is_spicy BOOLEAN NOT NULL DEFAULT FALSE,
  kid_friendly BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dishes_section ON dishes (section_id);
CREATE INDEX idx_dishes_calories ON dishes (calories);
CREATE INDEX idx_dishes_weight ON dishes (weight_g);

CREATE TABLE dish_ingredients (
  id SERIAL PRIMARY KEY,
  dish_id INT NOT NULL REFERENCES dishes (id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_dish_ingredients_dish ON dish_ingredients (dish_id);

-- Reviews (photo, text, author name)
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  dish_id INT NOT NULL REFERENCES dishes (id) ON DELETE CASCADE,
  author_name VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_dish ON reviews (dish_id);

-- Halls and tables for booking map
CREATE TABLE halls (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE hall_tables (
  id SERIAL PRIMARY KEY,
  hall_id INT NOT NULL REFERENCES halls (id) ON DELETE CASCADE,
  code VARCHAR(32) NOT NULL,
  pos_x REAL NOT NULL DEFAULT 0,
  pos_y REAL NOT NULL DEFAULT 0,
  seat_count INT NOT NULL DEFAULT 2,
  UNIQUE (hall_id, code)
);

CREATE INDEX idx_hall_tables_hall ON hall_tables (hall_id);

-- Admin (password hash filled in auth/seed step)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  login VARCHAR(128) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One booking per table per calendar day
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  table_id INT NOT NULL REFERENCES hall_tables (id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  guest_count INT NOT NULL CHECK (guest_count > 0),
  contact_name VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(64) NOT NULL,
  contact_email VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (table_id, visit_date)
);

CREATE INDEX idx_bookings_date ON bookings (visit_date);
CREATE INDEX idx_bookings_table ON bookings (table_id);
