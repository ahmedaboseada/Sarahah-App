import CryptoJS from "crypto-js"

export const encrypt = async(plainText)=>{
    return CryptoJS.AES.encrypt(plainText, process.env.ENCRYPTION_KEY).toString()
}