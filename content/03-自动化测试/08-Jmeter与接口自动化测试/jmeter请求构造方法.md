# jmeter请求构造方法

## 一、 核心概念辨析：Cookie vs Token

### 1. 维度差异

- **Cookie（搬运工/机制）**：浏览器的一种**自动存储与传输机制**。只要服务器下发了 `Set-Cookie`，浏览器后续请求同域名接口时会自动带上。
- **Token（通行证/内容）**：一种身份凭证字符串（如 JWT）。它可以存放在 Cookie 里，也可以存放在 `localStorage` 里由前端手动通过 Header 传输。

### 2. 实战结论

- **自动化测试**：浏览器环境下 Cookie 自动发送；在脚本测试（如 Python）中，需使用 `Session` 对象来模拟这种自动关联特性，否则需手动提取。
- **关联必要性**：
  - 返回 `Set-Cookie`：浏览器自动处理，脚本需 Session 关联。
  - 返回 `{"token": "..."}`：必须手动提取并关联。

## 二、 JMeter 请求构造“四步定位法”（方法论）

当你在抓包工具（F12）中看到一个请求时，按以下顺序映射到 JMeter：

### 第一步：定性 (Method)

- 确认是 `GET` 还是 `POST`。如果是 `POST`，关注是否有载荷。

### 第二步：寻踪 (Location) - 决定数据填在哪里

观察浏览器 **Payload (载荷)** 标签页下的标题：

1. **查询字符串参数 (Query String Parameters)** - **JMeter 配置**：直接拼接在 **路径 (Path)** 框的 `?` 后面，或写在参数列表（GET 推荐）。
2. **表单数据 (Form Data)** - **JMeter 配置**：写在 **参数 (Parameters)** 面板。
3. **请求负载 (Request Payload)** - **JMeter 配置**：写在 **消息体数据 (Body Data)** 面板。

### 第三步：对号 (Header) - 决定是否需要 Header 管理器

查看 **Headers (请求头)** 里的 `Content-Type`：

- **application/json**：**必须**配置“HTTP 信息头管理器”。
- **application/x-www-form-urlencoded**：对应“参数”面板，JMeter 默认支持。
- **无 Content-Type**：通常是因为 Body 为空，参数全在 URL 上。

### 第四步：建模 (Mapping) - 还原请求

- **原则**：100% 还原浏览器行为。如果浏览器把 POST 参数放在 URL 上，JMeter 也要放在 URL 上。

## 三、 特殊场景：带查询参数的 POST 请求

- **特征**：方法为 `POST`，但 `Payload` 只有 `Query String`，无 `Body`。
- **原因**：常见于 OAuth2 授权接口或老旧系统。
- **JMeter 处理**：将参数直接拼接在 `Path` 后面（例如 `/oauth/token?tenantId=1`），不要写在“参数”列表，防止 JMeter 将其错误地放入 Body 中。

## 四、 接口关联：JSON 提取实战

### 1. 提取工具

- **JSON 提取器 (JSON Extractor)**：首选。针对结构化数据，容错率高。
- **正则表达式提取器**：次选。适用于非标准格式或简单文本提取。

### 2. 关键语法

- **JSON Path 表达式**：
  - `$`：根节点。
  - `$.access_token`：提取根目录下的 `access_token` 字段。
  - `$.data.user.id`：提取嵌套字段。
- **变量引用**：
  - 语法：`${变量名}`。
  - 应用：可用于后续请求的 URL、参数、Header 或断言中。