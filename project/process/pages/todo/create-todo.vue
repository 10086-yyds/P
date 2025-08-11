<template>
  <view class="create-todo-page">
    <view class="page-header">
      <text class="page-title">创建代办事项</text>
      <text class="back-btn" @click="goBack">← 返回</text>
    </view>
    
    <view class="form-container">
      <view class="form-group">
        <text class="form-label">标题 *</text>
        <input 
          class="form-input" 
          v-model="todoForm.title" 
          placeholder="请输入代办事项标题"
          maxlength="50"
        />
      </view>
      
      <view class="form-group">
        <text class="form-label">描述</text>
        <textarea 
          class="form-textarea" 
          v-model="todoForm.description" 
          placeholder="请输入代办事项描述"
          :maxlength="200"
        />
        <text class="char-count">{{ todoForm.description.length }}/200</text>
      </view>
      
      <view class="form-group">
        <text class="form-label">优先级</text>
        <view class="priority-options">
          <view 
            class="priority-option" 
            :class="{ active: todoForm.priority === 'low' }"
            @click="todoForm.priority = 'low'"
          >
            <text class="priority-icon">🟢</text>
            <text class="priority-label">低</text>
          </view>
          <view 
            class="priority-option" 
            :class="{ active: todoForm.priority === 'normal' }"
            @click="todoForm.priority = 'normal'"
          >
            <text class="priority-icon">🟡</text>
            <text class="priority-label">中</text>
          </view>
          <view 
            class="priority-option" 
            :class="{ active: todoForm.priority === 'high' }"
            @click="todoForm.priority = 'high'"
          >
            <text class="priority-icon">🔴</text>
            <text class="priority-label">高</text>
          </view>
        </view>
      </view>
      
      <view class="form-group">
        <text class="form-label">分类</text>
        <picker 
          class="form-picker" 
          :value="categoryIndex" 
          :range="categoryOptions" 
          @change="onCategoryChange"
        >
          <view class="picker-display">
            <text>{{ todoForm.category ? getCategoryLabel(todoForm.category) : '请选择分类' }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>
      
      <view class="form-group">
        <text class="form-label">截止日期</text>
        <picker 
          class="form-picker" 
          mode="date" 
          :value="todoForm.dueDate" 
          @change="onDateChange"
        >
          <view class="picker-display">
            <text>{{ todoForm.dueDate || '请选择截止日期' }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>
      
      <view class="form-group">
        <text class="form-label">负责人</text>
        <input 
          class="form-input" 
          v-model="todoForm.assignee" 
          placeholder="请输入负责人姓名"
        />
      </view>
      
      <view class="form-actions">
        <button class="btn btn-secondary" @click="goBack">取消</button>
        <button class="btn btn-primary" @click="createTodo" :disabled="!isFormValid">
          创建代办事项
        </button>
      </view>
    </view>
  </view>
</template>

<script>
// 移除 todoManager 导入，因为我们现在使用假的添加逻辑
// import todoManager from '../../utils/todoManager.js';

export default {
  name: 'CreateTodo',
  data() {
    return {
      todoForm: {
        title: '',
        description: '',
        priority: 'normal',
        category: 'general',
        dueDate: '',
        assignee: ''
      },
      categoryOptions: ['general', 'project', 'purchase', 'safety', 'approval', 'meeting'],
      categoryIndex: 0
    };
  },
  computed: {
    isFormValid() {
      return this.todoForm.title.trim().length > 0;
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    
    onCategoryChange(e) {
      const index = e.detail.value;
      this.categoryIndex = index;
      this.todoForm.category = this.categoryOptions[index];
    },
    
    onDateChange(e) {
      this.todoForm.dueDate = e.detail.value;
    },
    
    getCategoryLabel(category) {
      const categoryLabels = {
        'general': '一般',
        'project': '项目',
        'purchase': '采购',
        'safety': '安全',
        'approval': '审批',
        'meeting': '会议'
      };
      return categoryLabels[category] || category;
    },
    
    createTodo() {
      if (!this.isFormValid) {
        uni.showToast({
          title: '请填写代办事项标题',
          icon: 'error',
          duration: 2000
        });
        return;
      }
      
      // 显示加载状态
      uni.showLoading({ title: '创建中...' });
      
      // 模拟网络延迟
      setTimeout(() => {
        // 格式化截止日期
        let dueDate = null;
        if (this.todoForm.dueDate) {
          dueDate = new Date(this.todoForm.dueDate + 'T23:59:59').toISOString();
        }
        
        const todoData = {
          title: this.todoForm.title.trim(),
          description: this.todoForm.description.trim(),
          priority: this.todoForm.priority,
          category: this.todoForm.category,
          dueDate: dueDate,
          assignee: this.todoForm.assignee.trim() || '当前用户'
        };
        
        // 假的创建逻辑 - 模拟成功响应
        const mockResult = {
          success: true,
          data: {
            id: Date.now().toString(), // 生成一个假的ID
            ...todoData,
            createdAt: new Date().toISOString(),
            completed: false,
            status: 'pending'
          },
          message: '代办事项创建成功'
        };
        
        // 隐藏加载状态
        uni.hideLoading();
        
        // 显示成功消息
        uni.showToast({
          title: '代办事项创建成功',
          icon: 'success',
          duration: 2000
        });
        
        // 在控制台输出创建的数据（用于调试）
        console.log('✅ 假的代办事项创建成功:', mockResult.data);
        
        // 返回上一页并添加新代办事项到首页
        setTimeout(() => {
          // 获取上一页实例
          const pages = getCurrentPages();
          const prevPage = pages[pages.length - 2];
          
          if (prevPage) {
            // 如果上一页有 addNewTodoToList 方法，调用它
            if (prevPage.addNewTodoToList) {
              prevPage.addNewTodoToList(mockResult.data);
            }
            // 如果上一页有 refreshTodos 方法，也调用它（保持兼容性）
            if (prevPage.refreshTodos) {
              prevPage.refreshTodos();
            }
          }
          
          // 返回上一页
          uni.navigateBack();
        }, 1000);
      }, 1000);
    }
  }
};
</script>

<style scoped>
.create-todo-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20rpx;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 20rpx;
  background: white;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.back-btn {
  font-size: 28rpx;
  color: #667eea;
  cursor: pointer;
}

.form-container {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 40rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.form-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e1e8ed;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
  background: #fafbfc;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #667eea;
  background: white;
}

.form-textarea {
  width: 100%;
  min-height: 120rpx;
  border: 2rpx solid #e1e8ed;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #333;
  background: #fafbfc;
  transition: all 0.3s ease;
  resize: none;
}

.form-textarea:focus {
  border-color: #667eea;
  background: white;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.priority-options {
  display: flex;
  gap: 20rpx;
}

.priority-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  border: 2rpx solid #e1e8ed;
  border-radius: 12rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafbfc;
}

.priority-option.active {
  border-color: #667eea;
  background: #f0f2ff;
}

.priority-icon {
  font-size: 32rpx;
  margin-bottom: 10rpx;
}

.priority-label {
  font-size: 24rpx;
  color: #333;
}

.form-picker {
  width: 100%;
}

.picker-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80rpx;
  border: 2rpx solid #e1e8ed;
  border-radius: 12rpx;
  padding: 0 20rpx;
  background: #fafbfc;
  color: #333;
  font-size: 28rpx;
}

.picker-arrow {
  font-size: 24rpx;
  color: #999;
}

.form-actions {
  display: flex;
  gap: 30rpx;
  margin-top: 60rpx;
}

.btn {
  flex: 1;
  height: 80rpx;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:active {
  background: #5a6fd8;
  transform: scale(0.98);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f8f9ff;
  color: #667eea;
  border: 2rpx solid #d1e7ff;
}

.btn-secondary:active {
  background: #e8f0ff;
  transform: scale(0.98);
}
</style>
