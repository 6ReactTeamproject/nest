import SidebarMenu from "./SidebarMenu";

const menuItems = [
  { path: "/mypage", label: "마이페이지" },
  { path: "/mypage/nickname", label: "닉네임 변경" },
  { path: "/mypage/password", label: "비밀번호 변경" }
];

export default function MypageSidebar() {
  return <SidebarMenu menuItems={menuItems} />;
}
