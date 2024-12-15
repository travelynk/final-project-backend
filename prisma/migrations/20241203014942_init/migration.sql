/*
  Warnings:

  - You are about to drop the column `outbound_flight_id` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `return_flight_id` on the `bookings` table. All the data in the column will be lost.
  - The primary key for the `cities` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `countries` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `disc` on the `flights` table. All the data in the column will be lost.
  - You are about to drop the column `route_id` on the `flights` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `flights` table. All the data in the column will be lost.
  - The `type` column on the `notifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `baby` on the `passenger_counts` table. All the data in the column will be lost.
  - You are about to drop the column `booking_id` on the `passengers` table. All the data in the column will be lost.
  - You are about to drop the column `seat_id` on the `passengers` table. All the data in the column will be lost.
  - The `gender` column on the `profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `otp` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `airlines_planes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `planes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `routes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transits` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[flight_num]` on the table `flights` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identity_number]` on the table `passengers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transaction_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `image` to the `airlines` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `region` on the `countries` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `airline_id` to the `flights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `arrival_airport_id` to the `flights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departure_airport_id` to the `flights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estimated_duration` to the `flights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `flight_num` to the `flights` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `seat_class` on the `flights` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `infant` to the `passenger_counts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `passengers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reference_number` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transaction_id` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `method` on the `payments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "airlines_planes" DROP CONSTRAINT "airlines_planes_airlineId_fkey";

-- DropForeignKey
ALTER TABLE "airlines_planes" DROP CONSTRAINT "airlines_planes_planeId_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_outbound_flight_id_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_return_flight_id_fkey";

-- DropForeignKey
ALTER TABLE "flights" DROP CONSTRAINT "flights_route_id_fkey";

-- DropForeignKey
ALTER TABLE "passengers" DROP CONSTRAINT "passengers_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "passengers" DROP CONSTRAINT "passengers_seat_id_fkey";

-- DropForeignKey
ALTER TABLE "routes" DROP CONSTRAINT "routes_airline_id_fkey";

-- DropForeignKey
ALTER TABLE "routes" DROP CONSTRAINT "routes_arrival_airport_id_fkey";

-- DropForeignKey
ALTER TABLE "routes" DROP CONSTRAINT "routes_departure_airport_id_fkey";

-- DropForeignKey
ALTER TABLE "transits" DROP CONSTRAINT "transits_flight_id_fkey";

-- DropForeignKey
ALTER TABLE "transits" DROP CONSTRAINT "transits_route_id_fkey";

-- DropForeignKey
ALTER TABLE "airports" DROP CONSTRAINT "airports_city_code_fkey";

-- AlterTable
CREATE SEQUENCE airlines_id_seq;
ALTER TABLE "airlines" ADD COLUMN     "image" VARCHAR(255) NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('airlines_id_seq'),
ALTER COLUMN "code" SET DATA TYPE VARCHAR(4);
ALTER SEQUENCE airlines_id_seq OWNED BY "airlines"."id";

-- AlterTable
ALTER TABLE "airports" ALTER COLUMN "code" SET DATA TYPE VARCHAR(4);

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "outbound_flight_id",
DROP COLUMN "return_flight_id",
ADD COLUMN     "disc" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "cities" DROP CONSTRAINT "cities_pkey" CASCADE,
ALTER COLUMN "code" SET DATA TYPE VARCHAR(4),
ADD CONSTRAINT "cities_pkey" PRIMARY KEY ("code");

-- AlterTable
ALTER TABLE "countries" DROP CONSTRAINT "countries_pkey" CASCADE,
ALTER COLUMN "code" SET DATA TYPE VARCHAR(4),
DROP COLUMN "region",
ADD COLUMN     "region" VARCHAR(20) NOT NULL,
ADD CONSTRAINT "countries_pkey" PRIMARY KEY ("code");

-- AlterTable
ALTER TABLE "flight_seats" ALTER COLUMN "position" SET DATA TYPE VARCHAR(4);

-- AlterTable
ALTER TABLE "flights" DROP COLUMN "disc",
DROP COLUMN "route_id",
DROP COLUMN "type",
ADD COLUMN     "airline_id" INTEGER NOT NULL,
ADD COLUMN     "arrival_airport_id" INTEGER NOT NULL,
ADD COLUMN     "departure_airport_id" INTEGER NOT NULL,
ADD COLUMN     "estimated_duration" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "flight_num" VARCHAR(15) NOT NULL,
DROP COLUMN "seat_class",
ADD COLUMN     "seat_class" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'General';

-- AlterTable
ALTER TABLE "passenger_counts" DROP COLUMN "baby",
ADD COLUMN     "infant" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "passengers" DROP COLUMN "booking_id",
DROP COLUMN "seat_id",
ADD COLUMN     "user_id" INTEGER NOT NULL,
ALTER COLUMN "title" SET DATA TYPE VARCHAR(7);

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "reference_number" VARCHAR(100) NOT NULL,
ADD COLUMN     "transaction_id" VARCHAR(100) NOT NULL,
DROP COLUMN "method",
ADD COLUMN     "method" VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "gender",
ADD COLUMN     "gender" VARCHAR(10);

-- AlterTable
ALTER TABLE "users" DROP COLUMN "otp",
ADD COLUMN     "otp_secret" CHAR(255);

-- DropTable
DROP TABLE "airlines_planes";

-- DropTable
DROP TABLE "planes";

-- DropTable
DROP TABLE "routes";

-- DropTable
DROP TABLE "transits";

-- DropEnum
DROP TYPE "CountryRegion";

-- DropEnum
DROP TYPE "FlightType";

-- DropEnum
DROP TYPE "Gender";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "SeatClass";

-- DropEnum
DROP TYPE "TypeNotification";

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

-- CreateIndex
CREATE UNIQUE INDEX "flights_flight_num_key" ON "flights"("flight_num");

-- CreateIndex
CREATE UNIQUE INDEX "passengers_identity_number_key" ON "passengers"("identity_number");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transaction_id_key" ON "payments"("transaction_id");

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_airline_id_fkey" FOREIGN KEY ("airline_id") REFERENCES "airlines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_departure_airport_id_fkey" FOREIGN KEY ("departure_airport_id") REFERENCES "airports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_arrival_airport_id_fkey" FOREIGN KEY ("arrival_airport_id") REFERENCES "airports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
