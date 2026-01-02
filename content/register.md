---
title: 账号注册
---

<div class="auth-box" style="max-width: 450px; margin: 40px auto; border: 1px solid #ddd; padding: 25px; border-radius: 12px;">
  <form id="reg-form">
    <div style="margin-bottom: 15px;">
      <label>用户名 (6-10位纯字母):</label>
      <input type="text" name="username" id="u" required style="width:100%; padding:8px;">
    </div>
    <div style="margin-bottom: 20px;">
      <label>密码 (6-10位,含数字/大小写/符号):</label>
      <input type="password" name="password" id="p" required style="width:100%; padding:8px;">
    </div>
    <button type="submit" style="width:100%; padding:12px; background:#38a169; color:white; border:none; cursor:pointer;">确认注册</button>
  </form>
</div>

<script>
document.getElementById('reg-form').onsubmit = async (e) => {
  e.preventDefault();
  const u = document.getElementById('u').value;
  const p = document.getElementById('p').value;

  // 前端正则预检
  const uReg = /^[a-zA-Z]{6,10}$/;
  const pReg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])\S{6,10}$/;

  if(!uReg.test(u)) { alert("用户名格式不符：只能输入6-10位字母！"); return; }
  if(!pReg.test(p)) { alert("密码强度不足：需包含数字、大小写字母及特殊符号，长度6-10位！"); return; }

  const resp = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({username: u, password: p})
  });

  if (resp.ok) {
    alert("注册成功！");
    window.location.href = '/login';
  } else {
    alert(await resp.text());
  }
};
</script>