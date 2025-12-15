import { useToast } from "./Toast";
import { MESSAGES } from "../../constants";

export default function HandleAuth(user, navigate, add) {
  if (!user) {
    alert(MESSAGES.LOGIN_NEEDED);
    navigate("/login");
  } else {
    navigate(add);
  }
}
