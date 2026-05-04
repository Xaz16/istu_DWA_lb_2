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

INSERT INTO "menu_sections" ("name", "sort_order") VALUES ('Горячее', 0), ('Напитки', 1);

INSERT INTO "dishes" ("section_id", "name", "description", "image_url", "weight_g", "calories", "has_allergens", "is_spicy", "kid_friendly")
VALUES (1, 'Борщ', 'Классический суп', NULL, 350, 180, true, false, true);

INSERT INTO "dish_ingredients" ("dish_id", "name", "sort_order") VALUES (1, 'Свёкла', 0), (1, 'Говядина', 1);

INSERT INTO "reviews" ("dish_id", "author_name", "body", "photo_url") VALUES (1, 'Иван', 'Отлично', NULL);

INSERT INTO "halls" ("name", "sort_order") VALUES ('Основной зал', 0);

INSERT INTO "hall_tables" ("hall_id", "code", "pos_x", "pos_y", "seat_count") VALUES (1, 'T1', 10, 10, 4), (1, 'T2', 30, 10, 2);
