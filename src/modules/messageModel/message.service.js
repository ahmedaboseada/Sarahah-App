import messageModel from "../../models/message.model.js"

export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body
        const { id } = req.params
        const newMessage = await messageModel.create({ message, userId: id })
        return res.status(201).json({
            message: "Message Sent Successfully",
            newMessage
        })
    } catch (err) {
        console.error("Send Message error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
}

export const getAllMessages = async (req, res) => { // /users/:id/messages
    if(req?.user?.id!=req?.params?.id){
        return res.status(403).json({ message: "Forbidden" })
    }
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
    return res.status(200).json({
        message
    })
}