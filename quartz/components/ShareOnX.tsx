import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export default (() => {
  const ShareOnX: QuartzComponent = ({ cfg, fileData }: QuartzComponentProps) => {
    const title = (fileData.frontmatter?.title ?? "ページタイトル") + cfg.pageTitleSuffix
    const url = `https://${cfg.baseUrl}/${encodeURIComponent(fileData.slug ?? '')}`
    const darkgray = cfg.theme.colors.lightMode.darkgray

    return (
      <div style={{ textAlign: "center", margin: "3rem 0" }}>
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
            backgroundColor: darkgray,
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
    )
  }


  return ShareOnX
}) satisfies QuartzComponentConstructor
