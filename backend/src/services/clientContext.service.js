import { prisma } from "../config/prisma.js";

const userSafeSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  deviceId: true,
  isDeviceVerified: true,
  createdAt: true,
};

// Finds the student record the client is allowed to view.
export async function getClientStudent({ userId, role }) {
  if (role === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        user: { select: userSafeSelect },
        class: true,
        parent: { include: { user: { select: userSafeSelect } } },
      },
    });
    return { student, isParent: false };
  }

  if (role === "PARENT") {
    const parent = await prisma.parent.findUnique({
      where: { userId },
      include: {
        user: { select: userSafeSelect },
        children: { include: { user: { select: userSafeSelect }, class: true } },
      },
    });

    const student = parent?.children?.[0] || null;
    return { student, isParent: true };
  }

  return { student: null, isParent: false };
}

