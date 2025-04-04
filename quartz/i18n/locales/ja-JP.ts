import { Translation } from "./definition"

export default {
  propertyDefaults: {
    title: "無題",
    description: "説明なし",
  },
  components: {
    callout: {
      note: "ノート",
      abstract: "抄録",
      info: "情報",
      todo: "やるべきこと",
      tip: "ヒント",
      success: "成功",
      question: "質問",
      warning: "警告",
      failure: "失敗",
      danger: "危険",
      bug: "バグ",
      example: "例",
      quote: "引用",
    },
    backlinks: {
      title: "バックリンク",
      noBacklinksFound: "バックリンクはありません",
    },
    themeToggle: {
      lightMode: "ライトモード",
      darkMode: "ダークモード",
    },
    explorer: {
      title: "記事一覧",
    },
    footer: {
      createdWith: "Written by",
    },
    graph: {
      title: "グラフビュー",
    },
    recentNotes: {
      title: "最近の記事",
      seeRemainingMore: ({ remaining }) => `さらに${remaining}件 →`,
    },
    transcludes: {
      transcludeOf: ({ targetSlug }) => `${targetSlug}のまとめ`,
      linkToOriginal: "元記事へのリンク",
    },
    search: {
      title: "検索（⌘+K）",
      searchBarPlaceholder: "検索ワードを入力",
    },
    tableOfContents: {
      title: "On This Page",
    },
    contentMeta: {
      readingTime: ({ minutes }) => `${minutes}分くらいで読めます`,
    },
  },
  pages: {
    rss: {
      recentNotes: "最近の記事",
      lastFewNotes: ({ count }) => `最新の${count}件`,
    },
    error: {
      title: "Not Found",
      notFound: "ページが見つかりませんでした。",
      home: "トップに戻る",
    },
    folderContent: {
      folder: "フォルダ",
      itemsUnderFolder: ({ count }) => `${count}件のページ`,
    },
    tagContent: {
      tag: "タグ",
      tagIndex: "タグ一覧",
      itemsUnderTag: ({ count }) => `${count}件のページ`,
      showingFirst: ({ count }) => `のうち最初の${count}件を表示しています`,
      totalTags: ({ count }) => `全${count}個のタグを表示中`,
    },
  },
} as const satisfies Translation
