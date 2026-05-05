import { prisma } from "../config/prisma.js";

// Finds the student record the client is allowed to view.
export async function getClientStudent({ userId, role }) {
  if (role === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { userId },
      include: { user: true, class: true, parent: { include: { user: true } } },
    });
    return { student, isParent: false };
  }

  if (role === "PARENT") {
    const parent = await prisma.parent.findUnique({
      where: { userId },
      include: { user: true, children: { include: { user: true, class: true } } },
    });

    const student = parent?.children?.[0] || null;
    return { student, isParent: true };
  }

  return { student: null, isParent: false };
}

