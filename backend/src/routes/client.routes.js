import express from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { ROLES } from "../models/constants.js";
import {
  attendance,
  depositSchema,
  feeBalance,
  feeDeposit,
  feeHistory,
  feeWithdraw,
  getProfile,
  grades,
  notifications,
  timetable,
  withdrawSchema,
} from "../controllers/client.controller.js";

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(ROLES.STUDENT, ROLES.PARENT));

router.get("/profile", getProfile);
router.get("/fees/balance", feeBalance);
router.get("/fees/history", feeHistory);
router.post("/fees/deposit", validateBody(depositSchema), feeDeposit);
router.post("/fees/withdraw", validateBody(withdrawSchema), feeWithdraw);
router.get("/grades", grades);
router.get("/attendance", attendance);
router.get("/timetable", timetable);
router.get("/notifications", notifications);

export default router;

