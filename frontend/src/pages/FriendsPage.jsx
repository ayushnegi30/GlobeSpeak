import React from "react";
import useGetFriends from "../hooks/useGetFriends";
import FriendCard from "../components/FriendCard";

const FriendsPage = () => {
  const { friends, isLoading } = useGetFriends();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Friends</h1>

      {isLoading ? (
        <p>Loading...</p>
      ) : friends.length === 0 ? (
        <p>No friends yet. Let's connect!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {friends.map((friend) => (
            <FriendCard key={friend._id} friend={friend} alreadyFriend={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsPage;
