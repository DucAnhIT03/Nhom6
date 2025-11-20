import React, { useEffect, useState } from "react";
import TopHeader from "../../../shared/components/header/TopHeader";
import NavigationBar from "../../../shared/components/header/NavigationBar";
import Footer from "../../../shared/components/footer/Footer";
import PostBanner from "../components/post-banner/PostBanner";
import { getPosts } from "../../../services/postService";
import "./PostPage.css";

const DEFAULT_BANNER = "/banner.jpg";

const stripHtml = (html = "") =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN");
};

export default function PostPage() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await getPosts({
          status: "PUBLISHED",
          limit: 8,
          page: 1,
        });
        const items = response?.data?.items || response?.data || [];
        setPosts(items);
        setSelectedPost(items[0] ?? null);
        setError(items.length ? "" : "Hiện chưa có bài viết nào.");
      } catch (err) {
        setError(
          err?.response?.data?.message || "Không thể tải danh sách bài viết."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleSelectPost = (post) => {
    setSelectedPost(post);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const bannerSubtitle = selectedPost
    ? stripHtml(selectedPost.content).slice(0, 140) + "..."
    : "Tin tức và cập nhật mới nhất từ hệ thống.";

  const renderContent = () => {
    if (loading) {
      return <div className="post-state">Đang tải bài viết...</div>;
    }
    if (error) {
      return <div className="post-state post-state__error">{error}</div>;
    }
    if (!selectedPost) {
      return <div className="post-state">Hiện chưa có bài viết nào.</div>;
    }
    return (
      <>
        <div className="post-meta">
          <span>{formatDate(selectedPost.createdAt)}</span>
        </div>
        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: selectedPost.content }}
        />
      </>
    );
  };

  return (
    <>
      <TopHeader />
      <NavigationBar />

      <div className="post-container">
        <PostBanner
          image={selectedPost?.thumbnailUrl || DEFAULT_BANNER}
          title={selectedPost?.title || "Bài viết"}
          subtitle={bannerSubtitle}
        />

        <div className="post-layout">
          <main className="post-main">{renderContent()}</main>
          <aside className="post-sidebar">
            <h3>Bài viết mới</h3>
            <div className="post-list">
              {posts.map((post) => (
                <button
                  key={post.id}
                  className={`post-list__item ${
                    selectedPost?.id === post.id ? "active" : ""
                  }`}
                  onClick={() => handleSelectPost(post)}
                >
                  <span className="post-list__title">{post.title}</span>
                  <span className="post-list__date">
                    {formatDate(post.createdAt)}
                  </span>
                </button>
              ))}
              {!loading && !posts.length && (
                <p className="post-empty">Chưa có bài viết nào để hiển thị.</p>
              )}
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </>
  );
}
