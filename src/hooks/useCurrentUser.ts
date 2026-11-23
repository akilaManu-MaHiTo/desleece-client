import { useQuery } from "@tanstack/react-query";
import { validateUser, type User } from "../api/userApi"; // Ensure this import is correct

interface UseCurrentUserResult {
  user: User | undefined;
  status: "idle" | "loading" | "error" | "success" | "pending";
}

function useCurrentUser(): UseCurrentUserResult {
  const { data, status } = useQuery<User>({
    queryKey: ["current-user"],
    queryFn: validateUser,
  });

  return { user: data, status };
}

export default useCurrentUser;
