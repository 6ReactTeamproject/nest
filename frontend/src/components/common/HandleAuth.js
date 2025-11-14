import { useToast } from "./Toast";
import { MESSAGES } from "../../constants";

export default function HandleAuth(user, navigate, add) {
  if (!user) {
    // Toast는 컴포넌트 내에서만 사용 가능하므로 alert 유지 (간단한 유틸 함수)
    alert(MESSAGES.LOGIN_NEEDED);
    navigate("/login");
  } else {
    navigate(add);
  }
}
