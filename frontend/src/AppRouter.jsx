/**
 * 애플리케이션 라우터
 * React Router를 사용하여 URL 경로와 컴포넌트를 매핑합니다.
 * 
 * 왜 필요한가?
 * - 라우팅 관리: URL 경로에 따라 다른 페이지 컴포넌트를 표시
 * - 네비게이션: 사용자가 원하는 페이지로 이동할 수 있게 함
 * - URL 기반 접근: 특정 URL로 직접 접근 가능
 * - 히스토리 관리: useRouteHistory 훅으로 라우팅 히스토리 추적
 */

import { Routes, Route } from "react-router-dom";
import TravelIntro from "./pages/Travel/TravelIntro.jsx";
import TeamIntro from "./pages/Member/TeamIntro.jsx";
import CreateMember from "./pages/Member/CreateMember.jsx";
import DetailMember from "./pages/Member/DetailMember.jsx";
import PostBoard from "./components/Board/Board.jsx";
import PostDetail from "./components/Post/PostDetail.jsx";
import WritePost from "./components/Post/WritePost";
import DetailTravel from "./pages/Travel/DetailTravel.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Auth/Login.jsx";
import Signup from "./pages/Auth/Signup.jsx";
import MyPage from "./pages/Auth/MyPage.jsx";
import CreateTravelIntro from "./pages/Travel/CreateTravelIntro.jsx";
import Layout from "./layout/Layout.jsx";
import MessageBox from "./components/Message/MessageBox.jsx";
import ChangePasswordForm from "./pages/Auth/ChangePasswordForm.jsx";
import ChangeNameForm from "./pages/Auth/ChangeNameForm.jsx";
import { useRouteHistory } from "./hooks/useRouteHistory";

export default function AppRouter({ setUser }) {
  // 라우팅 히스토리 추적: 로그인한 사용자가 로그인/회원가입 페이지로 돌아가는 것을 방지
  // 왜 필요한가? 로그인한 사용자가 뒤로가기로 로그인 페이지에 접근하는 것을 방지하기 위해
  useRouteHistory();
  
  return (
    <Layout>
      {/* Routes: 여러 Route를 그룹화하여 라우팅 관리 */}
      <Routes>
        {/* 홈 페이지 */}
        <Route path="/" element={<Home />} />
        
        {/* 인증 관련 페이지 */}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />

        {/* 여행지 소개 페이지 */}
        <Route path="/intro" element={<TravelIntro />} />
        <Route path="/intro/new" element={<CreateTravelIntro />} />
        <Route path="/intro/:id" element={<DetailTravel />} />

        {/* 팀 소개 페이지 */}
        <Route path="/team" element={<TeamIntro />} />
        <Route path="/team/new" element={<CreateMember />} />
        <Route path="/team/:id" element={<DetailMember />} />

        {/* 게시글 페이지 */}
        <Route path="/post" element={<PostBoard />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/post/write" element={<WritePost />} />
        <Route path="/post/edit/:id" element={<WritePost />} />

        {/* 마이페이지 및 기타 */}
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/message" element={<MessageBox />} />
        <Route path="/mypage/password" element={<ChangePasswordForm />} />
        <Route path="/mypage/nickname" element={<ChangeNameForm />} />
      </Routes>
    </Layout>
  );
}
