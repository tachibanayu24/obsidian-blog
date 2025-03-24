import type { Article, ObsidianFrontMatter } from '~/types';

/**
 * マークダウン文字列からフロントマターとコンテンツを抽出する
 * @param markdown マークダウン文字列
 * @returns フロントマターとコンテンツのオブジェクト
 */
export function extractFrontMatter(markdown: string): {
  frontMatter: ObsidianFrontMatter | null;
  content: string;
} {
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

    const frontMatter = parseFrontMatter(frontMatterString);

    // コンテンツ部分を抽出（フロントマター以降）
    const content = markdown.substring(match[0].length);

    return { frontMatter, content };
  } catch (error) {
    console.error('フロントマターのパースに失敗しました:', error);
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
    uid: '',
  };

  try {
    // 一般的なYAMLパースライブラリがない場合は、簡易的なYAMLパースを実装
    const lines = frontMatterString.split('\n');
    let currentKey = '';
    const keyIndentMap = new Map<string, number>();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue; // 空行をスキップ

      const indent = line.search(/\S|$/); // 先頭の空白の数
      const trimmedLine = line.trim();

      // リスト要素の場合
      if (trimmedLine.startsWith('-')) {
        const listItemValue = trimmedLine.slice(1).trim();

        // 前のキーを親として扱う
        if (currentKey && frontMatter[currentKey] !== undefined) {
          if (!Array.isArray(frontMatter[currentKey])) {
            frontMatter[currentKey] = [];
          }
          (frontMatter[currentKey] as any[]).push(listItemValue);
        }
        continue;
      }

      // キー：値のペア
      const colonIndex = trimmedLine.indexOf(':');
      if (colonIndex !== -1) {
        const key = trimmedLine.slice(0, colonIndex).trim();
        const value = trimmedLine.slice(colonIndex + 1).trim();

        // インデントレベルを記録
        keyIndentMap.set(key, indent);

        // 親キーを設定
        currentKey = key;

        // 値がある場合は設定
        if (value) {
          // 真偽値の処理
          if (value.toLowerCase() === 'true') {
            frontMatter[key] = true;
          } else if (value.toLowerCase() === 'false') {
            frontMatter[key] = false;
          } else {
            // 文字列（引用符を削除）
            frontMatter[key] = value.replace(/^["'](.*)["']$/, '$1');
          }
        } else {
          // 値がない場合は、次の行を確認して配列かどうか判断
          if (i + 1 < lines.length && lines[i + 1].trim().startsWith('-')) {
            frontMatter[key] = [];
          } else {
            frontMatter[key] = '';
          }
        }
      }
    }

    return frontMatter;
  } catch (error) {
    console.error('YAMLのパースに失敗しました:', error);
    return frontMatter; // 基本値を返す
  }
}

/**
 * マークダウンの最初の段落を抽出してプレビューにする
 * @param content マークダウンコンテンツ
 * @param maxLength 最大文字数
 * @returns プレビューテキスト
 */
export function extractPreviewContent(content: string, maxLength: number = 150): string {
  // 最初の段落または特定の長さを抽出
  const text = content.split('\n\n')[0] || '';

  // マークダウン記法を削除
  const plainText = text
    .replace(/!\[\[.*?\]\]/g, '') // 添付ファイル記法を削除
    .replace(/\[\[(.*?)\]\]/g, '$1') // ノートリンク記法を削除
    .replace(/[*_~`#]/g, '') // 装飾記法を削除
    .trim();

  // 長すぎる場合は切り詰める
  if (plainText.length > maxLength) {
    return plainText.substring(0, maxLength) + '...';
  }

  return plainText;
}

/**
 * マークダウンファイルからArticle情報を抽出する
 * GitHubに依存しない汎用的なインターフェース
 *
 * @param fileData ファイルデータ
 * @returns 記事情報
 */
export function parseObsidianArticle(fileData: {
  name: string;
  path: string;
  content: string;
  sha?: string;
}): Article | null {
  const { name, path, content: rawContent, sha } = fileData;

  // フロントマターとコンテンツを抽出
  const { frontMatter, content: markdownContent } = extractFrontMatter(rawContent);

  // フロントマターがない場合はnullを返す
  if (!frontMatter) {
    console.warn(`${path} にフロントマターが見つかりませんでした`);
    return null;
  }

  // 公開設定を確認
  if (frontMatter.published !== undefined && frontMatter.published === false) {
    console.info(`${path} は公開設定されていません`);
    return null;
  }

  // タイトルを取得（フロントマターのtitleか、ファイル名）
  const title = frontMatter.title || name.replace('.md', '');

  // スラッグを取得（aliasesの最初の値か、ファイル名をスラッグ化）
  const slug =
    frontMatter.aliases && frontMatter.aliases.length > 0
      ? frontMatter.aliases[0]
      : name.replace('.md', '').toLowerCase().replace(/\s+/g, '-');

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
    sha,
    path,
  };
}

/**
 * Obsidianの画像構文を検出する
 * @param content マークダウンコンテンツ
 * @returns 検出された画像パスの配列
 */
export function extractObsidianImagePaths(content: string): string[] {
  const imageRegex = /!\[\[(.*?)\]\]/g;
  const matches = content.match(imageRegex);

  if (!matches) return [];

  return matches.map(match => {
    // ![[ファイル名]] からファイル名を抽出
    return match.replace(/!\[\[(.*?)\]\]/, '$1').trim();
  });
}

/**
 * Obsidianの画像構文をHTML imgタグに変換する（パス変換関数を利用）
 * @param content マークダウンコンテンツ
 * @param pathTransformer 画像パスを変換する関数
 * @returns 変換後のコンテンツ
 */
export function convertObsidianImagesToHtml(
  content: string,
  pathTransformer: (imagePath: string) => string
): string {
  if (!content) return '';

  const imageRegex = /!\[\[(.*?)\]\]/g;
  let processedContent = content;
  const matches = content.match(imageRegex);

  if (matches) {
    matches.forEach(match => {
      const fileName = match.replace(/!\[\[(.*?)\]\]/, '$1').trim();
      const transformedPath = pathTransformer(fileName);

      processedContent = processedContent.replace(
        match,
        `<img src="${transformedPath}" alt="${fileName}" class="max-w-full h-auto rounded my-4" />`
      );
    });
  }

  return processedContent;
}

/**
 * Obsidianのリンク構文をHTMLのaタグに変換する
 * @param content マークダウンコンテンツ
 * @returns 変換後のコンテンツ
 */
export function convertObsidianLinksToHtml(content: string): string {
  if (!content) return '';

  const linkRegex = /\[\[(.*?)\]\]/g;
  let processedContent = content;
  const matches = content.match(linkRegex);

  if (matches) {
    matches.forEach(match => {
      const linkContent = match.replace(/\[\[(.*?)\]\]/, '$1').trim();
      const parts = linkContent.split('|');
      const noteName = parts[0].trim();
      const alias = parts.length > 1 ? parts[1].trim() : noteName;

      processedContent = processedContent.replace(
        match,
        `<a href="/${alias}" class="text-blue-400 hover:underline">${noteName}</a>`
      );
    });
  }

  return processedContent;
}

/**
 * マークダウン段落をHTMLの段落タグに変換する
 * @param content マークダウンコンテンツ
 * @returns 変換後のコンテンツ
 */
export function convertMarkdownParagraphs(content: string): string {
  if (!content) return '';

  return content
    .split('\n\n')
    .map(para => {
      const trimmed = para.trim();
      if (!trimmed) return '';
      return `<p>${trimmed}</p>`;
    })
    .join('');
}

/**
 * Obsidianのマークダウンコンテンツを完全にHTMLに変換する
 * @param content マークダウンコンテンツ
 * @param imagePathTransformer 画像パス変換関数
 * @returns 変換後のHTMLコンテンツ
 */
export function convertObsidianContentToHtml(
  content: string,
  imagePathTransformer: (imagePath: string) => string
): string {
  if (!content) return '';

  // 画像構文の変換
  let html = convertObsidianImagesToHtml(content, imagePathTransformer);

  // リンク構文の変換
  html = convertObsidianLinksToHtml(html);

  // 段落の処理
  html = convertMarkdownParagraphs(html);

  return html;
}
