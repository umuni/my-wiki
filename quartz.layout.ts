import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// 所有页面共享的组件（页脚、头部）
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
    // 【优化】将大纲放在正文上方，默认折叠，节省空间
    Component.DesktopOnly(Component.TableOfContents({ 
      title: "本文大纲", 
      layout: "stacked" 
    })),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    // 【优化】左侧目录：开启默认收缩功能
    Component.Explorer({
      title: "内容目录",
      useSavedState: true,
    }),
    // 【优化】将关系图谱移至左侧下方
    Component.DesktopOnly(Component.Graph({
      localGraph: { title: "页面关系", drag: true, zoom: true },
      globalGraph: { title: "全库图谱", drag: true, zoom: true },
    })),
    // 【优化】将反向链接移至左侧下方
    Component.DesktopOnly(Component.Backlinks({})),
  ],
  right: [], // 【关键】彻底清空右侧栏，实现宽屏阅读
}

// 列表页布局（标签页、文件夹页）
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
    Component.Explorer({ title: "目录" }),
  ],
  right: [],
}