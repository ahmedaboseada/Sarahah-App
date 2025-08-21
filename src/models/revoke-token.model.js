import mongoose, { Schema } from "mongoose";

const revokeTokenSchema = new Schema ({
    tokenId: {
        type: String,
        unique:true
    },
    expiredAt: {
        type: Date
    }
})

export const revokeTokenModel = mongoose.model('RevokedToken',revokeTokenSchema)