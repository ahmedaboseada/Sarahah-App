import express, { Router } from 'express'
import * as MS from './message.service.js'

const messageRouter = Router({
    strict:true,
    caseSensitive:true,
    mergeParams:true
}) // options

messageRouter.post('/sendMessage',MS.sendMessage)
messageRouter.get('/getMessage',MS.getMessage)
messageRouter.get('/messages',MS.getAllMessages)

export default messageRouter