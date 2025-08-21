import CryptoJS from "crypto-js";

export const decrypt = async(cypherText)=>{
    return CryptoJS.AES.decrypt(cypherText, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8)
}