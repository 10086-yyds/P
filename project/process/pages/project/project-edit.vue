<template>
  <view class="project-edit-container">
    <!-- 页面头部 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="header-title">
        <text>编辑项目</text>
      </view>
      <view class="header-right">
        <text class="save-btn" @click="saveProject">保存</text>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <scroll-view class="content" scroll-y="true">
      <!-- 项目基本信息 -->
      <view class="section">
        <view class="section-title">
          <text>基本信息</text>
        </view>
        <view class="form-item">
          <text class="label">项目名称</text>
          <view class="readonly-field">{{ projectInfo.name || '暂无' }}</view>
        </view>
        <view class="form-item">
          <text class="label">项目描述</text>
          <view class="readonly-field">{{ projectInfo.description || '暂无' }}</view>
        </view>
      </view>

      <!-- 项目进度 -->
      <view class="section">
        <view class="section-title">
          <text>项目进度</text>
        </view>
        <view class="progress-section">
          <view class="progress-display">
            <text class="progress-text">当前进度: {{ projectInfo.progress }}%</text>
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: projectInfo.progress + '%' }"></view>
            </view>
          </view>
          <slider 
            class="progress-slider" 
            :value="projectInfo.progress" 
            @change="onProgressChange"
            min="0" 
            max="100" 
            step="5"
            activeColor="#667eea"
            backgroundColor="#f0f0f0"
          />
        </view>
      </view>

      <!-- 项目状态 -->
      <view class="section">
        <view class="section-title">
          <text>项目状态</text>
        </view>
        <view class="status-grid">
          <view 
            class="status-item" 
            :class="{ active: projectInfo.status === status.value }"
            v-for="status in statusOptions" 
            :key="status.value"
            @click="selectStatus(status.value)"
          >
            <text class="status-icon">{{ status.icon }}</text>
            <text class="status-text">{{ status.label }}</text>
          </view>
        </view>
      </view>

      <!-- 任务优先级 -->
      <view class="section">
        <view class="section-title">
          <text>任务优先级</text>
        </view>
        <view class="priority-grid">
          <view 
            class="priority-item" 
            :class="{ active: projectInfo.priority === priority.value }"
            v-for="priority in priorityOptions" 
            :key="priority.value"
            @click="selectPriority(priority.value)"
          >
            <text class="priority-icon">{{ priority.icon }}</text>
            <text class="priority-text">{{ priority.label }}</text>
          </view>
        </view>
      </view>

      <!-- 项目图片 -->
      <view class="section">
        <view class="section-title">
          <text>项目图片</text>
        </view>
        <view class="image-section">
          <view class="image-list">
            <view 
              class="image-item" 
              v-for="(image, index) in projectImages" 
              :key="index"
            >
              <image class="project-image" :src="image" mode="aspectFill" />
              <view class="image-delete" @click="deleteImage(index)">
                <text class="delete-icon">×</text>
              </view>
            </view>
            <view class="add-image-btn" @click="addImage" v-if="projectImages.length < 5">
              <text class="add-icon">+</text>
              <text class="add-text">添加图片</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 项目类型 -->
      <view class="section">
        <view class="section-title">
          <text>项目类型</text>
        </view>
        <view class="readonly-field">
          <text class="type-display">{{ getTypeText(projectInfo.type) }}</text>
        </view>
      </view>

      <!-- 外部合作方 -->
      <view class="section">
        <view class="section-title">
          <text>外部合作方</text>
        </view>
        <view class="partners-section">
          <view class="partner-list" v-if="projectInfo.externalPartners && projectInfo.externalPartners.length > 0">
            <view 
              class="partner-item readonly-partner" 
              v-for="(partner, index) in projectInfo.externalPartners" 
              :key="index"
            >
              <text class="partner-name">{{ partner }}</text>
            </view>
          </view>
          <view class="no-partners" v-else>
            <text class="no-partners-text">暂无外部合作方</text>
          </view>
        </view>
      </view>
    </scroll-view>


  </view>
</template>

<script>
import { API_CONFIG } from "../../config/api.js";

export default {
  data() {
    return {
      projectId: '',
      projectInfo: {
        name: '',
        description: '',
        progress: 0,
        status: 'planning',
        priority: 1,
        type: 'development',
        externalPartners: []
      },
      projectImages: [],
      
      // 状态选项
      statusOptions: [
        { value: 'planning', label: '规划中', icon: '📋' },
        { value: 'ongoing', label: '进行中', icon: '🚀' },
        { value: 'completed', label: '已完成', icon: '✅' },
        { value: 'paused', label: '已暂停', icon: '⏸️' },
        { value: 'cancelled', label: '已取消', icon: '❌' }
      ],
      
      // 优先级选项
      priorityOptions: [
        { value: 1, label: '低', icon: '🟢' },
        { value: 2, label: '中', icon: '🟡' },
        { value: 3, label: '高', icon: '🟠' },
        { value: 4, label: '紧急', icon: '🔴' }
      ],
      
      // 类型选项
      typeOptions: [
        { value: 'development', label: '开发', icon: '🏗️' },
        { value: 'software', label: '软件', icon: '💻' },
        { value: 'infrastructure', label: '基础设施', icon: '🏢' },
        { value: 'research', label: '研究', icon: '🔬' },
        { value: 'design', label: '设计', icon: '🎨' }
      ]
    };
  },
  
  onLoad(options) {
    console.log('项目编辑页面加载', options);
    if (options.id) {
      this.projectId = options.id;
      this.loadProjectInfo();
    }
  },
  
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1
      });
    },
    
    // 加载项目信息
    async loadProjectInfo() {
      try {
        uni.showLoading({
          title: '加载中...'
        });
        
        const result = await uni.request({
          url: `${API_CONFIG.BASE_URL}/lz/api/projects/${this.projectId}`,
          method: 'GET',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`
          }
        });
        
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
          let projectData;
          if (response.data.success && response.data.data) {
            projectData = response.data.data;
          } else {
            projectData = response.data;
          }
          
          this.projectInfo = {
            name: projectData.name || '',
            description: projectData.description || '',
            progress: projectData.progress || 0,
            status: projectData.status || 'planning',
            priority: projectData.priority || 1,
            type: projectData.type || 'development',
            externalPartners: projectData.externalPartners || []
          };
          
          // 加载项目图片（如果有的话）
          if (projectData.images && Array.isArray(projectData.images)) {
            this.projectImages = projectData.images;
          }
          
          console.log('项目信息加载完成:', this.projectInfo);
        } else {
          throw new Error(`API请求失败: ${response.statusCode}`);
        }
      } catch (error) {
        console.error('加载项目信息失败:', error);
        uni.showToast({
          title: '加载失败',
          icon: 'error'
        });
      } finally {
        uni.hideLoading();
      }
    },
    
    // 进度变化
    onProgressChange(e) {
      this.projectInfo.progress = e.detail.value;
    },
    
    // 选择状态
    selectStatus(status) {
      this.projectInfo.status = status;
    },
    
    // 选择优先级
    selectPriority(priority) {
      this.projectInfo.priority = priority;
    },
    
    // 获取类型文本
    getTypeText(type) {
      const typeOption = this.typeOptions.find(option => option.value === type);
      return typeOption ? typeOption.label : '未知类型';
    },
    
    // 添加图片
    addImage() {
      uni.chooseImage({
        count: 5 - this.projectImages.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.projectImages = this.projectImages.concat(res.tempFilePaths);
        },
        fail: (error) => {
          console.error('选择图片失败:', error);
          uni.showToast({
            title: '选择图片失败',
            icon: 'error'
          });
        }
      });
    },
    
    // 删除图片
    deleteImage(index) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这张图片吗？',
        success: (res) => {
          if (res.confirm) {
            this.projectImages.splice(index, 1);
          }
        }
      });
    },
    

    
    // 保存项目
    async saveProject() {
      try {
        
        uni.showLoading({
          title: '保存中...'
        });
        
        // 准备保存的数据
        const saveData = {
          ...this.projectInfo,
          images: this.projectImages
        };
        
        console.log('准备保存的数据:', saveData);
        
        const result = await uni.request({
          url: `${API_CONFIG.BASE_URL}/lz/api/projects/${this.projectId}`,
          method: 'PUT',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`
          },
          data: saveData
        });
        
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
        
        if (response.statusCode === 200 || response.statusCode === 201) {
          uni.hideLoading();
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          });
          
          // 返回上一页
          setTimeout(() => {
            uni.navigateBack({
              delta: 1
            });
          }, 1500);
        } else {
          throw new Error(`保存失败: ${response.statusCode}`);
        }
      } catch (error) {
        console.error('保存项目失败:', error);
        uni.hideLoading();
        uni.showToast({
          title: '保存失败',
          icon: 'error'
        });
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
.project-edit-container {
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

.save-btn {
  font-size: 28rpx;
  font-weight: bold;
}

/* 内容区域 */
.content {
  padding: 30rpx;
  height: calc(100vh - 100rpx);
}

/* 区块样式 */
.section {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

/* 表单样式 */
.form-item {
  margin-bottom: 30rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 15rpx;
  font-weight: 500;
}

.input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  background: #fafafa;
}

.textarea {
  width: 100%;
  height: 120rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background: #fafafa;
}

/* 进度样式 */
.progress-section {
  margin-bottom: 20rpx;
}

.progress-display {
  margin-bottom: 20rpx;
}

.progress-text {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 15rpx;
}

.progress-bar {
  width: 100%;
  height: 12rpx;
  background-color: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-slider {
  width: 100%;
}

/* 状态网格 */
.status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 15rpx;
  background: #fafafa;
  transition: all 0.3s ease;
  cursor: pointer;
}

.status-item.active {
  border-color: #667eea;
  background: #f0f4ff;
}

.status-icon {
  font-size: 48rpx;
  margin-bottom: 10rpx;
}

.status-text {
  font-size: 24rpx;
  color: #333;
}

/* 优先级网格 */
.priority-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15rpx;
}

.priority-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25rpx 15rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  background: #fafafa;
  transition: all 0.3s ease;
  cursor: pointer;
}

.priority-item.active {
  border-color: #667eea;
  background: #f0f4ff;
}

.priority-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.priority-text {
  font-size: 22rpx;
  color: #333;
}

/* 类型网格 */
.type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 15rpx;
  background: #fafafa;
  transition: all 0.3s ease;
  cursor: pointer;
}

.type-item.active {
  border-color: #667eea;
  background: #f0f4ff;
}

.type-icon {
  font-size: 48rpx;
  margin-bottom: 10rpx;
}

.type-text {
  font-size: 24rpx;
  color: #333;
}

/* 图片样式 */
.image-section {
  margin-bottom: 20rpx;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.image-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
}

.project-image {
  width: 100%;
  height: 100%;
  border-radius: 10rpx;
}

.image-delete {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  background: #ff4757;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.delete-icon {
  color: white;
  font-size: 24rpx;
  font-weight: bold;
}

.add-image-btn {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #ccc;
  border-radius: 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-image-btn:active {
  border-color: #667eea;
  background: #f0f4ff;
}

.add-icon {
  font-size: 48rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.add-text {
  font-size: 24rpx;
  color: #999;
}

/* 只读字段样式 */
.readonly-field {
  width: 100%;
  min-height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background: #f8f9fa;
  color: #666;
  display: flex;
  align-items: center;
}

.type-display {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.readonly-partner {
  background: #f8f9fa !important;
  border: 2rpx solid #e0e0e0;
}

.readonly-partner .partner-name {
  color: #666;
}

.no-partners {
  padding: 40rpx;
  text-align: center;
}

.no-partners-text {
  font-size: 28rpx;
  color: #999;
}

/* 合作方样式 */
.partners-section {
  margin-bottom: 20rpx;
}

.partner-list {
  margin-bottom: 20rpx;
}

.partner-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background: #f8f9ff;
  border-radius: 10rpx;
  margin-bottom: 15rpx;
}

.partner-name {
  font-size: 28rpx;
  color: #333;
}

.partner-delete {
  font-size: 32rpx;
  color: #ff4757;
  cursor: pointer;
  font-weight: bold;
}

.add-partner {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border: 2rpx dashed #ccc;
  border-radius: 10rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-partner:active {
  border-color: #667eea;
  background: #f0f4ff;
}


</style>
