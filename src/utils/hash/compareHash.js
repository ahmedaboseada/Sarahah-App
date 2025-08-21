import bcrypt from "bcrypt";

export const compareHash= async ({plainText, cypherText}={})=>{
    return await bcrypt.compare(plainText, cypherText)
}