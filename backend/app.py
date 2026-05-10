#!/usr/bin/env python3
"""
马斯克AI对话App - 后端服务
基于Flask + 阿里百炼API（OpenAI兼容协议）
"""

import os
import json
import requests
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from musk_prompt import MUSK_SYSTEM_PROMPT, DEFAULT_API_CONFIG, MUSK_QUOTES

# ============ 配置 ============
app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)  # 允许跨域

# API配置
API_KEY = os.getenv("DASHSCOPE_API_KEY", DEFAULT_API_CONFIG["api_key"])
BASE_URL = os.getenv("DASHSCOPE_BASE_URL", DEFAULT_API_CONFIG["base_url"])
MODEL = os.getenv("MODEL_NAME", DEFAULT_API_CONFIG["model"])

# 对话历史存储（简单内存存储，生产环境应使用数据库）
chat_sessions = {}

# ============ 路由 ============

@app.route('/')
def index():
    """服务前端页面"""
    return send_from_directory('../frontend', 'index.html')

@app.route('/api/health')
def health_check():
    """健康检查"""
    return jsonify({"status": "ok", "model": MODEL})

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    对话API - 接收用户输入，返回马斯克的回复
    
    请求体：
    {
        "user_id": "user123",
        "message": "你好，马斯克！",
        "history": [],  // 可选，前端传入的历史对话
        "api_config": {  // 可选，前端传入的API配置
            "api_key": "sk-...",
            "base_url": "https://...",
            "model": "kimi-k2.5"
        }
    }
    
    响应：
    {
        "reply": "嘿！...（马斯克风格的回复）",
        "usage": {...}
    }
    """
    try:
        data = request.json
        user_message = data.get('message', '')
        user_id = data.get('user_id', 'default')
        history = data.get('history', [])
        api_config = data.get('api_config', None)  # 前端传入的API配置
        
        if not user_message:
            return jsonify({"error": "消息不能为空"}), 400
        
        # 确定使用的API配置
        if api_config and api_config.get('api_key'):
            # 使用前端传入的配置
            api_key = api_config['api_key']
            base_url = api_config.get('base_url', DEFAULT_API_CONFIG['base_url'])
            model = api_config.get('model', DEFAULT_API_CONFIG['model'])
            temperature = DEFAULT_API_CONFIG['temperature']
            max_tokens = DEFAULT_API_CONFIG['max_tokens']
        else:
            # 使用默认配置（环境变量或默认值）
            api_key = API_KEY
            base_url = BASE_URL
            model = MODEL
            temperature = DEFAULT_API_CONFIG['temperature']
            max_tokens = DEFAULT_API_CONFIG['max_tokens']
        
        # 检查API Key是否配置
        if not api_key or api_key == "YOUR_DASHSCOPE_API_KEY_HERE":
            return jsonify({"error": "API Key未配置。请在右上角⚙️设置中配置你的API Key。"}), 400
        
        # 构建消息列表
        messages = [{"role": "system", "content": MUSK_SYSTEM_PROMPT}]
        
        # 添加历史对话（最多保留10轮）
        for msg in history[-10:]:
            messages.append(msg)
        
        # 添加当前用户消息
        messages.append({"role": "user", "content": user_message})
        
        # 调用API（使用requests直接调用）
        # 智能处理 base_url
        if base_url.rstrip('/').endswith('/chat/completions'):
            # 用户填写了完整路径
            api_url = base_url
        else:
            # 自动拼接 /chat/completions
            api_url = f"{base_url.rstrip('/')}/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        response = requests.post(api_url, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        result = response.json()
        
        reply = result["choices"][0]["message"]["content"]
        usage = result.get("usage", {})
        
        return jsonify({
            "reply": reply,
            "usage": {
                "prompt_tokens": usage.get("prompt_tokens", 0),
                "completion_tokens": usage.get("completion_tokens", 0),
                "total_tokens": usage.get("total_tokens", 0)
            },
            "model": model
        })
        
    except Exception as e:
        app.logger.error(f"Chat API error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/test-connection', methods=['POST'])
def test_connection():
    """
    测试API连接
    
    请求体：
    {
        "api_key": "sk-...",
        "base_url": "https://...",
        "model": "kimi-k2.5"
    }
    
    响应：
    {
        "success": true/false,
        "error": "错误信息（如果有）"
    }
    """
    try:
        data = request.json
        api_key = data.get('api_key', '')
        base_url = data.get('base_url', DEFAULT_API_CONFIG['base_url'])
        model = data.get('model', DEFAULT_API_CONFIG['model'])
        
        app.logger.info(f"[TEST] api_key={api_key[:10]}..., base_url={base_url}, model={model}")
        
        if not api_key:
            return jsonify({"success": False, "error": "API Key不能为空"}), 400
        
        # 简单测试：发送一个测试消息
        # 智能处理 base_url
        if base_url.rstrip('/').endswith('/chat/completions'):
            # 用户填写了完整路径
            api_url = base_url
        else:
            # 自动拼接 /chat/completions
            api_url = f"{base_url.rstrip('/')}/chat/completions"
        
        app.logger.info(f"[TEST] api_url={api_url}")
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Hello, respond with just 'OK' if you can read this."}
            ],
            "temperature": 0.1,
            "max_tokens": 10
        }
        
        app.logger.info(f"[TEST] Sending request to API...")
        response = requests.post(api_url, headers=headers, json=payload, timeout=30)
        app.logger.info(f"[TEST] Response status: {response.status_code}")
        app.logger.info(f"[TEST] Response body: {response.text[:200]}")
        response.raise_for_status()
        result = response.json()
        app.logger.info(f"[TEST] Result: {str(result)[:200]}")
        
        # 检查是否有有效响应
        if 'choices' in result and len(result['choices']) > 0:
            app.logger.info(f"[TEST] ✅ Connection test successful")
            return jsonify({"success": True, "model": model})
        else:
            app.logger.error(f"[TEST] ❌ Invalid response format: {result}")
            return jsonify({"success": False, "error": "无效的API响应格式"}), 400
            
    except requests.exceptions.RequestException as e:
        app.logger.error(f"[TEST] ❌ Request error: {str(e)}")
        return jsonify({"success": False, "error": f"网络错误: {str(e)}"}), 400
    except Exception as e:
        app.logger.error(f"[TEST] ❌ Unexpected error: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/quote')
def get_quote():
    """随机返回一句马斯克语录"""
    import random
    quote = random.choice(MUSK_QUOTES)
    return jsonify({"quote": quote})

@app.route('/api/config', methods=['GET', 'POST'])
def config():
    """
    获取/更新API配置（管理员功能）
    GET: 返回当前配置（隐藏API Key）
    POST: 更新配置
    """
    if request.method == 'GET':
        return jsonify({
            "model": MODEL,
            "base_url": DEFAULT_API_CONFIG["base_url"],
            "api_key_configured": bool(DEFAULT_API_CONFIG["api_key"]),
        })
    
    elif request.method == 'POST':
        data = request.json
        # 这里可以添加配置更新逻辑
        return jsonify({"status": "Configuration updated"})

# ============ 主程序 ============

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5001))  # 改为5001避免冲突
    debug = os.getenv("DEBUG", "true").lower() == "true"
    
    print("\n" + "="*50)
    print("🚀 马斯克AI对话App 启动中...")
    print(f"📍 访问地址: http://localhost:{port}")
    print(f"🤖 使用模型: {MODEL}")
    print("="*50 + "\n")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
