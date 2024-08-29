import express from 'express';
const router = express.Router();
import * as chatController from "../controllers/chat.controller.mjs"

router.get("/chat-rooms", chatController.getChatRooms)
router.get("/messages", chatController.getMessages)


export default router
