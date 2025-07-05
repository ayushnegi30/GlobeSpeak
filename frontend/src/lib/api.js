import { axiosInstance } from "./axios";

// 🔐 Auth-related
export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.error("Error in getAuthUser:", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

// 👫 Friends
export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  try {
    const response = await axiosInstance.get("/users/outgoing-friend-request");
    return response.data?.outgoingReqs || [];
  } catch (error) {
    console.error("Error fetching outgoing requests:", error);
    return [];
  }
}

export async function sendFriendRequest(userId) {
  try {
    const res = await axiosInstance.post(`/users/friend-request/${userId}`);
    return res.data;
  } catch (error) {
    console.error("sendFriendRequest error details:", error.response || error);
    throw new Error(error?.response?.data?.message || "Failed to send request");
  }
}


export async function getFriendRequests() {
  try {
    const response = await axiosInstance.get("/users/friend-requests");
    return response.data;
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    return { incomingRequests: [], acceptedReqs: [] };
  }
}

export async function acceptFriendRequest(requestId) {
  try {
    const res = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
    return res.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || "Failed to accept friend request");
  }
}

// 💬 Chat
export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}

// 🔐 OTP
export const sendOtp = async (email) => {
  const response = await axiosInstance.post("/otp/send", { email });
  return response.data;
};

