import SidebarMenu from "../pages/Auth/SidebarMenu";

const menuItems = [
  { path: "/", label: "카페홈" },
  { path: "/intro", label: "현지학기제 소개" },
  { path: "/team", label: "조원 소개" },
  { path: "/post", label: "게시판" },
  { path: "/message", label: "쪽지함" },
];

export default function   SidebarHome() {
  return <SidebarMenu menuItems={menuItems} />;
}
