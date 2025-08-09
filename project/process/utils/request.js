/**
 * uni-app 网络请求封装
 * 基于 uni.request 进行二次封装
 */

/**
 * 获取基础URL
 * 支持多环境配置
 */
function getBaseUrl() {
  // 强制指向后端API服务器端口
  console.log('BASE_URL 初始化:', 'http://localhost:3000')
  return 'http://localhost:3000'
}

// 配置常量
const CONFIG = {
  // API基础地址 - 强制使用后端服务器地址
  BASE_URL: 'http://localhost:3000',
  // 请求超时时间 (毫秒)
  TIMEOUT: 10000,

  // 请求头配置
  HEADERS: {
    'Content-Type': 'application/json'
  }
}

// 状态码映射
const STATUS_CODE = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
}

class Request {
  constructor() {
    this.interceptors = {
      request: [],
      response: []
    }
  }

  /**
   * 添加请求拦截器
   * @param {Function} onFulfilled 请求成功拦截
   * @param {Function} onRejected 请求失败拦截
   */
  interceptRequest(onFulfilled, onRejected) {
    this.interceptors.request.push({
      onFulfilled,
      onRejected
    })
  }

  /**
   * 添加响应拦截器
   * @param {Function} onFulfilled 响应成功拦截
   * @param {Function} onRejected 响应失败拦截
   */
  interceptResponse(onFulfilled, onRejected) {
    this.interceptors.response.push({
      onFulfilled,
      onRejected
    })
  }

  /**
   * 处理请求拦截器
   * @param {Object} config 请求配置
   */
  async processRequestInterceptors(config) {
    let processedConfig = config

    for (const interceptor of this.interceptors.request) {
      try {
        if (interceptor.onFulfilled) {
          processedConfig = await interceptor.onFulfilled(processedConfig)
        }
      } catch (error) {
        if (interceptor.onRejected) {
          return interceptor.onRejected(error)
        }
        throw error
      }
    }

    return processedConfig
  }

  /**
   * 处理响应拦截器
   * @param {Object} response 响应数据
   */
  async processResponseInterceptors(response) {
    let processedResponse = response

    for (const interceptor of this.interceptors.response) {
      try {
        if (interceptor.onFulfilled) {
          processedResponse = await interceptor.onFulfilled(processedResponse)
        }
      } catch (error) {
        if (interceptor.onRejected) {
          return interceptor.onRejected(error)
        }
        throw error
      }
    }

    return processedResponse
  }

  /**
   * 发起网络请求
   * @param {Object} options 请求选项
   */
  async request(options = {}) {
    // 合并默认配置
    const finalUrl = options.url ? (CONFIG.BASE_URL + options.url) : CONFIG.BASE_URL
    console.log('请求配置:', {
      originalUrl: options.url,
      baseUrl: CONFIG.BASE_URL,
      finalUrl: finalUrl
    })
    
    const config = {
      url: finalUrl,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        ...CONFIG.HEADERS,
        ...options.header
      },
      timeout: options.timeout || CONFIG.TIMEOUT,
      ...options
    }

    // {{ AURA-X: Add - 添加调试日志确认请求URL. }}
    console.log('🔍 [Request Debug] 完整请求URL:', config.url)
    console.log('🔍 [Request Debug] BASE_URL:', CONFIG.BASE_URL)
    console.log('🔍 [Request Debug] 请求路径:', options.url)

    try {
      // 处理请求拦截器
      const processedConfig = await this.processRequestInterceptors(config)

      // 发起请求
      const response = await this.makeRequest(processedConfig)

      // 处理响应拦截器
      const processedResponse = await this.processResponseInterceptors(response)

      return processedResponse
    } catch (error) {
      // 统一错误处理
      return this.handleError(error)
    }
  }

  /**
   * 发起实际请求
   * @param {Object} config 请求配置
   */
  makeRequest(config) {
    console.log('makeRequest 收到的config:', config)
    console.log('即将调用uni.request，URL:', config.url)
    
    return new Promise((resolve, reject) => {
      const requestConfig = {
        ...config
      }
      console.log('uni.request 最终配置:', requestConfig)
      
      uni.request({
        ...requestConfig,
        success: (res) => {
          // 检查HTTP状态码
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({
              data: res.data,
              statusCode: res.statusCode,
              header: res.header,
              config
            })
          } else {
            reject({
              message: `请求失败，状态码: ${res.statusCode}`,
              statusCode: res.statusCode,
              data: res.data,
              config
            })
          }
        },
        fail: (error) => {
          reject({
            message: error.errMsg || '网络请求失败',
            error,
            config
          })
        }
      })
    })
  }

  /**
   * 统一错误处理
   * @param {Object} error 错误对象
   */
  handleError(error) {
    console.error('请求错误:', error)

    // 根据错误类型显示不同提示
    let message = '请求失败'

    if (error.statusCode) {
      switch (error.statusCode) {
        case STATUS_CODE.UNAUTHORIZED:
          message = '登录已过期，请重新登录'
          // 可以在这里处理自动跳转到登录页
          // uni.navigateTo({ url: '/pages/login/login' })
          break
        case STATUS_CODE.FORBIDDEN:
          message = '没有权限访问'
          break
        case STATUS_CODE.NOT_FOUND:
          message = '请求的资源不存在'
          break
        case STATUS_CODE.SERVER_ERROR:
          message = '服务器内部错误'
          break
        default:
          message = error.message || '请求失败'
      }
    } else {
      message = error.message || '网络连接失败'
    }

    // 显示错误提示
    uni.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })

    return Promise.reject(error)
  }

  /**
   * GET 请求
   * @param {String} url 请求地址
   * @param {Object} params 请求参数
   * @param {Object} options 其他选项
   */
  get(url, params = {}, options = {}) {
    // 将参数拼接到URL
    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')

    const fullUrl = queryString ? `${url}?${queryString}` : url

    return this.request({
      url: fullUrl,
      method: 'GET',
      ...options
    })
  }

  /**
   * POST 请求
   * @param {String} url 请求地址
   * @param {Object} data 请求数据
   * @param {Object} options 其他选项
   */
  post(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...options
    })
  }

  /**
   * PUT 请求
   * @param {String} url 请求地址
   * @param {Object} data 请求数据
   * @param {Object} options 其他选项
   */
  put(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'PUT',
      data,
      ...options
    })
  }

  /**
   * DELETE 请求
   * @param {String} url 请求地址
   * @param {Object} options 其他选项
   */
  delete(url, options = {}) {
    return this.request({
      url,
      method: 'DELETE',
      ...options
    })
  }
}

// 创建请求实例
const request = new Request()

// 默认请求拦截器 - 添加token等通用处理
request.interceptRequest(
  (config) => {
    // 从本地存储获取token
    const token = uni.getStorageSync('token')
    if (token) {
      config.header.Authorization = `Bearer ${token}`
    }

    // 添加时间戳防止缓存
    config.header['X-Timestamp'] = Date.now()

    console.log('发起请求:', config.method, config.url)
    return config
  },
  (error) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 默认响应拦截器 - 统一处理响应数据
request.interceptResponse(
  (response) => {
    console.log('收到响应:', response.statusCode, response.config.url)

    // 后端返回格式为 { success: true, code: 200, data: {}, message: '' }
    const { data } = response

    if (data && (data.success === true || data.code === 200)) {
      return data // 返回完整的响应数据
    } else {
      // 业务错误处理
      const message = data.message || '请求失败'
      uni.showToast({
        title: message,
        icon: 'none'
      })
      return Promise.reject({
        message,
        data
      })
    }
  },
  (error) => {
    console.error('响应拦截器错误:', error)
    return Promise.reject(error)
  }
)

export default request