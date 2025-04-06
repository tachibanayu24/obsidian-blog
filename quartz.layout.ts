import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { SimpleSlug } from "./quartz/util/path"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer(),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs({
        spacerSymbol: "/",
        rootName: "top",
        resolveFrontmatterTitle: true,
        showCurrentPage: true,
      }),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  afterBody: [
    Component.MobileOnly(Component.Profile()),
    Component.MobileOnly(
      Component.RecentNotes({
        title: "最近の更新",
        linkToMore: "tags/" as SimpleSlug,
        limit: 3,
        showTags: false,
        sort: (pageA, pageB) => {
          const dateA = pageA.dates?.modified?.getTime() ?? 0
          const dateB = pageB.dates?.modified?.getTime() ?? 0
          return dateB - dateA
        }
      }),
    ),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.DesktopOnly(
      Component.Flex({
        components: [
          {
            Component: Component.Search(),
            grow: true,
          },
        ],
      }),
    ),
    Component.MobileOnly(
      Component.Flex({
        components: [
          {
            Component: Component.SearchMobile(),
            grow: true,
          },
        ],
      }),
    ),
    Component.DesktopOnly(Component.Profile()),
    Component.DesktopOnly(
      Component.RecentNotes({
        title: "最近の更新",
        linkToMore: "tags/" as SimpleSlug,
        limit: 3,
        showTags: false,
        sort: (pageA, pageB) => {
          const dateA = pageA.dates?.modified?.getTime() ?? 0
          const dateB = pageB.dates?.modified?.getTime() ?? 0
          return dateB - dateA
        }
      }),
    ),
    Component.Explorer({
      folderDefaultState: "open",
    }),
  ],
  right: [
    // Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    // Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.DesktopOnly(
      Component.Flex({
        components: [
          {
            Component: Component.Search(),
            grow: true,
          },
        ],
      }),
    ),
    Component.MobileOnly(
      Component.Flex({
        components: [
          {
            Component: Component.SearchMobile(),
            grow: true,
          },
        ],
      }),
    ),
    Component.DesktopOnly(Component.Profile()),
    Component.DesktopOnly(
      Component.RecentNotes({
        title: "最近の更新",
        linkToMore: "tags/" as SimpleSlug,
        limit: 3,
        showTags: false,
        sort: (pageA, pageB) => {
          const dateA = pageA.dates?.modified?.getTime() ?? 0
          const dateB = pageB.dates?.modified?.getTime() ?? 0
          return dateB - dateA
        }
      }),
    ),
    Component.Explorer({
      folderDefaultState: "open",
    }),
  ],
  right: [],
  afterBody: [
    Component.MobileOnly(
      Component.RecentNotes({
        title: "最近の更新",
        linkToMore: "tags/" as SimpleSlug,
        limit: 3,
        showTags: false,
        sort: (pageA, pageB) => {
          const dateA = pageA.dates?.modified?.getTime() ?? 0
          const dateB = pageB.dates?.modified?.getTime() ?? 0
          return dateB - dateA
        }
      }),
    ),
  ],
  }
