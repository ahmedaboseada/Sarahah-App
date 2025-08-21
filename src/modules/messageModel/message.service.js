

import messageModel from "../../models/message.model.js"
// sendMessage
// getAllMessages - authed

export const sendMessage = async (req, res) => {

}

export const getAllMessages = async (req, res) => { // /users/:id/messages
    const message = await messageModel.find({ userId: req?.params?.id })
    return res.status(200).json({
        messages: message
    }).populate([{
        path: "userId",
        select: "email"
    }])
}

export const getMessage = async (req, res) => {
    const message = messageModel.findOne({ userId: req?.user?.id, _id: req?.params?.id })
}