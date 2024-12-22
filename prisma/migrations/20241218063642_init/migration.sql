-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'buyer');

-- CreateEnum
CREATE TYPE "FlightCategory" AS ENUM ('Internasional', 'Domestik', 'Multi');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('Unpaid', 'Issued', 'Cancelled');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('Pending', 'Settlement', 'Capture', 'Failed', 'Expired', 'Cancelled');

-- CreateEnum
CREATE TYPE "typeVoucher" AS ENUM ('Percentage', 'Fixed');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL,
    "otp_secret" CHAR(255),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(16) NOT NULL,
    "gender" VARCHAR(10),

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "code" VARCHAR(4) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "region" VARCHAR(20) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "cities" (
    "code" VARCHAR(4) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "country_code" TEXT NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "airports" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(4) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "city_code" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "long" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "airports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terminals" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "airport_id" INTEGER NOT NULL,
    "category" "FlightCategory" NOT NULL,

    CONSTRAINT "terminals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airlines" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(4) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "image" VARCHAR(255) NOT NULL,

    CONSTRAINT "airlines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flights" (
    "id" SERIAL NOT NULL,
    "airline_id" INTEGER NOT NULL,
    "flight_num" VARCHAR(15) NOT NULL,
    "departure_terminal_id" INTEGER NOT NULL,
    "arrival_airport_id" INTEGER NOT NULL,
    "departure_time" TIMESTAMP(3) NOT NULL,
    "arrival_time" TIMESTAMP(3) NOT NULL,
    "estimated_duration" DOUBLE PRECISION NOT NULL,
    "seat_class" TEXT NOT NULL,
    "seat_capacity" INTEGER NOT NULL,
    "facility" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "flights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flight_seats" (
    "id" SERIAL NOT NULL,
    "flight_id" INTEGER,
    "position" VARCHAR(4) NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "flight_seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vouchers" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(8) NOT NULL,
    "type" "typeVoucher" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "min_purchase" DOUBLE PRECISION NOT NULL,
    "max_voucher" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "round_trip" BOOLEAN NOT NULL DEFAULT false,
    "total_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "voucher_code" VARCHAR(8),
    "url_qrcode" TEXT,
    "is_scan" BOOLEAN NOT NULL DEFAULT false,
    "status" "BookingStatus" NOT NULL DEFAULT 'Unpaid',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passengers" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" VARCHAR(7) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "family_name" VARCHAR(50),
    "dob" TIMESTAMP(3) NOT NULL,
    "nationality" VARCHAR(50) NOT NULL,
    "identity_number" VARCHAR(20) NOT NULL,
    "issuing_country" VARCHAR(50) NOT NULL,
    "identity_exp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passengers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_segments" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "flight_id" INTEGER NOT NULL,
    "is_return" BOOLEAN NOT NULL DEFAULT false,
    "passenger_id" INTEGER NOT NULL,
    "seat_id" INTEGER NOT NULL,

    CONSTRAINT "booking_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passenger_counts" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "adult" INTEGER NOT NULL,
    "child" INTEGER NOT NULL,
    "infant" INTEGER NOT NULL,

    CONSTRAINT "passenger_counts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "transaction_id" VARCHAR(100),
    "reference_number" VARCHAR(100),
    "total" DOUBLE PRECISION,
    "method" VARCHAR(20),
    "status" "PaymentStatus" NOT NULL DEFAULT 'Pending',
    "amount" DOUBLE PRECISION DEFAULT 0,
    "deadline" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP + INTERVAL '15 minutes',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "type" TEXT NOT NULL DEFAULT 'General',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "airports_code_key" ON "airports"("code");

-- CreateIndex
CREATE UNIQUE INDEX "airlines_code_key" ON "airlines"("code");

-- CreateIndex
CREATE UNIQUE INDEX "vouchers_code_key" ON "vouchers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "passengers_identity_number_key" ON "passengers"("identity_number");

-- CreateIndex
CREATE UNIQUE INDEX "passenger_counts_booking_id_key" ON "passenger_counts"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transaction_id_key" ON "payments"("transaction_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "airports" ADD CONSTRAINT "airports_city_code_fkey" FOREIGN KEY ("city_code") REFERENCES "cities"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terminals" ADD CONSTRAINT "terminals_airport_id_fkey" FOREIGN KEY ("airport_id") REFERENCES "airports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_airline_id_fkey" FOREIGN KEY ("airline_id") REFERENCES "airlines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_departure_terminal_id_fkey" FOREIGN KEY ("departure_terminal_id") REFERENCES "terminals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_arrival_airport_id_fkey" FOREIGN KEY ("arrival_airport_id") REFERENCES "terminals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_seats" ADD CONSTRAINT "flight_seats_flight_id_fkey" FOREIGN KEY ("flight_id") REFERENCES "flights"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_voucher_code_fkey" FOREIGN KEY ("voucher_code") REFERENCES "vouchers"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passengers" ADD CONSTRAINT "passengers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_segments" ADD CONSTRAINT "booking_segments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_segments" ADD CONSTRAINT "booking_segments_flight_id_fkey" FOREIGN KEY ("flight_id") REFERENCES "flights"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_segments" ADD CONSTRAINT "booking_segments_passenger_id_fkey" FOREIGN KEY ("passenger_id") REFERENCES "passengers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_segments" ADD CONSTRAINT "booking_segments_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "flight_seats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger_counts" ADD CONSTRAINT "passenger_counts_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
