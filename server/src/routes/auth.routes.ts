import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { z } from 'zod';
import { ROLES } from '../constants';

const router = Router();

const emailSchema = z.string().email();
const passwordSchema = z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/);

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: emailSchema,
  password: passwordSchema,
  phone: z.string().optional(),
  role: z.enum([ROLES.CUSTOMER, ROLES.RESTAURANT_OWNER, ROLES.DELIVERY_PARTNER]).optional().default(ROLES.CUSTOMER),
});
const loginSchema = z.object({ email: emailSchema, password: z.string().min(1) });
const forgotPasswordSchema = z.object({ email: emailSchema });
const resetPasswordSchema = z.object({ token: z.string().min(1), password: passwordSchema, confirmPassword: z.string() }).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });
const changePasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: passwordSchema, confirmPassword: z.string() }).refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });
const sendOTPSchema = z.object({ identifier: z.string().min(1) });
const verifyOTPSchema = z.object({ identifier: z.string().min(1), otp: z.string().length(6) });
const refreshTokenSchema = z.object({ refreshToken: z.string().min(1) });

router.post('/register', validate(registerSchema), authController.register.bind(authController));
router.post('/login', validate(loginSchema), authController.login.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken.bind(authController));
router.get('/verify-email', authController.verifyEmail.bind(authController));
router.post('/send-otp', validate(sendOTPSchema), authController.sendOTP.bind(authController));
router.post('/verify-otp', validate(verifyOTPSchema), authController.verifyOTP.bind(authController));
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword.bind(authController));
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword.bind(authController));
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword.bind(authController));
router.get('/me', authenticate, authController.getMe.bind(authController));

export default router;
