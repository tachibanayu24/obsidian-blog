import { Octokit } from "octokit";
import type { Article, GitHubFile } from "~/types";
import { parseObsidianArticle } from "~/utils/markdown";

const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER as string;
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME as string;
const GITHUB_CONTENT_PATH = process.env.GITHUB_CONTENT_PATH as string;
const GITHUB_BRANCH = 'main'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

/**
 * GitHubからObsidian記事のリストを取得する
 * @returns 記事のリスト
 */
export async function fetchObsidianArticles(): Promise<{ articles: Article[], success: boolean, message: string }> {
  try {
    // GitHubからファイル一覧を取得
    const files = await fetchArticles();

    // 各ファイルの内容を取得して記事オブジェクトに変換
    const articlesPromises = files.map(async (file) => {
      const content = await fetchFileContent(file);
      return parseObsidianArticle(file, content);
    });

    // 結果を待ち、nullでないものだけをフィルタリング
    const articles = (await Promise.all(articlesPromises)).filter((article): article is Article => article !== null);

    return {
      articles,
      success: true,
      message: `${articles.length}件の記事を取得しました`
    };
  } catch (error) {
    console.error("記事の取得に失敗しました:", error);
    return {
      articles: [],
      success: false,
      message: `記事の取得に失敗しました: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * GitHubからマークダウンファイルのリストを取得する
 * @returns マークダウンファイルのリスト
 */
async function fetchArticles() {
  const response = await octokit.rest.repos.getContent({
    owner: GITHUB_REPO_OWNER,
    repo: GITHUB_REPO_NAME,
    path: GITHUB_CONTENT_PATH,
    ref: GITHUB_BRANCH,
  });

  if (response.status !== 200) {
    throw new Error(`ファイル一覧の取得に失敗しました: ${response.status}`);
  }

  const data = response.data;

  if (!Array.isArray(data)) {
    throw new Error(`ファイル一覧の取得に失敗しました: ${data}`);
  }

  // マークダウンファイルのみをフィルタリング
  return data.filter(data => data.name.endsWith(".md"));
}

/**
 * GitHubからファイルの内容を取得する
 * @param file GitHubファイル
 * @returns ファイルの内容（デコード済み）
 */
async function fetchFileContent(file: GitHubFile): Promise<string> {
  if (!file.download_url) {
    throw new Error(`ファイルのダウンロードURLが見つかりません: ${file.path}`);
  }

  const response = await fetch(file.download_url);

  if (!response.ok) {
    throw new Error(`ファイル内容の取得に失敗しました: ${response.status} ${response.statusText}`);
  }

  return await response.text();
}
