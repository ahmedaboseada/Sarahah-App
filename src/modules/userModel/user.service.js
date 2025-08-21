import userModel from "../../models/user.model.js"
import messageModel from "../../models/message.model.js"
import { eventEmitter } from "../../utils/sendEmail-events/index.js"
import { nanoid, customAlphabet } from 'nanoid'
import { revokeTokenModel } from '../../models/revoke-token.model.js'
import * as HT from '../../utils/hash/index.js'
import * as ET from '../../utils/encryption/index.js'
import * as VT from '../../utils/token/index.js'
import { userProvider } from "../../config/CONSTANTS.js"
import { OAuth2Client } from "google-auth-library"
import cloudinary from "../../config/cloudinary.js"

export const signup = async (req, res, next) => {
    try {
        const { name, email, password, gender, phone } = req.body;

        const avatar = req.files?.avatar?.[0]?.cloudinaryUrl || "";
        const avatarPublicId = req.files?.avatar?.[0]?.publicId || "";
        const coverImages = req.files?.images?.map(f => f.cloudinaryUrl) || [];
        const coverImagesPublicIds = req.files?.images?.map(f => f.publicId) || [];

        const avatarData = {
            picture: avatar,
            publicId: avatarPublicId
        }
        const coverImagesData = coverImages.map((image, index) => ({
            imageUrl: image,
            publicId: coverImagesPublicIds[index]
        }));

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists." });
        }

        const hashedPassword = await HT.hash({
            plainText: password,
            SALT_ROUNDS: Number(process.env.SALT_ROUNDS)
        });

        const encryptedPhone = await ET.encrypt(phone);

        eventEmitter.emit("sendEmail", { email, name });

        const user = await userModel.create({
            name,
            email,
            password: hashedPassword,
            gender,
            phone: encryptedPhone,
            avatar: avatarData,
            coverImages: coverImagesData,
            provider: userProvider.system
        });

        const tokenId = nanoid();

        return res.status(201).json({
            message: "User created successfully. Please confirm your email.",
            accessToken: VT.generateUserAccessToken(user, "1h", tokenId),
            refreshToken: VT.generateUserRefreshToken(user, "14d", tokenId)
        });
    } catch (err) {
        console.error("Signup error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
};




// export const signup = async (req, res, next) => {
//     try {
//         const { name, email, password, gender, phone } = req.body
//         const { file } = req
//         const { files } = req
//         const arrayPaths = []
//         for (const file of files) {
//             arrayPaths.push(file.path)
//         }
//         const avatar = file ? await file.cloudinaryUrl : ""
//         const coverImage = files ? await files.cloudinaryUrl : ""

//         const existingUser = await userModel.findOne({ email })

//         if (existingUser) {
//             return res.status(400).json({ message: "Email already exists." })
//         }

//         const hashedPassword = await HT.hash({ plainText: password, SALT_ROUNDS: Number(process.env.SALT_ROUNDS) })
//         const encryptedPhone = await ET.encrypt(phone)
//         const emailData = { email, name }
//         eventEmitter.emit("sendEmail", emailData)
//         // found bug, phone will be duplicated in db since it is encrypted
//         // solved: 2 solutions: 1- never decrypt it 2- make static encryption so we find user's phone number with encrypted one
//         const user = await userModel.create({
//             name,
//             email,
//             password: hashedPassword,
//             gender,
//             phone: encryptedPhone,
//             avatar
//         })

//         const tokenId = nanoid()

//         return res.status(201).json({
//             message: "User created successfully. Please confirm your email.",
//             accessToken: VT.generateUserAccessToken(user, '1h', tokenId),
//             refreshToken: VT.generateUserRefreshToken(user, '14d', tokenId)
//         })
//     } catch (err) {
//         console.error("Signup error:", err.message)
//         return res.status(500).json({ message: "Internal server error." })
//     }
// }

export const signin = async (req, res, next) => {
    const { email, password } = req.body

    const user = await userModel.findOne({ email, provider: userProvider.system })

    if (!user) {
        return res.status(404).json({ message: "user not found" })
    }

    if (user.frozenState.isFrozen) {
        return res.status(403).json({
            message: "Account Frozen"
        })
    }

    if (user.confirmed == false) {
        return res.status(400).json({ message: "Email Not Confirmed" })
    }

    const isPasswordMatched = await HT.compareHash({ plainText: password, cypherText: user.password })

    if (!isPasswordMatched) {
        return res.status(400).json({ message: "invalid credentials" })
    }
    const tokenId = nanoid()
    return res.status(200).json({
        message: "User Logged In Successfully",
        accessToken: user.role === 'admin' ? VT.generateAdminAccessToken(user, '1h', tokenId) : VT.generateUserAccessToken(user, '1h', tokenId),
        refreshToken: user.role === 'admin' ? VT.generateAdminRefreshToken(user, '14d', tokenId) : VT.generateUserRefreshToken(user, '14d', tokenId)
    })
}

export const getProfile = async (req, res, next) => {
    const user = await userModel.findById(req.user.id).select("-password -_id -updatedAt -__v")
    if (!user) {
        return res.status(404).json({ message: "user not found" })
    }
    if (user.confirmed == false) {
        return res.status(400).json({ message: "Email Not Confirmed" })
    }
    user.phone = await ET.decrypt(user.phone)
    return res.status(200).json({
        message: "User Profile Fetched Successfully",
        user
    })
}

export const confirmEmail = async (req, res, next) => {
    try {
        const { token } = req.params
        try {
            const decoded = VT.verifyConfirmEmailToken(token)
            if (!decoded?.email) {
                return res.status(400).json({ message: "Invalid Token" })
            }
            const user = await userModel.findOne({ email: decoded.email })
            if (!user) {
                return res.status(404).json({ message: "User Not Found" })
            }
            if (user.confirmed) {
                return res.status(400).json({ message: "Email Already Confirmed" })
            }
            user.confirmed = true
            user.save()
            return res.status(200).json({ message: "Email Confirmed Successfully" })
        } catch (err) {
            if (err.name === 'JsonWebTokenError') {
                return res.status(400).json({ message: "Invalid Token" })
            }
            if (err.name === 'TokenExpiredError') {
                return res.status(400).json({ message: "Token Expired" })
            }
            console.error("Confirm Email error:", err.message);
            return res.status(500).json({ message: "Internal server error." });
        }
    } catch (err) {
        console.error("Confirm Email error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
}

export const logout = async (req, res, next) => {
    try {
        const tokenId = req.user.jti
        const expiredAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        await revokeTokenModel.create({ tokenId, expiredAt })
        res.clearCookie('refreshToken')
        return res.status(200).json({ message: "Logged Out Successfully" })
    } catch (err) {
        console.error("Logout error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
}

export const resendConfirmEmail = async (req, res, next) => {
    try {
        const { email } = req.user.email
        if (!email) {
            return res.status(400).json({ message: "Missing email" })
        }
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "User Not Found" })
        }
        if (user.confirmed) {
            return res.status(400).json({ message: "Email Already Confirmed" })
        }
        const emailData = { email, name }
        eventEmitter.emit("sendEmail", emailData)
        return res.status(200).json({ message: "Confirmation email sent successfully." })
    } catch (err) {
        console.error("Resend Confirm Email error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
}

export const refreshToken = async (req, res, next) => {
    try {
        const { authorization } = req.headers
        if (!authorization) {
            return res.status(401).json({ message: "Unauthorized" })
        }
        const [prefix, token] = authorization.split(" ")
        if (prefix === process.env.PREFIX_ADMIN) {
            VT.verifyAdminRefreshToken(token, async (err, decoded) => {
                if (err) {
                    return res.status(401).json({ message: "Unauthorized" })
                }
                const isRevoked = await revokeTokenModel.findOne({ tokenId: decoded.jti })
                if (isRevoked) {
                    return res.status(403).json({
                        message: "Please login again"
                    })
                }
                const user = await userModel.findById(decoded.id)
                if (!user) {
                    return res.status(404).json({ message: "User Not Found" })
                }
                const tokenId = nanoid()
                const expiredAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                await revokeTokenModel.create({ tokenId: decoded.jti, expiredAt })
                return res.status(200).json({
                    message: "User Logged In Successfully",
                    accessToken: VT.generateAdminAccessToken(user, '1h', tokenId),
                    refreshToken: VT.generateAdminRefreshToken(user, '14d', tokenId)
                })
            })
        } else if (prefix === process.env.PREFIX_USER) {
            VT.verifyUserRefreshToken(token, async (err, decoded) => {
                if (err) {
                    return res.status(401).json({ message: "Unauthorized" })
                }
                const isRevoked = await revokeTokenModel.findOne({ tokenId: decoded.jti })
                if (isRevoked) {
                    return res.status(403).json({
                        message: "Please login again"
                    })
                }
                const user = await userModel.findById(decoded.id)
                if (!user) {
                    return res.status(404).json({ message: "User Not Found" })
                }
                const tokenId = nanoid()
                const expiredAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                await revokeTokenModel.create({ tokenId: decoded.jti, expiredAt })
                return res.status(200).json({
                    message: "User Logged In Successfully",
                    accessToken: VT.generateUserAccessToken(user, '1h', tokenId),
                    refreshToken: VT.generateUserRefreshToken(user, '14d', tokenId)
                })
            })
        }
    } catch (err) {
        console.error("Refresh Token error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
}

export const updatePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body
        const user = await userModel.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User Not Found" })
        }
        const isPasswordMatched = await HT.compareHash({ plainText: oldPassword, cypherText: user.password })
        if (!isPasswordMatched) {
            return res.status(400).json({ message: "Invalid Credentials" })
        }
        const hashedPassword = await HT.hash({ plainText: newPassword, SALT_ROUNDS: Number(process.env.SALT_ROUNDS) })
        await userModel.updateOne({ _id: req.user.id }, { password: hashedPassword })
        const tokenId = req.user.jti
        const expiredAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        await revokeTokenModel.create({ tokenId, expiredAt })
        return res.status(200).json({ message: "Password Updated Successfully" })
    } catch (err) {
        console.error("Update Password error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
}

export const forgetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "User Not Found" })
        }
        if (user.confirmed == false) {
            return res.status(400).json({ message: "Email Not Confirmed" })
        }
        const otp = customAlphabet("0123456789", 6)()
        eventEmitter.emit('sendOTP', { email, otp, name: user.name })

        const hashedOTP = await HT.hash({ plainText: otp, SALT_ROUNDS: Number(process.env.SALT_ROUNDS) })

        await userModel.updateOne({ email }, { otp: hashedOTP })
        return res.status(200).json({ message: "OTP Sent Successfully" })
    } catch (err) {
        console.error("Forget Password error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
}

export const checkOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "User Not Found" })
        }
        if (!user?.otp) {
            return res.status(400).json({ message: "Invalid OTP" })
        }
        const isOTPMatched = await HT.compareHash({ plainText: otp, cypherText: user?.otp })
        if (!isOTPMatched) {
            return res.status(400).json({ message: "Invalid OTP" })
        }
        await userModel.updateOne({ email: user.email }, { $unset: { otp: 1 } })
        return res.status(200).json({ message: "OTP Verified Successfully" })
    } catch (err) {
        console.error("Check OTP error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
}

export const resetPassword = async (req, res, next) => {
    try {
        const { email } = req.user;
        const { newPassword } = req.body;
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "User Not Found" })
        }
        const hashedPassword = await HT.hash({ plainText: newPassword, SALT_ROUNDS: Number(process.env.SALT_ROUNDS) })
        await userModel.updateOne({ email: user.email }, { password: hashedPassword })
        return res.status(200).json({ message: "Password Reset Successfully" })
    } catch (err) {
        console.error("Reset Password error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
}

export const updateProfile = async (req, res, next) => {
    try {
        const { name, email, gender, phone } = req.body;
        const user = await userModel.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User Not Found" })
        }
        if (name) {
            user.name = name
        }
        if (email) {
            user.email = email
            user.confirmed = false
            const emailData = { email, name }
            eventEmitter.emit("sendEmail", emailData)
        }
        if (gender) {
            user.gender = gender
        }
        if (phone) {
            user.phone = await ET.encrypt(phone)
        }

        if (req.files?.avatar) {
            const avatar = req.files?.avatar?.[0]?.cloudinaryUrl || "";
            const avatarPublicId = req.files?.avatar?.[0]?.publicId || "";

            user.avatar = {
                picture: avatar,
                publicId: avatarPublicId
            }

            cloudinary.v2.uploader.destroy(avatarPublicId)
        }

        if (req.files?.images) {
            const coverImages = req.files?.images?.map(f => f.cloudinaryUrl) || [];
            const coverImagesPublicIds = req.files?.images?.map(f => f.publicId) || [];

            user.coverImages = coverImages.map((image, index) => ({
                imageUrl: image,
                publicId: coverImagesPublicIds[index]
            }));
            coverImagesPublicIds.forEach(publicId => {
                cloudinary.v2.uploader.destroy(publicId)
            })
        }

        await user.save()
        return res.status(200).json({ message: "Profile Updated Successfully" })
    } catch (err) {
        console.error("Update Profile error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
}

export const getProfileForAll = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id).select('-password -confirmed -createdAt -updatedAt -__v -_id -phone -role').populate([{
            path:"message"
        }]) // returned as BSON so we have to change its type
        if (!user) {
            return res.status(404).json({ message: "User Not Found" })
        }
        // const messages = await messageModel.find({userId:id})
        // user.messages=messages
        return res.status(200).json({ user })
    } catch (err) {
        console.error("Get Profile error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
}

export const freezeAccount = async (req, res, next) => {
    try {
        let { id } = req.params;
        let frozenReason = req?.body?.frozenReason
        if (id) {
            if (req.user.role != 'admin') {
                return res.status(403).json({ message: "Forbidden" })
            }
        } else {
            id = req.user.id
        }
        const user = await userModel.findById(id)
        if (!user) {
            return res.status(404).json({ message: "User Not Found" })
        }
        if (user.frozenState.isFrozen == true) {
            return res.status(400).json({ message: "Account Already Frozen" })
        }
        user.frozenState.isFrozen = true
        user.frozenState.frozenAt = new Date()
        user.frozenState.frozenBy = req.user.id
        if (frozenReason) {
            user.frozenState.frozenReason = frozenReason
        }
        if (user.frozenState.unfrozenAt) user.frozenState.unfrozenAt = ""
        if (user.frozenState.unfrozenBy) user.frozenState.unfrozenBy = ""
        await user.save()
        return res.status(200).json({ message: "Account Frozen Successfully" })
    } catch (err) {
        console.error("Freeze Account error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
}
export const unfreezeAccount = async (req, res, next) => {
    try {
        let { id } = req.params;
        if (id) {
            if (req.user.role != 'admin') {
                return res.status(403).json({ message: "Forbidden" })
            }
        } else {
            id = req.user.id
        }
        const user = await userModel.findById(id)
        if (!user) {
            return res.status(404).json({ message: "User Not Found" })
        }
        if (user.frozenState.isFrozen == false) {
            return res.status(400).json({ message: "Account Already Unfrozen" })
        }
        user.frozenState.isFrozen = false
        user.frozenState.unfrozenAt = new Date()
        user.frozenState.unfrozenBy = req.user.id ? req.user.id : null
        if (user.frozenState.frozenReason) user.frozenState.frozenReason = ""
        if (user.frozenState.frozenAt) user.frozenState.frozenAt = ""
        if (user.frozenState.frozenBy) user.frozenState.frozenBy = null
        await user.save()
        return res.status(200).json({ message: "Account Unfrozen Successfully" })
    } catch (err) {
        console.error("Unfreeze Account error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
}

// login with google - with google-auth-library needs npm i - create user wirth provider is google
// check user provider if system login normally with system login
// if user signed up with google can login with google
// generate access and refresh tokens

export const googleLogin = async (req, res, next) => {
    try {
        const { idToken } = req.body
        const client = new OAuth2Client();
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.WEB_CLIENT_ID,

            });
            const payload = ticket.getPayload();
            return payload
        }
        const payload = await verify()
        let user = await userModel.findOne({ email: payload.email })
        if (!user) {
            user = await userModel.create({
                name: payload.name,
                email: payload.email,
                provider: userProvider.google,
                avatar: payload.picture,
                gender: payload.gender,
                phone: payload.phone,
                confirmed: true,
                role: 'user'
            })
        }
        if (user.provider != 'google') {
            return res.status(400).json({ message: "User Not Found" })
        }
        const tokenId = nanoid()
        return res.status(200).json({
            message: "User Logged In Successfully",
            accessToken: VT.generateUserAccessToken(user, '1h', tokenId),
            refreshToken: VT.generateUserRefreshToken(user, '14d', tokenId)
        })
    } catch (err) {
        console.error("Google Login error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
}

export const removeAllUserAvatars = async (req, res, next) => {
    try {
        const result = await cloudinary.v2.api.delete_all_resources({
            type: "private",
            prefix: "users/avatarImages"
        })
        return res.status(200).json({ message: "All User Avatars Removed Successfully" })
    } catch (err) {
        console.error("Remove All User Avatars error:", err.message);
    }
}

export const removeAllUserCoverImages = async (req, res, next) => {
    try {
        const result = await cloudinary.v2.api.delete_all_resources({
            type: "private",
            prefix: "users/coverImages"
        })
        return res.status(200).json({ message: "All User Cover Images Removed Successfully" })
    } catch (err) {
        console.error("Remove All User Cover Images error:", err.message);
    }
}

// export const deleteUser = async (req, res, next) => {
//     try {
//         const { id } = req.params
//         const user = await userModel.findByIdAndDelete(id)

//         if (!user) {
//             return res.status(404).json({ message: "User Not Found" })
//         }
//         cloudinary.v2.api.delete_all_resources({
//             type: "private",
//             prefix: `users/avatarImages/${user.avatar.publicId}`
//         })
//         user.coverImages.forEach(image => {
//             cloudinary.v2.api.delete_all_resources({
//                 type: "private",
//                 prefix: `users/coverImages/${image.publicId}`
//             })
//         })
//         return res.status(200).json({ message: "User Deleted Successfully" })
//     } catch (err) {
//         console.error("Delete User error:", err.message);
//         return res.status(500).json({ message: "Internal server error." });
//     }
// }

export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await userModel.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        if (user.avatar?.publicId) {
            await cloudinary.v2.uploader.destroy(user.avatar.publicId);
        }

        if (Array.isArray(user.coverImages) && user.coverImages.length > 0) {
            for (const img of user.coverImages) {
                if (img.publicId) {
                    await cloudinary.v2.uploader.destroy(img.publicId);
                }
            }
        }

        return res.status(200).json({ message: "User Deleted Successfully" });
    } catch (err) {
        console.error("Delete User error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const deleteAllUsers = async (req, res, next) => {
    try {
        await cloudinary.v2.api.delete_resources_by_prefix("users/avatarImages");
        await cloudinary.v2.api.delete_resources_by_prefix("users/coverImages");

        await cloudinary.v2.api.delete_folder("users/avatarImages");
        await cloudinary.v2.api.delete_folder("users/coverImages");

        await userModel.deleteMany();

        return res.status(200).json({ message: "All Users and Folders Deleted Successfully" });
    } catch (err) {
        console.error("Delete All Users error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
};
