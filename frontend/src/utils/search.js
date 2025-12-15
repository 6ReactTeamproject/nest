export const filterPosts = (posts, keyword, searchType, users = []) => {
  if (!keyword.trim()) return posts;

  return posts.filter((post) => {
    const title =
      typeof post.title === "string" ? post.title.toLowerCase() : "";
    const content =
      typeof post.content === "string" ? post.content.toLowerCase() : "";
    const userId = post.userId?.toString();

    const author = users.find((user) => user.id.toString() === userId);
    const authorName = author?.name?.toLowerCase() || "";

    switch (searchType) {
      case "title":
        return title.includes(keyword);
      case "content":
        return content.includes(keyword);
      case "title_content":
        return title.includes(keyword) || content.includes(keyword);
      case "author":
        return authorName.includes(keyword);
      case "userId":
        return userId === keyword;
      default:
        return false;
    }
  });
};
