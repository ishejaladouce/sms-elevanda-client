import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/response.js";
import { getClientStudent } from "../services/clientContext.service.js";
import { getFeeBalance, getFeeHistory, deposit, withdraw } from "../services/fees.service.js";
import { getAttendance, getGrades, getTimetable } from "../services/academic.service.js";
import { listNotifications } from "../services/notifications.service.js";

export const depositSchema = z.object({
  amount: z.number().int().positive(),
  note: z.string().max(200).optional(),
});

export const withdrawSchema = z.object({
  amount: z.number().int().positive(),
  note: z.string().max(200).optional(),
});

function getStudentIdFromQuery(req) {
  const value = req.query?.studentId;
  if (typeof value === "string" && value.trim().length > 0) return value.trim();
  return undefined;
}

export const getProfile = asyncHandler(async (req, res) => {
  const { student, isParent, parent } = await getClientStudent({
    userId: req.user.sub,
    role: req.user.role,
    studentId: getStudentIdFromQuery(req),
  });
  return ok(res, "Profile", {
    auth: req.user,
    isParent,
    parent,
    student,
  });
});

export const feeBalance = asyncHandler(async (req, res) => {
  const { student } = await getClientStudent({
    userId: req.user.sub,
    role: req.user.role,
    studentId: getStudentIdFromQuery(req),
  });
  if (!student) return ok(res, "Fee balance", { balance: 0 });
  const balance = await getFeeBalance(student.id);
  return ok(res, "Fee balance", { balance });
});

export const feeHistory = asyncHandler(async (req, res) => {
  const { student } = await getClientStudent({
    userId: req.user.sub,
    role: req.user.role,
    studentId: getStudentIdFromQuery(req),
  });
  if (!student) return ok(res, "Fee history", { items: [] });
  const items = await getFeeHistory(student.id);
  return ok(res, "Fee history", { items });
});

export const feeDeposit = asyncHandler(async (req, res) => {
  const { student } = await getClientStudent({
    userId: req.user.sub,
    role: req.user.role,
    studentId: getStudentIdFromQuery(req),
  });
  if (!student) {
    const err = new Error("Student not found for this account");
    err.status = 400;
    throw err;
  }
  const tx = await deposit({ studentId: student.id, amount: req.body.amount, note: req.body.note });
  return ok(res, "Deposit successful", { tx });
});

export const feeWithdraw = asyncHandler(async (req, res) => {
  const { student } = await getClientStudent({
    userId: req.user.sub,
    role: req.user.role,
    studentId: getStudentIdFromQuery(req),
  });
  if (!student) {
    const err = new Error("Student not found for this account");
    err.status = 400;
    throw err;
  }
  const tx = await withdraw({ studentId: student.id, amount: req.body.amount, note: req.body.note });
  return ok(res, "Withdrawal request saved", { tx });
});

export const grades = asyncHandler(async (req, res) => {
  const { student } = await getClientStudent({
    userId: req.user.sub,
    role: req.user.role,
    studentId: getStudentIdFromQuery(req),
  });
  const items = student ? await getGrades(student.id) : [];
  return ok(res, "Grades", { items });
});

export const attendance = asyncHandler(async (req, res) => {
  const { student } = await getClientStudent({
    userId: req.user.sub,
    role: req.user.role,
    studentId: getStudentIdFromQuery(req),
  });
  const items = student ? await getAttendance(student.id) : [];
  return ok(res, "Attendance", { items });
});

export const timetable = asyncHandler(async (req, res) => {
  const { student } = await getClientStudent({
    userId: req.user.sub,
    role: req.user.role,
    studentId: getStudentIdFromQuery(req),
  });
  const items = student ? await getTimetable(student.id) : [];
  return ok(res, "Timetable", { items });
});

export const notifications = asyncHandler(async (req, res) => {
  const items = await listNotifications(req.user.sub);
  return ok(res, "Notifications", { items });
});

