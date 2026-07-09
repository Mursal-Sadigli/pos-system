import { Router } from "express";
import { validate } from "../middleware/validation.middleware";
import {
  acceptInviteSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  inviteSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validations/auth.validation";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

// =============== Public Routes ============= //

// Register
router.post("/register", validate(registerSchema), AuthController.register);

// Accept invitation
router.post("/accept-invite", validate(acceptInviteSchema), AuthController.acceptInvitation);

// Login
router.post("/login", validate(loginSchema), AuthController.login);

// Verify 2FA
router.post("/verify-2fa", AuthController.verify2FA);

// Invite user (admin only)
router.post("/invite", authenticate, authorize('SUPER_ADMIN', 'ADMIN'), validate(inviteSchema), AuthController.invite);

// Refresh token
router.post("/refresh-token", validate(refreshTokenSchema), AuthController.refreshToken);

// Forgot Password
router.post("/forgot-password", validate(forgotPasswordSchema), AuthController.forgotPassword);

// Reset password
router.post("/reset-password", validate(resetPasswordSchema), AuthController.resetPassword);

// ================= Protected Routes ================= //

//logout
router.post("/logout", authenticate, AuthController.logout);

// Get current user
router.get("/me", authenticate, AuthController.getMe);

// Change password
router.post("/change-password", authenticate, validate(changePasswordSchema), AuthController.changePassword);

export default router;
