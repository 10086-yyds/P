<template>
  <view class="home-container">
    <!-- 下拉刷新区域 -->
    <scroll-view 
      class="scroll-container" 
      scroll-y="true" 
      refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
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
      <view class="notification-icon" @click="handleNotificationClick">
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
        <view class="stat-item" @click.stop="handleStatItemClick('total', '总项目')">
          <view class="stat-icon">📊</view>
          <view class="stat-number">{{ projectStats.total }}</view>
          <view class="stat-label">总项目</view>
        </view>
        <view class="stat-item" @click.stop="handleStatItemClick('ongoing', '进行中项目')">
          <view class="stat-icon">🔄</view>
          <view class="stat-number">{{ projectStats.ongoing }}</view>
          <view class="stat-label">进行中</view>
        </view>
        <view class="stat-item" @click.stop="handleStatItemClick('completed', '已完成项目')">
          <view class="stat-icon">✅</view>
          <view class="stat-number">{{ projectStats.completed }}</view>
          <view class="stat-label">已完成</view>
        </view>
        <view class="stat-item" @click.stop="handleStatItemClick('overdue', '逾期项目')">
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
        <view class="stat-card" @click="handleMonthlyStatClick('projects', '新增项目')">
          <text class="stat-value">{{ monthlyStats.projects }}</text>
          <text class="stat-label">新增项目</text>
        </view>
        <view class="stat-card" @click="handleMonthlyStatClick('tasks', '完成任务')">
          <text class="stat-value">{{ monthlyStats.tasks }}</text>
          <text class="stat-label">完成任务</text>
        </view>
        <view class="stat-card" @click="handleMonthlyStatClick('approvals', '审批通过')">
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
    </scroll-view>
  </view>
</template>

<script>
import { API_CONFIG, DEFAULT_CITY } from "../../config/api.js";

export default {
  data() {
    return {
      currentDate: "",
      notificationCount: 0,
      weather: {
        condition: "晴天",
        temperature: 25,
        icon: "☀️",
        isDefault: false,
      },
      isRefreshing: false,
      projectStats: {
        total: 0,
        ongoing: 0,
        completed: 0,
        overdue: 0,
      },
      todoList: [],
      quickActions: [
        { name: "新建项目", icon: "📋", type: "create-project" },
        { name: "项目搜索", icon: "🔍", type: "search-project" },
        { name: "团队管理", icon: "👥", type: "team-management" },
        { name: "文档中心", icon: "📁", type: "document-center" },
        { name: "合同管理", icon: "📄", type: "contract-management" },
        { name: "修改进度", icon: "📈", type: "project-check" },
      ],
      monthlyStats: {
        projects: 0,
        tasks: 0,
        approvals: 0,
      },
      recentItems: [],
      isLoading: false,
    };
  },
  mounted() {
    this.updateCurrentDate();
    // 添加防抖，避免频繁调用天气API
    this.debouncedGetWeather = this.debounce(this.getWeatherData, 30000); // 30秒防抖
    this.getWeatherData();
    
    // 加载页面数据
    this.loadPageData();
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
        // 使用防抖的天气获取函数
        await this.debouncedGetWeather();
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
      console.log('点击快捷功能:', action);
      
      // 显示加载提示
      uni.showLoading({
        title: '加载中...'
      });
      
      setTimeout(() => {
        uni.hideLoading();
        
        switch (action.type) {
          case 'create-project':
            this.navigateToCreateProject();
            break;
          case 'search-project':
            this.navigateToProjectSearch();
            break;
          case 'team-management':
            this.navigateToTeamManagement();
            break;
          case 'document-center':
            this.navigateToDocumentCenter();
            break;
          case 'contract-management':
            this.navigateToContractManagement();
            break;
          case 'project-check':
            this.navigateToQualityCheck();
            break;
          default:
            uni.showToast({
              title: `点击了${action.name}`,
              icon: "none",
            });
        }
      }, 500);
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
          url: `/pages/project/project-detail?id=${index}&title=${encodeURIComponent(item.title)}&description=${encodeURIComponent(item.description)}&time=${encodeURIComponent(item.time)}&priority=${item.priority}`,
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
        name: todoItem.title || '未知项目',
        icon: getIconByTitle(todoItem.title || ''),
        time: '刚刚',
        type: 'todo',
        id: Date.now(), // 用于唯一标识
        timestamp: new Date().getTime() // 添加时间戳
      };

      // 检查是否已经存在相同的项目
      const existingIndex = this.recentItems.findIndex(item => item.name === todoItem.title);
      
      if (existingIndex !== -1) {
        // 如果已存在，移除旧记录
        this.recentItems.splice(existingIndex, 1);
      }

      // 将新项目添加到列表开头
      this.recentItems.unshift(newRecentItem);

      // 保持最近访问列表最多显示5个项目
      if (this.recentItems.length > 5) {
        this.recentItems = this.recentItems.slice(0, 5);
      }

      // 只更新新添加项目的时间，其他项目保持原有时间
      this.updateTimeForNewItem();
    },

    // 只为新添加的项目更新时间
    updateTimeForNewItem() {
      // 只更新第一个项目（刚刚添加的）的时间
      if (this.recentItems.length > 0) {
        this.recentItems[0].time = '刚刚';
        this.recentItems[0].timestamp = new Date().getTime();
      }
    },

    // 更新最近访问项目的时间显示
    updateRecentItemsTime() {
      this.recentItems.forEach((item, index) => {
        if (index === 0) {
          item.time = '刚刚';
        } else if (index === 1) {
          item.time = '1分钟前';
        } else if (index === 2) {
          item.time = '3分钟前';
        } else if (index === 3) {
          item.time = '5分钟前';
        } else {
          item.time = '10分钟前';
        }
        
        // 为每个项目添加时间戳，用于更精确的时间计算
        if (!item.timestamp) {
          const now = new Date();
          item.timestamp = now.getTime() - (index * 60000); // 每分钟递减
        }
      });
    },

    // 处理最近访问项目的点击事件
    handleRecentItemClick(item, index) {
      console.log('点击最近访问:', item);
      
      // 首先更新最近访问列表（无论什么类型都要更新）
      this.updateRecentItemsFromClick(item, index);
      
      if (item.type === 'todo') {
        // 如果是待办事项，需要在todoList中找到对应的项目
        const todoIndex = this.todoList.findIndex(todo => todo.title === item.name);
        if (todoIndex !== -1) {
          // 调用点击处理
          this.handleTodoClick(this.todoList[todoIndex], todoIndex);
        } else {
          // 如果找不到对应的待办事项，显示提示
          uni.showToast({
            title: '该待办事项已不存在',
            icon: 'none'
          });
        }
      } else if (item.type === 'project') {
        // 如果是项目，跳转到项目详情页面
        this.handleProjectClick(item);
      } else if (item.type === 'document') {
        // 如果是文档，跳转到文档详情页面
        this.handleDocumentClick(item);
      } else {
        // 其他类型的项目
        uni.showToast({
          title: `点击了最近访问: ${item.name}`,
          icon: "none",
        });
      }
    },

    // 处理项目点击
    handleProjectClick(projectItem) {
      console.log('点击项目:', projectItem);
      
      // 显示加载提示
      uni.showLoading({
        title: '加载中...'
      });
      
      setTimeout(() => {
        uni.hideLoading();
        
        // 跳转到项目详情页面
        uni.navigateTo({
          url: `/pages/project/project-detail?name=${encodeURIComponent(projectItem.name)}&icon=${encodeURIComponent(projectItem.icon)}`,
          success: () => {
            console.log('项目详情页面跳转成功');
          },
          fail: (err) => {
            console.error('项目详情页面跳转失败:', err);
            uni.showModal({
              title: '提示',
              content: '项目详情页面正在开发中，敬请期待！',
              showCancel: false
            });
          }
        });
      }, 500);
    },

    // 处理文档点击
    handleDocumentClick(documentItem) {
      console.log('点击文档:', documentItem);
      
      // 显示加载提示
      uni.showLoading({
        title: '加载中...'
      });
      
      setTimeout(() => {
        uni.hideLoading();
        
        // 跳转到文档详情页面
        uni.navigateTo({
          url: `/pages/document/document-detail?name=${encodeURIComponent(documentItem.name)}&icon=${encodeURIComponent(documentItem.icon)}`,
          success: () => {
            console.log('文档详情页面跳转成功');
          },
          fail: (err) => {
            console.error('文档详情页面跳转失败:', err);
            uni.showModal({
              title: '提示',
              content: '文档详情页面正在开发中，敬请期待！',
              showCancel: false
            });
          }
        });
      }, 500);
    },

    // 从最近访问列表点击时更新访问记录
    updateRecentItemsFromClick(item, currentIndex) {
      // 将当前项目移动到列表开头
      this.recentItems.splice(currentIndex, 1);
      
      // 更新项目的时间戳为当前时间
      item.timestamp = new Date().getTime();
      item.time = '刚刚';
      
      this.recentItems.unshift(item);
      
      // 只更新被点击项目的时间，其他项目保持原有时间
      // 不需要更新其他项目的时间，保持它们的原有状态
    },

    // 防抖函数
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    // 项目概览点击处理
    handleProjectOverviewClick() {
      console.log('点击项目概览');
      uni.navigateTo({
        url: '/pages/project/project-list',
        success: () => {
          console.log('跳转到项目列表成功');
        },
        fail: (err) => {
          console.error('跳转到项目列表失败:', err);
          uni.showModal({
            title: '提示',
            content: '项目列表页面正在开发中，敬请期待！',
            showCancel: false
          });
        }
      });
    },

    // 统计项点击处理
    handleStatItemClick(type, title) {
      console.log('点击统计项:', type, title);
      uni.navigateTo({
        url: `/pages/project/project-list?type=${type}&title=${encodeURIComponent(title)}`,
        success: () => {
          console.log('跳转到项目列表成功');
        },
        fail: (err) => {
          console.error('跳转到项目列表失败:', err);
          uni.showModal({
            title: '提示',
            content: `${title}页面正在开发中，敬请期待！`,
            showCancel: false
          });
        }
      });
    },

    // 月度统计点击处理
    handleMonthlyStatClick(type, title) {
      console.log('点击月度统计:', type, title);
      uni.navigateTo({
        url: `/pages/statistics/monthly-stats?type=${type}&title=${encodeURIComponent(title)}`,
        success: () => {
          console.log('跳转到月度统计成功');
        },
        fail: (err) => {
          console.error('跳转到月度统计失败:', err);
          uni.showModal({
            title: '提示',
            content: `${title}统计页面正在开发中，敬请期待！`,
            showCancel: false
          });
        }
      });
    },

    // 新建项目导航
    navigateToCreateProject() {
      uni.navigateTo({
        url: '/pages/project/create-project',
        success: () => {
          console.log('跳转到新建项目页面成功');
        },
        fail: (err) => {
          console.error('跳转到新建项目页面失败:', err);
          uni.showModal({
            title: '提示',
            content: '新建项目页面正在开发中，敬请期待！',
            showCancel: false
          });
        }
      });
    },

    // 项目搜索导航
    navigateToProjectSearch() {
      uni.navigateTo({
        url: '/pages/project/project-search',
        success: () => {
          console.log('跳转到项目搜索页面成功');
        },
        fail: (err) => {
          console.error('跳转到项目搜索页面失败:', err);
          uni.showModal({
            title: '提示',
            content: '项目搜索页面正在开发中，敬请期待！',
            showCancel: false
          });
        }
      });
    },

    // 团队管理导航
    navigateToTeamManagement() {
      uni.navigateTo({
        url: '/pages/team/team-management',
        success: () => {
          console.log('跳转到团队管理页面成功');
        },
        fail: (err) => {
          console.error('跳转到团队管理页面失败:', err);
          uni.showModal({
            title: '提示',
            content: '团队管理页面正在开发中，敬请期待！',
            showCancel: false
          });
        }
      });
    },

    // 文档中心导航
    navigateToDocumentCenter() {
      uni.navigateTo({
        url: '/pages/document/document-center',
        success: () => {
          console.log('跳转到文档中心页面成功');
        },
        fail: (err) => {
          console.error('跳转到文档中心页面失败:', err);
          uni.showModal({
            title: '提示',
            content: '文档中心页面正在开发中，敬请期待！',
            showCancel: false
          });
        }
      });
    },

    // 合同管理导航
    navigateToContractManagement() {
      uni.navigateTo({
        url: '/pages/contract/contract-management',
        success: () => {
          console.log('跳转到合同管理页面成功');
        },
        fail: (err) => {
          console.error('跳转到合同管理页面失败:', err);
          uni.showModal({
            title: '提示',
            content: '合同管理页面正在开发中，敬请期待！',
            showCancel: false
          });
        }
      });
    },

    // 质量检查导航
    navigateToQualityCheck() {
      console.log('开始跳转到质量检查页面');
      
      // 先检查页面是否存在
      const pages = getCurrentPages();
      console.log('当前页面栈:', pages);
      
      uni.navigateTo({
        url: '/pages/project/project-check',
        success: () => {
          console.log('跳转到质量检查页面成功');
        },
        fail: (err) => {
          console.error('跳转到质量检查页面失败:', err);
          console.error('错误详情:', err);
          
          // 尝试使用不同的路径格式
          console.log('尝试使用相对路径...');
          uni.navigateTo({
            url: 'pages/project/project-check',
            success: () => {
              console.log('使用相对路径跳转成功');
            },
            fail: (err2) => {
              console.error('相对路径也失败:', err2);
              uni.showModal({
                title: '提示',
                content: '质量检查页面正在开发中，敬请期待！',
                showCancel: false
              });
            }
          });
        }
      });
    },

    // 加载页面数据
    async loadPageData() {
      this.isLoading = true;
      
      try {
        // 并行加载所有数据
        await Promise.all([
          this.loadProjectStats(),
          this.loadTodoList(),
          this.loadMonthlyStats(),
          this.loadRecentItems(),
          this.loadNotificationCount()
        ]);
        
        console.log('页面数据加载完成');
      } catch (error) {
        console.error('加载页面数据失败:', error);
        uni.showToast({
          title: '数据加载失败',
          icon: 'error',
          duration: 2000
        });
      } finally {
        this.isLoading = false;
      }
    },

    // 加载项目统计数据
    async loadProjectStats() {
      try {
        // 先尝试获取所有项目，然后计算统计
        const result = await uni.request({
          url: `${API_CONFIG.BASE_URL}/lz/api/projects`,
          method: 'GET',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`
          }
        });
        
        // 处理不同平台的返回值格式
        let error, response;
        if (Array.isArray(result)) {
          [error, response] = result;
        } else {
          if (result.errMsg && result.errMsg !== 'request:ok') {
            error = result;
            response = null;
          } else {
            error = null;
            response = result;
          }
        }
        
        if (error) {
          throw new Error(`网络请求失败: ${error.errMsg || error}`);
        }
        
        if (response.statusCode === 200 && response.data) {
          // 检查API返回的数据结构
          let projectsData;
          if (response.data.success && response.data.data) {
            projectsData = response.data.data;
          } else {
            projectsData = response.data;
          }
          
          // 确保projectsData是数组
          const projects = Array.isArray(projectsData) ? projectsData : [];
          
          // 计算统计数据
          this.projectStats = {
            total: projects.length,
            ongoing: projects.filter(p => p.status === 'active' || p.status === 'ongoing').length,
            completed: projects.filter(p => p.status === 'completed').length,
            overdue: projects.filter(p => p.status === 'overdue').length
          };
        }
      } catch (error) {
        console.error('加载项目统计数据失败:', error);
        // 使用默认数据
        this.projectStats = {
          total: 0,
          ongoing: 0,
          completed: 0,
          overdue: 0
        };
      }
    },

    // 加载待办事项列表
    async loadTodoList() {
      try {
        // 由于待办事项API可能不存在，我们使用模拟数据
        // 或者从项目数据中生成待办事项
        const result = await uni.request({
          url: `${API_CONFIG.BASE_URL}/lz/api/projects`,
          method: 'GET',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`
          }
        });
        
        // 处理不同平台的返回值格式
        let error, response;
        if (Array.isArray(result)) {
          [error, response] = result;
        } else {
          if (result.errMsg && result.errMsg !== 'request:ok') {
            error = result;
            response = null;
          } else {
            error = null;
            response = result;
          }
        }
        
        if (error) {
          throw new Error(`网络请求失败: ${error.errMsg || error}`);
        }
        
        if (response.statusCode === 200 && response.data) {
          // 检查API返回的数据结构
          let projectsData;
          if (response.data.success && response.data.data) {
            projectsData = response.data.data;
          } else {
            projectsData = response.data;
          }
          
          // 确保projectsData是数组
          const projects = Array.isArray(projectsData) ? projectsData : [];
          
          // 从项目中生成待办事项
          this.todoList = projects.slice(0, 3).map((project, index) => ({
            title: `${project.name}项目审批`,
            description: `需要审核${project.name}项目的相关文档`,
            time: this.formatTime(new Date(Date.now() + index * 3600000)), // 模拟时间
            priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'normal',
            id: project._id || project.id
          }));
        }
      } catch (error) {
        console.error('加载待办事项失败:', error);
        // 使用默认数据
        this.todoList = [];
      }
    },

    // 加载月度统计数据
    async loadMonthlyStats() {
      try {
        // 由于月度统计API可能不存在，我们使用模拟数据
        // 或者从项目数据中计算
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        // 这里可以调用项目API来获取本月数据
        const result = await uni.request({
          url: `${API_CONFIG.BASE_URL}/lz/api/projects`,
          method: 'GET',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`
          }
        });
        
        // 处理不同平台的返回值格式
        let error, response;
        if (Array.isArray(result)) {
          [error, response] = result;
        } else {
          if (result.errMsg && result.errMsg !== 'request:ok') {
            error = result;
            response = null;
          } else {
            error = null;
            response = result;
          }
        }
        
        if (error) {
          throw new Error(`网络请求失败: ${error.errMsg || error}`);
        }
        
        if (response.statusCode === 200 && response.data) {
          // 检查API返回的数据结构
          let projectsData;
          if (response.data.success && response.data.data) {
            projectsData = response.data.data;
          } else {
            projectsData = response.data;
          }
          
          // 确保projectsData是数组
          const projects = Array.isArray(projectsData) ? projectsData : [];
          
          // 计算本月统计数据
          const thisMonthProjects = projects.filter(project => {
            const createTime = new Date(project.createTime || project.createdAt);
            return createTime.getMonth() + 1 === currentMonth && 
                   createTime.getFullYear() === currentYear;
          });
          
          this.monthlyStats = {
            projects: thisMonthProjects.length,
            tasks: Math.floor(thisMonthProjects.length * 0.8), // 模拟任务数量
            approvals: Math.floor(thisMonthProjects.length * 1.2) // 模拟审批数量
          };
        }
      } catch (error) {
        console.error('加载月度统计数据失败:', error);
        // 使用默认数据
        this.monthlyStats = {
          projects: 0,
          tasks: 0,
          approvals: 0
        };
      }
    },

    // 加载最近访问项目
    async loadRecentItems() {
      try {
        // 由于最近访问API可能不存在，我们从项目数据中生成
        const result = await uni.request({
          url: `${API_CONFIG.BASE_URL}/lz/api/projects`,
          method: 'GET',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`
          }
        });
        
        // 处理不同平台的返回值格式
        let error, response;
        if (Array.isArray(result)) {
          [error, response] = result;
        } else {
          if (result.errMsg && result.errMsg !== 'request:ok') {
            error = result;
            response = null;
          } else {
            error = null;
            response = result;
          }
        }
        
        if (error) {
          throw new Error(`网络请求失败: ${error.errMsg || error}`);
        }
        
        if (response.statusCode === 200 && response.data) {
          // 检查API返回的数据结构
          let projectsData;
          if (response.data.success && response.data.data) {
            projectsData = response.data.data;
          } else {
            projectsData = response.data;
          }
          
          // 确保projectsData是数组
          const projects = Array.isArray(projectsData) ? projectsData : [];
          
          // 从项目中生成最近访问列表
          this.recentItems = projects.slice(0, 3).map((project, index) => ({
            name: project.name,
            icon: this.getIconByType('project'),
            time: this.formatTimeAgo(project.createTime || project.createdAt),
            type: 'project',
            id: project._id || project.id,
            timestamp: new Date(project.createTime || project.createdAt).getTime()
          }));
        }
      } catch (error) {
        console.error('加载最近访问项目失败:', error);
        // 使用默认数据
        this.recentItems = [];
      }
    },

    // 加载通知数量
    async loadNotificationCount() {
      try {
        // 由于通知API可能不存在，我们使用模拟数据
        // 或者从其他数据中计算
        this.notificationCount = Math.floor(Math.random() * 5); // 模拟0-4个通知
        
        // 如果后端有通知API，可以取消注释下面的代码
        /*
        const result = await uni.request({
          url: `${API_CONFIG.BASE_URL}/lz/api/notifications/count`,
          method: 'GET',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`
          }
        });
        
        // 处理不同平台的返回值格式
        let error, response;
        if (Array.isArray(result)) {
          [error, response] = result;
        } else {
          if (result.errMsg && result.errMsg !== 'request:ok') {
            error = result;
            response = null;
          } else {
            error = null;
            response = result;
          }
        }
        
        if (error) {
          throw new Error(`网络请求失败: ${error.errMsg || error}`);
        }
        
        if (response.statusCode === 200 && response.data) {
          // 检查API返回的数据结构
          let countData;
          if (response.data.success && response.data.data) {
            countData = response.data.data;
          } else {
            countData = response.data;
          }
          
          this.notificationCount = countData.count || 0;
        }
        */
      } catch (error) {
        console.error('加载通知数量失败:', error);
        this.notificationCount = 0;
      }
    },

    // 根据类型获取图标
    getIconByType(type) {
      const iconMap = {
        'project': '📊',
        'document': '📁',
        'todo': '📝',
        'contract': '📄',
        'approval': '📋',
        'check': '✅',
        'default': '📄'
      };
      return iconMap[type] || iconMap.default;
    },

    // 格式化时间
    formatTime(timeString) {
      if (!timeString) return '';
      
      try {
        const date = new Date(timeString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      } catch (error) {
        return '';
      }
    },

    // 格式化时间差
    formatTimeAgo(timeString) {
      if (!timeString) return '';
      
      try {
        const date = new Date(timeString);
        const now = new Date();
        const diffTime = now - date;
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffMinutes < 1) {
          return '刚刚';
        } else if (diffMinutes < 60) {
          return `${diffMinutes}分钟前`;
        } else if (diffHours < 24) {
          return `${diffHours}小时前`;
        } else if (diffDays < 7) {
          return `${diffDays}天前`;
        } else {
          return `${date.getMonth() + 1}月${date.getDate()}日`;
        }
      } catch (error) {
        return '';
      }
    },

    // 获取用户token
    getToken() {
      return uni.getStorageSync('userToken') || '';
    },

    // 下拉刷新处理
    async onRefresh() {
      this.isRefreshing = true;
      
      try {
        // 重新加载所有数据
        await this.loadPageData();
        
        uni.showToast({
          title: '刷新成功',
          icon: 'success',
          duration: 1500
        });
      } catch (error) {
        console.error('刷新数据失败:', error);
        uni.showToast({
          title: '刷新失败',
          icon: 'error',
          duration: 2000
        });
      } finally {
        this.isRefreshing = false;
      }
    },

    // 通知点击处理
    handleNotificationClick() {
      console.log('点击通知图标');
      uni.navigateTo({
        url: '/pages/notification/notification-list',
        success: () => {
          console.log('跳转到通知列表成功');
        },
        fail: (err) => {
          console.error('跳转到通知列表失败:', err);
          uni.showModal({
            title: '提示',
            content: '通知列表页面正在开发中，敬请期待！',
            showCancel: false
          });
        }
      });
    },
  },
};
</script>

<style scoped>
.home-container {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.scroll-container {
  height: 100vh;
}

/* 加载状态 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f3f3f3;
  border-top: 4rpx solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

  /* 顶部用户信息 */
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx 20rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20rpx;
    margin: 20rpx;
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
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 10rpx;
  border-radius: 50%;
}

.notification-icon:active {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(0.9);
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
    margin: 0 20rpx 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;
  }

.overview-card:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.15);
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
  transition: all 0.3s ease;
  cursor: pointer;
  padding: 10rpx;
  border-radius: 10rpx;
}

.stat-item:active {
  background-color: #f0f2ff;
  transform: scale(0.95);
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
    margin: 0 20rpx 30rpx;
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

.time-text {
  font-size: 24rpx;
  color: #999;
}

  /* 快捷功能 */
  .quick-actions {
    background: white;
    border-radius: 20rpx;
    padding: 30rpx;
    margin: 0 20rpx 30rpx;
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
    margin: 0 20rpx 30rpx;
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
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 10rpx rgba(102, 126, 234, 0.3);
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
    margin: 0 20rpx 30rpx;
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
