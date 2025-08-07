// API配置文件

// 后端服务器配置
export const BACKEND_CONFIG = {
  // 后端API基础地址
  BASE_URL: 'http://localhost:3000',
  
  // 接口前缀
  API_PREFIX: {
    AUTH: '/wxy/auth',
    USER: '/users',
    COMMON: '/'
  }
};

export const API_CONFIG = {
  // 高德地图API配置
  AMAP: {
    // 高德地图API密钥
    KEY: '4d9ce3ab1c31a6bb10c1766cdb0de9f0',
    
    // 高德地图密钥
    SECRET: '66a59f6e621ccbb956e8d71929def185',
    
    // 天气API接口
    WEATHER_URL: 'https://restapi.amap.com/v3/weather/weatherInfo',
    
    // 地理编码API接口
    GEOCODE_URL: 'https://restapi.amap.com/v3/geocode/regeo'
  }
};

// 默认城市配置（当获取位置失败时使用）
export const DEFAULT_CITY = {
  name: '北京',
  adcode: '110000',
  latitude: 39.9042,
  longitude: 116.4074
};

// 天气API使用说明
export const WEATHER_API_GUIDE = {
  title: '天气API使用说明',
  steps: [
    '1. 系统优先使用免费天气API（Open-Meteo）',
    '2. 如果免费API失败，会尝试高德地图API',
    '3. 如果所有API都失败，使用智能模拟天气',
    '4. 点击"API测试"按钮可以测试API状态'
  ],
  features: [
    '免费天气API：无需密钥，全球覆盖',
    '高德地图API：中文支持，需要密钥',
    '智能降级：多重备用方案',
    '实时天气：温度、天气状况、图标',
    '自动刷新：支持手动刷新天气',
    '错误处理：友好的错误提示'
  ],
  currentConfig: {
    primaryAPI: 'Open-Meteo (免费)',
    backupAPI: '高德地图',
    fallback: '智能模拟天气',
    status: '已配置多重方案'
  }
}; 