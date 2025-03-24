import { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router';
import { MainLayout, BlogCard, Footer } from '~/components';
import type { Article } from '~/types';
import { loader } from './server/loader.server';

export { loader };

export function meta() {
  return [
    { title: 'Hokori Note' },
    {
      name: 'description',
      content: 'プログラミングやテクノロジーに関する個人的なメモや発見を共有するブログです。',
    },
  ];
}

export default function HomeRoute() {
  const { articles, success, message } = useLoaderData<{
    articles: Article[];
    success: boolean;
    message: string;
  }>();

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // ページ内の利用可能なタグを収集
  const availableTags = Array.from(
    new Set(articles?.flatMap(article => article.tags) || [])
  ).sort();

  // 検索条件に基づいて記事をフィルタリング
  const filteredArticles = articles?.filter((article: Article) => {
    // タグでフィルタリング（選択されたタグがない場合はすべて表示）
    const tagMatch =
      selectedTags.length === 0 || article.tags.some((tag: string) => selectedTags.includes(tag));

    // 検索クエリでフィルタリング
    const searchMatch =
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.content?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    return tagMatch && searchMatch;
  });

  // リストが空の場合のメッセージ
  useEffect(() => {
    if (articles?.length === 0 && success) {
      console.info('記事が見つかりませんでした');
    }
  }, [articles, success]);

  return (
    <MainLayout
      availableTags={availableTags}
      selectedTags={selectedTags}
      onTagSelect={(tag: string) => {
        if (selectedTags.includes(tag)) {
          setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
          setSelectedTags([...selectedTags, tag]);
        }
      }}
      onSearchChange={(query: string) => setSearchQuery(query)}
      searchQuery={searchQuery}
    >
      <div className="w-full max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-2">Hokori Note</h1>
        <p className="text-gray-300 mb-8">
          プログラミングやテクノロジーに関する個人的なメモや発見を共有するブログです。
        </p>

        {!success ? (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-8">
            <p className="text-red-200">記事の取得に失敗しました: {message}</p>
          </div>
        ) : (
          <>
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">条件に一致する記事が見つかりませんでした</p>
                {selectedTags.length > 0 && (
                  <button
                    className="mt-4 text-blue-400 hover:underline"
                    onClick={() => setSelectedTags([])}
                  >
                    タグフィルターをクリア
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredArticles.map((article: Article) => (
                  <BlogCard
                    key={article.slug}
                    article={article}
                    onTagClick={(tag: string) => {
                      if (!selectedTags.includes(tag)) {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <Footer />
      </div>
    </MainLayout>
  );
}
