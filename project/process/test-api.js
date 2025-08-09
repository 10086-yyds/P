// API配置测试文件
import request from '@/utils/request.js'

// 测试API配置
export async function testApiConfig() {
  console.log('=== API配置测试 ===')
  
  try {
    // 测试发送验证码接口
    console.log('正在测试发送验证码接口...')
    console.log('目标URL应该是: http://localhost:3000/wxy/auth/send-code')
    
    const response = await request.post('/wxy/auth/send-code', {
      phone: '13800138000'  // 测试手机号
    })
    
    console.log('✅ API测试成功:', response)
    return { success: true, response }
    
  } catch (error) {
    console.error('❌ API测试失败:', error)
    console.error('错误详情:', {
      message: error.message,
      statusCode: error.statusCode,
      config: error.config
    })
    return { success: false, error }
  }
}

// 检查当前配置
export function checkCurrentConfig() {
  // 读取当前request模块的配置
  console.log('=== 当前配置检查 ===')
  
  // 这里需要你在控制台中运行来查看实际配置
  console.log('请在开发者工具控制台中运行以下代码来检查配置:')
  console.log('import request from "@/utils/request.js"')
  console.log('然后发送一个测试请求查看实际的URL')
} 