---
title: 知识库登录
---

<div class="auth-box" style="max-width: 400px; margin: 2rem auto; border: 1px solid #ddd; padding: 2rem; border-radius: 8px;">
  <div style="margin-bottom: 1rem;">
    <label>用户名</label>
    <input type="text" id="username" style="width: 100%; padding: 8px;">
  </div>
  <div style="margin-bottom: 1.5rem;">
    <label>密码</label>
    <input type="password" id="password" style="width: 100%; padding: 8px;">
  </div>
  <button id="login-btn" style="width: 100%; padding: 10px; background: #2b6cb0; color: white; border: none; cursor: pointer;">立即登录</button>
  <p style="text-align: center;"><a href="/register">没账号？去注册</a></p>
</div>

<script src="/static/auth-logic.js"></script>