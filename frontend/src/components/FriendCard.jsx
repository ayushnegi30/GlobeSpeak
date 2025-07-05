import { Link } from "react-router-dom";
import { LANGUAGE_TO_FLAG } from "../constants";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";

// Helper function: get flag image for language
export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}

const FriendCard = ({
  friend,
  showRequestButton = false,
  requestSent = false,
  alreadyFriend = false,
  onRequestSent = () => {},
}) => {
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        `/api/users/friend-request/${friend._id}`,
        {},
        { withCredentials: true }
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Friend request sent!");
      onRequestSent(friend._id); // trigger parent state change
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send request");
    },
  });

  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar size-12">
            <img src={friend.profilePic} alt={friend.fullname || "User"} />
          </div>
          <h3 className="font-semibold truncate">{friend.fullname}</h3>
        </div>

        {/* LANGUAGES */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {friend.nativeLanguage && (
            <span className="badge badge-secondary text-xs">
              {getLanguageFlag(friend.nativeLanguage)}
              Native: {friend.nativeLanguage}
            </span>
          )}
          {friend.learningLanguage && (
            <span className="badge badge-outline text-xs">
              {getLanguageFlag(friend.learningLanguage)}
              Learning: {friend.learningLanguage}
            </span>
          )}
        </div>

        {/* ACTION BUTTON */}
        {showRequestButton ? (
          <button
            className="btn btn-primary w-full"
            onClick={() => mutate()}
            disabled={isPending || requestSent}
          >
            {requestSent
              ? "✅ Pending"
              : isPending
              ? "⏳ Sending..."
              : "➕ Send Friend Request"}
          </button>
        ) : alreadyFriend ? (
          <Link to={`/chat/${friend._id}`} className="btn btn-outline w-full">
            💬 Message
          </Link>
        ) : null}
      </div>
    </div>
  );
};

export default FriendCard;
