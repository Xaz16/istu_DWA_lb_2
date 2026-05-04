CREATE TABLE "menu_sections" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "menu_sections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "dishes" (
    "id" SERIAL NOT NULL,
    "section_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "weight_g" INTEGER,
    "calories" INTEGER,
    "has_allergens" BOOLEAN NOT NULL DEFAULT false,
    "is_spicy" BOOLEAN NOT NULL DEFAULT false,
    "kid_friendly" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dishes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "dishes_section_id_idx" ON "dishes"("section_id");
CREATE INDEX "dishes_calories_idx" ON "dishes"("calories");
CREATE INDEX "dishes_weight_g_idx" ON "dishes"("weight_g");

ALTER TABLE "dishes" ADD CONSTRAINT "dishes_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "menu_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "dish_ingredients" (
    "id" SERIAL NOT NULL,
    "dish_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "dish_ingredients_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "dish_ingredients_dish_id_idx" ON "dish_ingredients"("dish_id");

ALTER TABLE "dish_ingredients" ADD CONSTRAINT "dish_ingredients_dish_id_fkey" FOREIGN KEY ("dish_id") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "dish_id" INTEGER NOT NULL,
    "author_name" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "photo_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "reviews_dish_id_idx" ON "reviews"("dish_id");

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_dish_id_fkey" FOREIGN KEY ("dish_id") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "halls" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "halls_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "hall_tables" (
    "id" SERIAL NOT NULL,
    "hall_id" INTEGER NOT NULL,
    "code" VARCHAR(32) NOT NULL,
    "pos_x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pos_y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "seat_count" INTEGER NOT NULL DEFAULT 2,
    CONSTRAINT "hall_tables_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "hall_tables_hall_id_idx" ON "hall_tables"("hall_id");

CREATE UNIQUE INDEX "hall_tables_hall_id_code_key" ON "hall_tables"("hall_id", "code");

ALTER TABLE "hall_tables" ADD CONSTRAINT "hall_tables_hall_id_fkey" FOREIGN KEY ("hall_id") REFERENCES "halls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "login" VARCHAR(128) NOT NULL,
    "password" TEXT NOT NULL,
    "role" VARCHAR(32) NOT NULL DEFAULT 'admin',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_login_key" ON "users"("login");

CREATE TABLE "bookings" (
    "id" SERIAL NOT NULL,
    "table_id" INTEGER NOT NULL,
    "visit_date" DATE NOT NULL,
    "guest_count" INTEGER NOT NULL,
    "contact_name" VARCHAR(255) NOT NULL,
    "contact_phone" VARCHAR(64) NOT NULL,
    "contact_email" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "bookings_visit_date_idx" ON "bookings"("visit_date");
CREATE INDEX "bookings_table_id_idx" ON "bookings"("table_id");

CREATE UNIQUE INDEX "bookings_table_id_visit_date_key" ON "bookings"("table_id", "visit_date");

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "hall_tables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "users" ("login", "password", "role") VALUES ('admin', '$2b$10$.janSDDMl5Kfwf5A2lCtWeISCWI3A0Uzbyx3JFVWPUEKKhcIwb5bm', 'admin');

INSERT INTO "menu_sections" ("id", "name", "sort_order") VALUES
    (1, 'Супы', 0),
    (2, 'Горячее', 1),
    (3, 'Салаты', 2),
    (4, 'Десерты', 3);

INSERT INTO "dishes" ("id", "section_id", "name", "description", "image_url", "weight_g", "calories", "has_allergens", "is_spicy", "kid_friendly") VALUES
    (1, 1, 'Борщ', NULL, 'https://images.unsplash.com/photo-1677889173479-c8a0ab15ae18?auto=format&w=800&h=500&fit=crop&q=80', 350, 180, false, false, true),
    (2, 1, 'Солянка мясная', NULL, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&w=800&h=500&fit=crop&q=80', 320, 240, true, true, false),
    (3, 2, 'Стейк рибай', NULL, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&w=800&h=500&fit=crop&q=80', 280, 520, false, false, true),
    (4, 2, 'Куриное филе на гриле', NULL, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&w=800&h=500&fit=crop&q=80', 220, 310, true, false, true),
    (5, 3, 'Цезарь с креветками', NULL, 'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&w=800&h=500&fit=crop&q=80', 240, 290, true, false, false),
    (6, 3, 'Оливье', NULL, 'https://cooking-img.nv.ua/cooking/recipe/19687/sMMnmXZrt1.webp?q=85&w=778', 200, 260, true, false, true),
    (7, 4, 'Тирамису', NULL, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&w=800&h=500&fit=crop&q=80', 150, 380, true, false, false),
    (8, 4, 'Чизкейк', NULL, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&w=800&h=500&fit=crop&q=80', 130, 340, true, false, true);

INSERT INTO "dish_ingredients" ("dish_id", "name", "sort_order") VALUES
    (1, 'Свекла', 0), (1, 'Говядина', 1), (1, 'Капуста', 2), (1, 'Картофель', 3), (1, 'Лук', 4),
    (2, 'Колбасы', 0), (2, 'Огурцы солёные', 1), (2, 'Томат', 2), (2, 'Лук', 3), (2, 'Маслины', 4),
    (3, 'Говядина', 0), (3, 'Соль', 1), (3, 'Перец', 2), (3, 'Розмарин', 3),
    (4, 'Курица', 0), (4, 'Молоко', 1), (4, 'Чеснок', 2), (4, 'Паприка', 3),
    (5, 'Креветки', 0), (5, 'Салат', 1), (5, 'Пармезан', 2), (5, 'Соус цезарь', 3), (5, 'Гренки', 4),
    (6, 'Картофель', 0), (6, 'Морковь', 1), (6, 'Яйцо', 2), (6, 'Колбаса', 3), (6, 'Горошек', 4), (6, 'Майонез', 5),
    (7, 'Маскарпоне', 0), (7, 'Печенье савоярди', 1), (7, 'Кофе', 2), (7, 'Какао', 3),
    (8, 'Сыр', 0), (8, 'Сливки', 1), (8, 'Печенье', 2), (8, 'Ваниль', 3);

INSERT INTO "reviews" ("id", "dish_id", "author_name", "body", "photo_url") VALUES
    (1, 1, 'Мария К.', 'Насыщенный бульон, порция большая.', 'https://picsum.photos/seed/r1/200/200'),
    (2, 1, 'Алексей', 'Классический вкус, как дома.', NULL),
    (3, 3, 'Ольга', 'Мясо мягкое, прожарка на месте.', 'https://picsum.photos/seed/r3/200/200'),
    (4, 5, 'Дмитрий', 'Соус отличный, креветки свежие.', NULL),
    (5, 7, 'Елена', 'Сладко, но не приторно.', 'https://picsum.photos/seed/r5/200/200');

INSERT INTO "halls" ("id", "name", "sort_order") VALUES
    (1, 'Основной зал', 0),
    (2, 'Терраса', 1);

INSERT INTO "hall_tables" ("id", "hall_id", "code", "pos_x", "pos_y", "seat_count") VALUES
    (1, 1, '1', 8, 12, 2),
    (2, 1, '2', 32, 12, 4),
    (3, 1, '3', 58, 12, 2),
    (4, 1, '4', 78, 12, 6),
    (5, 1, '5', 18, 48, 4),
    (6, 1, '6', 48, 48, 2),
    (7, 1, '7', 72, 48, 4),
    (8, 2, 'Т1', 15, 20, 2),
    (9, 2, 'Т2', 45, 20, 4),
    (10, 2, 'Т3', 75, 20, 2),
    (11, 2, 'Т4', 30, 55, 6),
    (12, 2, 'Т5', 65, 55, 4);

INSERT INTO "bookings" ("id", "table_id", "visit_date", "guest_count", "contact_name", "contact_phone", "contact_email") VALUES
    (1, 2, '2026-04-25', 3, 'Иван Петров', '+79001112233', NULL),
    (2, 6, '2026-04-25', 2, 'Светлана', '+79004445566', NULL),
    (3, 9, '2026-04-26', 4, 'Кирилл', '+79007778899', NULL);

SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX("id") FROM "users"), 1), true);
SELECT setval(pg_get_serial_sequence('menu_sections', 'id'), COALESCE((SELECT MAX("id") FROM "menu_sections"), 1), true);
SELECT setval(pg_get_serial_sequence('dishes', 'id'), COALESCE((SELECT MAX("id") FROM "dishes"), 1), true);
SELECT setval(pg_get_serial_sequence('dish_ingredients', 'id'), COALESCE((SELECT MAX("id") FROM "dish_ingredients"), 1), true);
SELECT setval(pg_get_serial_sequence('reviews', 'id'), COALESCE((SELECT MAX("id") FROM "reviews"), 1), true);
SELECT setval(pg_get_serial_sequence('halls', 'id'), COALESCE((SELECT MAX("id") FROM "halls"), 1), true);
SELECT setval(pg_get_serial_sequence('hall_tables', 'id'), COALESCE((SELECT MAX("id") FROM "hall_tables"), 1), true);
SELECT setval(pg_get_serial_sequence('bookings', 'id'), COALESCE((SELECT MAX("id") FROM "bookings"), 1), true);
