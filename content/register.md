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
/**
 * Quartz 专用脚本初始化函数
 * 使用 nav 事件确保在 SPA 路由切换后依然能绑定成功
 */
const initRegister = () => {
  const btn = document.getElementById('reg-btn');
  if (!btn) {
    console.log("未发现注册按钮，跳过初始化");
    return;
  }
  
  console.log("注册脚本已成功绑定到按钮");

  // 使用 onclick 覆盖方式，防止在 SPA 环境下重复绑定事件
  btn.onclick = async () => {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;

    // 校验逻辑
    const uReg = /^[a-zA-Z]{6,10}$/;
    const pReg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])\S{6,10}$/;

    if(!uReg.test(u)) { alert("用户名不符合要求！(6-10位纯字母)"); return; }
    if(!pReg.test(p)) { alert("密码强度不足！(6-10位,需含数字/大小写/特殊符号)"); return; }

    btn.innerText = "正在提交...";
    btn.disabled = true;

    try {
      console.log("正在向 /api/register 发送 POST 请求...");
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
        console.error("服务器返回错误:", msg);
      }
    } catch (err) {
      alert("网络错误，请检查 API 是否部署成功");
      console.error("Fetch 异常:", err);
    } finally {
      btn.innerText = "确认注册";
      btn.disabled = false;
    }
  };
};

// 监听 Quartz 的导航事件，确保每次切页都重新运行初始化
document.addEventListener("nav", initRegister);

// 首次加载也运行一次
initRegister();
</script>