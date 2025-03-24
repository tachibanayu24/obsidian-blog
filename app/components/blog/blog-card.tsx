import React from 'react';
import { Link } from 'react-router';
import { Tag } from '../common/tag';
import type { Article } from '~/types';

interface BlogCardProps {
  article: Article;
  onTagClick?: (tag: string) => void;
}

export const BlogCard = ({ article, onTagClick }: BlogCardProps) => {
  const { title, slug, tags, createDate, updateDate, previewContent } = article;

  return (
    <div className="p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
      <Link to={`/${slug}`} className="block">
        <h3 className="text-lg font-semibold mb-2 text-white truncate">{title}</h3>

        {tags && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map(tag => (
              <Tag key={tag} name={tag} onClick={onTagClick ? () => onTagClick(tag) : undefined} />
            ))}
          </div>
        )}

        {createDate && (
          <div className="text-sm text-gray-400 mb-2">
            作成日: {createDate}
            {updateDate && updateDate !== createDate && (
              <span className="ml-3">更新日: {updateDate}</span>
            )}
          </div>
        )}

        {previewContent && <p className="text-gray-300 line-clamp-2 text-sm">{previewContent}</p>}
      </Link>
    </div>
  );
};
