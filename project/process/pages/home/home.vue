<template>
  <view class="home-container">
    <!-- 顶部用户信息区域 -->
    <view class="header-section">
      <view class="user-info">
        <view class="welcome-text">
          <text class="greeting">早上好，</text>
          <text class="username">张工程师</text>
        </view>
        <view class="date-info">
          <text class="date">{{ currentDate }}</text>
          <view class="weather-container" @click="refreshWeather">
            <text class="weather"
              >{{ weather.icon }} {{ weather.condition }}
              {{ weather.temperature }}°C</text
            >
            <text class="refresh-icon" v-if="isRefreshing">🔄</text>
            <text class="weather-status" v-if="weather.isDefault">📍</text>
          </view>
        </view>
      </view>
      <view class="notification-icon">
        <text class="icon">🔔</text>
        <view class="badge" v-if="notificationCount > 0">{{
          notificationCount
        }}</view>
      </view>
    </view>

    <!-- 项目概览卡片 -->
    <view class="overview-card">
      <view class="card-header">
        <text class="card-title">项目概览</text>
        <text class="more-link">查看全部 ></text>
      </view>
      <view class="overview-stats">
        <view class="stat-item">
          <view class="stat-icon">📊</view>
          <view class="stat-number">{{ projectStats.total }}</view>
          <view class="stat-label">总项目</view>
        </view>
        <view class="stat-item">
          <view class="stat-icon">🔄</view>
          <view class="stat-number">{{ projectStats.ongoing }}</view>
          <view class="stat-label">进行中</view>
        </view>
        <view class="stat-item">
          <view class="stat-icon">✅</view>
          <view class="stat-number">{{ projectStats.completed }}</view>
          <view class="stat-label">已完成</view>
        </view>
        <view class="stat-item">
          <view class="stat-icon">⚠️</view>
          <view class="stat-number">{{ projectStats.overdue }}</view>
          <view class="stat-label">逾期</view>
        </view>
      </view>
    </view>

    <!-- 待办事项区域 -->
    <view class="todo-section">
      <view class="section-header">
        <text class="section-title">待办事项</text>
        <text class="todo-count">{{ todoList.length }}项</text>
      </view>
      <view class="todo-list">
        <view 
          class="todo-item" 
          v-for="(item, index) in todoList" 
          :key="index"
          @click="handleTodoClick(item, index)"
        >
          <view class="todo-priority" :class="item.priority"></view>
          <view class="todo-content">
            <text class="todo-title">{{ item.title }}</text>
            <text class="todo-desc">{{ item.description }}</text>
          </view>
          <view class="todo-time">
            <text class="time-text">{{ item.time }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 快捷功能区域 -->
    <view class="quick-actions">
      <view class="section-header">
        <text class="section-title">快捷功能</text>
      </view>
      <view class="action-grid">
        <view
          class="action-item"
          v-for="(action, index) in quickActions"
          :key="index"
          @click="handleQuickAction(action)"
        >
          <view class="action-icon">{{ action.icon }}</view>
          <text class="action-name">{{ action.name }}</text>
        </view>
      </view>
    </view>

    <!-- 数据统计区域 -->
    <view class="stats-section">
      <view class="section-header">
        <text class="section-title">本月统计</text>
      </view>
      <view class="stats-grid">
        <view class="stat-card">
          <text class="stat-value">{{ monthlyStats.projects }}</text>
          <text class="stat-label">新增项目</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ monthlyStats.tasks }}</text>
          <text class="stat-label">完成任务</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ monthlyStats.approvals }}</text>
          <text class="stat-label">审批通过</text>
        </view>
      </view>
    </view>

    <!-- 最近访问 -->
    <view class="recent-section">
      <view class="section-header">
        <text class="section-title">最近访问</text>
      </view>
      <view class="recent-list">
        <view
          class="recent-item"
          v-for="(item, index) in recentItems"
          :key="index"
          @click="handleRecentItemClick(item, index)"
        >
          <view class="recent-icon">{{ item.icon }}</view>
          <view class="recent-info">
            <text class="recent-name">{{ item.name }}</text>
            <text class="recent-time">{{ item.time }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { API_CONFIG, DEFAULT_CITY } from "../../config/api.js";

export default {
  data() {
    return {
      currentDate: "",
      notificationCount: 3,
      weather: {
        condition: "晴天",
        temperature: 25,
        icon: "☀️",
        isDefault: false,
      },
      isRefreshing: false,
      projectStats: {
        total: 12,
        ongoing: 8,
        completed: 3,
        overdue: 1,
      },
      todoList: [
        {
          title: "项目A施工方案审批",
          description: "需要审核施工图纸和材料清单",
          time: "09:30",
          priority: "high",
        },
        {
          title: "现场安全检查",
          description: "例行安全检查，重点关注高空作业",
          time: "14:00",
          priority: "medium",
        },
        {
          title: "团队会议",
          description: "讨论本周项目进度和下周计划",
          time: "16:00",
          priority: "normal",
        },
      ],
      quickActions: [
        { name: "新建项目", icon: "📋" },
        { name: "项目搜索", icon: "🔍" },
        { name: "团队管理", icon: "👥" },
        { name: "文档中心", icon: "📁" },
        { name: "会议安排", icon: "📅" },
        { name: "质量检查", icon: "✅" },
        // { name: "API测试", icon: "🔧" },
      ],
      monthlyStats: {
        projects: 5,
        tasks:3,
        approvals: 15,
      },
      recentItems: [
        { name: "地铁3号线项目", icon: "🚇", time: "2小时前" },
        { name: "施工图纸库", icon: "📐", time: "昨天" },
        { name: "安全培训资料", icon: "🛡️", time: "3天前" },
      ],
    };
  },
  mounted() {
    this.updateCurrentDate();
    this.getWeatherData();
  },

  onLoad() {
    // 检查位置权限
    this.checkLocationPermission();
  },
  methods: {
    updateCurrentDate() {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const date = now.getDate();
      const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
      const weekday = weekdays[now.getDay()];
      this.currentDate = `${year}年${month}月${date}日 星期${weekday}`;
    },

    // 获取天气数据
    async getWeatherData() {
      try {
        // 首先尝试获取用户位置
        const location = await this.getCurrentLocation();
        if (location) {
          // 调用天气API
          await this.fetchWeatherInfo(location.latitude, location.longitude);
        } else {
          // 如果获取位置失败，使用默认城市
          await this.fetchWeatherInfo(
            DEFAULT_CITY.latitude,
            DEFAULT_CITY.longitude
          );
        }
      } catch (error) {
        console.error("获取天气信息失败:", error);

        // 根据错误类型提供不同的处理
        if (
          error.message.includes("超时") ||
          error.errMsg?.includes("Timeout")
        ) {
          console.log("位置获取超时，使用默认城市天气");
          // 位置获取超时，直接使用默认城市
          await this.fetchWeatherInfo(
            DEFAULT_CITY.latitude,
            DEFAULT_CITY.longitude
          );
        } else {
          // 其他错误，使用模拟天气
          this.setSimulatedWeather();
        }
      }
    },

    // 检查位置权限
    checkLocationPermission() {
      // #ifdef APP-PLUS
      const permission = "android.permission.ACCESS_FINE_LOCATION";
      uni.getSystemInfo({
        success: (res) => {
          if (res.platform === "android") {
            // Android平台检查权限
            plus.android.requestPermissions(
              [permission],
              (result) => {
                console.log("位置权限结果:", result);
              },
              (error) => {
                console.log("位置权限检查失败:", error);
              }
            );
          }
        },
      });
      // #endif
    },

    // 获取当前位置
    getCurrentLocation() {
      return new Promise((resolve, reject) => {
        // 首先检查是否支持位置服务
        uni.getSystemInfo({
          success: (sysInfo) => {
            console.log("系统信息:", sysInfo);

            // 设置超时时间
            const timeout = setTimeout(() => {
              console.log("位置获取超时，使用默认城市");
              resolve(null); // 超时时直接使用默认城市，不报错
            }, 5000); // 缩短到5秒超时

            // 尝试获取位置
            uni.getLocation({
              type: "gcj02",
              timeout: 4000, // 4秒超时
              success: (res) => {
                clearTimeout(timeout);
                console.log("位置获取成功:", res);
                resolve({
                  latitude: res.latitude,
                  longitude: res.longitude,
                });
              },
              fail: (err) => {
                clearTimeout(timeout);
                console.log("获取位置失败:", err);

                // 根据错误类型提供不同的处理
                if (
                  err.errMsg?.includes("auth deny") ||
                  err.errMsg?.includes("permission")
                ) {
                  console.log("位置权限被拒绝");
                  // 权限被拒绝，直接使用默认城市
                  resolve(null);
                } else if (err.errMsg?.includes("Timeout")) {
                  console.log("位置获取超时");
                  // 超时，直接使用默认城市
                  resolve(null);
                } else {
                  console.log("其他位置获取错误:", err);
                  // 其他错误，也使用默认城市
                  resolve(null);
                }
              },
            });
          },
          fail: (err) => {
            console.log("获取系统信息失败:", err);
            resolve(null); // 系统信息获取失败，使用默认城市
          },
        });
      });
    },

    // 调用天气API
    async fetchWeatherInfo(latitude, longitude) {
      try {
        // 首先尝试使用免费的天气API
        await this.fetchFreeWeatherAPI(latitude, longitude);
      } catch (error) {
        console.error("免费天气API调用失败:", error);
        // 如果免费API失败，尝试高德地图API
        try {
          await this.fetchAmapWeatherAPI(latitude, longitude);
        } catch (amapError) {
          console.error("高德天气API调用失败:", amapError);
          // 如果所有API都失败，使用模拟数据
          this.setSimulatedWeather();
        }
      }
    },

    // 使用高德地图天气API
    async fetchAmapWeatherAPI(latitude, longitude) {
      try {
        const city = await this.getCityByLocation(latitude, longitude);

        // 尝试不使用签名的版本
        const params = {
          key: API_CONFIG.AMAP.KEY,
          city: city,
          extensions: "base", // base: 返回实况天气, all: 返回预报天气
        };

        console.log("调用高德天气API，参数:", params);

        // 高德地图天气API - 实时天气
        const response = await uni.request({
          url: API_CONFIG.AMAP.WEATHER_URL,
          method: "GET",
          data: params,
        });

        console.log("高德API响应:", response);

        if (
          response.statusCode === 200 &&
          response.data &&
          response.data.status === "1"
        ) {
          this.updateWeatherDisplayAmap(response.data);
        } else {
          // 如果API返回错误，尝试使用签名版本
          console.log("API返回错误，尝试使用签名版本");
          await this.fetchAmapWeatherWithSignature(latitude, longitude);
        }
      } catch (error) {
        console.error("高德天气API调用失败:", error);
        // 如果高德API失败，使用模拟数据
        this.setSimulatedWeather();
      }
    },

    // 使用免费的天气API（无需密钥）
    async fetchFreeWeatherAPI(latitude, longitude) {
      try {
        console.log("使用免费天气API获取天气信息");

        // 使用Open-Meteo免费天气API
        const response = await uni.request({
          url: "https://api.open-meteo.com/v1/forecast",
          method: "GET",
          data: {
            latitude: latitude,
            longitude: longitude,
            current: "temperature_2m,weather_code,is_day",
            timezone: "auto",
          },
        });

        console.log("免费天气API响应:", response);

        if (response.statusCode === 200 && response.data) {
          this.updateWeatherDisplayFree(response.data);
        } else {
          throw new Error("免费天气API响应异常");
        }
      } catch (error) {
        console.error("免费天气API调用失败:", error);
        throw error;
      }
    },

    // 更新免费天气API显示
    updateWeatherDisplayFree(weatherData) {
      const temp = Math.round(weatherData.current.temperature_2m);
      const weatherCode = weatherData.current.weather_code;
      const isDay = weatherData.current.is_day;

      const condition = this.getWeatherConditionFromCode(weatherCode);
      const icon = this.getWeatherIconFromCode(weatherCode, isDay);

      this.weather = {
        condition: condition,
        temperature: temp,
        icon: icon,
        isDefault: false,
      };

      console.log("免费天气API更新成功:", this.weather);
    },

    // 根据天气代码和是否白天获取图标
    getWeatherIconFromCode(code, isDay = true) {
      const iconMap = {
        // 晴天
        0: isDay ? "☀️" : "🌙",
        // 多云
        1: isDay ? "🌤️" : "☁️",
        2: isDay ? "🌤️" : "☁️",
        3: "☁️",
        // 雾
        45: "🌫️",
        48: "🌫️",
        // 小雨
        51: "🌦️",
        53: "🌦️",
        55: "🌦️",
        56: "🌨️",
        57: "🌨️",
        // 雨
        61: "🌧️",
        63: "🌧️",
        65: "🌧️",
        66: "🌨️",
        67: "🌨️",
        // 雷雨
        71: "⛈️",
        73: "⛈️",
        75: "⛈️",
        77: "⛈️",
        // 雪
        80: "🌨️",
        81: "🌨️",
        82: "🌨️",
        85: "❄️",
        86: "❄️",
        // 雷暴
        95: "⛈️",
        // 冰雹
        96: "❄️",
        99: "❄️",
      };
      return iconMap[code] || (isDay ? "🌤️" : "☁️");
    },

    // 使用签名的高德地图天气API（备用方案）
    async fetchAmapWeatherWithSignature(latitude, longitude) {
      try {
        const city = await this.getCityByLocation(latitude, longitude);
        const params = {
          key: API_CONFIG.AMAP.KEY,
          city: city,
          extensions: "base",
        };

        // 生成签名
        const signature = this.generateAmapSignature(params);
        params.sig = signature;

        console.log("使用签名调用高德天气API，参数:", params);

        const response = await uni.request({
          url: API_CONFIG.AMAP.WEATHER_URL,
          method: "GET",
          data: params,
        });

        if (
          response.statusCode === 200 &&
          response.data &&
          response.data.status === "1"
        ) {
          this.updateWeatherDisplayAmap(response.data);
        } else {
          throw new Error(
            "高德天气API响应异常: " + (response.data?.info || "未知错误")
          );
        }
      } catch (error) {
        console.error("签名版本高德天气API调用失败:", error);
        throw error; // 重新抛出错误，让上层处理
      }
    },

    // 根据经纬度获取城市编码
    async getCityByLocation(latitude, longitude) {
      try {
        // 尝试不使用签名的版本
        const params = {
          key: API_CONFIG.AMAP.KEY,
          location: `${longitude},${latitude}`,
          output: "json",
        };

        console.log("调用地理编码API，参数:", params);

        const response = await uni.request({
          url: API_CONFIG.AMAP.GEOCODE_URL,
          method: "GET",
          data: params,
        });

        console.log("地理编码API响应:", response);

        if (
          response.statusCode === 200 &&
          response.data &&
          response.data.status === "1"
        ) {
          const adcode = response.data.regeocode.addressComponent.adcode;
          console.log("获取到城市编码:", adcode);
          return adcode;
        } else {
          // 如果API返回错误，尝试使用签名版本
          console.log("地理编码API返回错误，尝试使用签名版本");
          return await this.getCityByLocationWithSignature(latitude, longitude);
        }
      } catch (error) {
        console.error("获取城市信息失败:", error);
        // 返回默认城市
        return DEFAULT_CITY.adcode;
      }
    },

    // 使用签名的地理编码API（备用方案）
    async getCityByLocationWithSignature(latitude, longitude) {
      try {
        const params = {
          key: API_CONFIG.AMAP.KEY,
          location: `${longitude},${latitude}`,
          output: "json",
        };

        // 生成签名
        const signature = this.generateAmapSignature(params);
        params.sig = signature;

        console.log("使用签名调用地理编码API，参数:", params);

        const response = await uni.request({
          url: API_CONFIG.AMAP.GEOCODE_URL,
          method: "GET",
          data: params,
        });

        if (
          response.statusCode === 200 &&
          response.data &&
          response.data.status === "1"
        ) {
          const adcode = response.data.regeocode.addressComponent.adcode;
          return adcode;
        } else {
          // 如果获取城市失败，返回默认城市
          return DEFAULT_CITY.adcode;
        }
      } catch (error) {
        console.error("签名版本地理编码API调用失败:", error);
        // 返回默认城市
        return DEFAULT_CITY.adcode;
      }
    },

    // 备用天气获取方案（使用免费API）
    async fetchWeatherFromBackup(latitude, longitude) {
      try {
        // 使用另一个免费的天气API
        const response = await uni.request({
          url: `https://api.weatherapi.com/v1/current.json`,
          method: "GET",
          data: {
            key: "YOUR_BACKUP_API_KEY", // 需要替换为备用API密钥
            q: `${latitude},${longitude}`,
            lang: "zh",
          },
        });

        if (response.statusCode === 200 && response.data) {
          this.updateWeatherDisplayBackup(response.data);
        } else {
          throw new Error("备用天气API响应异常");
        }
      } catch (error) {
        console.error("备用天气API调用失败:", error);
        this.setDefaultWeather();
      }
    },

    // 更新天气显示（OpenWeatherMap API）
    updateWeatherDisplay(weatherData) {
      const temp = Math.round(weatherData.main.temp);
      const condition = this.translateWeatherCondition(
        weatherData.weather[0].main
      );
      const icon = this.getWeatherIcon(weatherData.weather[0].main);

      this.weather = {
        condition: condition,
        temperature: temp,
        icon: icon,
      };
    },

    // 更新天气显示（WeatherAPI.com）
    updateWeatherDisplayBackup(weatherData) {
      const temp = Math.round(weatherData.current.temp_c);
      const condition = weatherData.current.condition.text;
      const icon = this.getWeatherIconFromCode(
        weatherData.current.condition.code
      );

      this.weather = {
        condition: condition,
        temperature: temp,
        icon: icon,
      };
    },

    // 更新天气显示（高德地图API）
    updateWeatherDisplayAmap(weatherData) {
      if (weatherData.lives && weatherData.lives.length > 0) {
        const liveWeather = weatherData.lives[0];
        const temp = parseInt(liveWeather.temperature);
        const condition = liveWeather.weather;
        const icon = this.getAmapWeatherIcon(liveWeather.weather);

        this.weather = {
          condition: condition,
          temperature: temp,
          icon: icon,
          isDefault: false,
        };
      } else {
        throw new Error("高德天气数据格式异常");
      }
    },

    // 翻译天气条件
    translateWeatherCondition(condition) {
      const weatherMap = {
        Clear: "晴天",
        Clouds: "多云",
        Rain: "雨天",
        Snow: "雪天",
        Thunderstorm: "雷雨",
        Drizzle: "小雨",
        Mist: "雾天",
        Fog: "雾天",
        Haze: "霾",
        Smoke: "雾霾",
        Dust: "沙尘",
        Sand: "沙尘",
        Ash: "火山灰",
        Squall: "狂风",
        Tornado: "龙卷风",
      };
      return weatherMap[condition] || condition;
    },

    // 根据天气条件获取图标
    getWeatherIcon(condition) {
      const iconMap = {
        Clear: "☀️",
        Clouds: "☁️",
        Rain: "🌧️",
        Snow: "❄️",
        Thunderstorm: "⛈️",
        Drizzle: "🌦️",
        Mist: "🌫️",
        Fog: "🌫️",
        Haze: "😷",
        Smoke: "😷",
        Dust: "💨",
        Sand: "💨",
        Ash: "🌋",
        Squall: "💨",
        Tornado: "🌪️",
      };
      return iconMap[condition] || "🌤️";
    },

    // 生成高德地图API签名
    generateAmapSignature(params) {
      try {
        // 将参数按key排序
        const sortedKeys = Object.keys(params).sort();
        let queryString = "";

        // 构建查询字符串
        sortedKeys.forEach((key) => {
          queryString += key + params[key];
        });

        // 在查询字符串前加上secret
        const signString =
          API_CONFIG.AMAP.SECRET + queryString + API_CONFIG.AMAP.SECRET;

        // 使用MD5加密（这里使用简单的哈希算法，实际项目中建议使用专门的MD5库）
        return this.simpleMD5(signString);
      } catch (error) {
        console.error("生成签名失败:", error);
        return "";
      }
    },

    // MD5实现（用于签名生成）
    simpleMD5(str) {
      // 高德地图签名算法：MD5(secret + 参数名参数值 + secret)
      // 这里使用一个更准确的MD5实现

      function md5cycle(x, k) {
        let a = x[0],
          b = x[1],
          c = x[2],
          d = x[3];

        a = ff(a, b, c, d, k[0], 7, -680876936);
        d = ff(d, a, b, c, k[1], 12, -389564586);
        c = ff(c, d, a, b, k[2], 17, 606105819);
        b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897);
        d = ff(d, a, b, c, k[5], 12, 1200080426);
        c = ff(c, d, a, b, k[6], 17, -1473231341);
        b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7, 1770035416);
        d = ff(d, a, b, c, k[9], 12, -1958414417);
        c = ff(c, d, a, b, k[10], 17, -42063);
        b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7, 1804603682);
        d = ff(d, a, b, c, k[13], 12, -40341101);
        c = ff(c, d, a, b, k[14], 17, -1502002290);
        b = ff(b, c, d, a, k[15], 22, 1236535329);

        a = gg(a, b, c, d, k[1], 5, -165796510);
        d = gg(d, a, b, c, k[6], 9, -1069501632);
        c = gg(c, d, a, b, k[11], 14, 643717713);
        b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691);
        d = gg(d, a, b, c, k[10], 9, 38016083);
        c = gg(c, d, a, b, k[15], 14, -660478335);
        b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5, 568446438);
        d = gg(d, a, b, c, k[14], 9, -1019803690);
        c = gg(c, d, a, b, k[3], 14, -187363961);
        b = gg(b, c, d, a, k[8], 20, 1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467);
        d = gg(d, a, b, c, k[2], 9, -51403784);
        c = gg(c, d, a, b, k[7], 14, 1735328473);
        b = gg(b, c, d, a, k[12], 20, -1926607734);

        a = hh(a, b, c, d, k[5], 4, -378558);
        d = hh(d, a, b, c, k[8], 11, -2022574463);
        c = hh(c, d, a, b, k[11], 16, 1839030562);
        b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060);
        d = hh(d, a, b, c, k[4], 11, 1272893353);
        c = hh(c, d, a, b, k[7], 16, -155497632);
        b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4, 681279174);
        d = hh(d, a, b, c, k[0], 11, -358537222);
        c = hh(c, d, a, b, k[3], 16, -722521979);
        b = hh(b, c, d, a, k[6], 23, 76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487);
        d = hh(d, a, b, c, k[12], 11, -421815835);
        c = hh(c, d, a, b, k[15], 16, 530742520);
        b = hh(b, c, d, a, k[2], 23, -995338651);

        a = ii(a, b, c, d, k[0], 6, -198630844);
        d = ii(d, a, b, c, k[7], 10, 1126891415);
        c = ii(c, d, a, b, k[14], 15, -1416354905);
        b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6, 1700485571);
        d = ii(d, a, b, c, k[3], 10, -1894986606);
        c = ii(c, d, a, b, k[10], 15, -1051523);
        b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6, 1873313359);
        d = ii(d, a, b, c, k[15], 10, -30611744);
        c = ii(c, d, a, b, k[6], 15, -1560198380);
        b = ii(b, c, d, a, k[13], 21, 1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070);
        d = ii(d, a, b, c, k[11], 10, -1120210379);
        c = ii(c, d, a, b, k[2], 15, 718787259);
        b = ii(b, c, d, a, k[9], 21, -343485551);

        x[0] = add32(a, x[0]);
        x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]);
        x[3] = add32(d, x[3]);
      }

      function cmn(q, a, b, x, s, t) {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
      }

      function ff(a, b, c, d, x, s, t) {
        return cmn((b & c) | (~b & d), a, b, x, s, t);
      }

      function gg(a, b, c, d, x, s, t) {
        return cmn((b & d) | (c & ~d), a, b, x, s, t);
      }

      function hh(a, b, c, d, x, s, t) {
        return cmn(b ^ c ^ d, a, b, x, s, t);
      }

      function ii(a, b, c, d, x, s, t) {
        return cmn(c ^ (b | ~d), a, b, x, s, t);
      }

      function md51(s) {
        const n = s.length;
        const state = [1732584193, -271733879, -1732584194, 271733878];
        let i;

        for (i = 64; i <= s.length; i += 64) {
          md5cycle(state, md5blk(s.substring(i - 64, i)));
        }

        s = s.substring(i - 64);
        const length = s.length;
        const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        for (i = 0; i < length; i++) {
          tail[i >> 2] |= s.charCodeAt(i) << (i % 4 << 3);
        }

        tail[i >> 2] |= 0x80 << (i % 4 << 3);
        if (i > 55) {
          md5cycle(state, tail);
          for (i = 0; i < 16; i++) tail[i] = 0;
        }

        tail[14] = n * 8;
        md5cycle(state, tail);
        return state;
      }

      function md5blk(s) {
        const md5blks = [];
        for (let i = 0; i < 64; i += 4) {
          md5blks[i >> 2] =
            s.charCodeAt(i) +
            (s.charCodeAt(i + 1) << 8) +
            (s.charCodeAt(i + 2) << 16) +
            (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
      }

      function add32(a, b) {
        return (a + b) & 0xffffffff;
      }

      function rhex(n) {
        let s = "",
          j = 0;
        for (; j < 4; j++) {
          s +=
            hex_chr[(n >> (j * 8 + 4)) & 0x0f] + hex_chr[(n >> (j * 8)) & 0x0f];
        }
        return s;
      }

      const hex_chr = "0123456789abcdef".split("");

      const x = md51(str);
      return rhex(x[0]) + rhex(x[1]) + rhex(x[2]) + rhex(x[3]);
    },

    // 根据高德地图天气描述获取图标
    getAmapWeatherIcon(weather) {
      const iconMap = {
        // 晴天
        晴: "☀️",
        // 多云
        多云: "☁️",
        阴: "☁️",
        阴天: "☁️",
        // 雨
        小雨: "🌦️",
        中雨: "🌧️",
        大雨: "🌧️",
        暴雨: "🌧️",
        雷阵雨: "⛈️",
        雷雨: "⛈️",
        阵雨: "🌦️",
        毛毛雨: "🌦️",
        // 雪
        小雪: "🌨️",
        中雪: "❄️",
        大雪: "❄️",
        暴雪: "❄️",
        雨夹雪: "🌨️",
        阵雪: "❄️",
        // 雾霾
        雾: "🌫️",
        霾: "😷",
        雾霾: "😷",
        轻雾: "🌫️",
        浓雾: "🌫️",
        // 风
        大风: "💨",
        台风: "🌀",
        龙卷风: "🌪️",
        // 其他
        沙尘暴: "💨",
        浮尘: "💨",
        扬沙: "💨",
        冰雹: "❄️",
        霜: "❄️",
        露: "💧",
      };

      // 模糊匹配
      for (const [key, icon] of Object.entries(iconMap)) {
        if (weather.includes(key)) {
          return icon;
        }
      }

      // 默认返回
      return "🌤️";
    },

    // 根据天气代码获取图标（通用）
    getWeatherIconFromCode(code) {
      // 根据WMO天气代码返回对应图标
      const iconMap = {
        // 晴天
        0: "☀️",
        // 多云
        1: "🌤️",
        2: "🌤️",
        3: "☁️",
        // 雾
        45: "🌫️",
        48: "🌫️",
        // 小雨
        51: "🌦️",
        53: "🌦️",
        55: "🌦️",
        56: "🌨️",
        57: "🌨️",
        // 雨
        61: "🌧️",
        63: "🌧️",
        65: "🌧️",
        66: "🌨️",
        67: "🌨️",
        // 雷雨
        71: "⛈️",
        73: "⛈️",
        75: "⛈️",
        77: "⛈️",
        // 雪
        80: "🌨️",
        81: "🌨️",
        82: "🌨️",
        85: "❄️",
        86: "❄️",
        // 雷暴
        95: "⛈️",
        // 冰雹
        96: "❄️",
        99: "❄️",
      };
      return iconMap[code] || "🌤️";
    },

    // 根据天气代码获取天气描述
    getWeatherConditionFromCode(code) {
      const conditionMap = {
        0: "晴天",
        1: "部分多云",
        2: "部分多云",
        3: "多云",
        45: "雾天",
        48: "雾天",
        51: "小雨",
        53: "小雨",
        55: "小雨",
        56: "雨夹雪",
        57: "雨夹雪",
        61: "雨天",
        63: "雨天",
        65: "大雨",
        66: "雨夹雪",
        67: "雨夹雪",
        71: "小雪",
        73: "雪天",
        75: "大雪",
        77: "雪天",
        80: "小雨",
        81: "雨天",
        82: "大雨",
        85: "小雪",
        86: "大雪",
        95: "雷雨",
        96: "雷雨",
        99: "雷雨",
      };
      return conditionMap[code] || "多云";
    },

    // 设置默认天气信息
    setDefaultWeather() {
      this.weather = {
        condition: "晴天",
        temperature: 25,
        icon: "☀️",
        isDefault: true,
      };
    },

    // 测试API配置
    async testAPIConfig() {
      try {
        uni.showLoading({
          title: "测试天气API...",
        });

        // 首先测试免费天气API
        console.log("测试免费天气API...");
        const freeWeatherResponse = await uni.request({
          url: "https://api.open-meteo.com/v1/forecast",
          method: "GET",
          data: {
            latitude: 39.9042,
            longitude: 116.4074,
            current: "temperature_2m,weather_code,is_day",
            timezone: "auto",
          },
        });

        uni.hideLoading();

        if (
          freeWeatherResponse.statusCode === 200 &&
          freeWeatherResponse.data
        ) {
          const temp = Math.round(
            freeWeatherResponse.data.current.temperature_2m
          );
          const weatherCode = freeWeatherResponse.data.current.weather_code;
          const condition = this.getWeatherConditionFromCode(weatherCode);

          uni.showModal({
            title: "天气API测试",
            content:
              "✅ 免费天气API工作正常！\n\n城市：北京\n温度：" +
              temp +
              "°C\n天气：" +
              condition +
              "\n\n现在将使用免费天气API获取天气信息。",
            showCancel: false,
          });

          // 更新天气显示
          this.updateWeatherDisplayFree(freeWeatherResponse.data);
        } else {
          throw new Error("免费天气API响应异常");
        }
      } catch (error) {
        uni.hideLoading();
        console.error("天气API测试失败:", error);

        // 如果免费API失败，测试高德API
        try {
          uni.showLoading({
            title: "测试高德API...",
          });

          const testParams = {
            key: API_CONFIG.AMAP.KEY,
            location: "116.397428,39.90923",
            output: "json",
          };

          const response = await uni.request({
            url: API_CONFIG.AMAP.GEOCODE_URL,
            method: "GET",
            data: testParams,
          });

          uni.hideLoading();

          if (
            response.statusCode === 200 &&
            response.data &&
            response.data.status === "1"
          ) {
            uni.showModal({
              title: "API配置测试",
              content:
                "⚠️ 高德地理编码API正常，但天气API可能未开通\n\n城市：" +
                response.data.regeocode.addressComponent.city +
                "\n区域：" +
                response.data.regeocode.addressComponent.district +
                "\n\n建议：\n1. 在高德控制台开通天气查询服务\n2. 或使用免费天气API（已自动启用）",
              showCancel: false,
            });
          } else {
            const errorMsg = response.data?.info || "API响应异常";
            uni.showModal({
              title: "API配置测试",
              content:
                "❌ 高德API配置失败！\n\n错误信息：" +
                errorMsg +
                "\n\n已自动启用免费天气API作为备用方案。",
              showCancel: false,
            });
          }
        } catch (amapError) {
          uni.hideLoading();
          uni.showModal({
            title: "API配置测试",
            content:
              "❌ 所有API测试失败！\n\n已启用智能模拟天气作为备用方案。\n\n请检查网络连接。",
            showCancel: false,
          });
        }
      }
    },

    // 刷新天气信息
    async refreshWeather() {
      if (this.isRefreshing) return;

      this.isRefreshing = true;
      try {
        await this.getWeatherData();
        uni.showToast({
          title: "天气已更新",
          icon: "success",
          duration: 1500,
        });
      } catch (error) {
        console.error("天气更新失败:", error);

        // 根据错误类型显示不同的提示
        let message = "更新失败";
        if (
          error.message?.includes("超时") ||
          error.errMsg?.includes("Timeout")
        ) {
          message = "位置获取超时，使用默认天气";
        } else if (
          error.message?.includes("网络") ||
          error.errMsg?.includes("network")
        ) {
          message = "网络连接失败";
        }

        uni.showToast({
          title: message,
          icon: "error",
          duration: 2000,
        });

        // 如果API调用失败，使用模拟数据
        this.setSimulatedWeather();
      } finally {
        this.isRefreshing = false;
      }
    },

    // 设置模拟天气信息（当所有API都失败时使用）
    setSimulatedWeather() {
      const now = new Date();
      const hour = now.getHours();
      const month = now.getMonth() + 1;

      // 根据时间和季节模拟天气
      let condition, icon, temperature;

      if (month >= 3 && month <= 5) {
        // 春季
        condition = "多云";
        icon = "🌤️";
        temperature = 15 + Math.floor(Math.random() * 10);
      } else if (month >= 6 && month <= 8) {
        // 夏季
        condition = "晴天";
        icon = "☀️";
        temperature = 25 + Math.floor(Math.random() * 15);
      } else if (month >= 9 && month <= 11) {
        // 秋季
        condition = "多云";
        icon = "☁️";
        temperature = 10 + Math.floor(Math.random() * 15);
      } else {
        // 冬季
        condition = "晴天";
        icon = "☀️";
        temperature = -5 + Math.floor(Math.random() * 15);
      }

      // 根据时间调整
      if (hour >= 18 || hour <= 6) {
        icon = "🌙";
        condition = "夜间";
        temperature -= 5;
      }

      this.weather = {
        condition: condition,
        temperature: temperature,
        icon: icon,
        isDefault: true,
      };
    },

    handleQuickAction(action) {
      if (action.name === "API测试") {
        this.testAPIConfig();
      } else {
        uni.showToast({
          title: `点击了${action.name}`,
          icon: "none",
        });
      }
    },

    handleTodoClick(item, index) {
      console.log('点击待办事项:', item);
      
      // 更新最近访问列表
      this.updateRecentItems(item);
      
      // 显示加载提示
      uni.showLoading({
        title: '加载中...'
      });
      
      // 模拟加载延迟
      setTimeout(() => {
        uni.hideLoading();
        
        // 跳转到待办事项详情页面
        uni.navigateTo({
          url: `/pages/todo/todo-detail?id=${index}&title=${encodeURIComponent(item.title)}&description=${encodeURIComponent(item.description)}&time=${encodeURIComponent(item.time)}&priority=${item.priority}`,
          success: () => {
            console.log('跳转成功');
          },
          fail: (err) => {
            console.error('跳转失败:', err);
            // 如果页面不存在，显示提示
            uni.showModal({
              title: '提示',
              content: '待办事项详情页面正在开发中，敬请期待！',
              showCancel: false
            });
          }
        });
      }, 500);
    },

    // 更新最近访问列表
    updateRecentItems(todoItem) {
      // 根据待办事项的标题和优先级选择合适的图标
      const getIconByTitle = (title) => {
        if (title.includes('审批') || title.includes('审核')) {
          return '📋';
        } else if (title.includes('检查') || title.includes('安全')) {
          return '🛡️';
        } else if (title.includes('会议')) {
          return '📅';
        } else if (title.includes('项目')) {
          return '📊';
        } else {
          return '📝';
        }
      };

      // 创建新的访问记录
      const newRecentItem = {
        name: todoItem.title,
        icon: getIconByTitle(todoItem.title),
        time: '刚刚',
        type: 'todo',
        id: Date.now() // 用于唯一标识
      };

      // 检查是否已经存在相同的项目
      const existingIndex = this.recentItems.findIndex(item => item.name === todoItem.title);
      
      if (existingIndex !== -1) {
        // 如果已存在，更新时间和位置
        this.recentItems.splice(existingIndex, 1);
      }

      // 将新项目添加到列表开头
      this.recentItems.unshift(newRecentItem);

      // 保持最近访问列表最多显示5个项目
      if (this.recentItems.length > 5) {
        this.recentItems = this.recentItems.slice(0, 5);
      }

      // 更新其他项目的时间显示
      this.updateRecentItemsTime();
    },

    // 更新最近访问项目的时间显示
    updateRecentItemsTime() {
      this.recentItems.forEach((item, index) => {
        if (index === 0) {
          item.time = '刚刚';
        } else if (index === 1) {
          item.time = '1分钟前';
        } else if (index === 2) {
          item.time = '5分钟前';
        } else if (index === 3) {
          item.time = '10分钟前';
        } else {
          item.time = '30分钟前';
        }
      });
    },

    // 处理最近访问项目的点击事件
    handleRecentItemClick(item, index) {
      console.log('点击最近访问:', item);
      
      if (item.type === 'todo') {
        // 如果是待办事项，需要在todoList中找到对应的项目
        const todoIndex = this.todoList.findIndex(todo => todo.title === item.name);
        if (todoIndex !== -1) {
          // 找到对应的待办事项，调用点击处理
          this.handleTodoClick(this.todoList[todoIndex], todoIndex);
        } else {
          // 如果找不到对应的待办事项，显示提示
          uni.showToast({
            title: '该待办事项已不存在',
            icon: 'none'
          });
        }
      } else {
        // 其他类型的项目（如项目、文档等）
        uni.showToast({
          title: `点击了最近访问: ${item.name}`,
          icon: "none",
        });
      }
    }
  },
};
</script>

<style scoped>
.home-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 顶部用户信息 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  color: white;
}

.user-info {
  flex: 1;
}

.welcome-text {
  margin-bottom: 10rpx;
}

.greeting {
  font-size: 28rpx;
  opacity: 0.9;
}

.username {
  font-size: 36rpx;
  font-weight: bold;
  margin-left: 10rpx;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
  font-size: 24rpx;
  opacity: 0.8;
}

.weather-container {
  display: flex;
  align-items: center;
  gap: 10rpx;
  cursor: pointer;
  transition: opacity 0.3s;
}

.weather-container:active {
  opacity: 0.7;
}

.refresh-icon {
  font-size: 20rpx;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.weather-status {
  font-size: 20rpx;
  opacity: 0.7;
}

.notification-icon {
  position: relative;
  font-size: 40rpx;
}

.badge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  background-color: #ff4757;
  color: white;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 20rpx;
  min-width: 30rpx;
  text-align: center;
}

/* 项目概览卡片 */
.overview-card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.more-link {
  font-size: 24rpx;
  color: #667eea;
}

.overview-stats {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 10rpx;
  line-height: 1.2;
}

.stat-label {
  font-size: 24rpx;
  color: #1a1a1a;
  background-color: #f0f2ff;
  font-weight: 600;
  display: block;
  text-align: center;
  line-height: 1.2;
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  margin-top: 6rpx;
  border: 1rpx solid #d1e7ff;
}

.stat-icon {
  font-size: 32rpx;
  margin-bottom: 8rpx;
  display: block;
  text-align: center;
  line-height: 1.2;
}

/* 待办事项 */
.todo-section {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.todo-count {
  font-size: 24rpx;
  color: #667eea;
  background: #f0f2ff;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.todo-item:active {
  background-color: #f8f9ff;
  transform: scale(0.98);
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-item::after {
  content: '>';
  position: absolute;
  right: 10rpx;
  color: #ccc;
  font-size: 24rpx;
  transition: all 0.3s ease;
}

.todo-item:active::after {
  color: #667eea;
  transform: translateX(5rpx);
}

.todo-priority {
  width: 8rpx;
  height: 60rpx;
  border-radius: 4rpx;
  margin-right: 20rpx;
}

.todo-priority.high {
  background-color: #ff4757;
}

.todo-priority.medium {
  background-color: #ffa502;
}

.todo-priority.normal {
  background-color: #2ed573;
}

.todo-content {
  flex: 1;
}

.todo-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.todo-desc {
  font-size: 24rpx;
  color: #666;
  display: block;
}

.todo-time {
  font-size: 24rpx;
  color: #999;
}

/* 快捷功能 */
.quick-actions {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30rpx;
}

.action-item {
  text-align: center;
  padding: 30rpx 20rpx;
  border-radius: 15rpx;
  background: #f8f9ff;
  transition: all 0.3s;
}

.action-item:active {
  background: #e8ecff;
  transform: scale(0.95);
}

.action-icon {
  font-size: 50rpx;
  margin-bottom: 15rpx;
}

.action-name {
  font-size: 24rpx;
  color: #333;
}

/* 数据统计 */
.stats-section {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.stat-card {
  text-align: center;
  padding: 30rpx 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15rpx;
  color: white;
}

.stat-value {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #1a1a1a;
  background-color: #f0f2ff;
  border: 1rpx solid #d1e7ff;
  font-weight: 500;
}

/* 最近访问 */
.recent-section {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.recent-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.recent-item:active {
  background-color: #f8f9ff;
  transform: scale(0.98);
}

.recent-item:last-child {
  border-bottom: none;
}

.recent-item::after {
  content: '>';
  position: absolute;
  right: 10rpx;
  color: #ccc;
  font-size: 24rpx;
  transition: all 0.3s ease;
}

.recent-item:active::after {
  color: #667eea;
  transform: translateX(5rpx);
}

.recent-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.recent-info {
  flex: 1;
}

.recent-name {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.recent-time {
  font-size: 24rpx;
  color: #999;
}
</style>
