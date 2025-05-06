import express from "express";
import {
  registerUser,
  verifyUser,
  loginUser,
  getMe,
  logoutUser,
} from "../controllers/user.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);

router.get("/verify/:token", verifyUser);

router.post("/login", loginUser);

router.get("/me", isLoggedIn, getMe);

router.get("/logout", isLoggedIn, logoutUser);
export default router;
