/*
  Warnings:

  - The values [Pending,Confirmed] on the enum `BookingStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [percentage,fixed] on the enum `typeVoucher` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BookingStatus_new" AS ENUM ('Unpaid', 'Issued', 'Cancelled');
ALTER TABLE "bookings" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "bookings" ALTER COLUMN "status" TYPE "BookingStatus_new" USING ("status"::text::"BookingStatus_new");
ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "BookingStatus_old";
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'Unpaid';
COMMIT;

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'Cancelled';

-- AlterEnum
BEGIN;
CREATE TYPE "typeVoucher_new" AS ENUM ('Percentage', 'Fixed');
ALTER TABLE "vouchers" ALTER COLUMN "type" TYPE "typeVoucher_new" USING ("type"::text::"typeVoucher_new");
ALTER TYPE "typeVoucher" RENAME TO "typeVoucher_old";
ALTER TYPE "typeVoucher_new" RENAME TO "typeVoucher";
DROP TYPE "typeVoucher_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_voucher_code_fkey";

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "is_scan" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "url_qrcode" TEXT,
ALTER COLUMN "status" SET DEFAULT 'Unpaid',
ALTER COLUMN "voucher_code" DROP NOT NULL;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "deadline" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP + INTERVAL '15 minutes',
ALTER COLUMN "transaction_id" DROP NOT NULL,
ALTER COLUMN "reference_number" DROP NOT NULL,
ALTER COLUMN "total" DROP NOT NULL,
ALTER COLUMN "method" DROP NOT NULL,
ALTER COLUMN "amount" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_voucher_code_fkey" FOREIGN KEY ("voucher_code") REFERENCES "vouchers"("code") ON DELETE SET NULL ON UPDATE CASCADE;
