import { useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { getGithubService, type GitHubFile } from "../services/github";

export async function loader() {
  console.log("サーバーサイドのローダー関数が呼ばれました");

  try {
    // サーバーサイドのみで実行されるサービスを取得
    const githubService = getGithubService();

    // Markdownファイルのみを取得
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
  // クライアントサイドでのデータ読み込み
  const data = useLoaderData() as {
    files?: GitHubFile[];
    error?: string;
    message: string;
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Hokori note</h1>
      <p className="mb-4">Obsidianのノートを公開するブログです。</p>
      <p className="mb-6">あなたの知識を共有し、整理するためのスペースです。</p>

      {data.error ? (
        <div className="text-red-500 p-4 rounded bg-gray-800 mb-4">
          <h2 className="font-bold">エラー</h2>
          <p>{data.error}</p>
          <p>{data.message}</p>
        </div>
      ) : data.files && data.files.length > 0 ? (
        <div>
          <h2 className="text-xl font-bold mb-3">公開されたノート</h2>
          <ul className="space-y-2">
            {data.files.map((file) => (
              <li key={file.sha} className="p-3 bg-gray-800 rounded-lg">
                <p className="font-medium">{file.name.replace('.md', '')}</p>
                <p className="text-sm text-gray-400">{file.path}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>公開されたノートはありません。</p>
      )}
    </div>
  );
}

export default Home;
