import { useState } from 'react';
import { useLoaderData } from 'react-router';
import type { Route } from './+types/home';
import { MainLayout, BlogCard, Footer } from '../components';
import type { Article } from '~/types';
import { fetchObsidianArticles } from '~/services/github.server';

export async function loader() {
  try {
    const result = await fetchObsidianArticles();

    if (!result.success) {
      return {
        error: 'GitHubからのデータ取得に失敗しました',
        message: result.message,
      };
    }

    return {
      files: result.articles,
      message: result.message,
      success: true,
    };
  } catch (error) {
    console.error('Error fetching from GitHub:', error);
    return {
      error: 'GitHubからのデータ取得に失敗しました',
      message: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Hokori note' },
    { name: 'description', content: 'Obsidianのノートを公開するブログ' },
  ];
}

export function Home() {
  const data = useLoaderData<typeof loader>();

  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // すべての記事から一意のタグを抽出
  const extractedTags: string[] =
    data.files && data.files.length
      ? Array.from(new Set(data.files.flatMap(file => file.tags || [])))
      : [];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTag(selectedTag === tag ? undefined : tag);
  };

  // タグとキーワードでフィルタリング
  const filteredFiles = data.files?.filter(file => {
    // タグでフィルタリング
    const tagMatch = !selectedTag || file.tags.includes(selectedTag);

    // 検索クエリでフィルタリング
    const queryMatch =
      !searchQuery ||
      file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.previewContent?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    return tagMatch && queryMatch;
  });

  return (
    <MainLayout
      tags={extractedTags}
      selectedTag={selectedTag}
      onTagSelect={handleTagSelect}
      onSearch={handleSearch}
    >
      <h1 className="text-3xl font-bold mb-6">Hokori note</h1>
      <p className="mb-4 text-lg">Obsidianのノートを公開するブログです。</p>
      <p className="mb-8 text-gray-400">あなたの知識を共有し、整理するためのスペースです。</p>

      {data.error ? (
        <div className="text-red-500 p-4 rounded bg-gray-800 mb-4">
          <h2 className="font-bold">エラー</h2>
          <p>{data.error}</p>
          <p>{data.message}</p>
        </div>
      ) : filteredFiles && filteredFiles.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold mb-6">最新の記事</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFiles.map(file => (
              <BlogCard
                key={file.sha || file.path}
                title={file.title}
                slug={file.slug}
                tags={file.tags}
                createDate={file.createDate || '不明'}
                updateDate={file.updateDate}
                previewContent={file.previewContent || 'プレビューなし'}
              />
            ))}
          </div>
        </div>
      ) : (
        <p>公開されたノートはありません。</p>
      )}

      <Footer />
    </MainLayout>
  );
}

export default Home;
