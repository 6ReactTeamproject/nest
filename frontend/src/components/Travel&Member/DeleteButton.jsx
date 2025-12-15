import { apiDelete } from "../../api/fetch";
import { useNavigate } from "react-router-dom";
import FormButton from "../common/FormButton";
import { MESSAGES } from "../../constants";
import "../../styles/form.css";

export default function DeleteButton({ endpoint, Id, backaddress }) {
  const navigate = useNavigate();
  const handleDelete = () => {
    if (window.confirm(MESSAGES.DELETE_CONFIRM)) {
      apiDelete(endpoint, Id).then(() => {
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
