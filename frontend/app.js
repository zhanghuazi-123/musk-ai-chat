// 马斯克AI对话App - 前端逻辑
// Talk with Elon - Frontend JS

(function() {
    'use strict';
    
    // ============ 配置 ============
    const API_BASE_URL = 'http://localhost:5001';  // 后端API地址（端口5001）
    const MAX_HISTORY = 20;  // 保留的最大历史消息数
    
    // ============ 状态 ============
    let chatHistory = [];
    let isLoading = false;
    let userId = 'user_' + Date.now();  // 简单用户ID生成
    let apiConfig = loadApiConfig();  // 加载API配置
    
    // ============ DOM元素 ============
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const btnSend = document.getElementById('btnSend');
    const btnClear = document.getElementById('btnClear');
    const btnConfig = document.getElementById('btnConfig');
    const btnCloseConfig = document.getElementById('btnCloseConfig');
    const btnSaveConfig = document.getElementById('btnSaveConfig');
    const btnTestConfig = document.getElementById('btnTestConfig');
    const btnCloseSidebar = document.getElementById('btnCloseSidebar');
    const sidebar = document.getElementById('sidebar');
    const quoteBox = document.getElementById('quoteBox');
    const modelBadge = document.getElementById('modelBadge');
    const configPanel = document.getElementById('configPanel');
    const configStatus = document.getElementById('configStatus');
    const inputApiKey = document.getElementById('inputApiKey');
    const inputBaseUrl = document.getElementById('inputBaseUrl');
    const inputModel = document.getElementById('inputModel');
    
    // ============ 初始化 ============
    async function init() {
        // 加载API配置
        loadConfigToForm();
        
        // 加载模型信息
        await loadModelInfo();
        
        // 加载随机语录
        await loadQuote();
        
        // 绑定事件
        bindEvents();
        bindConfigEvents();
        
        // 自动聚焦输入框
        userInput.focus();
        
        console.log('✅ Talk with Elon App initialized');
    }
    
    // ============ 加载模型信息 ============
    async function loadModelInfo() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/config`);
            const data = await response.json();
            if (data.model) {
                modelBadge.textContent = `Model: ${data.model}`;
            }
        } catch (error) {
            modelBadge.textContent = 'Model: Offline';
            console.error('Failed to load model info:', error);
        }
    }
    
    // ============ API配置管理 ============
    function loadApiConfig() {
        try {
            const config = localStorage.getItem('musk_ai_api_config');
            if (config) {
                return JSON.parse(config);
            }
        } catch (e) {
            console.error('Failed to load API config:', e);
        }
        return null;
    }
    
    function saveApiConfig(config) {
        try {
            localStorage.setItem('musk_ai_api_config', JSON.stringify(config));
            apiConfig = config;
            console.log('✅ API config saved');
            return true;
        } catch (e) {
            console.error('Failed to save API config:', e);
            return false;
        }
    }
    
    function loadConfigToForm() {
        const config = loadApiConfig();
        if (config) {
            inputApiKey.value = config.api_key || '';
            inputBaseUrl.value = config.base_url || '';
            inputModel.value = config.model || '';
        }
    }
    
    function getApiConfig() {
        // 优先使用用户配置，否则返回null
        return loadApiConfig();
    }
    
    // ============ 绑定配置面板事件 ============
    function bindConfigEvents() {
        // 打开配置面板
        btnConfig.addEventListener('click', () => {
            configPanel.classList.add('open');
            loadConfigToForm();  // 每次打开时重新加载
        });
        
        // 关闭配置面板
        btnCloseConfig.addEventListener('click', () => {
            configPanel.classList.remove('open');
            clearConfigStatus();
        });
        
        // 保存配置
        btnSaveConfig.addEventListener('click', saveConfig);
        
        // 测试连接
        btnTestConfig.addEventListener('click', testApiConnection);
    }
    
    async function saveConfig() {
        const apiKey = inputApiKey.value.trim();
        const baseUrl = inputBaseUrl.value.trim();
        const model = inputModel.value.trim();
        
        if (!apiKey) {
            showConfigStatus('error', '⚠️ API Key 不能为空！');
            return;
        }
        
        const config = {
            api_key: apiKey,
            base_url: baseUrl || 'https://coding.dashscope.aliyuncs.com/v1',
            model: model || 'kimi-k2.5'
        };
        
        if (saveApiConfig(config)) {
            showConfigStatus('success', '✅ 配置已保存到本地浏览器！');
            
            // 更新模型标签
            modelBadge.textContent = `Model: ${config.model}`;
            
            // 2秒后自动关闭面板
            setTimeout(() => {
                configPanel.classList.remove('open');
                clearConfigStatus();
            }, 2000);
        } else {
            showConfigStatus('error', '❌ 保存失败，请重试');
        }
    }
    
    async function testApiConnection() {
        const apiKey = inputApiKey.value.trim();
        const baseUrl = inputBaseUrl.value.trim();
        const model = inputModel.value.trim();
        
        if (!apiKey) {
            showConfigStatus('error', '⚠️ 请先填写 API Key');
            return;
        }
        
        showConfigStatus('info', '🔄 正在测试连接...');
        btnTestConfig.disabled = true;
        
        try {
            // 调用后端测试接口
            const response = await fetch(`${API_BASE_URL}/api/test-connection`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    api_key: apiKey,
                    base_url: baseUrl || 'https://coding.dashscope.aliyuncs.com/v1',
                    model: model || 'kimi-k2.5'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showConfigStatus('success', '✅ 连接成功！API配置有效');
            } else {
                showConfigStatus('error', `❌ 连接失败: ${data.error}`);
            }
        } catch (error) {
            showConfigStatus('error', `❌ 网络错误: ${error.message}`);
        } finally {
            btnTestConfig.disabled = false;
        }
    }
    
    function showConfigStatus(type, message) {
        configStatus.className = `config-status ${type}`;
        configStatus.textContent = message;
        configStatus.style.display = 'block';
    }
    
    function clearConfigStatus() {
        configStatus.className = 'config-status';
        configStatus.style.display = 'none';
    }
    
    // ============ 加载随机语录 ============
    async function loadQuote() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/quote`);
            const data = await response.json();
            if (data.quote) {
                quoteBox.innerHTML = `
                    <p class="quote-text">"${data.quote}"</p>
                    <p class="quote-author">— 埃隆·马斯克</p>
                `;
            }
        } catch (error) {
            console.error('Failed to load quote:', error);
        }
    }
    
    // ============ 绑定事件 ============
    function bindEvents() {
        // 发送按钮点击
        btnSend.addEventListener('click', () => sendMessage());
        
        // 输入框回车发送，Shift+回车换行
        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // 输入框自动调整高度
        userInput.addEventListener('input', () => {
            userInput.style.height = 'auto';
            userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
        });
        
        // 清空对话
        btnClear.addEventListener('click', clearChat);
        
        // 关闭侧边栏
        if (btnCloseSidebar) {
            btnCloseSidebar.addEventListener('click', () => {
                sidebar.classList.remove('open');
            });
        }
    }
    
    // ============ 发送消息 ============
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message || isLoading) return;
        
        // 添加用户消息到界面
        addMessage('user', message);
        
        // 清空输入框
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // 添加到历史
        chatHistory.push({ role: 'user', content: message });
        trimHistory();
        
        // 显示思考指示器
        showTypingIndicator();
        
        // 禁用发送按钮
        setLoading(true);
        
        try {
            // 获取API配置
            const apiConfig = getApiConfig();
            
            // 调用API
            const requestBody = {
                user_id: userId,
                message: message,
                history: chatHistory.slice(0, -1)  // 不包含当前消息
            };
            
            // 如果用户配置了API，则添加到请求中
            if (apiConfig && apiConfig.api_key) {
                requestBody.api_config = apiConfig;
            }
            
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            
            const data = await response.json();
            
            // 移除思考指示器
            removeTypingIndicator();
            
            if (data.reply) {
                // 添加马斯克回复到界面
                addMessage('elon', data.reply);
                
                // 添加到历史
                chatHistory.push({ role: 'assistant', content: data.reply });
                trimHistory();
                
                // 显示用量信息（可选）
                if (data.usage) {
                    console.log('API Usage:', data.usage);
                }
            } else if (data.error) {
                addMessage('system', `⚠️ 错误: ${data.error}`);
            }
        } catch (error) {
            // 移除思考指示器
            removeTypingIndicator();
            
            addMessage('system', `⚠️ 网络错误: ${error.message}。请检查后端服务是否启动。`);
            console.error('Chat API error:', error);
        } finally {
            setLoading(false);
        }
    }
    
    // ============ 添加消息到界面 ============
    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        let avatarIcon = '🤖';
        let senderName = 'Elon Musk';
        
        if (sender === 'user') {
            avatarIcon = '👤';
            senderName = 'You';
        } else if (sender === 'system') {
            avatarIcon = '⚙️';
            senderName = 'System';
        }
        
        // 简单处理换行
        const formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // 粗体
            .replace(/\*(.*?)\*/g, '<em>$1</em>')  // 斜体
            .replace(/\n/g, '<br>');  // 换行
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatarIcon}</div>
            <div class="message-content">
                <div class="message-sender">${senderName}</div>
                <div class="message-text">${formattedText}</div>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        
        // 滚动到底部
        scrollToBottom();
    }
    
    // ============ 显示思考指示器 ============
    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message elon-message';
        indicator.id = 'typingIndicator';
        indicator.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="message-sender">Elon Musk</div>
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(indicator);
        scrollToBottom();
    }
    
    // ============ 移除思考指示器 ============
    function removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    // ============ 清空对话 ============
    function clearChat() {
        if (!confirm('确定要清空所有对话吗？')) return;
        
        // 保留系统消息
        const systemMessage = chatMessages.querySelector('.system-message');
        chatMessages.innerHTML = '';
        if (systemMessage) {
            chatMessages.appendChild(systemMessage);
        }
        
        // 清空历史
        chatHistory = [];
        
        // 重新加载语录
        loadQuote();
    }
    
    // ============ 设置加载状态 ============
    function setLoading(loading) {
        isLoading = loading;
        btnSend.disabled = loading;
        userInput.disabled = loading;
    }
    
    // ============ 修剪历史 ============
    function trimHistory() {
        if (chatHistory.length > MAX_HISTORY * 2) {
            chatHistory = chatHistory.slice(-MAX_HISTORY * 2);
        }
    }
    
    // ============ 滚动到底部 ============
    function scrollToBottom() {
        requestAnimationFrame(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }
    
    // ============ 启动 ============
    document.addEventListener('DOMContentLoaded', init);
    
})();
