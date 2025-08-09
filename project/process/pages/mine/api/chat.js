/**
 * GLM大模型API调用
 */

// GLM API配置
const GLM_CONFIG = {
  // 这里需要替换为您的实际API地址和密钥
  baseURL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  apiKey: '089ca166c49545b3b0b4ecfb70b08b1d.WVyfoC0I8xHSZiQp', // 需要替换为真实的API密钥
  model: 'glm-4' // 或其他可用模型
}

/**
 * 调用GLM大模型
 * @param {string} message - 用户输入的消息
 * @param {Array} history - 对话历史记录
 * @returns {Promise} - 返回AI回复
 */
export const callGLM = async (message, history = []) => {
  try {
    // 构建消息格式
    const messages = [
      {
        role: "system",
        content: "你是一个友好的AI助手，专门帮助用户解决工程管理系统的问题。请用简洁、友好的语言回答用户的问题。"
      },
      ...history, // 历史对话
      {
        role: "user",
        content: message
      }
    ]

    const response = await new Promise((resolve, reject) => {
      uni.request({
        url: GLM_CONFIG.baseURL,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GLM_CONFIG.apiKey}`
        },
        data: {
          model: GLM_CONFIG.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1024,
          stream: false
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error(`API请求失败: ${res.statusCode}`))
          }
        },
        fail: (error) => {
          reject(error)
        }
      })
    })

    // 提取AI回复内容
    if (response.choices && response.choices.length > 0) {
      return response.choices[0].message.content
    } else {
      throw new Error('未收到有效的AI回复')
    }

  } catch (error) {
    console.error('GLM API调用失败:', error)
    
    // 返回默认回复
    return getDefaultResponse(message)
  }
}

/**
 * 获取默认回复（当API调用失败时使用）
 * @param {string} message - 用户消息
 * @returns {string} - 默认回复
 */
function getDefaultResponse(message) {
  const defaultResponses = {
    '密码': '如果您忘记了密码，可以通过以下方式找回：\n1. 联系系统管理员重置密码\n2. 使用手机验证码找回\n3. 通过邮箱重置链接找回',
    '个人信息': '修改个人信息很简单：\n1. 点击上方个人信息项目\n2. 选择要修改的字段\n3. 输入新信息并保存\n4. 系统会自动更新您的资料',
    '新手': '欢迎使用工程管理系统！\n主要功能包括：\n1. 个人信息管理\n2. 密码修改\n3. 系统设置\n4. 数据查看\n\n如有疑问，随时可以咨询我！',
    'default': '感谢您的提问！我是您的AI助手，很高兴为您服务。如果您有任何关于系统使用的问题，请随时告诉我。'
  }

  // 根据关键词匹配回复
  for (const [keyword, response] of Object.entries(defaultResponses)) {
    if (keyword !== 'default' && message.includes(keyword)) {
      return response
    }
  }

  return defaultResponses.default
}

/**
 * 预设问题回复
 */
export const getPresetResponse = (type) => {
  const presetResponses = {
    'password': '关于密码问题，我来帮您解答：\n\n1. 如果忘记密码，可以点击登录页面的"忘记密码"链接\n2. 通过手机验证码或邮箱重置\n3. 也可以联系系统管理员直接重置\n4. 新密码建议包含字母、数字和特殊字符\n\n还有其他问题吗？',
    'info': '修改个人信息的步骤如下：\n\n1. 在当前页面点击要修改的信息项\n2. 进入编辑页面输入新信息\n3. 点击保存按钮确认修改\n4. 系统会实时更新您的资料\n\n哪个具体信息需要修改呢？',
    'guide': '欢迎使用工程管理系统！新手入门指南：\n\n📱 基本功能：\n• 个人资料管理\n• 密码安全设置\n• 系统偏好配置\n\n🔧 常用操作：\n• 点击信息项直接编辑\n• 长按可查看详细选项\n• 右上角设置按钮进入系统配置\n\n需要了解具体哪个功能呢？'
  }
  
  return presetResponses[type] || presetResponses.guide
}
  