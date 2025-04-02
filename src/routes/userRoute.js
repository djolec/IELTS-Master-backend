import express from "express";
import userController from "../controllers/userController.js";
import { jwtCheck } from "../middleware/auth.js";
const router = express.Router();

router.post("/", jwtCheck, userController.createUser);

export default router;
