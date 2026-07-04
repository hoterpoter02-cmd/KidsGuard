import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import {
  updateUserInformation,
  deleteUserAccount,
  getCurrentUserInfo,
  getUserNotifications,
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

// Get notifications for the current authenticated user
/**
 * @openapi
 * /api/user/notifications:
 *   get:
 *     summary: Get current user's notifications
 *     tags:
 *       - User
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       recipientUserId:
 *                         type: string
 *                       serialNumber:
 *                         type: string
 *                       alertType:
 *                         type: string
 *                         enum:
 *                           - zone
 *                           - danger
 *                       watchDataId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           serialNumber:
 *                             type: string
 *                           heartRate:
 *                             type: number
 *                             nullable: true
 *                           stepCount:
 *                             type: number
 *                             nullable: true
 *                           longitude:
 *                             type: number
 *                             nullable: true
 *                           latitude:
 *                             type: number
 *                             nullable: true
 *                           batteryLevel:
 *                             type: number
 *                             nullable: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                       recordedAudioId:
 *                         oneOf:
 *                           - type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               serialNumber:
 *                                 type: string
 *                               recordedAudio:
 *                                 type: object
 *                                 properties:
 *                                   type:
 *                                     type: string
 *                                     example: Buffer
 *                                   data:
 *                                     type: array
 *                                     items:
 *                                       type: integer
 *                                       format: int32
 *                               emotion:
 *                                 type: string
 *                                 nullable: true
 *                               confidence:
 *                                 type: number
 *                                 nullable: true
 *                               safety:
 *                                 type: string
 *                                 nullable: true
 *                               safetyConfidence:
 *                                 type: number
 *                                 nullable: true
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *                           - type: 'null'
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Not authenticated
 */
router.get("/notifications", isAuthenticated, getUserNotifications);

export default router;
