export default function HandleAuth(user, navigate, add) {
  //로그인 상태가 아니라면
  if (!user) {
    // 로그인 필요 알람
    alert("로그인이 필요한 기능입니다.");
    // 로그인 페이지로 이동
    navigate("/login");
  }
  // 로그인 상태명 원하는 경로 이동
  else {
    navigate(add);
  }
}
