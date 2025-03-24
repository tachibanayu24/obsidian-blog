import { Octokit } from 'octokit';
import type { GitHubFile } from '~/types';

const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER as string;
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME as string;
const GITHUB_CONTENT_PATH = process.env.GITHUB_CONTENT_PATH as string;
const GITHUB_BRANCH = 'main';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

/**
 * GitHubからマークダウンファイルを取得する
 * @returns マークダウンファイル一覧とその内容
 */
export async function fetchGitHubMarkdownFiles(): Promise<{
  files: Array<{
    name: string;
    path: string;
    content: string;
    sha: string;
  }>;
  success: boolean;
  message: string;
}> {
  try {
    // GitHubからファイル一覧を取得
    const files = await fetchArticles();
    console.log(`GitHub APIから ${files.length} 個のマークダウンファイルを取得しました`);

    // 各ファイルの内容を取得
    const filesWithContent = await Promise.all(
      files.map(async file => {
        try {
          const content = await fetchFileContent(file);
          return {
            name: file.name,
            path: file.path,
            content,
            sha: file.sha,
          };
        } catch (error) {
          console.error(`${file.path} の内容取得に失敗しました:`, error);
          return null;
        }
      })
    );

    // nullを除外
    const validFiles = filesWithContent.filter(f => f !== null) as Array<{
      name: string;
      path: string;
      content: string;
      sha: string;
    }>;

    return {
      files: validFiles,
      success: true,
      message: `${validFiles.length} 個のマークダウンファイルを取得しました`,
    };
  } catch (error) {
    console.error('ファイル取得に失敗しました:', error);
    return {
      files: [],
      success: false,
      message: `エラー: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * GitHubからマークダウンファイルのリストを取得する
 * @returns マークダウンファイルのリスト
 */
async function fetchArticles(): Promise<GitHubFile[]> {
  try {
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
      throw new Error(`ファイル一覧の取得に失敗しました: 予期しない応答形式です`);
    }

    // マークダウンファイルのみをフィルタリング
    return data.filter(file => file.name.endsWith('.md'));
  } catch (error) {
    console.error('GitHub APIからファイル一覧の取得に失敗しました:', error);
    throw error;
  }
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

/**
 * GitHubから添付ファイル（画像など）を取得する
 * @param fileName ファイル名
 * @returns ファイルのバイナリデータとコンテンツタイプ
 */
export async function fetchGitHubAttachment(fileName: string): Promise<{
  data: Buffer | null;
  contentType: string | null;
  success: boolean;
  error?: string;
}> {
  try {
    const attachmentPath = process.env.GITHUB_ATTACHMENT_PATH || '_config/attachment';
    const repo = process.env.GITHUB_REPO_NOTES_NAME || GITHUB_REPO_NAME;

    // GitHubからファイルのメタデータを取得
    const response = await octokit.rest.repos.getContent({
      owner: GITHUB_REPO_OWNER,
      repo: repo,
      path: `${attachmentPath}/${fileName}`,
      ref: GITHUB_BRANCH,
    });

    if (response.status !== 200) {
      throw new Error(`添付ファイルの取得に失敗しました: ${response.status}`);
    }

    const data = response.data;

    // 単一ファイルであることを確認
    if (Array.isArray(data) || !('content' in data) || !('encoding' in data)) {
      throw new Error('予期しないレスポンス形式です');
    }

    // Base64デコード
    if (data.encoding !== 'base64' || !data.content) {
      throw new Error('ファイルコンテンツを取得できませんでした');
    }

    const fileBuffer = Buffer.from(data.content, 'base64');

    // Content-Typeの判定（ファイル名の拡張子から）
    let contentType = 'application/octet-stream';
    if (fileName.toLowerCase().endsWith('.png')) contentType = 'image/png';
    else if (fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg'))
      contentType = 'image/jpeg';
    else if (fileName.toLowerCase().endsWith('.gif')) contentType = 'image/gif';
    else if (fileName.toLowerCase().endsWith('.svg')) contentType = 'image/svg+xml';
    else if (fileName.toLowerCase().endsWith('.pdf')) contentType = 'application/pdf';

    return {
      data: fileBuffer,
      contentType,
      success: true,
    };
  } catch (error) {
    console.error('添付ファイルの取得に失敗しました:', error);

    // バックアッププラン: 直接raw.githubusercontent.comにアクセス
    try {
      const attachmentPath = process.env.GITHUB_ATTACHMENT_PATH || '_config/attachment';
      const repo = process.env.GITHUB_REPO_NOTES_NAME || GITHUB_REPO_NAME;
      const token = process.env.GITHUB_TOKEN;

      const githubUrl = `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${repo}/${GITHUB_BRANCH}/${attachmentPath}/${fileName}`;

      const response = await fetch(githubUrl, {
        headers: {
          Authorization: token ? `token ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error(
          `添付ファイルの直接取得に失敗しました: ${response.status} ${response.statusText}`
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'application/octet-stream';

      return {
        data: Buffer.from(arrayBuffer),
        contentType,
        success: true,
      };
    } catch (backupError) {
      console.error('添付ファイルのバックアップ方法による取得にも失敗しました:', backupError);
      return {
        data: null,
        contentType: null,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

/**
 * 添付ファイルのAPIエンドポイントパスを生成する
 * @param fileName ファイル名
 * @returns APIエンドポイントパス
 */
export function getAttachmentPath(fileName: string): string {
  return `/api/attachments/${encodeURIComponent(fileName)}`;
}
