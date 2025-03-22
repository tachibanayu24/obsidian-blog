import { Octokit } from "octokit";

// GitHubサービスの型定義
export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content?: string;
  encoding?: string;
}

// GitHubへのアクセスを管理するサービス
class GitHubService {
  private octokit: Octokit;
  private owner: string;
  private repo: string;
  private contentPath: string;

  constructor() {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      throw new Error("GitHub token is not set in environment variables");
    }

    this.owner = process.env.GITHUB_REPO_OWNER || "";
    this.repo = process.env.GITHUB_REPO_NAME || "";
    this.contentPath = process.env.GITHUB_CONTENT_PATH || "";

    this.octokit = new Octokit({
      auth: token,
    });
  }

  /**
   * 指定したパスのファイル一覧を取得
   */
  async getContents(path: string = this.contentPath): Promise<GitHubFile[]> {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
      });

      // レスポンスがファイル配列の場合
      if (Array.isArray(response.data)) {
        return response.data as GitHubFile[];
      }

      // 単一ファイルの場合は配列に変換
      return [response.data as GitHubFile];
    } catch (error) {
      console.error("Error fetching from GitHub:", error);
      throw error;
    }
  }

  /**
   * Markdownファイルのみをフィルタリング
   */
  async getMarkdownFiles(path: string = this.contentPath): Promise<GitHubFile[]> {
    const files = await this.getContents(path);
    return files.filter(file => file.type === "file" && file.name.endsWith(".md"));
  }

  /**
   * ファイルの内容を取得
   */
  async getFileContent(path: string): Promise<string> {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
      });

      if ('content' in response.data && 'encoding' in response.data) {
        const { content, encoding } = response.data as GitHubFile;
        if (content && encoding === 'base64') {
          return Buffer.from(content, 'base64').toString('utf-8');
        }
      }

      throw new Error("Invalid file content or encoding");
    } catch (error) {
      console.error(`Error fetching file content for ${path}:`, error);
      throw error;
    }
  }
}

// サーバーサイドでのみインスタンスを作成（SSRのハイドレーションエラー防止）
let githubService: GitHubService | null = null;

export function getGithubService(): GitHubService {
  if (typeof window !== 'undefined') {
    throw new Error("GitHub service should only be used on the server side");
  }

  if (!githubService) {
    githubService = new GitHubService();
  }

  return githubService;
}
