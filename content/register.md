---
title: 账号注册
---

<div class="auth-box" style="max-width: 400px; margin: 2rem auto; border: 1px solid #ddd; padding: 2rem; border-radius: 8px;">
  <div style="margin-bottom: 1rem;">
    <label>用户名 (6-10位字母)</label>
    <input type="text" id="username" style="width: 100%; padding: 8px;">
  </div>
  <div style="margin-bottom: 1.5rem;">
    <label>密码 (数字+大小写+符号)</label>
    <input type="password" id="password" style="width: 100%; padding: 8px;">
  </div>
  <button id="reg-btn" style="width: 100%; padding: 10px; background: #38a169; color: white; border: none; cursor: pointer;">确认注册</button>
  <p style="text-align: center;"><a href="/login">已有账号？去登录</a></p>
</div>

<script src="/static/auth-logic.js"></script>