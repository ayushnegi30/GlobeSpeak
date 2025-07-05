import express from "express"
import axios from "axios";;
import { protectRoute } from "../middleware/auth.middleware.js";

import {
    acceptFriendRequest,
    getMyFriends,
    getRecommendedUsers,
 sendFriendRequest,
 getFriendRequest,
 getOutgoingFriendReqs,
}from "../controllers/user.controller.js";

const router=express.Router();
router.use(protectRoute)
router.get("/",getRecommendedUsers)
router.get("/friends",getMyFriends)
router.post("/friend-request/:id",sendFriendRequest);
router.put("/friend-request/:id/accept",acceptFriendRequest);
router.get("/friend-requests",getFriendRequest);
router.get("/outgoing-friend-request",getOutgoingFriendReqs);


export default router;