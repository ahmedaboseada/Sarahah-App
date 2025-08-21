import mongoose from "mongoose";

import { userGender, userProvider, userRole } from "../config/CONSTANTS.js"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        Enum: Object.values(userGender),
        default: userGender.male
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    avatar: {
        picture: {
            type: String,
        },
        publicId: {
            type: String,
        }
    },
    coverImages: [
        {
            imageUrl: {
                type: String,
            },
            publicId: {
                type: String,
            }
        }
    ],
    role: {
        type: String,
        enum: Object.values(userRole),
        default: userRole.user
    },
    provider: {
        type: String,
        enum: Object.values(userProvider),
        default: userProvider.system
    },
    isDeleted: {
        type: Boolean
    },
    frozenState: {
        isFrozen: {
            type: Boolean
        },
        frozenAt: {
            type: Date
        },
        frozenBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        unfrozenAt: {
            type: Date
        },
        unfrozenBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        frozenReason: {
            type: String
        }
    },
    otp: {
        type: String
    }
},
    {
        timestamps: true,
        toJSON:{
            virtuals:true // to be able to populate
        },
        toObject:{
            virtuals:true // to show the virtual keys in the returned object
        }
    }
)

// userModel.virtual('message',{
//     ref:'Message',
//     localField:"_id",
//     foriegnField:"userId",
//     // justOne:true
// })

const userModel = mongoose.models.User || mongoose.model('User', userSchema)

export default userModel