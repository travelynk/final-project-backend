/*
  Warnings:

  - You are about to drop the column `disc` on the `bookings` table. All the data in the column will be lost.
  - Added the required column `lat` to the `airports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `long` to the `airports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voucher_code` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "typeVoucher" AS ENUM ('percentage', 'fixed');

-- AlterTable
ALTER TABLE "airports" ADD COLUMN     "lat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "long" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "disc",
ADD COLUMN     "voucher_code" VARCHAR(8) NOT NULL;

-- CreateTable
CREATE TABLE "vouchers" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(8) NOT NULL,
    "type" "typeVoucher" NOT NULL,
    "min_purchase" DOUBLE PRECISION NOT NULL,
    "max_voucher" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vouchers_code_key" ON "vouchers"("code");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_voucher_code_fkey" FOREIGN KEY ("voucher_code") REFERENCES "vouchers"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
