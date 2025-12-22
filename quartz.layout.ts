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

// 笔记详情页布局（包括首页/欢迎页）
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
    // 【要求 2】目录结构迭代：实现只展示一级目录且自动切换展开
    Component.Explorer({
      title: "内容目录",
      useSavedState: false,        // 【核心】不保存状态，确保每次页面加载都遵循默认收起逻辑
      folderDefaultState: "collapsed", // 【核心】默认收起所有文件夹，从而只显示第一层级
      folderClickBehavior: "toggle", // 【核心】点击文件夹名即展开/收起，而不是直接跳转
      sortFn: (a: any, b: any) => {
        // 沿用你验证成功的 a.name 升序逻辑
        if (a.file !== b.file) {
          return a.file ? 1 : -1
        }
        return a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      },
      mapFn: (node: any) => {
        // 沿用你验证成功的序号隐藏逻辑
        if (node.displayName) {
          node.displayName = node.displayName.replace(/^\d+[-_]/, "")
        }
      },
    } as any),
    //--------------------------------

    //-------------------
    // 【要求 2】目录结构迭代：解决欢迎页不显示问题
    // Component.Explorer({
    //   title: "内容目录",
    //   useSavedState: false, 
    //   folderDefaultState: "open", // 【核心新增】强制展开目录，确保首页加载即显示
    //   folderClickBehavior: "toggle", // 确保点击文件夹可以自由收起/展开
    //   sortFn: (a: any, b: any) => {
    //     if (a.file !== b.file) {
    //       return a.file ? 1 : -1
    //     }
    //     // 沿用你验证成功的 a.name 升序逻辑
    //     return a.name.localeCompare(b.name, undefined, {
    //       numeric: true,
    //       sensitivity: "base",
    //     })
    //   },
    //   mapFn: (node: any) => {
    //     // 沿用你验证成功的序号隐藏逻辑
    //     if (node.displayName) {
    //       node.displayName = node.displayName.replace(/^\d+[-_]/, "")
    //     }
    //   },
    // } as any),
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
      folderDefaultState: "open", // 同步新增
      folderClickBehavior: "toggle",
      sortFn: (a: any, b: any) => {
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