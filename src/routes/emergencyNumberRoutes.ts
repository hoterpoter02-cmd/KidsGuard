import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import {
  getEmergencyNumber,
  addEmergencyNumber,
} from "../controllers/emergencyNumberController";

const router = Router(); //api/emergency-number/

/**
 * @openapi
 * /api/emergency-number/{serialNumber}:
 *   get:
 *     summary: Get the emergency number for a watch serial number
 *     tags:
 *       - Emergency Number
 *     parameters:
 *       - in: path
 *         name: serialNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Serial number of the watch
 *     responses:
 *       200:
 *         description: Emergency number retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 serialNumber:
 *                   type: string
 *                 emergencyNumber:
 *                   type: string
 *       400:
 *         description: Serial number is required
 *       404:
 *         description: Emergency number not found
 *       500:
 *         description: Server error
 */
router.get("/:serialNumber", getEmergencyNumber);

/**
 * @openapi
 * /api/emergency-number/{serialNumber}:
 *   post:
 *     summary: Add or update the emergency number for a watch serial number
 *     tags:
 *       - Emergency Number
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serialNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Serial number of the watch
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emergencyNumber
 *             properties:
 *               emergencyNumber:
 *                 type: string
 *                 description: Emergency contact number for the watch
 *     responses:
 *       201:
 *         description: Emergency number created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 serialNumber:
 *                   type: string
 *                 emergencyNumber:
 *                   type: string
 *       400:
 *         description: Serial number and emergency number are required
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: User does not have access to this serial number
 *       500:
 *         description: Server error
 */
router.post("/:serialNumber", isAuthenticated, addEmergencyNumber);

export default router;
