import { joinSegments, pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const PageTitle: QuartzComponent = ({ fileData, cfg: _, displayClass }: QuartzComponentProps) => {
  const baseDir = pathToRoot(fileData.slug!)
  return (
    <h2 class={classNames(displayClass, "page-title")}>
      <a href={baseDir}>
        <img style={{ margin: "0" }} src={joinSegments(baseDir, "static/hokori_log.png")} alt="icon" />
      </a>
    </h2>
  )
}

PageTitle.css = `
.page-title {
  margin: 0;
  padding: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title a {
  height: 34px;
}

@media (max-width: 768px) {
  .page-title img {
    height: 34px;
  }
}
`

export default (() => PageTitle) satisfies QuartzComponentConstructor
