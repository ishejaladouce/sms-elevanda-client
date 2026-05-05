import { prisma } from "../config/prisma.js";

export async function getGrades(studentId) {
  return prisma.grade.findMany({
    where: { studentId },
    orderBy: [{ term: "desc" }, { subject: "asc" }],
  });
}

export async function getAttendance(studentId) {
  return prisma.attendance.findMany({
    where: { studentId },
    orderBy: { date: "desc" },
  });
}

export async function getTimetable(studentId) {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student?.classId) return [];

  return prisma.schedule.findMany({
    where: { classId: student.classId },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
}

