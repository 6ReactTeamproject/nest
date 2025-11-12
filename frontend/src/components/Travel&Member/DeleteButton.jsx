import { apiDelete } from "../../api/fetch";
import { useNavigate } from "react-router-dom";
import FormButton from "../common/FormButton";
import { MESSAGES } from "../../constants";
import "../../styles/form.css";

export default function DeleteButton({ endpoint, Id, backaddress }) {
  const navigate = useNavigate();
// 삭제 버튼 클릭 시 실행
  const handleDelete = () => {
    // 삭제 확인 창
    if (window.confirm(MESSAGES.DELETE_CONFIRM)) {
      apiDelete(endpoint, Id).then(() => {
        // 삭제 성공 후 지정된 주소로 이동
        navigate(backaddress);
      });
    }
  };

  return (
    <FormButton onClick={handleDelete} className="cancel-button">
      🗑️ 삭제
    </FormButton>
  );
}
