import { fetchGitHubMarkdownFiles } from '~/services/github.server';
import { parseObsidianArticle } from '~/services/obsidian';
import type { Article } from '~/types';

export async function loader() {
  try {
    // GitHubからマークダウンファイルを取得
    const { files, success, message } = await fetchGitHubMarkdownFiles();

    if (!success) {
      console.error('マークダウンファイルの取得に失敗しました:', message);
      return {
        articles: [],
        success: false,
        message: message,
      };
    }

    // Obsidianパーサーでファイルを記事に変換
    const articles: Article[] = files
      .map(file => parseObsidianArticle(file))
      .filter((article): article is Article => article !== null);

    return {
      articles,
      success: true,
      message: `${articles.length}件の記事を取得しました`,
    };
  } catch (error) {
    console.error('記事の取得処理に失敗しました:', error);
    return {
      articles: [],
      success: false,
      message: `エラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
