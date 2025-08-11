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
          
          <!-- 进度状态提示 -->
          <view class="progress-status-tip" v-if="projectInfo.progress >= 100">
            <text class="tip-text">🎉 项目进度100%，将自动标记为已完成</text>
          </view>
          <view class="progress-status-tip" v-else-if="projectInfo.progress >= 80">
            <text class="tip-text">🚀 项目即将完成，继续加油！</text>
          </view>
          <view class="progress-status-tip" v-else-if="projectInfo.progress >= 50">
            <text class="tip-text">📈 项目进展良好，保持进度</text>
          </view>
          <view class="progress-status-tip" v-else-if="projectInfo.progress >= 20">
            <text class="tip-text">🔄 项目正在起步，稳步推进</text>
          </view>
          <view class="progress-status-tip" v-else>
            <text class="tip-text">📋 项目刚刚开始，制定计划</text>
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
        
        <!-- 调试信息 -->
        <view class="debug-info" style="background: #f0f0f0; padding: 10rpx; margin: 10rpx 0; border-radius: 8rpx;">
          <text style="font-size: 24rpx; color: #666;">调试信息: 图片数量: {{ projectImages.length }}, 类型: {{ Array.isArray(projectImages) ? '数组' : typeof projectImages }}</text>
        </view>
        
        <view class="image-section">
          <view class="image-list">
            <view 
              class="image-item" 
              v-for="(image, index) in projectImages" 
              :key="index"
            >
              <image 
                class="project-image" 
                :src="image" 
                mode="aspectFill"
                @error="onImageError(index)"
                @load="onImageLoad(index)"
              />
              <view class="image-delete" @click="deleteImage(index)">
                <text class="delete-icon">×</text>
              </view>
            </view>
            
            <!-- 添加图片按钮 -->
            <view class="add-image-btn" @click="addImage" v-if="projectImages.length < 9">
              <text class="add-icon">+</text>
              <text class="add-text">添加图片</text>
            </view>
            
            <!-- 空状态提示 -->
            <view class="empty-images" v-if="projectImages.length === 0" style="text-align: center; padding: 40rpx; color: #999;">
              <text style="font-size: 28rpx;">暂无项目图片</text>
              <text style="font-size: 24rpx; display: block; margin-top: 10rpx;">点击下方按钮添加图片</text>
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
    console.log('初始 projectImages:', this.projectImages);
    
    if (options.id) {
      this.projectId = options.id;
      this.loadProjectInfo();
      
      // 延迟测试图片选择功能（仅用于调试）
      setTimeout(() => {
        console.log('延迟测试：检查 projectImages 状态');
        console.log('延迟后 projectImages:', this.projectImages);
        console.log('延迟后类型:', typeof this.projectImages);
        console.log('延迟后是否为数组:', Array.isArray(this.projectImages));
      }, 2000);
    } else {
      console.error('没有传入项目ID');
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
          
          // 根据进度自动调整状态，确保数据一致性
          console.log('=== 进度状态一致性检查 ===');
          console.log('项目进度:', this.projectInfo.progress, '%');
          console.log('项目状态:', this.projectInfo.status);
          
          if (this.projectInfo.progress >= 100 && this.projectInfo.status !== 'completed') {
            // 进度100%但状态不是已完成，自动修正
            this.projectInfo.status = 'completed';
            console.log('✅ 进度100%，自动修正状态为已完成');
          } else if (this.projectInfo.progress < 100 && this.projectInfo.status === 'completed') {
            // 进度未达100%但状态是已完成，自动修正
            this.projectInfo.status = 'ongoing';
            console.log('⚠️ 进度未达100%，自动修正状态为进行中');
          }
          
          console.log('修正后的状态:', this.projectInfo.status);
          
          // 添加状态值调试信息
          console.log('=== 状态值调试信息 ===');
          console.log('后端返回的原始状态值:', projectData.status);
          console.log('后端返回的状态值类型:', typeof projectData.status);
          console.log('设置后的状态值:', this.projectInfo.status);
          console.log('设置后的状态值类型:', typeof this.projectInfo.status);
          console.log('前端定义的状态选项:', this.statusOptions);
          console.log('状态值是否在允许列表中:', this.statusOptions.some(s => s.value === this.projectInfo.status));
          console.log('匹配的状态选项:', this.statusOptions.find(s => s.value === this.projectInfo.status));
          
          // 加载项目图片（如果有的话）
          console.log('=== 开始处理项目图片数据 ===');
          console.log('原始 projectData.images:', projectData.images);
          console.log('projectData.images 类型:', typeof projectData.images);
          console.log('projectData.images 是否为数组:', Array.isArray(projectData.images));
          
          if (projectData.images && Array.isArray(projectData.images)) {
            // 处理图片数据，可能是对象数组或字符串数组
            console.log('✅ 检测到数组格式的图片数据');
            
            if (projectData.images.length > 0) {
              // 检查第一个元素是对象还是字符串
              const firstImage = projectData.images[0];
              console.log('第一个图片元素:', firstImage);
              console.log('第一个图片元素类型:', typeof firstImage);
              
              if (typeof firstImage === 'object' && firstImage !== null) {
                // 如果是对象数组，提取 url 字段
                console.log('🔄 检测到对象格式图片数据，转换为字符串数组');
                this.projectImages = projectData.images.map(img => {
                  if (img && typeof img === 'object' && img.url) {
                    return img.url;
                  } else if (typeof img === 'string') {
                    return img;
                  } else {
                    console.warn('无效的图片对象:', img);
                    return null;
                  }
                }).filter(url => url !== null);
                
                console.log('转换后的图片URL数组:', this.projectImages);
              } else if (typeof firstImage === 'string') {
                // 如果已经是字符串数组，直接使用
                console.log('✅ 直接使用字符串格式的图片数据');
                this.projectImages = projectData.images;
              } else {
                console.warn('⚠️ 图片数据格式未知，初始化为空数组');
                this.projectImages = [];
              }
            } else {
              this.projectImages = [];
            }
            
            console.log('处理后的图片数量:', this.projectImages.length);
          } else if (projectData.images && typeof projectData.images === 'string') {
            // 如果 images 是字符串，尝试解析为数组
            console.log('🔄 检测到字符串格式的图片数据，尝试解析');
            try {
              const parsedImages = JSON.parse(projectData.images);
              console.log('解析结果:', parsedImages);
              console.log('解析结果类型:', typeof parsedImages);
              console.log('解析结果是否为数组:', Array.isArray(parsedImages));
              
              if (Array.isArray(parsedImages)) {
                // 同样需要处理对象格式
                if (parsedImages.length > 0 && typeof parsedImages[0] === 'object') {
                  this.projectImages = parsedImages.map(img => img.url || '').filter(url => url);
                } else {
                  this.projectImages = parsedImages;
                }
                console.log('✅ 成功解析并处理字符串为数组:', this.projectImages);
                console.log('解析后图片数量:', this.projectImages.length);
              } else {
                this.projectImages = [];
                console.log('⚠️ 解析的图片数据不是数组，初始化为空数组');
              }
            } catch (e) {
              console.log('❌ 图片数据解析失败:', e);
              console.log('错误详情:', e.message);
              this.projectImages = [];
            }
          } else {
            // 确保 projectImages 是空数组
            this.projectImages = [];
            console.log('ℹ️ 项目没有图片数据，初始化为空数组');
          }
          
          // 最终验证 projectImages 是数组
          console.log('=== 最终验证 projectImages ===');
          console.log('最终 projectImages:', this.projectImages);
          console.log('最终类型:', typeof this.projectImages);
          console.log('最终是否为数组:', Array.isArray(this.projectImages));
          console.log('最终长度:', this.projectImages ? this.projectImages.length : 'undefined');
          
          if (!Array.isArray(this.projectImages)) {
            console.warn('⚠️ projectImages 不是数组，强制重置为空数组');
            this.projectImages = [];
          }
          
          // 验证图片数据的有效性
          if (Array.isArray(this.projectImages) && this.projectImages.length > 0) {
            console.log('=== 验证图片数据有效性 ===');
            const validImages = this.projectImages.filter(img => {
              const isValid = img && typeof img === 'string' && img.trim() !== '';
              if (!isValid) {
                console.warn('发现无效图片:', img);
              }
              return isValid;
            });
            
            if (validImages.length !== this.projectImages.length) {
              console.warn(`⚠️ 发现 ${this.projectImages.length - validImages.length} 个无效图片，已过滤`);
              this.projectImages = validImages;
            }
            
            // 处理图片URL，确保都是完整URL
            this.projectImages = this.projectImages.map(imgUrl => this.processImageUrl(imgUrl));
            console.log('处理后的完整图片URL:', this.projectImages);
            
            console.log('验证后的有效图片:', this.projectImages);
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
      const newProgress = e.detail.value;
      const oldProgress = this.projectInfo.progress;
      this.projectInfo.progress = newProgress;
      
      console.log('=== 进度变化 ===');
      console.log('旧进度:', oldProgress, '%');
      console.log('新进度:', newProgress, '%');
      console.log('变化量:', newProgress - oldProgress, '%');
      
      // 当进度达到100%时，自动标记项目为已完成
      if (newProgress === 100) {
        // 检查当前状态是否已经是已完成
        if (this.projectInfo.status !== 'completed') {
          this.projectInfo.status = 'completed';
          
          // 显示提示信息
          uni.showToast({
            title: '🎉 项目进度100%，已自动标记为已完成！',
            icon: 'success',
            duration: 3000
          });
          
          console.log('✅ 进度达到100%，自动标记项目为已完成');
        } else {
          console.log('项目状态已经是已完成，无需更改');
        }
      } else if (this.projectInfo.status === 'completed') {
        // 如果进度不是100%但状态是已完成，则改为进行中
        this.projectInfo.status = 'ongoing';
        
        uni.showToast({
          title: '⚠️ 进度未达100%，状态已改为进行中',
          icon: 'none',
          duration: 2000
        });
        
        console.log('⚠️ 进度未达100%，状态已改为进行中');
      }
      
      // 记录进度变化日志
      console.log('进度变化完成 - 新进度:', this.projectInfo.progress, '%, 新状态:', this.projectInfo.status);
    },
    
    // 选择状态
    selectStatus(status) {
      console.log('=== 选择状态 ===');
      console.log('选择的状态值:', status);
      console.log('选择的状态值类型:', typeof status);
      console.log('选择前的状态值:', this.projectInfo.status);
      console.log('选择前的状态值类型:', typeof this.projectInfo.status);
      
      this.projectInfo.status = status;
      
      console.log('选择后的状态值:', this.projectInfo.status);
      console.log('选择后的状态值类型:', typeof this.projectInfo.status);
      console.log('状态值是否在允许列表中:', this.statusOptions.some(s => s.value === this.projectInfo.status));
      console.log('匹配的状态选项:', this.statusOptions.find(s => s.value === this.projectInfo.status));
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
    
    // 测试图片功能
    testImageFunction() {
      console.log('测试图片功能被调用');
      console.log('当前 projectImages:', this.projectImages);
      console.log('projectImages 类型:', typeof this.projectImages);
      console.log('projectImages 是否为数组:', Array.isArray(this.projectImages));
      console.log('projectImages 长度:', this.projectImages ? this.projectImages.length : 'undefined');
      
      // 模拟添加一张测试图片
      const testImage = 'https://via.placeholder.com/150x150/667eea/ffffff?text=Test';
      if (Array.isArray(this.projectImages)) {
        this.projectImages.push(testImage);
        console.log('添加测试图片后:', this.projectImages);
        uni.showToast({
          title: '测试图片已添加',
          icon: 'success'
        });
      } else {
        console.error('projectImages 不是数组，无法添加测试图片');
        this.projectImages = [testImage];
        uni.showToast({
          title: '重置为数组并添加测试图片',
          icon: 'success'
        });
      }
    },

    // 检查组件状态（调试用）
    checkComponentState() {
      console.log('=== 组件状态检查 ===');
      console.log('组件实例:', this);
      console.log('data 属性:', this.$data);
      console.log('projectId:', this.projectId);
      console.log('projectInfo:', this.projectInfo);
      console.log('projectImages:', this.projectImages);
      console.log('projectImages 类型:', typeof this.projectImages);
      console.log('projectImages 是否为数组:', Array.isArray(this.projectImages));
      console.log('projectImages 长度:', this.projectImages ? this.projectImages.length : 'undefined');
      
      // 检查 Vue 响应式系统
      console.log('Vue 版本:', this.$options.version);
      console.log('组件名称:', this.$options.name);
      
      // 检查方法是否存在
      console.log('addImage 方法存在:', typeof this.addImage === 'function');
      console.log('deleteImage 方法存在:', typeof this.deleteImage === 'function');
      
      // 检查模板中的绑定
      console.log('模板中的 projectImages 绑定:', this.$el ? this.$el.querySelector('.image-list') : 'DOM 未渲染');
      
      // 强制更新视图
      this.$forceUpdate();
      console.log('已强制更新视图');
      
      uni.showToast({
        title: '状态检查完成，请查看控制台',
        icon: 'none',
        duration: 2000
      });
    },
    
    // 添加图片
    addImage() {
      console.log('=== 开始添加图片 ===');
      
      // 首先检查登录状态
      if (!this.checkAndPromptLogin()) {
        console.log('用户未登录，停止添加图片');
        return;
      }
      
      console.log('当前 projectImages 状态:', this.projectImages);
      console.log('当前 projectImages 类型:', typeof this.projectImages);
      console.log('当前 projectImages 长度:', this.projectImages ? this.projectImages.length : 'undefined');
      
      // 检查最大图片数量
      if (this.projectImages && this.projectImages.length >= 9) {
        uni.showToast({
          title: '最多只能添加9张图片',
          icon: 'none'
        });
        return;
      }
      
      // 确保 projectImages 是数组
      if (!Array.isArray(this.projectImages)) {
        this.projectImages = [];
        console.log('projectImages 不是数组，重置为空数组');
      }
      
      uni.chooseImage({
        count: 9 - (this.projectImages ? this.projectImages.length : 0),
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          console.log('图片选择成功:', res);
          console.log('选择的图片数量:', res.tempFilePaths.length);
          console.log('选择的图片路径:', res.tempFilePaths);
          
          if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            // 显示上传进度
            uni.showLoading({
              title: '上传图片中...'
            });
            
            try {
              // 逐个上传图片
              for (let i = 0; i < res.tempFilePaths.length; i++) {
                const imagePath = res.tempFilePaths[i];
                console.log(`开始上传第${i + 1}张图片:`, imagePath);
                
                // 上传图片到服务器
                try {
                  console.log(`准备上传第${i + 1}张图片:`, imagePath);
                  const uploadResult = await this.uploadImage(imagePath);
                  console.log(`第${i + 1}张图片上传结果:`, uploadResult);
                  
                  if (uploadResult && uploadResult.success) {
                    // 上传成功，添加到图片列表
                    this.projectImages.push(uploadResult.url);
                    console.log(`第${i + 1}张图片上传成功，已添加到列表:`, uploadResult.url);
                    console.log('当前图片列表长度:', this.projectImages.length);
                  } else {
                    // 上传失败，显示错误
                    const errorMsg = uploadResult ? uploadResult.message : '未知错误';
                    console.error(`第${i + 1}张图片上传失败:`, errorMsg);
                    uni.showToast({
                      title: `图片${i + 1}上传失败: ${errorMsg}`,
                      icon: 'none',
                      duration: 3000
                    });
                  }
                } catch (uploadError) {
                  console.error(`第${i + 1}张图片上传异常:`, uploadError);
                  uni.showToast({
                    title: `图片${i + 1}上传异常: ${uploadError.message || '未知错误'}`,
                    icon: 'none',
                    duration: 3000
                  });
                }
              }
              
              // 强制更新视图
              this.$forceUpdate();
              
              uni.hideLoading();
              uni.showToast({
                title: '图片添加完成',
                icon: 'success'
              });
              
              console.log('所有图片处理完成，当前 projectImages:', this.projectImages);
            } catch (error) {
              console.error('图片上传过程中发生错误:', error);
              uni.hideLoading();
              uni.showToast({
                title: '图片上传失败',
                icon: 'error'
              });
            }
          } else {
            console.log('没有选择图片');
            uni.showToast({
              title: '没有选择图片',
              icon: 'none'
            });
          }
        },
        fail: (error) => {
          console.error('❌ 图片选择失败:', error);
          console.error('错误详情:', error);
          
          // 根据错误类型提供更具体的提示
          let errorMessage = '图片选择失败';
          if (error.errMsg) {
            if (error.errMsg.includes('cancel')) {
              errorMessage = '用户取消选择';
            } else if (error.errMsg.includes('permission')) {
              errorMessage = '没有相机或相册权限，请在设置中开启';
            } else if (error.errMsg.includes('network')) {
              errorMessage = '网络连接失败，请检查网络';
            } else if (error.errMsg.includes('fail')) {
              errorMessage = '图片选择器启动失败';
            }
          }
          
          uni.showToast({
            title: errorMessage,
            icon: 'none',
            duration: 3000
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

    // 处理图片URL，将相对路径转换为完整URL
    processImageUrl(url) {
      if (!url) return '';
      
      // 如果已经是完整URL，直接返回
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      
      // 如果是相对路径，添加基础URL
      if (url.startsWith('/')) {
        return `${API_CONFIG.BASE_URL}${url}`;
      }
      
      // 其他情况，添加基础URL和斜杠
      return `${API_CONFIG.BASE_URL}/${url}`;
    },
    
    // 图片加载成功
    onImageLoad(index) {
      console.log(`图片加载成功: ${this.projectImages[index]}`);
    },

    // 图片加载失败
    onImageError(index) {
      const originalUrl = this.projectImages[index];
      console.error(`图片加载失败: ${originalUrl}`);
      
      // 尝试处理URL格式
      const processedUrl = this.processImageUrl(originalUrl);
      console.log(`尝试处理后的URL: ${processedUrl}`);
      
      if (processedUrl !== originalUrl) {
        // 如果URL被处理了，更新并重试
        this.projectImages[index] = processedUrl;
        console.log(`已更新图片URL: ${processedUrl}`);
        
        // 强制更新视图
        this.$forceUpdate();
        
        uni.showToast({
          title: '图片URL已修复，请重试',
          icon: 'none',
          duration: 2000
        });
      } else {
        // 如果URL已经是完整格式但仍然失败，显示错误提示
        this.projectImages[index] = 'https://via.placeholder.com/150x150/ff0000/ffffff?text=Error';
        uni.showToast({
          title: '图片加载失败，已替换为占位图',
          icon: 'none',
          duration: 2000
        });
      }
    },
    
    // 清空所有图片（测试用）
    clearAllImages() {
      uni.showModal({
        title: '确认清空',
        content: '确定要清空所有图片吗？',
        success: (res) => {
          if (res.confirm) {
            this.projectImages = [];
            console.log('已清空所有图片');
            uni.showToast({
              title: '已清空所有图片',
              icon: 'success'
            });
          }
        }
      });
    },
    
    // 手动触发图片选择器（测试用）
    manualTriggerImagePicker() {
      console.log('手动触发图片选择器');
      this.addImage();
    },

    // 简单图片选择测试
    testSimpleImagePicker() {
      console.log('简单图片选择测试被调用');
      uni.chooseImage({
        count: 1, // 只选择一张图片
        sizeType: ['original'], // 可以选择原图
        sourceType: ['album', 'camera'], // 可以从相册或相机选择
        success: (res) => {
          console.log('简单图片选择成功:', res);
          console.log('选择的图片路径:', res.tempFilePaths);
          if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            this.projectImages.push(res.tempFilePaths[0]);
            uni.showToast({
              title: '简单图片已添加',
              icon: 'success'
            });
            this.$forceUpdate(); // 强制更新视图
          } else {
            uni.showToast({
              title: '没有选择图片',
              icon: 'none'
            });
          }
        },
        fail: (error) => {
          console.error('简单图片选择失败:', error);
          uni.showToast({
            title: '简单图片选择失败',
            icon: 'none'
          });
        }
      });
    },

    // 测试图片数据格式转换
    testImageFormatConversion() {
      console.log('=== 测试图片数据格式转换 ===');
      console.log('当前 projectImages:', this.projectImages);
      
      if (this.projectImages && this.projectImages.length > 0) {
        // 模拟保存时的格式转换
        const convertedImages = this.projectImages.map((imgPath, index) => {
          return {
            id: index + 1,
            url: imgPath,
            name: `图片${index + 1}`,
            type: 'image',
            size: 0,
            uploadTime: new Date().toISOString()
          };
        });
        
        console.log('转换后的对象格式:', convertedImages);
        console.log('转换后的JSON字符串:', JSON.stringify(convertedImages, null, 2));
        
        uni.showToast({
          title: '格式转换测试完成，请查看控制台',
          icon: 'none',
          duration: 2000
        });
      } else {
        uni.showToast({
          title: '没有图片数据可测试',
          icon: 'none'
        });
      }
    },

    // 测试图片上传
    testImageUpload() {
      console.log('=== 测试图片上传 ===');
      console.log('当前 projectImages:', this.projectImages);
      if (this.projectImages && this.projectImages.length > 0) {
        const imagePath = this.projectImages[0]; // 假设上传第一张图片
        console.log('准备上传的图片路径:', imagePath);
        this.uploadImage(imagePath).then(result => {
          if (result.success) {
            uni.showToast({
              title: `图片上传成功: ${result.url}`,
              icon: 'success'
            });
            console.log('图片上传成功:', result);
          } else {
            uni.showToast({
              title: `图片上传失败: ${result.message}`,
              icon: 'none'
            });
            console.error('图片上传失败:', result);
          }
        }).catch(error => {
          console.error('图片上传异常:', error);
          uni.showToast({
            title: '图片上传失败',
            icon: 'error'
          });
        });
      } else {
        uni.showToast({
          title: '没有图片可供上传',
          icon: 'none'
        });
      }
    },
    
    // 测试简单上传（使用测试图片）
    async testSimpleUpload() {
      console.log('=== 测试简单上传 ===');
      
      // 创建一个测试图片URL（使用base64编码的简单图片）
      const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      try {
        console.log('开始测试上传...');
        uni.showLoading({
          title: '测试上传中...'
        });
        
        // 模拟上传过程
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 模拟上传成功
        const mockUploadResult = {
          success: true,
          url: 'https://via.placeholder.com/200x200/667eea/ffffff?text=Test+Upload'
        };
        
        console.log('模拟上传成功:', mockUploadResult);
        
        // 添加到图片列表
        if (Array.isArray(this.projectImages)) {
          this.projectImages.push(mockUploadResult.url);
          console.log('测试图片已添加到列表，当前长度:', this.projectImages.length);
          
          // 强制更新视图
          this.$forceUpdate();
          
          uni.hideLoading();
          uni.showToast({
            title: '测试上传成功',
            icon: 'success'
          });
        } else {
          throw new Error('projectImages 不是数组');
        }
      } catch (error) {
        console.error('测试上传失败:', error);
        uni.hideLoading();
        uni.showToast({
          title: `测试上传失败: ${error.message}`,
          icon: 'error'
        });
      }
    },
    
    // 上传图片到服务器
    async uploadImage(filePath) {
      try {
        console.log('=== 开始上传图片 ===');
        console.log('文件路径:', filePath);
        console.log('API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
        console.log('API_CONFIG.UPLOAD.UPLOAD_IMAGE:', API_CONFIG.UPLOAD.UPLOAD_IMAGE);
        console.log('完整上传URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.UPLOAD.UPLOAD_IMAGE}`);
        
        // 验证Token
        const token = this.getToken();
        console.log('用户Token:', token ? '已设置' : '未设置');
        if (!token) {
          console.error('❌ 用户未登录，无法上传图片');
          return {
            success: false,
            message: '用户未登录，请先登录'
          };
        }
        
        console.log('项目ID:', this.projectId);
        if (!this.projectId) {
          console.error('❌ 项目ID未设置，无法上传图片');
          return {
            success: false,
            message: '项目ID未设置'
          };
        }
        
        return new Promise((resolve, reject) => {
          const uploadTask = uni.uploadFile({
            url: `${API_CONFIG.BASE_URL}${API_CONFIG.UPLOAD.UPLOAD_IMAGE}`,
            filePath: filePath,
            name: 'image',
            header: {
              'Authorization': `Bearer ${token}`
            },
            formData: {
              projectId: this.projectId,
              timestamp: Date.now()
            },
            success: (res) => {
              console.log('图片上传成功响应:', res);
              console.log('响应状态码:', res.statusCode);
              console.log('响应数据:', res.data);
              
              try {
                const data = JSON.parse(res.data);
                console.log('解析后的上传响应:', data);
                
                // 修复响应数据验证逻辑
                if (data.success && data.data) {
                  // 检查是否有图片数据
                  if (data.data.images && Array.isArray(data.data.images) && data.data.images.length > 0) {
                    // 获取第一张图片的URL
                    const firstImage = data.data.images[0];
                    if (firstImage && firstImage.url) {
                      console.log('✅ 图片上传成功，获取到URL:', firstImage.url);
                      resolve({
                        success: true,
                        url: firstImage.url
                      });
                    } else {
                      console.error('❌ 图片数据中缺少URL字段:', firstImage);
                      resolve({
                        success: false,
                        message: '图片数据格式错误，缺少URL'
                      });
                    }
                  } else if (data.data.url) {
                    // 兼容旧格式：直接返回url字段
                    console.log('✅ 图片上传成功，获取到URL:', data.data.url);
                    resolve({
                      success: true,
                      url: data.data.url
                    });
                  } else {
                    console.error('❌ 响应数据中缺少图片信息:', data.data);
                    resolve({
                      success: false,
                      message: '响应数据中缺少图片信息'
                    });
                  }
                } else {
                  console.error('❌ 上传响应格式错误:', data);
                  resolve({
                    success: false,
                    message: data.message || '上传失败，响应格式错误'
                  });
                }
              } catch (parseError) {
                console.error('❌ 解析上传响应失败:', parseError);
                console.error('原始响应数据:', res.data);
                resolve({
                  success: false,
                  message: '服务器响应格式错误'
                });
              }
            },
            fail: (error) => {
              console.error('❌ 图片上传失败:', error);
              console.error('错误详情:', error);
              reject({
                success: false,
                message: error.errMsg || '网络上传失败'
              });
            }
          });
          
          // 监听上传进度（添加平台检查）
          try {
            if (uploadTask.onProgressUpdate && typeof uploadTask.onProgressUpdate === 'function') {
              uploadTask.onProgressUpdate((res) => {
                console.log(`上传进度: ${res.progress}%`);
              });
            } else {
              console.log('当前平台不支持 onProgressUpdate 方法');
            }
          } catch (error) {
            console.log('onProgressUpdate 方法调用失败，继续上传流程');
          }
          
          // 监听上传任务状态（添加平台检查）
          try {
            if (uploadTask.onHeadersReceived && typeof uploadTask.onHeadersReceived === 'function') {
              uploadTask.onHeadersReceived((res) => {
                console.log('收到响应头:', res);
              });
            } else {
              console.log('当前平台不支持 onHeadersReceived 方法');
            }
          } catch (error) {
            console.log('onHeadersReceived 方法调用失败，继续上传流程');
          }
        });
      } catch (error) {
        console.error('❌ 图片上传异常:', error);
        return {
          success: false,
          message: error.message || '上传异常'
        };
      }
    },

    
    // 保存项目
    async saveProject() {
      try {
        console.log('开始保存项目，当前图片数据:', this.projectImages);
        
        uni.showLoading({
          title: '保存中...'
        });
        
        // 确保 projectImages 是数组
        if (!Array.isArray(this.projectImages)) {
          this.projectImages = [];
          console.log('projectImages 不是数组，重置为空数组');
        }
        
                // 准备保存的数据
        const saveData = {
          ...this.projectInfo,
          images: []
        };

        // 验证并转换图片数据格式
        if (this.projectImages && this.projectImages.length > 0) {
          // 过滤掉无效的图片URL并转换为对象格式
          const validImages = this.projectImages.filter(img => {
            return img && typeof img === 'string' && img.trim() !== '';
          }).map((imgUrl, index) => {
            // 转换为后端期望的对象格式
            return {
              id: index + 1, // 图片ID
              url: imgUrl,    // 图片URL（现在已经是真实的服务器URL）
              name: `图片${index + 1}`, // 图片名称
              type: 'image',  // 图片类型
              size: 0,        // 图片大小（暂时设为0）
              uploadTime: new Date().toISOString() // 上传时间
            };
          });
          
          if (validImages.length !== this.projectImages.length) {
            console.warn('发现无效图片URL，已过滤');
            this.projectImages = validImages.map(img => img.url); // 更新本地数组
          }
          
          saveData.images = validImages;
          console.log('转换后的图片数据格式:', validImages);
        }
        
        console.log('准备保存的数据:', saveData);
        console.log('图片数组长度:', saveData.images.length);
        console.log('图片数据格式示例:', saveData.images[0]);
        console.log('发送给后端的完整图片数据:', JSON.stringify(saveData.images, null, 2));
        
        // 根据进度自动调整项目状态
        console.log('=== 进度状态自动调整 ===');
        console.log('当前进度:', saveData.progress);
        console.log('当前状态:', saveData.status);
        
        if (saveData.progress >= 100) {
          // 进度达到100%，自动标记为已完成
          if (saveData.status !== 'completed') {
            saveData.status = 'completed';
            console.log('进度100%，自动将状态改为已完成');
            
            // 显示提示信息
            uni.showToast({
              title: '项目进度100%，已自动标记为已完成',
              icon: 'success',
              duration: 2000
            });
          }
        } else if (saveData.status === 'completed') {
          // 进度未达100%但状态是已完成，改为进行中
          saveData.status = 'ongoing';
          console.log('进度未达100%，状态已改为进行中');
          
          uni.showToast({
            title: '进度未达100%，状态已改为进行中',
            icon: 'none',
            duration: 2000
          });
        }
        
        console.log('调整后的状态:', saveData.status);
        
        // 添加状态值验证和调试
        console.log('=== 状态值验证 ===');
        console.log('当前状态值:', saveData.status);
        console.log('状态值类型:', typeof saveData.status);
        console.log('状态值是否为null:', saveData.status === null);
        console.log('状态值是否为undefined:', saveData.status === undefined);
        console.log('状态值是否为空字符串:', saveData.status === '');
        console.log('状态值长度:', saveData.status ? saveData.status.length : 'N/A');
        console.log('允许的状态值:', this.statusOptions.map(s => s.value));
        console.log('允许的状态值类型:', this.statusOptions.map(s => ({ value: s.value, type: typeof s.value })));
        console.log('状态值是否有效:', this.statusOptions.some(s => s.value === saveData.status));
        
        // 详细的状态值匹配检查
        console.log('=== 详细状态值匹配检查 ===');
        this.statusOptions.forEach((option, index) => {
          const isMatch = option.value === saveData.status;
          const matchType = isMatch ? '✅ 匹配' : '❌ 不匹配';
          console.log(`${index + 1}. ${option.label} (${option.value}): ${matchType}`);
          console.log(`   选项值类型: ${typeof option.value}, 当前值类型: ${typeof saveData.status}`);
          console.log(`   选项值: "${option.value}", 当前值: "${saveData.status}"`);
          console.log(`   严格相等: ${option.value === saveData.status}`);
          console.log(`   宽松相等: ${option.value == saveData.status}`);
        });
        
        // 验证状态值
        if (!this.statusOptions.some(s => s.value === saveData.status)) {
          console.error('❌ 状态值验证失败');
          console.error('无效的状态值:', saveData.status);
          console.error('状态值类型:', typeof saveData.status);
          console.error('允许的状态值:', this.statusOptions.map(s => s.value));
          
          // 尝试找到最接近的匹配
          const closestMatch = this.statusOptions.find(s => 
            s.value.toString().toLowerCase() === saveData.status.toString().toLowerCase()
          );
          
          if (closestMatch) {
            console.log('找到最接近的匹配:', closestMatch);
            console.log('建议使用:', closestMatch.value);
          }
          
          uni.showToast({
            title: `状态值无效: ${saveData.status}`,
            icon: 'none',
            duration: 3000
          });
          return;
        }
        
        console.log('✅ 状态值验证通过');
        
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
        
        console.log('保存响应:', response);
        
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
          // 改进错误处理，提供更详细的错误信息
          let errorMessage = `保存失败: ${response.statusCode}`;
          
          if (response.data) {
            try {
              const errorData = response.data;
              if (errorData.message) {
                errorMessage = `保存失败: ${errorData.message}`;
              }
              if (errorData.code) {
                errorMessage += ` (错误代码: ${errorData.code})`;
              }
              console.error('详细错误信息:', errorData);
            } catch (e) {
              console.error('解析错误响应失败:', e);
            }
          }
          
          throw new Error(errorMessage);
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
    
    // 检查并提示登录
    checkAndPromptLogin() {
      const token = this.getToken();
      if (!token) {
        console.warn('⚠️ 用户未登录，显示登录提示');
        uni.showModal({
          title: '需要登录',
          content: '您需要先登录才能使用图片上传功能。请返回首页进行登录。',
          showCancel: true,
          cancelText: '取消',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              // 跳转到登录页面
              uni.navigateTo({
                url: '/pages/login/login'
              });
            }
          }
        });
        return false;
      }
      return true;
    },
    
    // 获取用户token
    getToken() {
      // 尝试多种方式获取token
      let token = uni.getStorageSync('userToken');
      
      if (!token) {
        // 尝试其他可能的存储键
        token = uni.getStorageSync('token');
      }
      
      if (!token) {
        // 尝试从localStorage获取
        try {
          token = localStorage.getItem('userToken') || localStorage.getItem('token');
        } catch (e) {
          console.log('localStorage不可用');
        }
      }
      
      if (!token) {
        // 尝试从sessionStorage获取
        try {
          token = sessionStorage.getItem('userToken') || sessionStorage.getItem('token');
        } catch (e) {
          console.log('sessionStorage不可用');
        }
      }
      
      console.log('获取到的Token:', token ? '已设置' : '未设置');
      if (token) {
        console.log('Token长度:', token.length);
        console.log('Token前10位:', token.substring(0, 10) + '...');
      }
      
      return token || '';
    },
    
    // 检查网络状态
    checkNetworkStatus() {
      uni.getNetworkType({
        success: (res) => {
          console.log('当前网络类型:', res.networkType);
          if (res.networkType === 'none') {
            uni.showToast({
              title: '网络连接失败，请检查网络设置',
              icon: 'none',
              duration: 3000
            });
          }
        },
        fail: (error) => {
          console.error('获取网络状态失败:', error);
        }
      });
    },
    
    // 验证上传配置
    verifyUploadConfig() {
      console.log('=== 验证上传配置 ===');
      
      // 检查API配置
      console.log('API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
      console.log('API_CONFIG.UPLOAD:', API_CONFIG.UPLOAD);
      console.log('UPLOAD_IMAGE 端点:', API_CONFIG.UPLOAD.UPLOAD_IMAGE);
      
      // 检查完整URL
      const fullUploadUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.UPLOAD.UPLOAD_IMAGE}`;
      console.log('完整上传URL:', fullUploadUrl);
      
      // 检查用户认证
      const token = this.getToken();
      console.log('用户Token:', token ? '已设置' : '未设置');
      console.log('Token长度:', token ? token.length : 0);
      
      // 检查项目ID
      console.log('项目ID:', this.projectId);
      
      // 检查图片数组状态
      console.log('projectImages 类型:', typeof this.projectImages);
      console.log('projectImages 是否为数组:', Array.isArray(this.projectImages));
      console.log('projectImages 长度:', this.projectImages ? this.projectImages.length : 'undefined');
      
      // 显示验证结果
      let validationMessage = '配置验证完成\n';
      validationMessage += `API地址: ${API_CONFIG.BASE_URL}\n`;
      validationMessage += `上传端点: ${API_CONFIG.UPLOAD.UPLOAD_IMAGE}\n`;
      validationMessage += `完整URL: ${fullUploadUrl}\n`;
      validationMessage += `Token状态: ${token ? '已设置' : '未设置'}\n`;
      validationMessage += `项目ID: ${this.projectId}\n`;
      validationMessage += `图片数组: ${Array.isArray(this.projectImages) ? '正常' : '异常'}`;
      
      uni.showModal({
        title: '上传配置验证结果',
        content: validationMessage,
        showCancel: false,
        confirmText: '确定'
      });
      
      console.log('配置验证完成');
    },
    
    // 测试API连接
    async testAPIConnection() {
      try {
        console.log('测试API连接...');
        const result = await uni.request({
          url: `${API_CONFIG.BASE_URL}/health`,
          method: 'GET',
          timeout: 5000
        });
        
        let error, response;
        if (Array.isArray(result)) {
          [error, response] = result;
        } else {
          error = result.errMsg && result.errMsg !== 'request:ok' ? result : null;
          response = result;
        }
        
        if (error) {
          throw error;
        }
        
        console.log('✅ API连接测试成功:', response.statusCode);
        uni.showToast({
          title: 'API连接正常',
          icon: 'success'
        });
      } catch (error) {
        console.error('❌ API连接测试失败:', error);
        uni.showToast({
          title: 'API连接失败',
          icon: 'error'
        });
      }
    },

    // 诊断上传问题
    async diagnoseUploadIssue() {
      console.log('=== 开始全面上传问题诊断 ===');
      
      try {
        // 1. 检查基础配置
        console.log('1️⃣ 检查基础配置...');
        console.log('API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
        console.log('API_CONFIG.UPLOAD.UPLOAD_IMAGE:', API_CONFIG.UPLOAD.UPLOAD_IMAGE);
        console.log('完整上传URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.UPLOAD.UPLOAD_IMAGE}`);
        
        // 2. 检查用户认证
        console.log('2️⃣ 检查用户认证...');
        const token = this.getToken();
        console.log('用户Token:', token ? '已设置' : '未设置');
        console.log('Token长度:', token ? token.length : 0);
        console.log('Token前10位:', token ? token.substring(0, 10) + '...' : '无');
        
        // 3. 检查项目信息
        console.log('3️⃣ 检查项目信息...');
        console.log('项目ID:', this.projectId);
        console.log('项目名称:', this.projectInfo.name);
        
        // 4. 检查图片数组状态
        console.log('4️⃣ 检查图片数组状态...');
        console.log('projectImages:', this.projectImages);
        console.log('projectImages 类型:', typeof this.projectImages);
        console.log('projectImages 是否为数组:', Array.isArray(this.projectImages));
        console.log('projectImages 长度:', this.projectImages ? this.projectImages.length : 'undefined');
        
        // 5. 检查网络状态
        console.log('5️⃣ 检查网络状态...');
        const networkResult = await this.checkNetworkStatusAsync();
        console.log('网络检查结果:', networkResult);
        
        // 6. 测试API连接
        console.log('6️⃣ 测试API连接...');
        const apiResult = await this.testAPIConnectionAsync();
        console.log('API连接测试结果:', apiResult);
        
        // 7. 测试图片选择功能
        console.log('7️⃣ 测试图片选择功能...');
        const pickerResult = await this.testImagePickerAsync();
        console.log('图片选择测试结果:', pickerResult);
        
        // 8. 生成诊断报告
        const diagnosisReport = this.generateDiagnosisReport({
          baseUrl: API_CONFIG.BASE_URL,
          uploadEndpoint: API_CONFIG.UPLOAD.UPLOAD_IMAGE,
          token: token,
          projectId: this.projectId,
          projectImages: this.projectImages,
          networkStatus: networkResult,
          apiConnection: apiResult,
          imagePicker: pickerResult
        });
        
        console.log('=== 诊断报告 ===');
        console.log(diagnosisReport);
        
        // 9. 显示诊断结果
        uni.showModal({
          title: '上传问题诊断报告',
          content: diagnosisReport,
          showCancel: false,
          confirmText: '确定'
        });
        
      } catch (error) {
        console.error('诊断过程中发生错误:', error);
        uni.showToast({
          title: `诊断失败: ${error.message}`,
          icon: 'error',
          duration: 3000
        });
      }
    },
    
    // 异步检查网络状态
    async checkNetworkStatusAsync() {
      return new Promise((resolve) => {
        uni.getNetworkType({
          success: (res) => {
            resolve({
              success: true,
              networkType: res.networkType,
              message: `网络类型: ${res.networkType}`
            });
          },
          fail: (error) => {
            resolve({
              success: false,
              error: error,
              message: '获取网络状态失败'
            });
          }
        });
      });
    },
    
    // 异步测试API连接
    async testAPIConnectionAsync() {
      try {
        const result = await uni.request({
          url: `${API_CONFIG.BASE_URL}/health`,
          method: 'GET',
          timeout: 5000
        });
        
        let error, response;
        if (Array.isArray(result)) {
          [error, response] = result;
        } else {
          error = result.errMsg && result.errMsg !== 'request:ok' ? result : null;
          response = result;
        }
        
        if (error) {
          return {
            success: false,
            error: error,
            message: 'API连接失败'
          };
        }
        
        return {
          success: true,
          statusCode: response.statusCode,
          message: `API连接正常，状态码: ${response.statusCode}`
        };
      } catch (error) {
        return {
          success: false,
          error: error,
          message: 'API连接异常'
        };
      }
    },
    
    // 异步测试图片选择
    async testImagePickerAsync() {
      return new Promise((resolve) => {
        // 模拟图片选择测试
        setTimeout(() => {
          resolve({
            success: true,
            message: '图片选择功能正常（模拟测试）'
          });
        }, 1000);
      });
    },
    
    // 生成诊断报告
    generateDiagnosisReport(data) {
      let report = '🔍 上传问题诊断报告\n\n';
      
      // 基础配置
      report += '📋 基础配置:\n';
      report += `API地址: ${data.baseUrl}\n`;
      report += `上传端点: ${data.uploadEndpoint}\n`;
      report += `完整URL: ${data.baseUrl}${data.uploadEndpoint}\n\n`;
      
      // 用户认证
      report += '🔐 用户认证:\n';
      report += `Token状态: ${data.token ? '已设置' : '未设置'}\n`;
      report += `Token长度: ${data.token ? data.token.length : 0}\n\n`;
      
      // 项目信息
      report += '📁 项目信息:\n';
      report += `项目ID: ${data.projectId}\n`;
      report += `项目名称: ${data.projectImages ? '已加载' : '未加载'}\n\n`;
      
      // 图片数组
      report += '🖼️ 图片数组:\n';
      report += `数组类型: ${Array.isArray(data.projectImages) ? '正常' : '异常'}\n`;
      report += `数组长度: ${data.projectImages ? data.projectImages.length : 'undefined'}\n\n`;
      
      // 网络状态
      report += '🌐 网络状态:\n';
      report += `状态: ${data.networkStatus.success ? '正常' : '异常'}\n`;
      report += `详情: ${data.networkStatus.message}\n\n`;
      
      // API连接
      report += '🔗 API连接:\n';
      report += `状态: ${data.apiConnection.success ? '正常' : '异常'}\n`;
      report += `详情: ${data.apiConnection.message}\n\n`;
      
      // 图片选择
      report += '📱 图片选择:\n';
      report += `状态: ${data.imagePicker.success ? '正常' : '异常'}\n`;
      report += `详情: ${data.imagePicker.message}\n\n`;
      
      // 问题分析
      report += '💡 问题分析:\n';
      if (!data.token) {
        report += '❌ 用户未登录或Token已过期\n';
      }
      if (!data.projectId) {
        report += '❌ 项目ID未设置\n';
      }
      if (!Array.isArray(data.projectImages)) {
        report += '❌ 图片数组格式异常\n';
      }
      if (!data.networkStatus.success) {
        report += '❌ 网络连接异常\n';
      }
      if (!data.apiConnection.success) {
        report += '❌ 后端服务不可用\n';
      }
      
      if (data.token && data.projectId && Array.isArray(data.projectImages) && data.networkStatus.success && data.apiConnection.success) {
        report += '✅ 所有基础检查都通过，问题可能在上传逻辑中\n';
      }
      
      return report;
    },

    // 收集错误日志
    collectErrorLogs() {
      console.log('=== 收集错误日志 ===');
      this.errorLogs = []; // 清空之前的日志
      this.errorLogs.push('项目编辑页面错误日志收集开始...');
      this.errorLogs.push('当前 projectImages 状态:', this.projectImages);
      this.errorLogs.push('当前 projectImages 类型:', typeof this.projectImages);
      this.errorLogs.push('当前 projectImages 长度:', this.projectImages ? this.projectImages.length : 'undefined');
      this.errorLogs.push('项目ID:', this.projectId);
      this.errorLogs.push('项目名称:', this.projectInfo.name);
      this.errorLogs.push('项目描述:', this.projectInfo.description);
      this.errorLogs.push('项目进度:', this.projectInfo.progress);
      this.errorLogs.push('项目状态:', this.projectInfo.status);
      this.errorLogs.push('项目优先级:', this.projectInfo.priority);
      this.errorLogs.push('项目类型:', this.projectInfo.type);
      this.errorLogs.push('外部合作方:', this.projectInfo.externalPartners);
      this.errorLogs.push('错误日志收集完成。');
      uni.showModal({
        title: '错误日志',
        content: this.errorLogs.join('\n\n'),
        showCancel: false,
        confirmText: '确定'
      });
      console.log('错误日志已收集并显示。');
    },

    // 检查登录状态
    checkLoginStatus() {
      console.log('=== 检查登录状态 ===');
      const token = this.getToken();
      if (token) {
        uni.showModal({
          title: '登录状态',
          content: `用户已登录，Token: ${token.substring(0, 10)}...`,
          showCancel: false,
          confirmText: '确定'
        });
      } else {
        uni.showModal({
          title: '登录状态',
          content: '用户未登录或Token已过期。请返回首页进行登录。',
          showCancel: true,
          cancelText: '取消',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: '/pages/login/login'
              });
            }
          }
        });
      }
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

/* 进度状态提示样式 */
.progress-status-tip {
  background: linear-gradient(135deg, #f0f4ff 0%, #e8f4fd 100%);
  border: 2rpx solid #667eea;
  border-radius: 12rpx;
  padding: 20rpx;
  margin: 20rpx 0;
  text-align: center;
}

.tip-text {
  font-size: 26rpx;
  color: #667eea;
  font-weight: 500;
  line-height: 1.4;
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
