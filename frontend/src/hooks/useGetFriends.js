import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";

const fetchFriends = async () => {
  const res = await axiosInstance.get("/users/friends");
  return res.data;
};

const useGetFriends = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["friends"],
    queryFn: fetchFriends,
  });

  return {
    friends: data || [],
    isLoading,
    isError,
  };
};

export default useGetFriends;
