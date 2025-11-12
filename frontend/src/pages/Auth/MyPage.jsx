import React, { useEffect, useState } from "react";
import { useUser } from "../../hooks/UserContext";
import UploadImg from "./UploadImg";
import GitForm from "./GitForm";
import MypageLayout from "./MypageLayout";
import { Link } from "react-router-dom";

export default function MyPage() {
  const { user } = useUser(); // 현재 로그인된 사용자 정보 가져오기
  const [myPosts, setMyPosts] = useState([]); // 내가 작성한 게시판 글 상태
  const [myMembers, setMyMembers] = useState([]); // 내가 작성한 멤버 소개 상태
  const [myTravels, setMyTravels] = useState([]); // 내가 작성한 여행 소개 상태

  useEffect(() => {
    if (!user) return; // 로그인하지 않았을 경우 API 요청 생략

    // 게시판 글 중 내 userId와 일치하는 글만 필터링
    fetch("http://localhost:3001/posts")
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(item => String(item.userId) === String(user.id));
        setMyPosts(filtered);
      });

    // 멤버 소개 중 authorId가 내 ID인 항목만 필터링
    fetch("http://localhost:3001/members")
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(item => String(item.authorId) === String(user.id));
        setMyMembers(filtered);
      });

    // 여행 소개(semester) 중 authorId가 내 ID인 항목만 필터링
    fetch("http://localhost:3001/semester")
      .then(res => res.json())
      .then(data => {
        const filtered = Array.isArray(data)
          ? data.filter(item => String(item.authorId) === String(user.id))
          : [];
        setMyTravels(filtered);
      });
  }, [user]);

  // 로그인되지 않았을 경우 접근 차단
  if (!user) return <p>로그인이 필요합니다.</p>;

  return (
    <MypageLayout>
      {/* 사용자 프로필 영역 */}
      <h2>마이페이지</h2>
      <div className="profile-card">
        <UploadImg /> {/* 프로필 이미지 수정 */}
        <div className="profile-info">
          <h3>{user.name}</h3>
          <p>아이디 : {user.loginId}</p>
          <p>등급 : {user.grade}</p>
          <GitForm /> {/* 깃허브 주소 입력/수정 */}
        </div>
      </div>

      {/* 내가 작성한 글 영역 */}
      <h2>내가 쓴 글</h2>
      <div className="my-articles">
        {/* 게시판 글 목록 */}
        <h3>📌 게시판</h3>
        <ul>
          {myPosts.length > 0 ? (
            myPosts.map(post => (
              <li key={post.id}>
                <Link to={`/post/${post.id}`}>{post.title}</Link>
              </li>
            ))
          ) : (
            <li>작성한 게시판 글이 없습니다.</li>
          )}
        </ul>

        {/* 멤버 소개 목록 */}
        <h3>👥 멤버 소개</h3>
        <ul>
          {myMembers.length > 0 ? (
            myMembers.map(member => (
              <li key={member.id}>
                <Link to={`/team/${member.id}`}>{member.name || "제목 없음"}</Link>
              </li>
            ))
          ) : (
            <li>작성한 멤버 소개 글이 없습니다.</li>
          )}
        </ul>

        {/* 여행 소개 목록 */}
        <h3>🌍 여행 소개</h3>
        <ul>
          {myTravels.length > 0 ? (
            myTravels.map(travel => (
              <li key={travel.id}>
                <Link to={`/intro/${travel.id}`}>{travel.title || "제목 없음"}</Link>
              </li>
            ))
          ) : (
            <li>작성한 여행 소개 글이 없습니다.</li>
          )}
        </ul>
      </div>
    </MypageLayout>
  );
}
