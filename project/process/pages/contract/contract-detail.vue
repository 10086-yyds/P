<template>
  <view class="contract-detail-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-left" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="navbar-title">
        <text class="title-text">合同详情</text>
      </view>
      <view class="navbar-right" @click="showActionMenu">
        <text class="more-icon">⋯</text>
      </view>
    </view>

    <!-- 合同基本信息 -->
    <view class="contract-header">
      <view class="contract-title">
        <text class="title">{{ contract.name }}</text>
        <view class="status-badge" :class="contract.status">
          <text class="status-text">{{ getStatusText(contract.status) }}</text>
        </view>
      </view>
      <view class="contract-number">
        <text class="number-text">合同编号：{{ contract.number }}</text>
      </view>
    </view>

    <!-- 合同详细信息 -->
    <view class="contract-info-section">
      <view class="section-title">
        <text class="title-text">基本信息</text>
      </view>
      
      <view class="info-card">
        <view class="info-row">
          <text class="info-label">客户名称</text>
          <text class="info-value">{{ contract.client }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">合同金额</text>
          <text class="info-value amount">¥{{ formatAmount(contract.amount) }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">签署日期</text>
          <text class="info-value">{{ contract.signDate }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">到期日期</text>
          <text class="info-value" :class="{ 'expired': isExpired(contract.endDate) }">
            {{ contract.endDate }}
          </text>
        </view>
        <view class="info-row">
          <text class="info-label">合同状态</text>
          <text class="info-value">{{ getStatusText(contract.status) }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">负责人</text>
          <text class="info-value">{{ contract.manager || '张工程师' }}</text>
        </view>
      </view>
    </view>

    <!-- 合同条款 -->
    <view class="contract-terms-section">
      <view class="section-title">
        <text class="title-text">合同条款</text>
      </view>
      
      <view class="terms-card">
        <view class="term-item">
          <text class="term-title">服务内容</text>
          <text class="term-content">{{ contract.serviceContent || '软件开发、系统维护、技术咨询等服务' }}</text>
        </view>
        <view class="term-item">
          <text class="term-title">付款方式</text>
          <text class="term-content">{{ contract.paymentMethod || '分期付款：签约30%，开发中40%，验收30%' }}</text>
        </view>
        <view class="term-item">
          <text class="term-title">交付时间</text>
          <text class="term-content">{{ contract.deliveryTime || '合同签署后3个月内完成交付' }}</text>
        </view>
        <view class="term-item">
          <text class="term-title">质保期</text>
          <text class="term-content">{{ contract.warranty || '项目验收后12个月免费质保' }}</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <view class="action-buttons">
        <view class="action-btn primary" @click="editContract">
          <text class="btn-text">编辑合同</text>
        </view>
        <view class="action-btn secondary" @click="downloadContract">
          <text class="btn-text">下载合同</text>
        </view>
        <view class="action-btn warning" @click="shareContract">
          <text class="btn-text">分享</text>
        </view>
        <view class="action-btn approval" @click="goToApproval">
          <text class="btn-text">去审批</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      contractId: null,
      showMenu: false,
      contract: {
        id: 0,
        name: '',
        number: '',
        client: '',
        amount: 0,
        signDate: '',
        endDate: '',
        status: 'pending',
        manager: '张工程师',
        serviceContent: '',
        paymentMethod: '',
        deliveryTime: '',
        warranty: ''
      }
    };
  },
  
  onLoad(options) {
    console.log('合同详情页面接收参数:', options);
    
    if (options.id) {
      this.contractId = options.id;
      
      // 如果通过URL参数传递了完整的合同信息，直接使用
      if (options.name && options.number && options.client) {
        this.contract = {
          id: parseInt(options.id),
          name: decodeURIComponent(options.name),
          number: decodeURIComponent(options.number),
          client: decodeURIComponent(options.client),
          amount: parseFloat(options.amount) || 0,
          signDate: decodeURIComponent(options.signDate),
          endDate: decodeURIComponent(options.endDate),
          status: options.status,
          manager: '张工程师',
          serviceContent: '软件开发、系统维护、技术咨询等服务',
          paymentMethod: '分期付款：签约30%，开发中40%，验收30%',
          deliveryTime: '合同签署后3个月内完成交付',
          warranty: '项目验收后12个月免费质保'
        };
      } else {
        // 否则通过API加载合同详情
        this.loadContractDetail();
      }
    }
  },
  
  methods: {
    goBack() {
      uni.navigateBack();
    },
    
    loadContractDetail() {
      console.log('加载合同详情:', this.contractId);
      
      // 模拟API调用
      setTimeout(() => {
        this.contract = {
          id: this.contractId,
          name: '软件开发服务合同',
          number: 'HT2024001',
          client: 'ABC科技有限公司',
          amount: 500000,
          signDate: '2024-01-15',
          endDate: '2024-12-31',
          status: 'active',
          manager: '张工程师',
          serviceContent: '软件开发、系统维护、技术咨询等服务',
          paymentMethod: '分期付款：签约30%，开发中40%，验收30%',
          deliveryTime: '合同签署后3个月内完成交付',
          warranty: '项目验收后12个月免费质保'
        };
      }, 1000);
    },
    
    getStatusText(status) {
      const statusMap = {
        'pending': '待签署',
        'active': '执行中',
        'completed': '已完成',
        'expired': '已过期'
      };
      return statusMap[status] || '未知';
    },
    
    formatAmount(amount) {
      return amount.toLocaleString();
    },
    
    isExpired(endDate) {
      const today = new Date();
      const end = new Date(endDate);
      return today > end;
    },
    
    showActionMenu() {
      this.showMenu = true;
    },
    
    hideActionMenu() {
      this.showMenu = false;
    },
    
    editContract() {
      console.log('编辑合同');
      uni.showToast({
        title: '编辑功能开发中',
        icon: 'none'
      });
    },
    
    downloadContract() {
      console.log('下载合同');
      uni.showToast({
        title: '下载合同文件',
        icon: 'none'
      });
    },
    
    shareContract() {
      console.log('分享合同');
      uni.showToast({
        title: '分享功能开发中',
        icon: 'none'
      });
    },
    
    goToApproval() {
      console.log('去审批');
      // 跳转到审批页面，传递合同信息
      uni.switchTab({
        url: '/pages/approval/approval',
        success: () => {
          console.log('跳转到审批页面成功');
          // 可以通过全局状态管理传递参数
          getApp().globalData = getApp().globalData || {};
          getApp().globalData.contractForApproval = {
            type: 'contract',
            id: this.contract.id,
            name: this.contract.name,
            number: this.contract.number,
            client: this.contract.client,
            amount: this.contract.amount
          };
        },
        fail: (err) => {
          console.error('跳转到审批页面失败:', err);
          uni.showModal({
            title: '提示',
            content: '审批页面正在开发中，敬请期待！',
            showCancel: false
          });
        }
      });
    }
  }
};
</script>

<style scoped>
.contract-detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 自定义导航栏 */
.custom-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-left {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 36rpx;
  font-weight: bold;
}

.navbar-title {
  flex: 1;
  text-align: center;
}

.title-text {
  font-size: 32rpx;
  font-weight: bold;
}

.navbar-right {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-icon {
  font-size: 32rpx;
  font-weight: bold;
}

/* 合同头部 */
.contract-header {
  background: white;
  padding: 30rpx;
  margin: 20rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.contract-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.status-badge {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.active {
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.completed {
  background: #d4edda;
  color: #155724;
}

.status-badge.expired {
  background: #f8d7da;
  color: #721c24;
}

.status-text {
  font-size: 22rpx;
}

.contract-number {
  font-size: 26rpx;
  color: #666;
}

.number-text {
  font-size: 26rpx;
  color: #666;
}

/* 信息卡片 */
.contract-info-section,
.contract-terms-section {
  margin: 20rpx;
}

.section-title {
  margin-bottom: 20rpx;
}

.section-title .title-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.info-card,
.terms-card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.info-row {
  display: flex;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #666;
}

.info-value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.info-value.amount {
  color: #e74c3c;
  font-weight: bold;
}

.info-value.expired {
  color: #e74c3c;
}

/* 合同条款 */
.term-item {
  margin-bottom: 30rpx;
}

.term-item:last-child {
  margin-bottom: 0;
}

.term-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.term-content {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

/* 操作按钮 */
.action-section {
  padding: 30rpx 20rpx;
  background: white;
  margin-top: 20rpx;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.action-btn.primary {
  background: #667eea;
  color: white;
}

.action-btn.secondary {
  background: #f8f9fa;
  color: #666;
  border: 1rpx solid #ddd;
}

.action-btn.warning {
  background: #ffa502;
  color: white;
}

.action-btn.approval {
  background: #28a745;
  color: white;
}

.btn-text {
  font-size: 28rpx;
}
</style>