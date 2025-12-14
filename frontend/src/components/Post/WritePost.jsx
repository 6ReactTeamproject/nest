import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PostForm from "./PostForm";
import { useUser } from "../../hooks/UserContext";
import { useToast } from "../common/Toast";
import { apiGet, apiPost, apiPatch } from "../../api/fetch";
import { MESSAGES } from "../../constants";
import "../../styles/post.css";

const WritePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState({ title: "", content: "", image: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { user: currentUser } = useUser();
  const { success, error: showError } = useToast();

  useEffect(() => {
    const loadPost = async () => {
      if (id) {
        try {
          const data = await apiGet("posts", id);
          // 기존 이미지 경로 설정 (외부 URL이거나 로컬 경로)
          const imagePath = data.image || "";
          setPost({
            title: data.title,
            content: data.content,
            image: imagePath,
          });
        } catch (err) {
          showError("게시글을 불러오는데 실패했습니다.");
        }
      }
    };
    loadPost();
  }, [id]);

  const handleSubmit = async () => {
    if (!currentUser) {
      showError(MESSAGES.LOGIN_NEEDED);
      navigate("/login");
      return;
    }

    if (!post.title.trim() || !post.content.trim()) {
      showError(MESSAGES.REQUIRED_FIELD);
      return;
    }

    try {
      setIsLoading(true);
      const data = { ...post };

      if (id) {
        await apiPatch("posts", id, data);
        success(MESSAGES.UPDATE_SUCCESS);
      } else {
        await apiPost("posts", data);
        success(MESSAGES.CREATE_SUCCESS);
      }

      if (location.state?.fromBoard) {
        let url = "/post";
        const params = [];
        if (location.state.page) params.push(`page=${location.state.page}`);
        if (location.state.sort) params.push(`sort=${location.state.sort}`);
        if (params.length > 0) url += "?" + params.join("&");
        navigate(url);
      } else {
        navigate(-1);
      }
    } catch (err) {
      showError(err.message || (id ? MESSAGES.UPDATE_FAIL : MESSAGES.CREATE_FAIL));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="write-post-container">
      <h2 className="write-post-title">{id ? "게시글 수정" : "새 글 작성"}</h2>
      <PostForm post={post} setPost={setPost} onSubmit={handleSubmit} id={id} isLoading={isLoading} />
    </div>
  );
};

export default WritePost;
