import express from 'express'
import { loginController, registerController, verifyEmailController, forgotPasswordController, recoveryPasswordController, recoveryPasswordPageController, uploadProfileImageController, getUserDetailsController } from '../controllers/auth.controller.js'

const authRouter = express.Router()


authRouter.post('/register', registerController)
authRouter.post('/login', loginController)
authRouter.get('/verify-email/:validation_token', verifyEmailController)
authRouter.post('/forgot-password', forgotPasswordController)
authRouter.post('/reset-password', recoveryPasswordController)
authRouter.get('/recovery-password/:token', recoveryPasswordPageController)
authRouter.post('/upload-profile', uploadProfileImageController)
authRouter.post('/user-details', getUserDetailsController)

export default authRouter
