<template>
  <view class="todo-detail-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="back-icon">←</text>
        <text class="back-text">返回</text>
      </view>
      <text class="nav-title">待办详情</text>
      <view class="nav-right">
        <text class="edit-btn" @click="editTodo">编辑</text>
      </view>
    </view>

    <!-- 待办事项内容 -->
    <view class="todo-content">
      <!-- 优先级标识 -->
      <view class="priority-badge" :class="todoData.priority">
        <text class="priority-text">{{ getPriorityText(todoData.priority) }}</text>
      </view>

      <!-- 标题 -->
      <view class="title-section">
        <text class="todo-title">{{ todoData.title }}</text>
      </view>

      <!-- 时间信息 -->
      <view class="time-section">
        <view class="time-item">
          <text class="time-label">时间：</text>
          <text class="time-value">{{ todoData.time }}</text>
        </view>
        <view class="time-item">
          <text class="time-label">状态：</text>
          <text class="status-text" :class="todoData.priority">进行中</text>
        </view>
      </view>

      <!-- 描述 -->
      <view class="description-section">
        <text class="section-title">详细描述</text>
        <view class="description-content">
          <text class="description-text">{{ todoData.description }}</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="action-btn complete-btn" @click="completeTodo">
          <text class="btn-icon">✅</text>
          <text class="btn-text">标记完成</text>
        </button>
        <button class="action-btn postpone-btn" @click="postponeTodo">
          <text class="btn-icon">⏰</text>
          <text class="btn-text">推迟</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      todoData: {
        title: '',
        description: '',
        time: '',
        priority: 'normal'
      }
    };
  },
  
  onLoad(options) {
    // 接收传递的参数
    if (options.title) {
      this.todoData.title = decodeURIComponent(options.title);
    }
    if (options.description) {
      this.todoData.description = decodeURIComponent(options.description);
    }
    if (options.time) {
      this.todoData.time = decodeURIComponent(options.time);
    }
    if (options.priority) {
      this.todoData.priority = options.priority;
    }
  },

  methods: {
    goBack() {
      uni.navigateBack();
    },

    editTodo() {
      uni.showToast({
        title: '编辑功能开发中',
        icon: 'none'
      });
    },

    getPriorityText(priority) {
      const priorityMap = {
        high: '高优先级',
        medium: '中优先级',
        normal: '普通优先级'
      };
      return priorityMap[priority] || '普通优先级';
    },

    completeTodo() {
      uni.showModal({
        title: '确认完成',
        content: '确定要将此待办事项标记为完成吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '已完成',
              icon: 'success'
            });
            // 这里可以调用API更新状态
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          }
        }
      });
    },

    postponeTodo() {
      uni.showActionSheet({
        itemList: ['推迟1小时', '推迟到明天', '推迟到下周'],
        success: (res) => {
          const options = ['推迟1小时', '推迟到明天', '推迟到下周'];
          uni.showToast({
            title: `已${options[res.tapIndex]}`,
            icon: 'success'
          });
        }
      });
    }
  }
};
</script>

<style scoped>
.todo-detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background: white;
  border-bottom: 1rpx solid #eee;
}

.nav-left {
  display: flex;
  align-items: center;
}

.back-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
}

.back-text {
  font-size: 28rpx;
  color: #333;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.edit-btn {
  font-size: 28rpx;
  color: #667eea;
}

.todo-content {
  padding: 30rpx;
}

.priority-badge {
  display: inline-block;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
}

.priority-badge.high {
  background-color: #ffeaea;
  color: #ff4757;
}

.priority-badge.medium {
  background-color: #fff3e0;
  color: #ffa502;
}

.priority-badge.normal {
  background-color: #e8f5e8;
  color: #2ed573;
}

.priority-text {
  font-size: 24rpx;
  font-weight: 500;
}

.title-section {
  margin-bottom: 30rpx;
}

.todo-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
}

.time-section {
  background: white;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.time-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.time-item:last-child {
  margin-bottom: 0;
}

.time-label {
  font-size: 28rpx;
  color: #666;
  width: 120rpx;
}

.time-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.status-text {
  font-size: 28rpx;
  font-weight: 500;
}

.status-text.high {
  color: #ff4757;
}

.status-text.medium {
  color: #ffa502;
}

.status-text.normal {
  color: #2ed573;
}

.description-section {
  background: white;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.description-content {
  background: #f8f9fa;
  border-radius: 10rpx;
  padding: 20rpx;
}

.description-text {
  font-size: 28rpx;
  color: #555;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 25rpx;
  border-radius: 15rpx;
  border: none;
  font-size: 28rpx;
  font-weight: 500;
}

.complete-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.postpone-btn {
  background: #f8f9fa;
  color: #333;
  border: 1rpx solid #ddd;
}

.btn-icon {
  margin-right: 10rpx;
  font-size: 24rpx;
}

.btn-text {
  font-size: 28rpx;
}
</style> 