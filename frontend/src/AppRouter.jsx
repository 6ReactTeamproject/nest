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
  useRouteHistory();
  
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/intro" element={<TravelIntro />} />
        <Route path="/intro/new" element={<CreateTravelIntro />} />
        <Route path="/intro/:id" element={<DetailTravel />} />

        <Route path="/team" element={<TeamIntro />} />
        <Route path="/team/new" element={<CreateMember />} />
        <Route path="/team/:id" element={<DetailMember />} />

        <Route path="/post" element={<PostBoard />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/post/write" element={<WritePost />} />
        <Route path="/post/edit/:id" element={<WritePost />} />

        <Route path="/mypage" element={<MyPage />} />
        <Route path="/message" element={<MessageBox />} />
        <Route path="/mypage/password" element={<ChangePasswordForm />} />
        <Route path="/mypage/nickname" element={<ChangeNameForm />} />
      </Routes>
    </Layout>
  );
}
