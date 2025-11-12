import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PostForm from "./PostForm";
import { useUser } from "../../hooks/UserContext";
import { apiGet, apiPost, apiPatch } from "../../api/fetch";
import "../../styles/post.css";

const WritePost = () => {
  const { id } = useParams(); // 수정이면 id 존재
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState({ title: "", content: "", image: "" });
  const { user: currentUser } = useUser();

  useEffect(() => {
    if (id) {
      // 수정 시 기존 데이터 불러오기
      apiGet("posts", id).then((data) =>
        setPost({
          title: data.title,
          content: data.content,
          image: data.image || "",
        })
      );
    }
  }, [id]);

  const handleSubmit = async () => {
    try {
      if (!currentUser || !currentUser.id) {
        alert("로그인된 사용자 정보가 없습니다.");
        return;
      }
      
      // 새 글 작성 시 userId, createdAt, views 기본 데이터 포함
      const data = {
        ...post,
        ...(id
          ? {}
          : {
              userId: currentUser.id,
              createdAt: new Date().toISOString().slice(0, 10), // 날짜만 yyyy-mm-dd 형식으로 저장
              views: 0,
            }),
      };

      if (id) {
        await apiPatch("posts", id, data);
      } else {
        await apiPost("posts", data);
      }

      // 게시판에서 왔다면 해당 페이지로 돌아가기
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
    } catch (error) {
      console.error("게시글 작성 실패:", error);
      alert("게시글 작성에 실패했습니다.");
    }
  };

  return (
    <div className="write-post-container">
      <h2 className="write-post-title">{id ? "게시글 수정" : "새 글 작성"}</h2>
      <PostForm post={post} setPost={setPost} onSubmit={handleSubmit} id={id} />
    </div>
  );
};

export default WritePost;
