import PostItem from "./PostItem";

const PostList = ({ users, posts, onClickPost, currentPage, sortType }) => (
  <ul>
    {posts.length > 0 ? (
      posts.map((post) => (
        <PostItem
          key={post.id}
          users={users}
          post={post}
          onClick={() => onClickPost(post.id, currentPage, sortType)}
        />
      ))
    ) : (
      <p>게시물이 없습니다</p>
    )}
  </ul>
);

export default PostList;
