import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import {
  addZone,
  listZones,
  removeZone,
} from "../controllers/allowedZoneController";

const router = Router(); //api/allowedZone/

/**
 * @openapi
 * /api/allowed-zone/:
 *   post:
 *     summary: Add an allowed zone for the authenticated user
 *     tags:
 *       - Allowed Zone
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               zoneName:
 *                 type: string
 *               centerLat:
 *                 type: number
 *               centerLng:
 *                 type: number
 *               radiusMeters:
 *                 type: number
 *               serialNumber:
 *                 type: string
 *             required:
 *               - zoneName
 *               - centerLat
 *               - centerLng
 *               - radiusMeters
 *               - serialNumber
 *     responses:
 *       403:
 *         description: Forbidden - user does not own this watch
 *       401:
 *         description: Unauthenticated or expired token
 *       400:
 *         description: Bad Request - missing zone parameters
 *       500:
 *         description: Internal Server Error - failed to add zone
 *       201:
 *         description: Zone created successfully
 */
router.post("/", isAuthenticated, addZone);
/**
 * @openapi
 * /api/allowed-zone/{serialNumber}:
 *   get:
 *     summary: get allowed zones for a child of the authenticated user
 *     tags:
 *       - Allowed Zone
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serialNumber
 *         schema:
 *           type: string
 *         required: true
 *         description: Serial number of the watch to get allowed zones for
 *     responses:
 *       403:
 *         description: Forbidden - user does not own this watch
 *       401:
 *         description: Unauthenticated or expired token
 *       400:
 *         description: Bad Request - serial number is required
 *       500:
 *         description: Internal Server Error - failed to add zone
 *       200:
 *         description: Zone list retrieved successfully
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
 *                   zoneName:
 *                     type: string
 *                   centerLat:
 *                     type: number
 *                   centerLng:
 *                     type: number
 *                   radiusMeters:
 *                     type: number
 */
router.get("/:serialNumber", isAuthenticated, listZones);
/**
 * @openapi
 * /api/allowed-zone/{zoneId}:
 *   delete:
 *     summary: Delete the zone with the given ID
 *     tags:
 *       - Allowed Zone
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: zoneId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the zone to delete
 *     responses:
 *       204:
 *         description: Zone deleted successfully
 *       401:
 *         description: Not authenticated
 *       400:
 *         description: Bad Request - zone ID is required
 *       500:
 *         description: Internal Server Error - failed to delete zone
 */
router.delete("/:zoneId", isAuthenticated, removeZone);

export default router;
