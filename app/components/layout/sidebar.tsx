import React, { useState } from "react";
import { Link, useLocation } from "react-router";
import { Tag } from "../common/tag";

export interface SidebarProps {
  tags?: string[];
  onTagSelect?: (tag: string) => void;
  selectedTag?: string;
  onSearch?: (query: string) => void;
}

export function Sidebar({ tags = [], onTagSelect, selectedTag, onSearch }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleTagClick = (tag: string) => {
    if (onTagSelect) {
      onTagSelect(tag);
    }
    // モバイルの場合はタグクリック後にサイドバーを閉じる
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  // タグをアルファベット順に並べ替え
  const sortedTags = [...tags].sort((a, b) => a.localeCompare(b));

  return (
    <>
      {/* モバイル用メニューボタン */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-gray-200"
        onClick={toggleSidebar}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* サイドバー */}
      <aside
        className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out md:relative md:h-screen w-64 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto z-40`}
      >
        <div className="mb-8">
          <Link to="/" className="text-2xl font-bold text-white hover:text-blue-400 transition-colors">
            Hokori note
          </Link>
        </div>

        <form onSubmit={handleSearchSubmit} className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="記事を検索..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full py-2 px-3 pl-10 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </form>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">タグ</h3>
          <div className="flex flex-wrap gap-2">
            {sortedTags.map(tag => (
              <Tag
                key={tag}
                name={tag}
                onClick={handleTagClick}
                className={selectedTag === tag ? 'bg-blue-700' : ''}
              />
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
