import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { i18n } from "../i18n"

export default (() => {
  const Footer: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
    const year = new Date().getFullYear()
    return (
      <footer style={{ textAlign: "center" }}>
        <p style={{ fontSize: "0.8rem", lineHeight: "1" }}>
          {i18n(cfg.locale).components.footer.createdWith}{" "}
          <a href="https://x.com/tachibanayu24" target="_blank" rel="noopener noreferrer">tachibanayu24</a> © {year}
        </p>

        <p style={{ fontSize: "0.725rem", lineHeight: "1" }}>
          このブログは、
          <a href="https://quartz.jzhao.xyz/" target="_blank" rel="noopener noreferrer">Quartz</a>
          をベースに作成しています。
        </p>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
