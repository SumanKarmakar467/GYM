import express from "express";
import { getAdminOverview, getAdminUsers } from "../controllers/adminController.js";
import adminOnly from "../middleware/adminOnly.js";
import protect from "../middleware/protect.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/overview", getAdminOverview);
router.get("/users", getAdminUsers);

export default router;
