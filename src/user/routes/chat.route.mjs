import express from 'express';
const router = express.Router();
import * as chatController from "../controllers/chat.controller.mjs"

router.post("/chat/room/join", chatController.joinChatRoom)
router.get("/chat/rooms", chatController.getChatRooms)
router.get("/chat/messages", chatController.getMessages)


export default router
