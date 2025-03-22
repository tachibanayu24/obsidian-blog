import type { Article, GitHubFile, ObsidianFrontMatter } from '~/types';

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
  const title = frontMatter.title || file.name.replace('.md', '');

  // スラッグを取得（aliasesの最初の値か、ファイル名をスラッグ化）
  const slug =
    frontMatter.aliases && frontMatter.aliases.length > 0
      ? frontMatter.aliases[0]
      : file.name.replace('.md', '').toLowerCase().replace(/\s+/g, '-');

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
    path: file.path,
  };
}
