import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const baseButton = {
  margin: "0 5px",
  minWidth: "36px",
  height: "36px",
  textAlign: "center",
  background: "#fff",
  color: "#111827",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
};

const activeButton = {
  ...baseButton,
  background: "#1d4ed8",
  color: "#fff",
  borderColor: "#1d4ed8",
};

const disabledButton = {
  ...baseButton,
  color: "#9ca3af",
  borderColor: "#e5e7eb",
  cursor: "not-allowed",
  background: "#f9fafb",
};

const ellipsisStyle = {
  ...baseButton,
  cursor: "default",
  border: "none",
  background: "transparent",
};

const buildPages = (current, total) => {
  if (total <= 1) return [1];
  const pages = [];
  const add = (value) => {
    if (pages[pages.length - 1] !== value) {
      pages.push(value);
    }
  };

  add(1);

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) {
    pages.push("left-ellipsis");
  }

  for (let i = start; i <= end; i += 1) {
    add(i);
  }

  if (end < total - 1) {
    pages.push("right-ellipsis");
  }

  if (total > 1) {
    add(total);
  }

  return pages;
};

export default function Pagination({ current = 1, total = 1, onPageChange = () => {} }) {
  if (!total || total <= 1) {
    return null;
  }

  const pages = buildPages(current, total);

  const changePage = (page) => {
    if (page < 1 || page > total || page === current) return;
    onPageChange(page);
  };

  return (
    <div style={{ marginTop: "24px", textAlign: "center" }}>
      <button
        type="button"
        style={current === 1 ? disabledButton : baseButton}
        onClick={() => changePage(current - 1)}
        disabled={current === 1}
      >
        <FaChevronLeft size={12} />
      </button>

      {pages.map((page, index) => {
        if (page === "left-ellipsis" || page === "right-ellipsis") {
          return (
            <span key={`${page}-${index}`} style={ellipsisStyle}>
              ...
            </span>
          );
        }
        const isActive = page === current;
        return (
          <button
            key={page}
            type="button"
            style={isActive ? activeButton : baseButton}
            onClick={() => changePage(page)}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        style={current === total ? disabledButton : baseButton}
        onClick={() => changePage(current + 1)}
        disabled={current === total}
      >
        <FaChevronRight size={12} />
      </button>
    </div>
  );
}
