---
title: 账号注册
---

<div id="auth-box" style="max-width: 400px; margin: 40px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
  <form id="register-form">
    <div style="margin-bottom: 15px;">
      <label style="display: block;">设置用户名</label>
      <input type="text" name="username" required style="width: 100%; padding: 8px;">
    </div>
    <div style="margin-bottom: 20px;">
      <label style="display: block;">设置密码</label>
      <input type="password" name="password" required style="width: 100%; padding: 8px;">
    </div>
    <button type="submit" style="width: 100%; padding: 10px; background: #38a169; color: white; border: none; border-radius: 5px; cursor: pointer;">注册</button>
  </form>
  <p style="text-align: center; margin-top: 15px;">已有账号？<a href="/login">去登录</a></p>
</div>

<script>
document.getElementById('register-
