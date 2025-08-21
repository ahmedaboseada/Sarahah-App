import { verifyToken } from '../../middlewares/authentication.js'
import * as UC from './user.service.js'
import { Router } from 'express'
import { validation } from '../../middlewares/validation.js'
import * as UVS from './user.validation.js'
import { cloudinaryUploadAvatarAndCover } from '../../middlewares/cloudinary.js'
import { restrictTo } from '../../middlewares/restrictTo.js'
import { allowedFileExtensions } from '../../config/CONSTANTS.js'
import messageRouter from '../messageModel/message.controller.js'

const userRouter = Router()

userRouter.use('/:id/messages',messageRouter)

userRouter.post(
    "/signup",
    cloudinaryUploadAvatarAndCover({ folder: "users", customExtensions: [...allowedFileExtensions.image] }),
    validation(UVS.signupSchema),
    UC.signup
);
userRouter.post('/signin', validation(UVS.signinSchema), UC.signin)
userRouter.get('/confirmEmail/:token', UC.confirmEmail)
userRouter.post('/forgetPassword', validation(UVS.forgetPasswordSchema), UC.forgetPassword)
userRouter.post('/checkOTP', validation(UVS.checkOTPSchema), UC.checkOTP)
userRouter.post('/refreshToken', UC.refreshToken)
userRouter.get('/profile/:id', validation(UVS.getProfileSchema), UC.getProfileForAll)
userRouter.use('/', verifyToken)
userRouter.use('/', restrictTo(['user','admin']))
userRouter.get('/', UC.getProfile)
userRouter.post('/logout', UC.logout)
userRouter.post('/resendConfirmEmail', UC.resendConfirmEmail)
userRouter.patch('/updatePassword', validation(UVS.updatePasswordSchema), UC.updatePassword)
userRouter.patch('/updateProfile', cloudinaryUploadAvatarAndCover({ folder: 'users', customExtensions: [...allowedFileExtensions.image] }), validation(UVS.updateProfile), UC.updateProfile)
userRouter.patch('/profile/freeze/{:id}',validation(UVS.freezeAccountSchema), UC.freezeAccount)
userRouter.patch('/profile/unfreeze/{:id}', validation(UVS.unfreezeAccountSchema), UC.unfreezeAccount)
userRouter.delete('/profile/delete/:id', validation(UVS.deleteUserSchema), restrictTo(['admin']), UC.deleteUser)
userRouter.delete('/profile/deleteAll', restrictTo(['admin']),UC.deleteAllUsers)
export default userRouter