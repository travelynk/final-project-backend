/*
  Warnings:

  - You are about to drop the column `airport_id` on the `airlines` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "airlines" DROP CONSTRAINT "airlines_airport_id_fkey";

-- AlterTable
ALTER TABLE "airlines" DROP COLUMN "airport_id";
