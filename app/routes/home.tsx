import { useState } from "react";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { getGithubService } from "../services/github";
import { MainLayout, BlogCard, Footer } from "../components";
import type { GitHubFile } from "../components/blog/blog-card";

export async function loader() {
  try {
    const githubService = getGithubService();

    const markdownFiles = await githubService.getMarkdownFiles();
    console.log("Markdownファイル:", markdownFiles);

    return {
      files: markdownFiles,
      message: "APIからデータを取得しました"
    };
  } catch (error) {
    console.error("Error fetching from GitHub:", error);
    return {
      error: "GitHubからのデータ取得に失敗しました",
      message: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Hokori note" },
    { name: "description", content: "Obsidianのノートを公開するブログ" },
  ];
}

export function Home() {
  const data = useLoaderData() as {
    files?: GitHubFile[];
    error?: string;
    message: string;
  };

  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  const extractedTags: string[] = ["プログラミング", "React", "TypeScript", "自己啓発", "趣味"];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTag(selectedTag === tag ? undefined : tag);
  };

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
      ) : data.files && data.files.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold mb-6">最新の記事</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.files.map((file) => (
              <BlogCard
                key={file.sha}
                file={file}
                tags={["プログラミング", "React"]}
                createDate="2024-03-01"
                updateDate="2024-03-20"
                previewContent="これはObsidianから取得した記事のプレビューです。実際の内容はMarkdownから取得します。"
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
