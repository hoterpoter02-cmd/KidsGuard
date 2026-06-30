import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import { isAdmin } from "../middlewares/isAdmin";
import { User } from "../models/User";
import { WatchData } from "../models/WatchData";
import { RecordedAudio } from "../models/RecordedAudio";

const router = Router(); //api/admin/
router.use(isAuthenticated);
router.use(isAdmin);

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: List all users
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       googleId:
 *                         type: string
 *                         nullable: true
 *                       photoUrl:
 *                         type: string
 *                         nullable: true
 *                       serialNumbers:
 *                         type: array
 *                         items:
 *                           type: string
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden - admin access required
 *       500:
 *         description: Server error
 */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

/**
 * @openapi
 * /api/admin/watchData/{serialNumber}:
 *   get:
 *     summary: List all watch data for a serial number
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serialNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Watch serial number
 *     responses:
 *       200:
 *         description: Watch data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   serialNumber:
 *                     type: string
 *                   heartRate:
 *                     type: number
 *                     nullable: true
 *                   stepCount:
 *                     type: number
 *                     nullable: true
 *                   longitude:
 *                     type: number
 *                     nullable: true
 *                   latitude:
 *                     type: number
 *                     nullable: true
 *                   batteryLevel:
 *                     type: number
 *                     nullable: true
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Serial number is required
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden - admin access required
 *       500:
 *         description: Error retrieving watch data
 */
router.get("/watchData/:serialNumber", async (req, res) => {
  try {
    const { serialNumber } = req.params;
    if (!serialNumber) {
      return res.status(400).json({ message: "Serial number is required" });
    }
    const allWatchData = await WatchData.find({ serialNumber });
    res.json(allWatchData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving watch data" });
  }
});

/**
 * @openapi
 * /api/admin/audio/{serialNumber}:
 *   get:
 *     summary: List all recorded audio entries for a serial number
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serialNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Watch serial number
 *     responses:
 *       200:
 *         description: Audio data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   serialNumber:
 *                     type: string
 *                   recordedAudio:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: Buffer
 *                       data:
 *                         type: array
 *                         items:
 *                           type: integer
 *                           format: int32
 *                     description: JSON-serialized Buffer with byte data in the data array
 *                   emotion:
 *                     type: string
 *                     nullable: true
 *                   safety:
 *                     type: string
 *                     nullable: true
 *                   confidence:
 *                     type: number
 *                     nullable: true
 *                   safetyConfidence:
 *                     type: number
 *                     nullable: true
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Serial number is required
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden - admin access required
 *       500:
 *         description: Error retrieving audio data
 */
router.get("/audio/:serialNumber", async (req, res) => {
  try {
    const { serialNumber } = req.params;
    if (!serialNumber) {
      return res.status(400).json({ message: "Serial number is required" });
    }
    const allAudioData = await RecordedAudio.find({ serialNumber });
    res.json(allAudioData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving audio data" });
  }
});

export default router;
