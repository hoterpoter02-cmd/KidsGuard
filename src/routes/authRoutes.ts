import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
} from "../controllers/authController";
const router = express.Router(); // api/auth/

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User registered
 *       400:
 *         description: Email and password required
 *       409:
 *         description: Email already in use
 *       500:
 *         description: Server error
 */
router.post("/register", registerUser);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Email and password required
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post("/login", loginUser);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Logout the current user
 *     tags:
 *       - Auth
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 *       500:
 *         description: Server error
 */
router.post("/logout", logoutUser);

/**
 * @openapi
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags:
 *       - Auth
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token for mobile clients
 *     responses:
 *       200:
 *         description: New access and refresh tokens issued
 *       401:
 *         description: Invalid refresh token
 */
router.post("/refresh-token", refreshToken);

export default router;
