import { PrismaClient } from "@prisma/client";
import { loadEnvLocal } from "./env";

loadEnvLocal();

const prisma = new PrismaClient();

export type HomeDisplaySnapshot = {
  nickname: string;
  address: string;
  detailAddress: string | null;
};

export type ContractStressSnapshot = {
  deposit: number;
  monthlyRent: number;
  maintenanceFee: number;
};

export async function getHomeDisplaySnapshot(
  homeId: string,
): Promise<HomeDisplaySnapshot | null> {
  return prisma.home.findUnique({
    where: { id: homeId },
    select: { nickname: true, address: true, detailAddress: true },
  });
}

export async function updateHomeDisplayFields(
  homeId: string,
  data: Partial<HomeDisplaySnapshot>,
): Promise<void> {
  await prisma.home.update({
    where: { id: homeId },
    data,
  });
}

export async function getContractStressSnapshot(
  homeId: string,
): Promise<ContractStressSnapshot | null> {
  return prisma.contract.findUnique({
    where: { homeId },
    select: { deposit: true, monthlyRent: true, maintenanceFee: true },
  });
}

export async function updateContractDeposit(
  homeId: string,
  deposit: number,
): Promise<void> {
  await prisma.contract.update({
    where: { homeId },
    data: { deposit },
  });
}

export async function disconnectStressFixture(): Promise<void> {
  await prisma.$disconnect();
}
