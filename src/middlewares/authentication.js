import { revokeTokenModel } from "../models/revoke-token.model.js"
import * as VT from "../utils/token/verifyToken.js"
import userModel from "../models/user.model.js"

export const verifyToken = (req, res, next) => {
    const { authorization } = req.headers
    if (!authorization) {
        return res.status(401).json({ message: "Unauthorized" })
    }
    const [prefix, token] = authorization.split(" ")

    if (prefix === process.env.PREFIX_ADMIN) {
        VT.verifyAdminAccessToken(token, async (err, decoded) => {
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
            req.user = decoded
            next()
        })
    } else if (prefix === process.env.PREFIX_USER) {
        VT.verifyUserAccessToken(token, async (err, decoded) => {
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
            if (user.frozenState.isFrozen) {
                return res.status(403).json({
                    message: "Account Frozen"
                })
            }
            req.user = decoded
            next()
        })
    } else {
        return res.status(401).json({ message: "Unauthorized" })
    }
}
