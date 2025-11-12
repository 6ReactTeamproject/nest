import SidebarMenu from "./SidebarMenu";

// 마이페이지에서 사용할 사이드바 메뉴 항목 정의
const menuItems = [
  { path: "/mypage", label: "마이페이지" },         // 마이페이지 홈
  { path: "/mypage/nickname", label: "닉네임 변경" }, // 닉네임 변경 페이지
  { path: "/mypage/password", label: "비밀번호 변경" } // 비밀번호 변경 페이지
];

// SidebarMenu 컴포넌트를 활용해 실제 사이드바 렌더링
export default function MypageSidebar() {
  return <SidebarMenu menuItems={menuItems} />;
}
