export const onRequestPost: PagesFunction<{ "MY-WIKI_DB": D1Database }> = async (context) => {
  const { request, env } = context;
  
  try {
    const { username, password } = await request.json();

    // 1. 严格规则校验
    const userRegex = /^[a-zA-Z]{6,10}$/;
    // 密码正则：包含数字、大小写、特殊字符，且无空格，长度6-10
    const pwdRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])\S{6,10}$/;

    if (!userRegex.test(username)) {
      return new Response("用户名无效：仅限字母，长度6-10位，且不能有空格", { status: 400 });
    }
    if (!pwdRegex.test(password)) {
      return new Response("密码无效：须包含数字、大小写字母和特殊符号，长度6-10位，且不能有空格", { status: 400 });
    }

    // 2. 数据库查重 (SQLite 默认大小写敏感比较)
    const existingUser = await env["MY-WIKI_DB"].prepare(
      "SELECT id FROM users WHERE username = ?"
    ).bind(username).first();

    if (existingUser) {
      return new Response("该用户名已被注册", { status: 409 });
    }

    // 3. 校验通过，写入数据库
    await env["MY-WIKI_DB"].prepare(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)"
    ).bind(username, password).run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (err) {
    return new Response("注册失败，请联系管理员", { status: 500 });
  }
};