import { Router } from "express";
import multer from "multer";
import {
  uploadWatchData,
  getWatchData,
} from "../controllers/watchDataController";
import { isAuthenticated } from "../middlewares/isAuthenticated";

const router = Router(); //api/watch-data/

// Use multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
/**
 * @openapi
 * /api/watch-data:
 *   post:
 *     summary: Upload watch data from a smartwatch
 *     description: Upload sensor data and optional audio recording from a smartwatch. Data is associated with the watch's serial number.
 *     tags:
 *       - Watch Data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - serialNumber
 *             properties:
 *               serialNumber:
 *                 type: string
 *                 description: Unique serial number of the watch
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: Audio recording file (optional)
 *               heartRate:
 *                 type: number
 *                 description: Heart rate in BPM
 *               stepCount:
 *                 type: number
 *                 description: Number of steps counted
 *               latitude:
 *                 type: number
 *                 format: double
 *                 description: Latitude coordinate
 *               longitude:
 *                 type: number
 *                 format: double
 *                 description: Longitude coordinate
 *               batteryLevel:
 *                 type: number
 *                 nullable: true
 *                 description: Battery level percentage
 *     responses:
 *       201:
 *         description: Watch data saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: string
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Server error
 */
router.post("/", upload.single("audio"), uploadWatchData);

/**
 * @openapi
 * /api/watch-data/{serialNumber}:
 *   get:
 *     summary: Get the latest watch data for a specific serial number
 *     description: Retrieve the most recent data entry for a watch that the authenticated user owns
 *     tags:
 *       - Watch Data
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: serialNumber
 *         schema:
 *           type: string
 *         required: true
 *         description: Serial number of the watch
 *     responses:
 *       200:
 *         description: Watch data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 serialNumber:
 *                   type: string
 *                 heartRate:
 *                   type: number
 *                   nullable: true
 *                 stepCount:
 *                   type: number
 *                   nullable: true
 *                 latitude:
 *                   type: number
 *                   nullable: true
 *                 longitude:
 *                   type: number
 *                   nullable: true
 *                 recordedAudio:
 *                   type: object
 *                   nullable: true
 *                 batteryLevel:
 *                   type: number
 *                   nullable: true
 *                 emotion:
 *                   type: string
 *                   nullable: true
 *                   description: Detected emotion from audio
 *                 confidence:
 *                   type: number
 *                   nullable: true
 *                   description: Confidence level of detected emotion
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Serial number is required
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - user does not own this watch
 *       500:
 *         description: Error retrieving watch data
 */
router.get("/:serialNumber", isAuthenticated, getWatchData);

export default router;
