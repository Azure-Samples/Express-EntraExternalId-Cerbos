import express from 'express';
import {signIn, signOut, handleRedirect} from '../controller/authController.js';
const router = express.Router();

router.get('/signin', signIn);
router.get('/signout', signOut);
router.post('/redirect', handleRedirect);

export default router;
