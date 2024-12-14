/*
  Warnings:

  - You are about to drop the column `departure_airport_id` on the `flights` table. All the data in the column will be lost.
  - Added the required column `departure_terminal_id` to the `flights` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "flights" DROP CONSTRAINT "flights_arrival_airport_id_fkey";

-- DropForeignKey
ALTER TABLE "flights" DROP CONSTRAINT "flights_departure_airport_id_fkey";

-- AlterTable
ALTER TABLE "flights" DROP COLUMN "departure_airport_id",
ADD COLUMN     "departure_terminal_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_departure_terminal_id_fkey" FOREIGN KEY ("departure_terminal_id") REFERENCES "terminals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_arrival_airport_id_fkey" FOREIGN KEY ("arrival_airport_id") REFERENCES "terminals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
