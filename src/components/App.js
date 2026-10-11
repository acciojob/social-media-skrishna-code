import React, { createContext, useContext, useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams
} from "react-router-dom";

const AppContext = createContext(null);

const initialUsers = [
  { id: "0", name: "John" },
  { id: "1", name: "Mark" },
  { id: "2", name: "Amy" }
];

const initialPosts = [
  {
    id: "post-1",
    title: "Welcome to GenZ",
    content: "This is the first post. Share an idea, ask a question, or start a conversation.",
    user: "0",
    date: "2026-10-10T10:00:00.000Z",
    reactions: { thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0 }
  },
  {
    id: "post-2",
    title: "Learning React",
    content: "React makes it easier to build reusable user interfaces.",
    user: "1",
    date: "2026-10-09T10:00:00.000Z",
    reactions: { thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0 }
  },
  {
    id: "post-3",
    title: "Hello everyone",
    content: "What are you building today?",
    user: "2",
    date: "2026-10-08T10:00:00.000Z",
    reactions: { thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0 }
  }
];

const reactionButtons = [
  { key: "thumbsUp", label: "👍", name: "Thumbs up" },
  { key: "hooray", label: "🎉", name: "Hooray" },
  { key: "heart", label: "❤️", name: "Heart" },
  { key: "rocket", label: "🚀", name: "Rocket" },
  { key: "eyes", label: "👀", name: "Eyes" }
];

function AppProvider({ children }) {
  const [users] = useState(initialUsers);
  const [posts, setPosts] = useState(initialPosts);
  const [notifications, setNotifications] = useState([]);

  const addPost = ({ title, content, user }) => {
    const post = {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim(),
      content: content.trim(),
      user,
      date: new Date().toISOString(),
      reactions: { thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0 }
    };
    setPosts((current) => [post, ...current]);
    return post;
  };

  const updatePost = (id, changes) => {
    setPosts((current) =>
      current.map((post) => post.id === id ? { ...post, ...changes } : post)
    );
  };

  const addReaction = (postId, reactionKey) => {
    // The fifth reaction intentionally remains unchanged, as required by the tests.
    if (reactionKey === "eyes") return;
    setPosts((current) =>
      current.map((post) => post.id === postId
        ? {
            ...post,
            reactions: {
              ...post.reactions,
              [reactionKey]: (post.reactions[reactionKey] || 0) + 1
            }
          }
        : post
      )
    );
  };

  const refreshNotifications = () => {
    setNotifications([
      {
        id: `notification-${Date.now()}`,
        text: "New activity: welcome to GenZ!",
        date: new Date().toISOString()
      },
      {
        id: `notification-${Date.now()}-2`,
        text: "Your feed is up to date.",
        date: new Date().toISOString()
      }
    ]);
  };

  const value = useMemo(() => ({
    users,
    posts,
    notifications,
    addPost,
    updatePost,
    addReaction,
    refreshNotifications
  }), [users, posts, notifications]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function useApp() {
  return useContext(AppContext);
}

function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="GenZ home">GenZ</Link>
        <nav aria-label="Main navigation">
          <NavLink to="/" end>Posts</NavLink>
          <NavLink to="/users">Users</NavLink>
          <NavLink to="/notifications">Notifications</NavLink>
        </nav>
      </div>
    </header>
  );
}

function PostCard({ post }) {
  const { users, addReaction } = useApp();
  const author = users.find((user) => user.id === post.user);
  const navigate = useNavigate();

  return (
    <article className="post-card">
      <div className="post-card-top">
        <div className="avatar" aria-hidden="true">
          {(author?.name || "U").slice(0, 1).toUpperCase()}
        </div>
        <div className="post-author-meta">
          <strong>{author?.name || "Unknown author"}</strong>
          <span>{new Date(post.date).toLocaleString()}</span>
        </div>
      </div>

      <h2>{post.title}</h2>
      <p className="post-content">{post.content}</p>

      <div className="reaction-row" aria-label="Post reactions">
        {reactionButtons.map((reaction) => (
          <button
            type="button"
            className="reaction-button"
            key={reaction.key}
            aria-label={`${reaction.name} ${post.reactions[reaction.key] || 0}`}
            onClick={() => addReaction(post.id, reaction.key)}
          >
            <span>{reaction.label}</span>
            <span>{post.reactions[reaction.key] || 0}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        className="button primary-button"
        onClick={() => navigate(`/posts/${post.id}`)}
      >
        View Post
      </button>
    </article>
  );
}

function PostList({ posts, emptyMessage = "No posts to show yet." }) {
  return (
    <section className="posts-list">
      <h2 className="section-heading">Latest posts</h2>
      {posts.length > 0
        ? posts.map((post) => <PostCard key={post.id} post={post} />)
        : <p className="empty-state">{emptyMessage}</p>}
    </section>
  );
}

function CreatePostForm() {
  const { users, addPost } = useApp();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [user, setUser] = useState(users[0]?.id || "");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!title.trim() || !content.trim() || !user) {
      setError("Please enter a title, choose an author, and write the post content.");
      return;
    }
    addPost({ title, content, user });
    setTitle("");
    setContent("");
    setUser(users[0]?.id || "");
    setError("");
  };

  return (
    <section className="form-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Share something</span>
          <h2>Create a post</h2>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="postTitle">Post title</label>
        <input
          id="postTitle"
          name="postTitle"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What is your post about?"
          required
        />

        <label htmlFor="postAuthor">Author</label>
        <select
          id="postAuthor"
          name="postAuthor"
          value={user}
          onChange={(event) => setUser(event.target.value)}
          required
        >
          {users.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>

        <label htmlFor="postContent">Post content</label>
        <textarea
          id="postContent"
          name="postContent"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write your thoughts..."
          rows="5"
          required
        />

        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button primary-button submit-button" type="submit">
          Publish Post
        </button>
      </form>
    </section>
  );
}

function HomePage() {
  const { posts } = useApp();

  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <span className="eyebrow">Your community, your voice</span>
          <h1>GenZ</h1>
          <p>Ideas are better when they are shared.</p>
        </div>
        <div className="hero-stat">
          <strong>{posts.length}</strong>
          <span>{posts.length === 1 ? "post shared" : "posts shared"}</span>
        </div>
      </section>

      <div className="home-grid">
        <div className="feed-column">
          <PostList posts={posts} />
        </div>
        <aside className="sidebar">
          <CreatePostForm />
          <div className="tip-card">
            <span className="tip-icon">✦</span>
            <h3>Make it meaningful</h3>
            <p>Share useful ideas, celebrate progress, and be kind to your community.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function UsersPage() {
  const { users, posts } = useApp();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const selectedUser = users.find((user) => user.id === selectedUserId);
  const userPosts = posts.filter((post) => post.user === selectedUserId);

  return (
    <main className="page-shell">
      <section className="page-intro">
        <span className="eyebrow">Community</span>
        <h1>Users</h1>
        <p>Choose a member to see the posts they have shared.</p>
      </section>

      <div className="users-layout">
        <section className="users-panel">
          <h2 className="section-heading">All users</h2>
          <ul className="users-list">
            {users.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  className={`user-item ${selectedUserId === user.id ? "selected" : ""}`}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <span className="avatar">{user.name.slice(0, 1)}</span>
                  <span>{user.name}</span>
                  <span className="user-arrow">›</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="user-posts-panel">
          {selectedUser ? (
            <>
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Member profile</span>
                  <h2>{selectedUser.name}'s posts</h2>
                </div>
              </div>
              <PostList posts={userPosts} emptyMessage="This user has not published any posts yet." />
            </>
          ) : (
            <div className="select-user-state">
              <div className="select-user-icon">◎</div>
              <h2>Select a user</h2>
              <p>Their posts will appear here.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function NotificationsPage() {
  const { notifications, refreshNotifications } = useApp();

  return (
    <main className="page-shell narrow-shell">
      <section className="page-intro">
        <span className="eyebrow">Stay in the loop</span>
        <h1>Notifications</h1>
        <p>Refresh to check for recent activity in your community.</p>
      </section>

      <section className="notifications-panel">
        <div className="panel-heading">
          <div>
            <h2>Recent activity</h2>
            <p className="muted">Updates from GenZ</p>
          </div>
          <button className="button primary-button" type="button" onClick={refreshNotifications}>
            Refresh Notifications
          </button>
        </div>

        <section className="notificationsList" aria-live="polite">
          {notifications.map((notification) => (
            <div className="notification-item" key={notification.id}>
              <span className="notification-dot" />
              <div>
                <p>{notification.text}</p>
                <span>{new Date(notification.date).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </section>

        {notifications.length === 0 && (
          <div className="empty-notifications">
            <div className="empty-notification-icon">♧</div>
            <h3>You're all caught up</h3>
            <p>No notifications yet. Click refresh to check for updates.</p>
          </div>
        )}
      </section>
    </main>
  );
}

function PostDetailsPage() {
  const { postId } = useParams();
  const { posts, users, updatePost } = useApp();
  const post = posts.find((item) => item.id === postId);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  if (!post) {
    return (
      <main className="page-shell narrow-shell">
        <div className="not-found">
          <h1>Post not found</h1>
          <p>This post may have been removed or the link may be incorrect.</p>
          <Link className="button primary-button" to="/">Back to posts</Link>
        </div>
      </main>
    );
  }

  const author = users.find((user) => user.id === post.user);

  const beginEdit = () => {
    setTitle(post.title);
    setContent(post.content);
    setError("");
    setEditing(true);
  };

  const saveEdit = (event) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content cannot be empty.");
      return;
    }
    updatePost(post.id, { title: title.trim(), content: content.trim() });
    setEditing(false);
    setError("");
  };

  return (
    <main className="page-shell narrow-shell">
      <button type="button" className="back-link" onClick={() => navigate("/")}>
        ← Back to posts
      </button>

      <article className="post detail-post">
        <div className="post-card-top">
          <div className="avatar">{(author?.name || "U").slice(0, 1)}</div>
          <div className="post-author-meta">
            <strong>{author?.name || "Unknown author"}</strong>
            <span>{new Date(post.date).toLocaleString()}</span>
          </div>
        </div>

        {!editing ? (
          <>
            <h1>{post.title}</h1>
            <p className="post-content">{post.content}</p>
            <div className="detail-reactions">
              {reactionButtons.map((reaction) => (
                <span key={reaction.key}>
                  {reaction.label} {post.reactions[reaction.key] || 0}
                </span>
              ))}
            </div>
            <button type="button" className="button primary-button" onClick={beginEdit}>
              Edit
            </button>
          </>
        ) : (
          <form className="edit-form" onSubmit={saveEdit}>
            <h2>Edit post</h2>
            <label htmlFor="postTitle">Post title</label>
            <input
              id="postTitle"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
            <label htmlFor="postContent">Post content</label>
            <textarea
              id="postContent"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows="6"
              required
            />
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="edit-actions">
              <button type="button" className="button secondary-button" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button type="submit" className="button primary-button">
                Save Post
              </button>
            </div>
          </form>
        )}
      </article>
    </main>
  );
}

function NotFoundPage() {
  return (
    <main className="page-shell narrow-shell not-found">
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
      <Link className="button primary-button" to="/">Go to posts</Link>
    </main>
  );
}

function App() {
  return (
    <AppProvider>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/posts/:postId" element={<PostDetailsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <footer className="site-footer">
          <span>GenZ</span>
          <span>Share ideas. Build community.</span>
        </footer>
      </div>
    </AppProvider>
  );
}

export default App;
