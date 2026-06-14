import { Router } from "express";
import healthRouter from "./health.js";
import storesRouter from "./stores.js";
import staffRouter from "./staff.js";
import phonesRouter from "./phones.js";
import salesRouter from "./sales.js";
import dashboardRouter from "./dashboard.js";

const router = Router();
router.use(healthRouter);
router.use(storesRouter);
router.use(staffRouter);
router.use(phonesRouter);
router.use(salesRouter);
router.use(dashboardRouter);

export default router;
