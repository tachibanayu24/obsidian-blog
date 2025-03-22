export interface Article {
  title: string;
  slug: string;
  tags: string[];
  createDate?: string;
  updateDate?: string;
  previewContent?: string;
  published?: boolean;
  uid?: string;
  content?: string;
  sha?: string; // GitHubのファイル識別用
  path?: string; // ファイルパス
}

// GitHubから取得したファイルの型
export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string | null;
  git_url: string | null;
  download_url: string | null;
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  content?: string;
  encoding?: string;
}

// Obsidianのフロントマターの型
export interface ObsidianFrontMatter {
  title?: string;
  aliases: string[];
  tags: string[];
  create_date: string;
  update_date: string;
  uid: string;
  published?: boolean;
  [key: string]: any; // その他のカスタムプロパティ
}
