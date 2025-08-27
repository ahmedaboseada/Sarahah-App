import express, { Router } from 'express'
import * as MS from './message.service.js'
import { verifyToken } from '../../middlewares/authentication.js'
import { validation } from '../../middlewares/validation.js'
import * as MV from './message.validation.js'

const messageRouter = Router({
    strict:true,
    caseSensitive:true,
    mergeParams:true
})

messageRouter.post('/sendMessage',validation(MV.sendMessageSchema),MS.sendMessage)
messageRouter.use(verifyToken)
messageRouter.get('/getMessage',validation(MV.getMessageSchema),MS.getMessage)
messageRouter.get('/',validation(MV.getAllMessagesSchema),MS.getAllMessages)

export default messageRouter