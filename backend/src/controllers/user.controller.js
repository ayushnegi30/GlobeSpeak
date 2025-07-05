import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";


export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = await User.findById(currentUserId);

    if (!currentUser) return res.status(404).json({ message: "User not found" });

    const recommendedUsers = await User.find({
      _id: { $ne: currentUserId, $nin: currentUser.friends },
      isOnboarded: true,
    });

    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate("friends", "fullName profilePic language");

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getMyFriends:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    if (!recipientId || !myId) {
      return res.status(400).json({ message: "Invalid sender or recipient ID" });
    }

    if (myId === recipientId) {
      return res.status(400).json({ message: "You can't send a friend request to yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient user not found" });
    }

    const sender = await User.findById(myId);
    if (!sender) {
      return res.status(404).json({ message: "Sender user not found" });
    }

    if (recipient.friends.includes(myId)) {
      return res.status(400).json({ message: "You are already friends" });
    }

    const existingRequest = await FriendRequest.findOne({
  status: "pending", 
  $or: [
    { sender: myId, recipient: recipientId },
    { sender: recipientId, recipient: myId },
  ],
});


    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already exists" });
    }

    const newRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) return res.status(404).json({ message: "Friend request not found" });

    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can't accept this friend request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error in acceptFriendRequest:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFriendRequest(req, res) {
  try {
    const incomingRequests = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("sender", "fullName profilePic language");

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    res.status(200).json({ incomingRequests, acceptedReqs });
  } catch (error) {
    console.error("Error in getFriendRequest:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// 📤 Get outgoing (pending) friend requests
export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipient", "fullName profilePic language");

    const formattedRecipients = outgoingReqs.map((req) => ({
      _id: req.recipient._id,
      fullName: req.recipient.fullName,
      profilePic: req.recipient.profilePic,
      language: req.recipient.language,
    }));

    res.status(200).json(formattedRecipients);
  } catch (error) {
    console.error("Error in getOutgoingFriendReqs:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

