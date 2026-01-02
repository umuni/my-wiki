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
// 使用全隔离的逻辑，避免被编译器干扰
(function() {
  const init = () => {
    const btn = document.getElementById('reg-btn');
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = "true";

    console.log("✅ 注册脚本已激活");
    
    btn.onclick = async () => {
      const u = document.getElementById('username').value;
      const p = document.getElementById('password').value;
    
      // 1. 动态构造正则表达式，绕开 HTML 转义
      // 用 String.fromCharCode(38) 代替直接写 &
      const ampersand = String.fromCharCode(38);
      const userPattern = "^[a-zA-Z]{6,10}$";
      // 将特殊符号里的 & 替换为动态生成的字符
      const pwdPattern = "^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%" + ampersand + "^*(),.?\":{}|<>])\\S{6,10}$";
      
      const uReg = new RegExp(userPattern);
      const pReg = new RegExp(pwdPattern);
    
      if(!uReg.test(u)) { 
        alert("用户名不符合要求！(只能输入6-10位大小写字母)"); 
        return; 
      }
      if(!pReg.test(p)) { 
        alert("密码强度不足！(6-10位，需包含数字、大小写字母及特殊符号，且不能有空格)"); 
        return; 
      }
    
      btn.innerText = "提交中...";
      btn.disabled = true;
    
      try {
        const resp = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: p })
        });
    
        if (resp.ok) {
          alert("🎉 注册成功！");
          window.location.href = '/login';
        } else {
          const msg = await resp.text();
          alert("❌ 注册失败：" + msg);
        }
      } catch (err) {
        alert("网络错误");
      } finally {
        btn.innerText = "确认注册";
        btn.disabled = false;
      }
    };
  };

  document.addEventListener("nav", init);
  init();
})();
</script>