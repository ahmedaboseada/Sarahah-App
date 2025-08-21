import express, { Router } from 'express'
import * as MS from './message.service.js'
import { verifyToken } from '../../middlewares/authentication.js'

const messageRouter = Router({
    strict:true,
    caseSensitive:true,
    mergeParams:true
})

messageRouter.post('/sendMessage',MS.sendMessage)
messageRouter.use(verifyToken)
messageRouter.get('/getMessage',MS.getMessage)
messageRouter.get('/messages',MS.getAllMessages)

export default messageRouter