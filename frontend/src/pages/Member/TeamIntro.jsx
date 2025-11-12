import IntroList from "../../components/Travel&Member/IntroList";

export default function TeamIntro() {
  return (
    <IntroList
      heading="조원 소개"
      endpoint="members"
      primaryKey="name"
      secondaryKey="introduction"
      imageKey="imageUrl"
      pathPrefix="team"
    />
  );
}
