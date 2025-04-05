import { ComponentChildren } from "preact"
import { htmlToJsx } from "../../util/jsx"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

const Content: QuartzComponent = ({ fileData, tree, cfg }: QuartzComponentProps) => {
  const content = htmlToJsx(fileData.filePath!, tree) as ComponentChildren
  const classes: string[] = fileData.frontmatter?.cssclasses ?? []
  const classString = ["popover-hint", ...classes].join(" ")

  const title = (fileData.frontmatter?.title ?? "ページタイトル") + cfg.pageTitleSuffix
  const url = `https://${cfg.baseUrl}/${encodeURIComponent(fileData.slug ?? '')}`


  return (
    <article class={classString}>
      {content}

      <div style={{ textAlign: "center", marginTop: "3rem" }}>
        <a
          href={`https://x.com/intent/tweet?text=${encodeURIComponent(
            title
          )}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="twitter-share-button"
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "0.5rem 1rem",
          backgroundColor: "#000000",
          color: "white",
          borderRadius: "9999px",
          textDecoration: "none",
          fontSize: "0.875rem",
          gap: "0.5rem"
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share on X
      </a>
      </div>
    </article>
  )
}

export default (() => Content) satisfies QuartzComponentConstructor
