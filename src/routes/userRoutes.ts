import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import {
  updateUserInformation,
  deleteUserAccount,
  getCurrentUserInfo,
} from "../controllers/userController";

const router = Router(); //api/user/

// Get current user info - Authenticated through passport session
/**
 * @openapi
 * /api/user/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags:
 *       - User
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user info
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   email:
 *                     type: string
 *                   name:
 *                     type: string
 *                   photoUrl:
 *                     type: string
 *                   serialNumbers:
 *                     type: array
 *                     items:
 *                       type: string
 *       401:
 *         description: Not authenticated
 */
router.get("/me", isAuthenticated, getCurrentUserInfo);

// Update user information: name and/or photoUrl
/**
 * @openapi
 * /api/user/me:
 *   put:
 *     summary: Update authenticated user's information
 *     tags:
 *       - User
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               photoUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: No fields to update
 *       401:
 *         description: Not authenticated
 */
router.put("/me", isAuthenticated, updateUserInformation);

// Delete the currently authenticated user's account
/**
 * @openapi
 * /api/user/me:
 *   delete:
 *     summary: Delete the authenticated user's account
 *     tags:
 *       - User
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User account deleted
 *       401:
 *         description: Not authenticated
 */
router.delete("/me", isAuthenticated, deleteUserAccount);

export default router;
