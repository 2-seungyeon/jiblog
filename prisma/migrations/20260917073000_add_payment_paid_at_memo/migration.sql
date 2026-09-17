-- AlterTable
ALTER TABLE "RentPayment" ADD COLUMN "paidAt" DATE,
ADD COLUMN "memo" TEXT;

-- AlterTable
ALTER TABLE "ExpensePayment" ADD COLUMN "paidAt" DATE,
ADD COLUMN "memo" TEXT;
