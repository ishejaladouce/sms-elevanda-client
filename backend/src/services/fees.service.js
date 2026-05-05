import { prisma } from "../config/prisma.js";

export async function getFeeBalance(studentId) {
  const last = await prisma.feePayment.findFirst({
    where: { studentId },
    orderBy: { createdAt: "desc" },
  });
  return last?.balance ?? 0;
}

export async function getFeeHistory(studentId) {
  return prisma.feePayment.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
  });
}

export async function deposit({ studentId, amount, note }) {
  const current = await getFeeBalance(studentId);
  const balance = current + amount;

  return prisma.feePayment.create({
    data: { studentId, amount, type: "DEPOSIT", balance, note },
  });
}

export async function withdraw({ studentId, amount, note }) {
  const current = await getFeeBalance(studentId);
  if (amount > current) {
    const err = new Error("Withdrawal exceeds available balance");
    err.status = 400;
    throw err;
  }

  const balance = current - amount;
  return prisma.feePayment.create({
    data: { studentId, amount, type: "WITHDRAWAL", balance, note },
  });
}

