import express from 'express'
import { callback } from '../services/openid-client';

const router = express.Router();

router.get('/', callback)


export default router;