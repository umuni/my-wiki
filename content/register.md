---
title: 账号注册
---

<div id="auth-box" style="max-width: 400px; margin: 40px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
  <form id="reg-form">
    <div style="margin-bottom: 15px;">
      <label style="display: block;">设置用户名 (6-10位字母)</label>
      <input type="text" id="username" required style="width: 100%; padding: 8px;">
    </div>
    <div style="margin-bottom: 20px;">
      <label style="display: block;">设置密码 (6-10位,含符号/数字/大小写)</label>
      <input type="password" id="password" required style="width: 100%; padding: 8px;">
    </div>
    <button type="button" id="reg-btn" style="width: 100%; padding: 10px; background: #38a169; color: white; border: none; border-radius: 5px; cursor: pointer;">确认注册</button>
  </form>
  <p style="text-align: center; margin-top: 15px;">已有账号？<a href="/login">去登录</a></p>
</div>

<script>
// 使用匿名函数包裹，防止 Quartz 页面切换导致的变量冲突
(function() {
  const btn = document.getElementById('reg-btn');
  if (!btn) return;

  btn.onclick = async () => {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;

    // 1. 前端正则校验 (对应你要求的规则)
    const uReg = /^[a-zA-Z]{6,10}$/;
    const pReg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])\S{6,10}$/;

    if(!uReg.test(u)) { alert("用户名不符合要求！(6-10位纯字母)"); return; }
    if(!pReg.test(p)) { alert("密码强度不足！(6-10位,需含数字/大小写/特殊符号)"); return; }

    btn.innerText = "提交中...";
    btn.disabled = true;

    try {
      // 2. 发送请求
      const resp = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
      });

      if (resp.ok) {
        alert("注册成功！马上为你跳转登录");
        window.location.href = '/login';
      } else {
        const msg = await resp.text();
        alert("注册失败：" + msg);
      }
    } catch (err) {
      alert("网络错误，请检查 API 是否部署成功");
    } finally {
      btn.innerText = "确认注册";
      btn.disabled = false;
    }
  };
})();
</script>