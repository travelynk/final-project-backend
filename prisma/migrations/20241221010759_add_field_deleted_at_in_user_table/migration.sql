-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "deadline" SET DEFAULT CURRENT_TIMESTAMP + INTERVAL '15 minutes';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deleted_at" TIMESTAMP(3);
