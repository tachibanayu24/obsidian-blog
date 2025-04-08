import { FileTrieNode } from "../../util/fileTrie"
import { FullSlug, resolveRelative, simplifySlug } from "../../util/path"
import { ContentDetails } from "../../plugins/emitters/contentIndex"

type MaybeHTMLElement = HTMLElement | undefined

interface ParsedOptions {
  folderClickBehavior: "collapse" | "link"
  folderDefaultState: "collapsed" | "open"
  useSavedState: boolean
  sortFn: (a: FileTrieNode, b: FileTrieNode) => number
  filterFn: (node: FileTrieNode) => boolean
  mapFn: (node: FileTrieNode) => void
  order: "sort" | "filter" | "map"[]
}

type FolderState = {
  path: string
  collapsed: boolean
}

// フォルダアイコンSVGの設定
interface SVGConfig {
  path: string
  className: string
}

const FOLDER_ICONS = {
  closed: {
    path: "M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640v400q0 33-23.5 56.5T800-160H160Zm0-80h640v-400H447l-80-80H160v480Zm0 0v-480 480Z",
    className: "folder-closed"
  },
  open: {
    path: "M168-192q-32 0-52-21.16t-20-50.88v-432.24Q96-726 116-747t52-21h216l96 96h313q31 0 50.5 21t21.5 51H451l-96-96H168v432l78-264h690l-85 285q-8 23-21 37t-38 14H168Zm75-72h538l59-192H300l-57 192Zm0 0 57-192-57 192Zm-75-336v-96 96Z",
    className: "folder-open"
  },
  file: {
    path: "M340-460h280v-64H340v64Zm0 120h280v-64H340v64Zm0 120h174v-64H340v64ZM263.72-96Q234-96 213-117.15T192-168v-624q0-29.7 21.15-50.85Q234.3-864 264-864h312l192 192v504q0 29.7-21.16 50.85Q725.68-96 695.96-96H263.72ZM528-624v-168H264v624h432v-456H528ZM264-792v168-168 624-624Z",
    className: "file-icon"
  }
};

// SVG作成ヘルパー関数
function createSVGIcon(config: SVGConfig, display: string = "block"): SVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("height", "20px");
  svg.setAttribute("viewBox", "0 -960 960 960");
  svg.setAttribute("width", "20px");
  svg.setAttribute("fill", "#8b7355");
  svg.classList.add(config.className);
  svg.style.flexShrink = "0";
  svg.style.display = display;

  // フォルダーアイコンの場合にのみ追加のスタイル
  if (config.className.includes("folder")) {
    svg.style.cursor = "pointer";
    svg.style.pointerEvents = "all";
  }

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", config.path);
  path.style.pointerEvents = "none";
  svg.appendChild(path);

  return svg;
}

// フォルダーの状態更新ヘルパー
function updateFolderState(
  folderContainer: HTMLElement,
  folderOuter: HTMLElement,
  closedIcon: SVGElement,
  openIcon: SVGElement,
  isCollapsed: boolean
): void {
  if (isCollapsed) {
    folderOuter.classList.remove("open");
    closedIcon.style.display = "block";
    openIcon.style.display = "none";
  } else {
    folderOuter.classList.add("open");
    closedIcon.style.display = "none";
    openIcon.style.display = "block";
  }

  // 状態の永続化
  const currentFolderState = currentExplorerState.find(
    (item) => item.path === folderContainer.dataset.folderpath,
  );
  if (currentFolderState) {
    currentFolderState.collapsed = isCollapsed;
  } else {
    currentExplorerState.push({
      path: folderContainer.dataset.folderpath as FullSlug,
      collapsed: isCollapsed,
    });
  }

  localStorage.setItem("fileTree", JSON.stringify(currentExplorerState));
}

let currentExplorerState: Array<FolderState>
function toggleExplorer(this: HTMLElement) {
  const nearestExplorer = this.closest(".explorer") as HTMLElement
  if (!nearestExplorer) return
  nearestExplorer.classList.toggle("collapsed")
  nearestExplorer.setAttribute(
    "aria-expanded",
    nearestExplorer.getAttribute("aria-expanded") === "true" ? "false" : "true",
  )
}

function toggleFolder(evt: MouseEvent) {
  evt.stopPropagation()
  const target = evt.target as MaybeHTMLElement
  if (!target) return

  // Check if target was svg or path or other icon-related element
  const isSvg = target.nodeName === "svg" || target.nodeName === "path" || target.classList.contains("folder-closed") || target.classList.contains("folder-open")

  // Find the folder-container ancestor regardless of what was clicked
  let folderContainer: HTMLElement | null = null

  if (isSvg) {
    // Navigate up the DOM tree to find folder-container
    let el: HTMLElement | null = target as HTMLElement
    while (el && !folderContainer) {
      if (el.classList?.contains("folder-container")) {
        folderContainer = el
      } else {
        el = el.parentElement
      }
    }
  } else {
    // Traditional approach for button clicks
    folderContainer = target.parentElement?.parentElement as HTMLElement
  }

  if (!folderContainer) return
  const childFolderContainer = folderContainer.nextElementSibling as MaybeHTMLElement
  if (!childFolderContainer) return

  childFolderContainer.classList.toggle("open")

  // Collapse folder container
  const isCollapsed = !childFolderContainer.classList.contains("open")
  setFolderState(childFolderContainer, isCollapsed)

  const currentFolderState = currentExplorerState.find(
    (item) => item.path === folderContainer.dataset.folderpath,
  )
  if (currentFolderState) {
    currentFolderState.collapsed = isCollapsed
  } else {
    currentExplorerState.push({
      path: folderContainer.dataset.folderpath as FullSlug,
      collapsed: isCollapsed,
    })
  }

  const stringifiedFileTree = JSON.stringify(currentExplorerState)
  localStorage.setItem("fileTree", stringifiedFileTree)
}

function createFileNode(currentSlug: FullSlug, node: FileTrieNode): HTMLLIElement {
  const template = document.getElementById("template-file") as HTMLTemplateElement
  const clone = template.content.cloneNode(true) as DocumentFragment
  const li = clone.querySelector("li") as HTMLLIElement
  const a = li.querySelector("a") as HTMLAnchorElement
  a.href = resolveRelative(currentSlug, node.slug)
  a.dataset.for = node.slug

  // スタイルを追加
  a.style.display = "flex"
  // a.style.alignItems = "center"
  a.style.gap = "2px"

  // ファイルアイコンのSVGを作成
  const fileSvg = createSVGIcon(FOLDER_ICONS.file)
  a.appendChild(fileSvg)

  // テキストノードを追加
  const text = document.createTextNode(node.displayName)
  a.appendChild(text)

  if (currentSlug === node.slug) {
    a.classList.add("active")
  }

  return li
}

function createFolderNode(
  currentSlug: FullSlug,
  node: FileTrieNode,
  opts: ParsedOptions,
): HTMLLIElement {
  const template = document.getElementById("template-folder") as HTMLTemplateElement
  const clone = template.content.cloneNode(true) as DocumentFragment
  const li = clone.querySelector("li") as HTMLLIElement
  const folderContainer = li.querySelector(".folder-container") as HTMLElement
  const titleContainer = folderContainer.querySelector("div") as HTMLElement
  const folderOuter = li.querySelector(".folder-outer") as HTMLElement
  const ul = folderOuter.querySelector("ul") as HTMLUListElement

  const folderPath = node.slug
  folderContainer.dataset.folderpath = folderPath

  // アイコン作成
  const closedFolderSvg = createSVGIcon(FOLDER_ICONS.closed, "block")
  const openFolderSvg = createSVGIcon(FOLDER_ICONS.open, "none")

  // 初期状態の取得
  const isCollapsed =
    currentExplorerState.find((item) => item.path === folderPath)?.collapsed ??
    opts.folderDefaultState === "collapsed"

  // このパスがプレフィックスの場合は常に開く
  const simpleFolderPath = simplifySlug(folderPath)
  const folderIsPrefixOfCurrentSlug =
    simpleFolderPath === currentSlug.slice(0, simpleFolderPath.length)

  if (!isCollapsed || folderIsPrefixOfCurrentSlug) {
    folderOuter.classList.add("open")
  }

  // フォルダーの状態更新関数
  const updateFolderIcon = () => {
    const isOpen = folderOuter.classList.contains("open")
    closedFolderSvg.style.display = isOpen ? "none" : "block"
    openFolderSvg.style.display = isOpen ? "block" : "none"
  }

  // SVGアイコンのクリックハンドラー
  const svgClickHandler = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    folderOuter.classList.toggle("open")

    // 状態更新
    const newIsCollapsed = !folderOuter.classList.contains("open")
    updateFolderIcon()

    // 状態の永続化
    updateFolderState(folderContainer, folderOuter, closedFolderSvg, openFolderSvg, newIsCollapsed)
  }

  // イベント設定
  closedFolderSvg.addEventListener("click", svgClickHandler)
  openFolderSvg.addEventListener("click", svgClickHandler)

  // クリーンアップ
  window.addCleanup(() => {
    closedFolderSvg.removeEventListener("click", svgClickHandler)
    openFolderSvg.removeEventListener("click", svgClickHandler)
  })

  // MutationObserverの設定
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" && mutation.attributeName === "class") {
        updateFolderIcon()
      }
    })
  })

  observer.observe(folderOuter, { attributes: true })
  window.addCleanup(() => observer.disconnect())

  if (opts.folderClickBehavior === "link") {
    // リンクモード用の処理
    const button = titleContainer.querySelector(".folder-button") as HTMLElement
    const a = document.createElement("a")
    a.href = resolveRelative(currentSlug, folderPath)
    a.dataset.for = folderPath
    a.className = "folder-title"

    // スタイル適用
    a.style.display = "flex"
    a.style.alignItems = "center"
    a.style.gap = "2px"
    a.style.fontWeight = "bold"
    a.style.fontSize = "1.2rem"

    // アイコンとテキストを追加
    a.appendChild(closedFolderSvg)
    a.appendChild(openFolderSvg)
    a.appendChild(document.createTextNode(node.displayName))

    // 初期状態を反映
    updateFolderIcon()

    button.replaceWith(a)
  } else {
    // 折りたたみモード用の処理
    const span = titleContainer.querySelector(".folder-title") as HTMLElement
    span.textContent = node.displayName
    span.style.fontWeight = "bold"
    span.style.color = '#8b7355'

    // ボタンを取得してスタイル適用
    const button = titleContainer.querySelector(".folder-button") as HTMLElement
    button.style.display = "flex"
    button.style.alignItems = "center"
    button.style.gap = "2px"

    // スパンの前にアイコンを挿入
    button.insertBefore(openFolderSvg, span)
    button.insertBefore(closedFolderSvg, openFolderSvg)

    // 初期状態を反映
    updateFolderIcon()
  }

  // 子ノードの作成
  for (const child of node.children) {
    const childNode = child.isFolder
      ? createFolderNode(currentSlug, child, opts)
      : createFileNode(currentSlug, child)
    ul.appendChild(childNode)
  }

  return li
}

async function setupExplorer(currentSlug: FullSlug) {
  const allExplorers = document.querySelectorAll("div.explorer") as NodeListOf<HTMLElement>

  for (const explorer of allExplorers) {
    const dataFns = JSON.parse(explorer.dataset.dataFns || "{}")
    const opts: ParsedOptions = {
      folderClickBehavior: (explorer.dataset.behavior || "collapse") as "collapse" | "link",
      folderDefaultState: (explorer.dataset.collapsed || "collapsed") as "collapsed" | "open",
      useSavedState: explorer.dataset.savestate === "true",
      order: dataFns.order || ["filter", "map", "sort"],
      sortFn: new Function("return " + (dataFns.sortFn || "undefined"))(),
      filterFn: new Function("return " + (dataFns.filterFn || "undefined"))(),
      mapFn: new Function("return " + (dataFns.mapFn || "undefined"))(),
    }

    // Get folder state from local storage
    const storageTree = localStorage.getItem("fileTree")
    const serializedExplorerState = storageTree && opts.useSavedState ? JSON.parse(storageTree) : []
    const oldIndex = new Map<string, boolean>(
      serializedExplorerState.map((entry: FolderState) => [entry.path, entry.collapsed]),
    )

    const data = await fetchData
    const entries = [...Object.entries(data)] as [FullSlug, ContentDetails][]
    const trie = FileTrieNode.fromEntries(entries)

    // Apply functions in order
    for (const fn of opts.order) {
      switch (fn) {
        case "filter":
          if (opts.filterFn) trie.filter(opts.filterFn)
          break
        case "map":
          if (opts.mapFn) trie.map(opts.mapFn)
          break
        case "sort":
          if (opts.sortFn) trie.sort(opts.sortFn)
          break
      }
    }

    // Get folder paths for state management
    const folderPaths = trie.getFolderPaths()
    currentExplorerState = folderPaths.map((path) => {
      const previousState = oldIndex.get(path)
      return {
        path,
        collapsed:
          previousState === undefined ? opts.folderDefaultState === "collapsed" : previousState,
      }
    })

    const explorerUl = explorer.querySelector(".explorer-ul")
    if (!explorerUl) continue

    // Create and insert new content
    const fragment = document.createDocumentFragment()
    for (const child of trie.children) {
      const node = child.isFolder
        ? createFolderNode(currentSlug, child, opts)
        : createFileNode(currentSlug, child)

      fragment.appendChild(node)
    }
    explorerUl.insertBefore(fragment, explorerUl.firstChild)

    // restore explorer scrollTop position if it exists
    const scrollTop = sessionStorage.getItem("explorerScrollTop")
    if (scrollTop) {
      explorerUl.scrollTop = parseInt(scrollTop)
    } else {
      // try to scroll to the active element if it exists
      const activeElement = explorerUl.querySelector(".active")
      if (activeElement) {
        // TODO: メインコンテンツまでスクロールしてしまうので一旦コメントアウトするが直したい。。。
        // activeElement.scrollIntoView({ behavior: "smooth" })
      }
    }

    // Set up event handlers
    const explorerButtons = explorer.getElementsByClassName(
      "explorer-toggle",
    ) as HTMLCollectionOf<HTMLElement>
    for (const button of explorerButtons) {
      button.addEventListener("click", toggleExplorer)
      window.addCleanup(() => button.removeEventListener("click", toggleExplorer))
    }

    // Set up folder click handlers
    if (opts.folderClickBehavior === "collapse") {
      const folderButtons = explorer.getElementsByClassName(
        "folder-button",
      ) as HTMLCollectionOf<HTMLElement>
      for (const button of folderButtons) {
        button.addEventListener("click", toggleFolder)
        window.addCleanup(() => button.removeEventListener("click", toggleFolder))
      }
    }

    const folderIcons = explorer.getElementsByClassName(
      "folder-icon",
    ) as HTMLCollectionOf<HTMLElement>
    for (const icon of folderIcons) {
      icon.addEventListener("click", toggleFolder)
      window.addCleanup(() => icon.removeEventListener("click", toggleFolder))
    }
  }
}

document.addEventListener("prenav", async () => {
  // save explorer scrollTop position
  const explorer = document.querySelector(".explorer-ul")
  if (!explorer) return
  sessionStorage.setItem("explorerScrollTop", explorer.scrollTop.toString())
})

document.addEventListener("nav", async (e: CustomEventMap["nav"]) => {
  const currentSlug = e.detail.url
  await setupExplorer(currentSlug)

  // if mobile hamburger is visible, collapse by default
  for (const explorer of document.getElementsByClassName("explorer")) {
    const mobileExplorer = explorer.querySelector(".mobile-explorer")
    if (!mobileExplorer) return

    if (mobileExplorer.checkVisibility()) {
      explorer.classList.add("collapsed")
      explorer.setAttribute("aria-expanded", "false")
    }

    mobileExplorer.classList.remove("hide-until-loaded")
  }
})

function setFolderState(folderElement: HTMLElement, collapsed: boolean) {
  return collapsed ? folderElement.classList.remove("open") : folderElement.classList.add("open")
}
