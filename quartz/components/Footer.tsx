import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { i18n } from "../i18n"

export default (() => {
  const Footer: QuartzComponent = ({ cfg, fileData }: QuartzComponentProps) => {
    const year = new Date().getFullYear()
    const title = (fileData.frontmatter?.title ?? "ページタイトル") + cfg.pageTitleSuffix
    const url = `https://${cfg.baseUrl}/${encodeURIComponent(fileData.slug ?? '')}`

    return (
      <footer style={{ textAlign: "center" }}>

        <hr />
        <p style={{ fontSize: "0.8rem", lineHeight: "1" }}>
          {i18n(cfg.locale).components.footer.createdWith}{" "}
          <a href="https://x.com/tachibanayu24" target="_blank" rel="noopener noreferrer">tachibanayu24</a> © {year}
        </p>

        <p style={{ fontSize: "0.725rem", lineHeight: "1.2", margin: "0.25rem" }}>
          このブログは
          <a href="https://quartz.jzhao.xyz/" target="_blank" rel="noopener noreferrer">Quartz</a>
          をベースに作成しています。<a href="https://policies.google.com/technologies/partner-sites?hl=ja" target="_blank" rel="noopener noreferrer">Google Analytics</a>を使用してアクセス解析を行っています。
        </p>
        <p style={{ fontSize: "0.725rem", lineHeight: "1.2", margin: "0.25rem", display: "flex", gap: "0.5rem", justifyContent: "center" }}>
          <a href="/index.xml" target="_blank" rel="noopener noreferrer">RSSフィード</a>
          <a href="https://github.com/tachibanayu24/hokori-log" target="_blank" rel="noopener noreferrer">ソースコード</a>
        </p>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
