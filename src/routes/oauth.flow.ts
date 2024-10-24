import express from "express";
import {authorize, token, authenticate, test, isAuthenticated, login} from "../services/authentication.service";

const router = express.Router();

router.post('/login', login)
router.get("/authorize", isAuthenticated, authorize);
router.post("/token", token);
router.get("/authenticate", authenticate);


export default router;