import type { Article, GitHubFile, ObsidianFrontMatter } from "~/types";

/**
 * マークダウン文字列からフロントマターとコンテンツを抽出する
 * @param markdown マークダウン文字列
 * @returns フロントマターとコンテンツのオブジェクト
 */
export function extractFrontMatter(markdown: string): { frontMatter: ObsidianFrontMatter | null, content: string } {
  // フロントマターが存在するか確認（---で囲まれたYAML形式のブロック）
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = markdown.match(frontMatterRegex);


  if (!match) {
    // フロントマターが見つからない場合
    return { frontMatter: null, content: markdown };
  }

  try {
    // フロントマターをパースする
    const frontMatterString = match[1];
console.log('frontMatterString', frontMatterString)
    const frontMatter = parseFrontMatter(frontMatterString);

    // コンテンツ部分を抽出（フロントマター以降）
    const content = markdown.substring(match[0].length);

    return { frontMatter, content };
  } catch (error) {
    console.error("フロントマターのパースに失敗しました:", error);
    return { frontMatter: null, content: markdown };
  }
}

/**
 * YAMLフォーマットのフロントマター文字列をオブジェクトにパースする
 * @param frontMatterString YAMLフォーマットのフロントマター文字列
 * @returns パースされたオブジェクト
 */
function parseFrontMatter(frontMatterString: string): ObsidianFrontMatter {
  const frontMatter: ObsidianFrontMatter = {
    aliases: [],
    tags: [],
    create_date: '',
    update_date: '',
    uid: ''
  };
  const lines = frontMatterString.split("\n");

  for (const line of lines) {
    // 空行をスキップ
    if (!line.trim()) continue;

    // キーと値を抽出（例: "title: My Blog Post"）
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();

    // 値が配列の場合（例: "[tag1, tag2]"）
    if (value.startsWith("[") && value.endsWith("]")) {
      value = value.substring(1, value.length - 1);
      const array = value.split(",").map(item => item.trim().replace(/"/g, '').replace(/'/g, ''));
      frontMatter[key] = array;
    }
    // 値が文字列の場合（引用符を削除）
    else {
      frontMatter[key] = value.replace(/^["'](.*)["']$/, "$1");
    }
  }

  return frontMatter;
}

/**
 * マークダウンの最初の段落を抽出してプレビューにする
 * @param content マークダウンコンテンツ
 * @param maxLength 最大文字数
 * @returns プレビューテキスト
 */
export function extractPreviewContent(content: string, maxLength: number = 150): string {
  // 最初の段落または特定の長さを抽出
  const text = content.split("\n\n")[0] || "";

  // マークダウン記法を削除
  const plainText = text
    .replace(/!\[\[.*?\]\]/g, '') // 添付ファイル記法を削除
    .replace(/\[\[(.*?)\]\]/g, '$1') // ノートリンク記法を削除
    .replace(/[*_~`#]/g, '') // 装飾記法を削除
    .trim();

  // 長すぎる場合は切り詰める
  if (plainText.length > maxLength) {
    return plainText.substring(0, maxLength) + "...";
  }

  return plainText;
}

/**
 * GitHubファイルからArticle情報を抽出する
 * @param file GitHubファイル
 * @param content ファイルの内容
 * @returns 記事情報
 */
export function parseObsidianArticle(file: GitHubFile, content: string): Article | null {

  // フロントマターとコンテンツを抽出
  const { frontMatter, content: markdownContent } = extractFrontMatter(content);

  // フロントマターがない場合はnullを返す
  if (!frontMatter) {
    console.warn(`${file.path} にフロントマターが見つかりませんでした`);
    return null;
  }

  // 公開設定を確認
  if (frontMatter.published !== undefined && frontMatter.published === false) {
    console.info(`${file.path} は公開設定されていません`);
    return null;
  }

  // タイトルを取得（フロントマターのtitleか、ファイル名）
  const title = frontMatter.title || file.name.replace(".md", "");

  // スラッグを取得（aliasesの最初の値か、ファイル名をスラッグ化）
  const slug = frontMatter.aliases && frontMatter.aliases.length > 0
    ? frontMatter.aliases[0]
    : file.name.replace(".md", "").toLowerCase().replace(/\s+/g, "-");

  // タグを取得
  const tags = frontMatter.tags || [];

  // プレビューコンテンツを抽出
  const previewContent = extractPreviewContent(markdownContent);

  return {
    title,
    slug,
    tags,
    createDate: frontMatter.create_date,
    updateDate: frontMatter.update_date,
    previewContent,
    published: frontMatter.published === true || frontMatter.published === undefined, // 明示的にfalseでない限りtrue
    uid: frontMatter.uid,
    content: markdownContent,
    sha: file.sha,
    path: file.path
  };
}
