---
title: 知识库登录
---

<div id="auth-box" style="max-width: 400px; margin: 40px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
  <form id="login-form">
    <div style="margin-bottom: 15px;">
      <label style="display: block;">用户名</label>
      <input type="text" name="username" required style="width: 100%; padding: 8px;">
    </div>
    <div style="margin-bottom: 20px;">
      <label style="display: block;">密码</label>
      <input type="password" name="password" required style="width: 100%; padding: 8px;">
    </div>
    <button type="submit" style="width: 100%; padding: 10px; background: #2b6cb0; color: white; border: none; border-radius: 5px; cursor: pointer;">登录</button>
  </form>
  <p style="text-align: center; margin-top: 15px;">没有账号？<a href="/register">去注册</a></p>
</div>

<script>
document.getElementById('login-form').onsubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  const resp = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (resp.ok) {
    alert('登录成功！');
    window.location.href = '/'; // 登录成功回到首页
  } else {
    alert('登录失败：' + await resp.text());
  }
};
</script>
