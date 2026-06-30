import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import { isAdmin } from "../middlewares/isAdmin";
import { User } from "../models/User";
import { WatchData } from "../models/WatchData";
import { RecordedAudio } from "../models/RecordedAudio";

const router = Router(); //api/admin/
router.use(isAuthenticated);
router.use(isAdmin);

router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

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
