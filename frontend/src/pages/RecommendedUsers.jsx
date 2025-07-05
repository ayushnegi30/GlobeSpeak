import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import FriendCard from "../components/FriendCard";
import PageLoader from "../components/PageLoader";

const RecommendedUsersPage = () => {
  const [sentRequests, setSentRequests] = useState(new Set());
  const [myFriends, setMyFriends] = useState(new Set());

  const queryClient = useQueryClient();

  // fetch recommended users
  const {
    data: recommendedUsers,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["recommendedUsers"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users");
      return res.data;
    },
  });

  // fetch sent requests and friend list
  const fetchSentRequestsAndFriends = async () => {
    try {
      const [outgoingRes, friendsRes] = await Promise.all([
        axiosInstance.get("/users/friend-requests/outgoing"),
        axiosInstance.get("/users/friends"),
      ]);

      const sentIds = outgoingRes.data.outgoingReqs.map((r) => r.recipient._id);
      const friendIds = friendsRes.data.map((f) => f._id);

      setSentRequests(new Set(sentIds));
      setMyFriends(new Set(friendIds));
    } catch (err) {
      console.error("Error fetching friend data:", err);
    }
  };

  useEffect(() => {
    fetchSentRequestsAndFriends();
  }, []);

  if (isLoading) return <PageLoader />;
  if (isError) return <div className="text-center mt-10">Failed to load users.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Recommended Users</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {recommendedUsers.length === 0 ? (
          <p>No recommended users found.</p>
        ) : (
          recommendedUsers.map((user) => (
            <FriendCard
              key={user._id}
              friend={user}
              showRequestButton={
                !sentRequests.has(user._id) && !myFriends.has(user._id)
              }
              alreadyFriend={myFriends.has(user._id)}
              requestSent={sentRequests.has(user._id)}
              onRequestSent={(id) => {
                setSentRequests((prev) => new Set(prev).add(id));
                queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] });
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RecommendedUsersPage;
