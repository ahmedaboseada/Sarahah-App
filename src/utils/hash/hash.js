import bcrypt from "bcrypt";

export const hash = async({plainText, SALT_ROUNDS=process.env.SALT_ROUNDS}={})=>{
    return await bcrypt.hash(plainText,Number(SALT_ROUNDS))
}