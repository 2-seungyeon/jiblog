-- CreateEnum
CREATE TYPE "ResidenceStatus" AS ENUM ('거주 중', '이사 예정', '과거 거주');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('월세', '전세', '반전세');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('계약 진행 중');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('예정', '완료');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('관리비', '전기', '가스', '수도', '인터넷', '기타');

-- CreateTable
CREATE TABLE "Home" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "detailAddress" TEXT,
    "residenceStatus" "ResidenceStatus" NOT NULL,
    "moveInDate" DATE,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Home_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "homeId" TEXT NOT NULL,
    "type" "ContractType" NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "deposit" INTEGER NOT NULL,
    "monthlyRent" INTEGER NOT NULL DEFAULT 0,
    "maintenanceFee" INTEGER NOT NULL DEFAULT 0,
    "status" "ContractStatus" NOT NULL DEFAULT '계약 진행 중',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentPayment" (
    "id" TEXT NOT NULL,
    "homeId" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "dueDay" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT '예정',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpensePayment" (
    "id" TEXT NOT NULL,
    "homeId" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amount" INTEGER NOT NULL,
    "dueDay" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT '예정',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpensePayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Home_isPrimary_idx" ON "Home"("isPrimary");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_homeId_key" ON "Contract"("homeId");

-- CreateIndex
CREATE INDEX "RentPayment_yearMonth_idx" ON "RentPayment"("yearMonth");

-- CreateIndex
CREATE INDEX "RentPayment_status_idx" ON "RentPayment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RentPayment_homeId_yearMonth_key" ON "RentPayment"("homeId", "yearMonth");

-- CreateIndex
CREATE INDEX "ExpensePayment_homeId_yearMonth_idx" ON "ExpensePayment"("homeId", "yearMonth");

-- CreateIndex
CREATE INDEX "ExpensePayment_yearMonth_idx" ON "ExpensePayment"("yearMonth");

-- CreateIndex
CREATE INDEX "ExpensePayment_status_idx" ON "ExpensePayment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ExpensePayment_homeId_yearMonth_category_key" ON "ExpensePayment"("homeId", "yearMonth", "category");

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentPayment" ADD CONSTRAINT "RentPayment_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpensePayment" ADD CONSTRAINT "ExpensePayment_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;
