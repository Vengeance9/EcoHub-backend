import express from "express"
import { AuthController } from "./auth.controller"
import auth from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = express.Router()


router.post('/register',AuthController.registerUser)
router.post('/login',AuthController.loginUser)
router.get("/me", auth(Role.USER, Role.ADMIN), AuthController.getMe);
router.patch('/subscribe',auth(Role.USER,Role.ADMIN),AuthController.subscribe)

//router.get('/logout',AuthController.logOutUser)
router.post('/refresh-token',AuthController.getNewToken)
router.post('/change-password',AuthController.changPassword)

export const AuthRoutes = router