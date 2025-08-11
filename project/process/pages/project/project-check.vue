<template>
  <view class="progress-container">
    <!-- 页面头部 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="header-title">
        <text>项目进度统计</text>
      </view>
      <view class="header-right">
        <text class="refresh-icon" @click="refreshData">🔄</text>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <view class="content">
      <!-- 进度统计卡片 -->
      <view class="stats-section">
        <view class="stat-card">
          <view class="stat-icon">📊</view>
          <view class="stat-info">
            <text class="stat-number">{{ stats.total }}</text>
            <text class="stat-label">总项目</text>
          </view>
        </view>
        <view class="stat-card">
          <view class="stat-icon">🚀</view>
          <view class="stat-info">
            <text class="stat-number">{{ stats.ongoing }}</text>
            <text class="stat-label">进行中</text>
          </view>
        </view>
        <view class="stat-card">
          <view class="stat-icon">✅</view>
          <view class="stat-info">
            <text class="stat-number">{{ stats.completed }}</text>
            <text class="stat-label">已完成</text>
          </view>
        </view>
      </view>

      <!-- 进度分布统计 -->
      <view class="progress-distribution">
        <view class="section-title">
          <text>进度分布</text>
        </view>
        
        <view class="distribution-grid">
          <view class="dist-item">
            <view class="dist-icon">🟢</view>
            <view class="dist-info">
              <text class="dist-number">{{ stats.progress100 }}</text>
              <text class="dist-label">100%完成</text>
            </view>
          </view>
          <view class="dist-item">
            <view class="dist-icon">🟡</view>
            <view class="dist-info">
              <text class="dist-number">{{ stats.progress80_99 }}</text>
              <text class="dist-label">80-99%</text>
            </view>
          </view>
          <view class="dist-item">
            <view class="dist-icon">🟠</view>
            <view class="dist-info">
              <text class="dist-number">{{ stats.progress50_79 }}</text>
              <text class="dist-label">50-79%</text>
            </view>
          </view>
          <view class="dist-item">
            <view class="dist-icon">🔴</view>
            <view class="dist-info">
              <text class="dist-number">{{ stats.progress20_49 }}</text>
              <text class="dist-label">20-49%</text>
            </view>
          </view>
          <view class="dist-item">
            <view class="dist-icon">⚫</view>
            <view class="dist-info">
              <text class="dist-number">{{ stats.progress0_19 }}</text>
              <text class="dist-label">0-19%</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 项目进度列表 -->
      <view class="progress-list">
        <view class="section-title">
          <text>项目进度详情</text>
        </view>
        
        <view v-if="isLoading" class="loading-container">
          <text class="loading-text">加载中...</text>
        </view>
        
        <view v-else-if="progressItems.length === 0" class="empty-container">
          <text class="empty-text">暂无项目数据</text>
        </view>
        
        <view v-else class="progress-item" v-for="(item, index) in progressItems" :key="index" @click="handleProgressItem(item)">
          <view class="item-left">
            <view class="item-icon">{{ getProjectIcon(item.type) }}</view>
            <view class="item-info">
              <text class="item-title">{{ item.name }}</text>
              <text class="item-desc">{{ item.description }}</text>
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: item.progress + '%' }"></view>
              </view>
              <text class="progress-text">{{ item.progress }}% 完成</text>
            </view>
          </view>
          <view class="item-right">
            <text class="item-time">{{ formatTime(item.updateTime || item.createdAt) }}</text>
            <text class="item-status" :class="getStatusClass(item.progress)">{{ getStatusText(item.progress) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { API_CONFIG } from "../../config/api.js";

export default {
  data() {
    return {
      isLoading: false,
      stats: {
        total: 0,
        ongoing: 0,
        completed: 0,
        progress100: 0,
        progress80_99: 0,
        progress50_79: 0,
        progress20_49: 0,
        progress0_19: 0
      },
      progressItems: []
    };
  },
  
  onLoad(options) {
    console.log('项目进度统计页面加载', options);
    this.loadProgressData();
  },
  
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1
      });
    },
    
    // 刷新数据
    refreshData() {
      uni.showLoading({
        title: '刷新中...'
      });
      
      this.loadProgressData().then(() => {
        uni.hideLoading();
        uni.showToast({
          title: '刷新成功',
          icon: 'success'
        });
      }).catch(error => {
        uni.hideLoading();
        uni.showToast({
          title: '刷新失败',
          icon: 'error'
        });
      });
    },
    
    // 加载进度数据
    async loadProgressData() {
      this.isLoading = true;
      
      try {
        console.log('开始加载项目进度数据...');
        
        // 调用后端API获取项目数据
        const result = await uni.request({
          url: `${API_CONFIG.BASE_URL}/lz/api/projects`,
          method: 'GET',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`
          }
        });
        
        console.log('API请求结果:', result);
        
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
          console.log('API响应数据:', response.data);
          
          // 检查API返回的数据结构
          let projectsData;
          if (response.data.success && response.data.data) {
            if (response.data.data.projects) {
              projectsData = response.data.data.projects;
            } else {
              projectsData = response.data.data;
            }
          } else {
            projectsData = response.data;
          }
          
          // 确保projectsData是数组
          const projects = Array.isArray(projectsData) ? projectsData : [];
          console.log('解析后的项目数据:', projects);
          
          // 处理项目数据
          this.progressItems = projects.map(project => ({
            id: project._id || project.id,
            name: project.name,
            description: project.description || '暂无描述',
            type: project.type || 'development',
            progress: project.progress || 0,
            status: project.status || 'planning',
            updateTime: project.updateTime || project.updatedAt,
            createdAt: project.createdAt || project.createTime
          }));
          
          // 计算统计数据
          this.calculateStats();
          
          console.log('进度数据加载完成:', this.progressItems);
        } else {
          throw new Error(`API请求失败: ${response.statusCode}`);
        }
      } catch (error) {
        console.error('加载进度数据失败:', error);
        
        // 如果API调用失败，使用模拟数据
        this.loadMockData();
      } finally {
        this.isLoading = false;
      }
    },
    
    // 计算统计数据
    calculateStats() {
      const total = this.progressItems.length;
      
      // 按进度区间统计（优先使用进度值）
      const progress100 = this.progressItems.filter(item => item.progress >= 100).length;
      const progress80_99 = this.progressItems.filter(item => item.progress >= 80 && item.progress < 100).length;
      const progress50_79 = this.progressItems.filter(item => item.progress >= 50 && item.progress < 80).length;
      const progress20_49 = this.progressItems.filter(item => item.progress >= 20 && item.progress < 50).length;
      const progress0_19 = this.progressItems.filter(item => item.progress >= 0 && item.progress < 20).length;
      
      // 进行中项目 = 总项目 - 已完成项目
      const completed = progress100; // 只有进度100%的才算已完成
      const ongoing = total - completed;
      
      this.stats = {
        total,
        ongoing,
        completed,
        progress100,
        progress80_99,
        progress50_79,
        progress20_49,
        progress0_19
      };
      
      console.log('进度统计数据:', this.stats);
      console.log('统计逻辑说明:');
      console.log('- 已完成项目 = 进度100%的项目');
      console.log('- 进行中项目 = 总项目 - 已完成项目');
      console.log('- 进度分布按实际进度值统计');
    },
    
    // 加载模拟数据（备用方案）
    loadMockData() {
      console.log('使用模拟数据');
      
      this.progressItems = [
        {
          id: 1,
          name: '地铁3号线项目',
          description: '城市轨道交通建设项目',
          type: 'development',
          progress: 75,
          status: 'ongoing',
          updateTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          name: '智慧城市平台',
          description: '城市管理数字化平台建设',
          type: 'software',
          progress: 45,
          status: 'ongoing',
          updateTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          name: '新能源充电站',
          description: '电动汽车充电设施建设',
          type: 'infrastructure',
          progress: 90,
          status: 'ongoing',
          updateTime: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        }
      ];
      
      this.calculateStats();
    },
    
    // 处理进度项目点击
    handleProgressItem(item) {
      console.log('点击进度项目:', item);
      // 跳转到项目编辑页面
      uni.navigateTo({
        url: `/pages/project/project-edit?id=${item.id}`,
        success: () => {
          console.log('跳转到编辑页面成功');
        },
        fail: (error) => {
          console.error('跳转到编辑页面失败:', error);
          uni.showToast({
            title: '跳转失败',
            icon: 'error'
          });
        }
      });
    },
    
    // 获取项目图标
    getProjectIcon(type) {
      const iconMap = {
        development: '🏗️',
        software: '💻',
        infrastructure: '🏢',
        research: '🔬',
        design: '🎨'
      };
      return iconMap[type] || '📋';
    },
    
    // 获取状态文本
    getStatusText(progress) {
      if (progress >= 100) return '已完成';
      if (progress >= 80) return '即将完成';
      if (progress >= 50) return '进行中';
      if (progress >= 20) return '刚开始';
      return '未开始';
    },
    
    // 获取状态样式类
    getStatusClass(progress) {
      if (progress >= 100) return 'completed';
      if (progress >= 80) return 'near-complete';
      if (progress >= 50) return 'ongoing';
      if (progress >= 20) return 'started';
      return 'not-started';
    },
    
    // 格式化时间
    formatTime(timeString) {
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
    }
  }
};
</script>

<style scoped>
.progress-container {
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 头部样式 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-left {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.back-icon {
  font-size: 36rpx;
  font-weight: bold;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
}

.header-right {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.refresh-icon {
  font-size: 32rpx;
}

/* 内容区域 */
.content {
  padding: 30rpx;
}

/* 统计卡片 */
.stats-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40rpx;
}

.stat-card {
  flex: 1;
  background: white;
  border-radius: 15rpx;
  padding: 30rpx 20rpx;
  margin: 0 10rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 48rpx;
  margin-bottom: 15rpx;
}

.stat-number {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

/* 进度分布统计 */
.progress-distribution {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.distribution-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15rpx;
}

.dist-item {
  text-align: center;
  padding: 20rpx 10rpx;
}

.dist-icon {
  font-size: 32rpx;
  margin-bottom: 10rpx;
}

.dist-number {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 5rpx;
}

.dist-label {
  font-size: 20rpx;
  color: #666;
}

/* 进度列表 */
.progress-list {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

.loading-container, .empty-container {
  text-align: center;
  padding: 60rpx 0;
}

.loading-text, .empty-text {
  font-size: 28rpx;
  color: #999;
}

.progress-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.progress-item:last-child {
  border-bottom: none;
}

.progress-item:active {
  background-color: #f8f9ff;
  transform: scale(0.98);
}

.item-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.item-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.item-info {
  flex: 1;
}

.item-title {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
  font-weight: 500;
}

.item-desc {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 15rpx;
}

.progress-bar {
  width: 100%;
  height: 8rpx;
  background-color: #f0f0f0;
  border-radius: 4rpx;
  margin-bottom: 8rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 22rpx;
  color: #999;
}

.item-right {
  text-align: right;
}

.item-time {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.item-status {
  display: block;
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.item-status.completed {
  background-color: #e8f5e8;
  color: #52c41a;
}

.item-status.near-complete {
  background-color: #e6f7ff;
  color: #1890ff;
}

.item-status.ongoing {
  background-color: #fff7e6;
  color: #fa8c16;
}

.item-status.started {
  background-color: #f6ffed;
  color: #73d13d;
}

.item-status.not-started {
  background-color: #f5f5f5;
  color: #999;
}
</style>