import jwt from "jsonwebtoken"

export const generateUserAccessToken = (payload, length = '1h',tokenId) => {
    return jwt.sign({ id: payload._id, email:payload.email, role:payload.role }, process.env.JWT_ACCESS_USER_SECRET, { expiresIn: `${length}`, jwtid:tokenId })
}

export const generateUserRefreshToken = (payload, length = '7d',tokenId) => {
    return jwt.sign({ id: payload._id, email:payload.email, role:payload.role }, process.env.JWT_REFRESH_USER_SECRET, { expiresIn: `${length}`, jwtid:tokenId })
}

export const generateAdminAccessToken = (payload, length = '1h',tokenId) => {
    return jwt.sign({ id: payload._id, email:payload.email, role:payload.role }, process.env.JWT_ACCESS_ADMIN_SECRET, { expiresIn: `${length}`, jwtid:tokenId })
}

export const generateAdminRefreshToken = (payload, length = '7d',tokenId) => {
    return jwt.sign({ id: payload._id, email:payload.email, role:payload.role }, process.env.JWT_REFRESH_ADMIN_SECRET, { expiresIn: `${length}`, jwtid:tokenId })
}


// payload, signature, options -> as parameters