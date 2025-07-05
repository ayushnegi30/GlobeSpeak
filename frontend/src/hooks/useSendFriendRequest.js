import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";

const sendFriendRequest = async (id) => {
  const res = await axiosInstance.post(`/users/friend-request/${id}`);
  return res.data;
};

const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] });
    },
  });
};

export default useSendFriendRequest;
