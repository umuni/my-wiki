export const onRequest: PagesFunction = async (context) => {
  const { request, next } = context;
  const url = new URL(request.url);

  // 1. 定义白名单：登录页、注册页、API 接口和静态资源不拦截
  const whiteList = ["/login", "/register", "/api", "/static"];
  if (whiteList.some(path => url.pathname.startsWith(path))) {
    return next();
  }

  // 2. 检查会话 Cookie
  const cookie = request.headers.get("Cookie") || "";
  if (!cookie.includes("auth_token=")) {
    // 未登录，重定向到登录页
    return Response.redirect(`${url.origin}/login`, 302);
  }

  // 3. 已登录，放行
  return next();
};