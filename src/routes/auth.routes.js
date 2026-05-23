import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  me,
} from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, me);

export default router;
