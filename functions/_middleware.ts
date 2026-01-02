export const onRequest: PagesFunction = async (context) => {
  const { request, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // 1. 极其重要的白名单过滤
  // 确保排除：登录页、注册页、API接口、以及所有的静态资源（js, css, 图片）
  const isWhiteList =
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/api") ||
    path.includes(".") || // 排除所有带后缀的文件如 .js, .css, .png
    path.startsWith("/static");

  if (isWhiteList) {
    return next();
  }

  // 2. 检查 Cookie
  const cookie = request.headers.get("Cookie") || "";
  // 只有当 Cookie 中包含我们定义的 auth_token 且有值时才放行
  if (cookie.includes("auth_token=valid")) {
    return next();
  }

  // 3. 没登录？跳转到登录页
  // 使用绝对路径确保跳转准确
  return Response.redirect(`${url.origin}/login`, 302);
};