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
    // 【要求 1】标题置顶：AItest知识库 永远在左侧最上方
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
    // 【要求 2】左侧剩余空间：全部展示目录，且强制 01 在上，06 在下
    Component.Explorer({
      title: "内容目录",
      useSavedState: false,
      // 核心排序：强制升序排列 (Numeric Ascending)
      sort: (a, b) => {
        if (a.file !== b.file) {
          return a.file ? 1 : -1
        }
        // 比较原始文件名（name），如 "01-理论" 与 "05-阶梯"
        // 01 比 05 小，localeCompare 返回 -1，a 排在 b 前面。这就是你要的正序。
        return a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      },
      // 视觉处理：剔除 01- 前缀，保持界面整洁
      mapFn: (node) => {
        node.displayName = node.displayName.replace(/^\d+[-_]/, "")
      },
    } as any),
  ],
  right: [
    // 【要求 3】页面关系（图谱）移动到右侧最顶端
    Component.DesktopOnly(Component.Graph({
      localGraph: { title: "页面关系", drag: true, zoom: true },
      globalGraph: { title: "全库图谱", drag: true, zoom: true },
    })),
    Component.DesktopOnly(Component.Backlinks({})),
  ],
}

// 列表页布局（同步更新，确保全局一致）
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
      title: "目录",
      sort: (a, b) => {
		console.log('Comparing:', a.name, b.name); // 输出排序前的项
        if (a.file !== b.file) {
          return a.file ? 1 : -1
        }
        return a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      },
      mapFn: (node) => {
        node.displayName = node.displayName.replace(/^\d+[-_]/, "")
      },
    } as any),
  ],
  right: [
    Component.DesktopOnly(Component.Graph({})),
  ],
}
