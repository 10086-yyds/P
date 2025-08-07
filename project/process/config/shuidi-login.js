// 水滴聚合第三方登录配置
export const SHUIDI_CONFIG = {
  // 从水滴聚合平台获取
  appId: '3757',
  appSecret: 'f8b6dab2e2de8ce148022d0aab4aba2d',
  // API 基础地址
  apiBase: 'https://uniqueker.top',
  // 回调地址 - 需要在水滴聚合平台配置白名单
  redirectUri: 'http://localhost:3000/wxy/auth/shuidi-callback',
  // 支持的第三方登录平台
  platforms: {
    wechat: { name: '微信登录', enabled: true, provider: 'wechat' },
    qq: { name: 'QQ登录', enabled: true, provider: 'qq' },
    alipay: { name: '支付宝登录', enabled: true, provider: 'alipay' },
    weibo: { name: '微博登录', enabled: true, provider: 'weibo' },
    apple: { name: 'Apple登录', enabled: true, provider: 'apple' }
  }
}

// 生成水滴聚合授权URL
export function generateShuidiAuthUrl(platform) {
  const config = SHUIDI_CONFIG.platforms[platform];
  if (!config || !config.enabled) {
    throw new Error(`${platform} 登录未启用`);
  }

  const params = new URLSearchParams({
    app_id: SHUIDI_CONFIG.appId,
    provider: config.provider,
    redirect_uri: SHUIDI_CONFIG.redirectUri,
    state: `shuidi_${platform}_${Date.now()}`,
    scope: 'basic'
  });

  return `${SHUIDI_CONFIG.apiBase}/oauth/authorize?${params.toString()}`;
}

// 获取启用的登录平台
export function getEnabledPlatforms() {
  return Object.keys(SHUIDI_CONFIG.platforms)
    .filter(key => SHUIDI_CONFIG.platforms[key].enabled)
    .map(key => ({
      key,
      ...SHUIDI_CONFIG.platforms[key]
    }));
}

// 水滴聚合API封装
export class ShuidiAPI {
  constructor() {
    this.baseUrl = SHUIDI_CONFIG.apiBase;
    this.appId = SHUIDI_CONFIG.appId;
    this.appSecret = SHUIDI_CONFIG.appSecret;
  }

  // 通过授权码获取访问令牌
  async getAccessToken(code, state) {
    try {
      const response = await uni.request({
        url: `${this.baseUrl}/oauth/token`,
        method: 'POST',
        data: {
          app_id: this.appId,
          app_secret: this.appSecret,
          code: code,
          grant_type: 'authorization_code'
        },
        header: {
          'Content-Type': 'application/json'
        }
      });

      if (response.statusCode === 200 && response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '获取访问令牌失败');
      }
    } catch (error) {
      console.error('水滴聚合获取令牌失败:', error);
      throw error;
    }
  }

  // 通过访问令牌获取用户信息
  async getUserInfo(accessToken) {
    try {
      const response = await uni.request({
        url: `${this.baseUrl}/user/info`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.statusCode === 200 && response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '获取用户信息失败');
      }
    } catch (error) {
      console.error('水滴聚合获取用户信息失败:', error);
      throw error;
    }
  }
}

// 水滴聚合登录工具类
export class ShuidiLogin {
  constructor() {
    this.api = new ShuidiAPI();
  }

  // 启动第三方登录
  async startLogin(platform) {
    try {
      // 生成授权URL
      const authUrl = generateShuidiAuthUrl(platform);
      
      // 在uni-app中打开授权页面
      return new Promise((resolve, reject) => {
        uni.navigateTo({
          url: `/pages/login/oauth-webview?url=${encodeURIComponent(authUrl)}&platform=${platform}`,
          success: () => {
            console.log(`🚀 启动${platform}登录`);
            
            // 监听登录结果
            uni.$on('oauthLoginResult', (result) => {
              if (result.success) {
                resolve(result);
              } else {
                reject(new Error(result.message));
              }
            });
          },
          fail: (error) => {
            reject(new Error('打开授权页面失败'));
          }
        });
      });
    } catch (error) {
      console.error(`${platform}登录启动失败:`, error);
      throw error;
    }
  }

  // 处理授权回调
  async handleCallback(code, state) {
    try {
      // 1. 通过code获取访问令牌
      const tokenData = await this.api.getAccessToken(code, state);
      
      // 2. 通过访问令牌获取用户信息
      const userInfo = await this.api.getUserInfo(tokenData.access_token);
      
      // 3. 发送到后端进行用户绑定或创建
      const result = await uni.request({
        url: 'http://localhost:3000/wxy/auth/shuidi-login',
        method: 'POST',
        data: {
          platform: this.extractPlatformFromState(state),
          userInfo: userInfo,
          accessToken: tokenData.access_token
        },
        header: {
          'Content-Type': 'application/json'
        }
      });

      if (result.statusCode === 200 && result.data.code === 200) {
        return result.data.data;
      } else {
        throw new Error(result.data.message || '登录失败');
      }
    } catch (error) {
      console.error('水滴聚合登录处理失败:', error);
      throw error;
    }
  }

  // 从state中提取平台信息
  extractPlatformFromState(state) {
    const parts = state.split('_');
    return parts.length >= 2 ? parts[1] : 'unknown';
  }
}

// 导出单例
export const shuidiLogin = new ShuidiLogin(); 