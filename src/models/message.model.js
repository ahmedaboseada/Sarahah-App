import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    content:{
        type:String,
        required:true,
        minLength:[1,"Message cannot be empty"]
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        required:true
    }
},{
    timestamps:true
})

const messageModel = mongoose.models.Message || mongoose.model('Message', messageSchema)

export default messageModel