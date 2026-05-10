# 🚀 Talk with Elon - 与马斯克对话

一个基于 AI 的马斯克人格对话应用。用户输入消息，AI 以埃隆·马斯克的风格和人格回复。

![Version](https://img.shields.io/badge/version-v2.0-hgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/python-3.10+-blueviolet)
![Flask](https://img.shields.io/badge/flask-3.0+-red)

---

## ✨ 特性

- 🎭 **马斯克人格引擎** - 基于8份深度调研报告训练的Prompt（v2.0幽默增强版）
- 🔒 **开放式API配置** - 右上角配置按钮，支持任何OpenAI兼容API
- 💬 **流式对话** - 实时显示马斯克的回复
- 🌍 **多模型支持** - 支持 Kimi-k2.5, Qwen3.5, GLM-5, MiniMax-M2.5 等
- 🎨 **深色主题** - 特斯拉红 + Twitter蓝的酷炫设计
- 📱 **响应式设计** - 支持桌面和移动端

---

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/你的用户名/musk-ai-app.git
cd musk-ai-app
```

### 2. 安装依赖

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. 启动后端

```bash
python app.py
```

后端将在 `http://localhost:5001` 启动

### 4. 打开前端

在浏览器中访问：`http://localhost:5001`

---

## 🔧 配置API

1. 点击右上角 **⚙️** 按钮
2. 填写你的 API 配置：
   - **API Key**: 你的 OpenAI 兼容 API Key（如阿里云百炼）
   - **Base URL**: `https://coding.dashscope.aliyuncs.com/v1`
   - **Model**: `kimi-k2.5`（或其他支持的模型）
3. 点击 **🧪 测试连接** 验证
4. 点击 **💾 保存配置**
5. 开始对话！

---

## 📋 支持的API提供商

| 提供商 | Base URL | 推荐模型 |
|--------|----------|----------|
| **阿里云百炼** | `https://coding.dashscope.aliyuncs.com/v1` | `kimi-k2.5`, `qwen3.5-plus` |
| **OpenAI** | `https://api.openai.com/v1` | `gpt-4o`, `gpt-4-turbo` |
| **其他 OpenAI 兼容 API** | 你的 API 地址 | 根据提供商 |

---

## 🎨 技术栈

### 后端
- **Flask** - 轻量级 Web 框架
- **OpenAI Python SDK** - 调用大模型 API
- **Flask-CORS** - 跨域支持

### 前端
- **Vanilla JavaScript** - 无框架依赖
- **CSS3** - 深色主题 + 动画
- **LocalStorage** - API 配置持久化

---

## 📂 项目结构

```
musk-ai-app/
├── backend/
│   ├── app.py              # Flask 后端服务
│   ├── musk_prompt.py    # 马斯克人格 Prompt (v2.0)
│   ├── requirements.txt   # Python 依赖
│   └── venv/             # 虚拟环境
├── frontend/
│   ├── index.html        # 主页面
│   ├── style.css         # 样式表
│   └── app.js           # 前端逻辑
├── .gitignore            # Git 忽略文件
└── README.md            # 本文件
```

---

## 🧪 示例对话

**You**: "你认为 AI 风险有多大？"

**Elon**: "It's the biggest threat humanity faces. Bigger than nuclear war. People don't get it because it's exponential, not linear. I've been warning about this for over a decade. Larry [Page] thought I was being alarmist. Look where we are now. [laughs] Although, if we're in a simulation, maybe the AI is just the screensaver. 💀"

---

## 🎯 路线图

- [ ] 支持多轮对话历史
- [ ] 添加语音输入/输出
- [ ] 部署到公网（让任何人都能访问）
- [ ] Electron 桌面应用打包
- [ ] 添加更多人格（特朗普、奥巴马等）

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

---

## 📝 License

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

- 基于 **8份马斯克深度调研报告** 构建人格 Prompt
- 使用 **阿里百炼 API** (OpenAI 兼容协议)
- 灵感来自 Elon Musk 的真实访谈、推文和传记

---

## 📧 联系

如有问题或建议，欢迎提交 Issue 或联系：[你的邮箱]

---

**☕ 如果觉得有用，请给个 Star！**
