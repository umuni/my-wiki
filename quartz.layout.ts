import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// 所有页面共享的组件
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      "我的博客": "https://aitest.eu.cc",
      "联系我": "mailto:xrdtgzl@gmail.com",
    },
  }),
}

// 笔记详情页布局
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
    Component.DesktopOnly(Component.TableOfContents()),
  ],
  left: [
    // 【要求 1】标题置顶
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        { Component: Component.Search(), grow: true },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    // 【要求 2】目录结构修复
    Component.Explorer({
      title: "内容目录",
      useSavedState: false, // 必须为 false，确保每次刷新都重新应用排序逻辑
      // 增加安全检查，防止 a 或 b 为空导致目录消失
      sortFn: (a: any, b: any) => {
        const nameA = a?.name ?? ""
        const nameB = b?.name ?? ""
        if (a?.file !== b?.file) {
          return a?.file ? 1 : -1
        }
        // 强制使用 name 升序排列 (01 -> 06)
        return nameA.localeCompare(nameB, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      },
      mapFn: (node: any) => {
        // 视觉上隐藏 01- 这种前缀（先判断是否存在）
        if (node.displayName) {
          node.displayName = node.displayName.replace(/^\d+[-_]/, "")
        }
      },
    } as any),
  ],
  right: [
    // 【要求 3】图谱置顶
    Component.DesktopOnly(Component.Graph({
      localGraph: { title: "页面关系", drag: true, zoom: true },
      globalGraph: { title: "全库图谱", drag: true, zoom: true },
    })),
    Component.DesktopOnly(Component.Backlinks({})),
  ],
}

// 列表页布局
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        { Component: Component.Search(), grow: true },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer({ 
      title: "内容目录",
      useSavedState: false,
      sortFn: (a: any, b: any) => {
        // 增加安全检查，防止 a 或 b 为空导致目录消失
        const nameA = a?.name ?? ""
        const nameB = b?.name ?? ""
        if (a?.file !== b?.file) {
          return a?.file ? 1 : -1
        }
        return nameA.localeCompare(nameB, undefined, { numeric: true })
      },
      mapFn: (node: any) => {
        if (node.displayName) {
          node.displayName = node.displayName.replace(/^\d+[-_]/, "")
        }
      },
    } as any),
  ],
  right: [
    Component.DesktopOnly(Component.Graph({})),
  ],
}