import React, { useState, useEffect } from "react";
import { apiPost, apiGet } from "../../api/fetch";
import { useUser } from "../../hooks/UserContext";
import { useToast } from "../common/Toast";
import { compareIds } from "../../utils/helpers";
import { MESSAGES } from "../../constants";

const MessageForm = ({ onClose }) => {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState({
    receiverId: "",
    title: "",
    content: "",
  });
  const { success, error: showError } = useToast();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await apiGet("user/info");
        const usersList = res.data ?? res;
        setUsers(Array.isArray(usersList) ? usersList : []);
      } catch (err) {
        showError("사용자 목록을 불러오는데 실패했습니다.");
      }
    };
    loadUsers();
  }, []);

  const handleChange = (e) => {
    setMessage({ ...message, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.receiverId || !message.title.trim() || !message.content.trim()) {
      showError("모든 필드를 입력해주세요.");
      return;
    }

    try {
      const newMessage = {
        receiverId: message.receiverId,
        title: message.title,
        content: message.content,
      };

      await apiPost("messages", newMessage);
      setMessage({
        receiverId: "",
        title: "",
        content: "",
      });
      success(MESSAGES.MESSAGE_SEND_SUCCESS);
      onClose();
    } catch (err) {
      showError(err.message || MESSAGES.MESSAGE_SEND_FAIL);
    }
  };

  return (
    <div className="message-form">
      <h3>쪽지 작성</h3>
      <form onSubmit={handleSubmit}>
        {/* 받는 사람 선택 박스 */}
        <select
          name="receiverId"
          value={message.receiverId}
          onChange={handleChange}
          required
        >
          <option value="">받는 사람 선택</option>
          {/* 본인을 제외한 사용자 목록 옵션 생성 */}
          {users
            .filter((u) => !compareIds(u.id, user?.id))
            .map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
        </select>
        <input
          type="text"
          name="title"
          value={message.title}
          onChange={handleChange}
          placeholder="제목을 입력하세요"
          required
        />
        <textarea
          name="content"
          value={message.content}
          onChange={handleChange}
          placeholder="쪽지 내용을 입력하세요"
          required
        />
        <div className="form-buttons">
          <button type="submit">전송</button>
          <button
            type="button"
            onClick={() => {
              // 폼 초기화 후 닫기
              setMessage({
                receiverId: "",
                title: "",
                content: "",
              });
              onClose();
            }}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageForm;
