import express from "express";
import { getAdminActivity, getAdminOverview, getAdminUsers } from "../controllers/adminController.js";
import adminOnly from "../middleware/adminOnly.js";
import protect from "../middleware/protect.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/overview", getAdminOverview);
router.get("/users", getAdminUsers);
router.get("/activity", getAdminActivity);

export default router;
