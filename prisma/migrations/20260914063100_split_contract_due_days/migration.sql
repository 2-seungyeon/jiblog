-- AlterTable
ALTER TABLE "Contract" RENAME COLUMN "dueDay" TO "rentDueDay";

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN "maintenanceDueDay" INTEGER NOT NULL DEFAULT 5;

-- Existing contracts used one shared due day; copy rent due day as the starting maintenance due day.
UPDATE "Contract" SET "maintenanceDueDay" = "rentDueDay";
