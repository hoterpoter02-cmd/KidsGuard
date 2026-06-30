import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated";

import {
  getAudioBySerialNumber,
  getAudioFileById,
} from "../controllers/audioController";

const router = Router(); // api/audio/

/**
 * @openapi
 * /api/audio/{serialNumber}:
 *   get:
 *     summary: Get the most recent recorded audio by watch serial number
 *     tags:
 *       - Audio
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: serialNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Watch serial number
 *     responses:
 *       200:
 *         description: Latest recorded audio data for the watch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 serialNumber:
 *                   type: string
 *                 recordedAudio:
 *                   type: string
 *                   description: Base64-encoded audio payload
 *                   nullable: true
 *                 emotion:
 *                   type: string
 *                   nullable: true
 *                 confidence:
 *                   type: number
 *                   nullable: true
 *                 safety:
 *                   type: string
 *                   nullable: true
 *                 safetyConfidence:
 *                   type: number
 *                   nullable: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Serial number is required
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden - user does not own this watch
 *       500:
 *         description: Error retrieving audio data
 */
router.get("/:serialNumber", isAuthenticated, getAudioBySerialNumber);

/**
 * @openapi
 * /api/audio/file/{audioId}:
 *   get:
 *     summary: Get recorded audio file by audio ID
 *     tags:
 *       - Audio
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: audioId
 *         required: true
 *         schema:
 *           type: string
 *         description: Audio record ID
 *     responses:
 *       200:
 *         description: Audio file retrieved successfully
 *         content:
 *           audio/*:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Audio ID is required
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Audio record not found
 *       500:
 *         description: Error retrieving audio file
 */
router.get("/file/:audioId", isAuthenticated, getAudioFileById);

// router.delete("/:audioId", isAuthenticated, deleteAudioById);

export default router;
