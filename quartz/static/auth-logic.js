/**
 * 知识库身份验证中心 - 解耦版
 */
console.log("✅ 身份验证逻辑中心已就绪");

const AuthCenter = {
    // 1. 校验规则定义
    rules: {
        userReg: /^[a-zA-Z]{6,10}$/,
        // 包含数字、大小写、特殊字符，无空格，6-10位
        pwdReg: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])\S{6,10}$/
    },

    // 2. 注册执行逻辑
    async handleRegister() {
        const u = document.getElementById('username').value;
        const p = document.getElementById('password').value;
        const btn = document.getElementById('reg-btn');

        if (!this.rules.userReg.test(u)) return alert("用户名格式错误：需6-10位纯字母");
        if (!this.rules.pwdReg.test(p)) return alert("密码强度不足：需含数字/大小写/符号，6-10位");

        this.setLoading(btn, true, "提交中...");
        try {
            const resp = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: u, password: p })
            });
            if (resp.ok) {
                alert("注册成功！");
                window.location.href = '/login';
            } else {
                alert("注册失败：" + await resp.text());
            }
        } catch (e) { alert("网络请求异常"); }
        this.setLoading(btn, false, "确认注册");
    },

    // 3. 登录执行逻辑
    async handleLogin() {
        const u = document.getElementById('username').value;
        const p = document.getElementById('password').value;
        const btn = document.getElementById('login-btn');

        this.setLoading(btn, true, "验证中...");
        try {
            const resp = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: u, password: p })
            });
            if (resp.ok) {
                window.location.href = '/'; // 登录成功去首页
            } else {
                alert("登录失败：用户名或密码错误");
            }
        } catch (e) { alert("网络请求异常"); }
        this.setLoading(btn, false, "立即登录");
    },

    // 辅助：按钮状态切换
    setLoading(btn, isLoading, text) {
        btn.innerText = text;
        btn.disabled = isLoading;
    },

    // 4. 事件绑定核心
    init() {
        console.log("🚀 正在绑定 UI 事件...");
        const regBtn = document.getElementById('reg-btn');
        if (regBtn) regBtn.onclick = () => this.handleRegister();

        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) loginBtn.onclick = () => this.handleLogin();
    }
};

// 兼容 Quartz 的 SPA 路由导航
document.addEventListener("nav", () => AuthCenter.init());
// 首次进入页面执行
AuthCenter.init();