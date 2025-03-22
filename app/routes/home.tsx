import type { Route } from "./+types/home";

export async function loader() {
  console.log("サーバーサイドのローダー関数が呼ばれました");

  // GitHub APIからデータを取得するための環境変数
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const path = process.env.GITHUB_CONTENT_PATH;

  console.log("環境変数:", { owner, repo, path });

  try {
    // GitHubのREST APIを使用してリポジトリの内容を取得
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    console.log("API URL:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("取得したデータ:", data);

    // Markdownファイルのみをフィルタリング
    const markdownFiles = data.filter(
      (file: any) => file.type === "file" && file.name.endsWith(".md")
    );

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
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Hokori note</h1>
      <p className="mb-4">Obsidianのノートを公開するブログです。</p>
      <p>あなたの知識を共有し、整理するためのスペースです。</p>
    </div>
  );
}

export default Home;
