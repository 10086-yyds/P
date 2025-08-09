<template>
  <view class="contract-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-left" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="navbar-title">
        <text class="title-text">合同管理</text>
      </view>
      <view class="navbar-right" @click="showAddContract">
        <text class="add-icon">+</text>
      </view>
    </view>

    <!-- 搜索和筛选区域 -->
    <view class="search-section">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          placeholder="搜索合同名称、编号或客户" 
          v-model="searchKeyword"
          @input="handleSearch"
        />
        <text class="clear-icon" v-if="searchKeyword" @click="clearSearch">×</text>
      </view>
      
      <view class="filter-tabs">
        <view 
          class="filter-tab" 
          :class="{ active: currentFilter === 'all' }"
          @click="setFilter('all')"
        >
          <text class="tab-text">全部</text>
        </view>
        <view 
          class="filter-tab" 
          :class="{ active: currentFilter === 'pending' }"
          @click="setFilter('pending')"
        >
          <text class="tab-text">待签署</text>
        </view>
        <view 
          class="filter-tab" 
          :class="{ active: currentFilter === 'active' }"
          @click="setFilter('active')"
        >
          <text class="tab-text">执行中</text>
        </view>
        <view 
          class="filter-tab" 
          :class="{ active: currentFilter === 'completed' }"
          @click="setFilter('completed')"
        >
          <text class="tab-text">已完成</text>
        </view>
      </view>
    </view>

    <!-- 合同列表 -->
    <scroll-view 
      class="contract-list" 
      scroll-y="true"
      refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <view 
        class="contract-item" 
        v-for="contract in filteredContracts" 
        :key="contract.id"
        @click="handleContractClick(contract)"
      >
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
        
        <view class="contract-info">
          <view class="info-row">
            <text class="info-label">客户：</text>
            <text class="info-value">{{ contract.client }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">金额：</text>
            <text class="info-value amount">¥{{ formatAmount(contract.amount) }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">签署日期：</text>
            <text class="info-value">{{ contract.signDate }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">到期日期：</text>
            <text class="info-value" :class="{ 'expired': isExpired(contract.endDate) }">
              {{ contract.endDate }}
            </text>
          </view>
        </view>
        
        <view class="contract-actions">
          <view class="action-btn view" @click.stop="viewContract(contract)">
            <text class="action-text">查看</text>
          </view>
          <view class="action-btn edit" @click.stop="editContract(contract)">
            <text class="action-text">编辑</text>
          </view>
          <view class="action-btn download" @click.stop="downloadContract(contract)">
            <text class="action-text">下载</text>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-if="filteredContracts.length === 0">
        <text class="empty-icon">📄</text>
        <text class="empty-text">暂无合同数据</text>
        <text class="empty-desc">点击右上角"+"添加新合同</text>
      </view>
    </scroll-view>

    <!-- 添加合同弹窗 -->
    <view class="modal-overlay" v-if="showAddModal" @click="hideAddContract">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">添加新合同</text>
          <text class="modal-close" @click="hideAddContract">×</text>
        </view>
        
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">合同名称</text>
            <input class="form-input" v-model="newContract.name" placeholder="请输入合同名称" />
          </view>
          <view class="form-item">
            <text class="form-label">合同编号</text>
            <input class="form-input" v-model="newContract.number" placeholder="请输入合同编号" />
          </view>
          <view class="form-item">
            <text class="form-label">客户名称</text>
            <input class="form-input" v-model="newContract.client" placeholder="请输入客户名称" />
          </view>
          <view class="form-item">
            <text class="form-label">合同金额</text>
            <input class="form-input" v-model="newContract.amount" placeholder="请输入合同金额" type="number" />
          </view>
          <view class="form-item">
            <text class="form-label">签署日期</text>
            <view class="date-input-group">
              <input 
                class="form-input date-input" 
                v-model="newContract.signDate" 
                placeholder="请输入签署日期 (YYYY-MM-DD)"
                @focus="showSignDatePicker"
              />
              <view class="date-picker-btn" @click="showSignDatePicker">
                <text class="picker-icon">📅</text>
              </view>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">到期日期</text>
            <view class="date-input-group">
              <input 
                class="form-input date-input" 
                v-model="newContract.endDate" 
                placeholder="请输入到期日期 (YYYY-MM-DD)"
                @focus="showEndDatePicker"
              />
              <view class="date-picker-btn" @click="showEndDatePicker">
                <text class="picker-icon">📅</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="modal-footer">
          <view class="btn btn-cancel" @click="hideAddContract">
            <text class="btn-text">取消</text>
          </view>
          <view class="btn btn-confirm" @click="addContract">
            <text class="btn-text">确定</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchKeyword: '',
      currentFilter: 'all',
      isRefreshing: false,
      showAddModal: false,
      contracts: [],
      newContract: {
        name: '',
        number: '',
        client: '',
        amount: '',
        signDate: '',
        endDate: ''
      }
    };
  },
  
  computed: {
    filteredContracts() {
      let filtered = this.contracts;
      
      // 按状态筛选
      if (this.currentFilter !== 'all') {
        filtered = filtered.filter(contract => contract.status === this.currentFilter);
      }
      
      // 按关键词搜索
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        filtered = filtered.filter(contract => 
          contract.name.toLowerCase().includes(keyword) ||
          contract.number.toLowerCase().includes(keyword) ||
          contract.client.toLowerCase().includes(keyword)
        );
      }
      
      return filtered;
    }
  },
  
  onLoad() {
    console.log('合同管理页面加载');
    this.loadContractData();
  },
   
  onShow() {
    // 页面显示时刷新数据
    console.log('合同管理页面显示');
    this.loadContractData();
  },
  
  methods: {
    goBack() {
      uni.navigateBack();
    },
    
    // 加载合同数据
    async loadContractData() {
      try {
        uni.showLoading({
          title: '加载中...'
        });
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 这里应该调用真实的API
        // const response = await uni.request({
        //   url: '/api/contracts',
        //   method: 'GET'
        // });
        
        // 模拟数据
        const mockData = [
          {
            id: 1,
            name: '软件开发服务合同',
            number: 'HT2024001',
            client: 'ABC科技有限公司',
            amount: 500000,
            signDate: '2024-01-15',
            endDate: '2024-12-31',
            status: 'active'
          },
          {
            id: 2,
            name: '系统维护合同',
            number: 'HT2024002',
            client: 'XYZ企业集团',
            amount: 120000,
            signDate: '2024-02-01',
            endDate: '2024-11-30',
            status: 'pending'
          },
          {
            id: 3,
            name: '技术咨询合同',
            number: 'HT2024003',
            client: 'DEF咨询公司',
            amount: 80000,
            signDate: '2024-01-20',
            endDate: '2024-06-30',
            status: 'completed'
          }
        ];
        
        this.contracts = mockData;
        
        uni.hideLoading();
      } catch (error) {
        console.error('加载合同数据失败:', error);
        uni.hideLoading();
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
      }
    },
    
    handleSearch() {
      // 搜索逻辑已在computed中处理
    },
    
    clearSearch() {
      this.searchKeyword = '';
    },
    
    setFilter(filter) {
      this.currentFilter = filter;
    },
    
    onRefresh() {
      this.isRefreshing = true;
      this.loadContractData().then(() => {
        this.isRefreshing = false;
        uni.showToast({
          title: '刷新成功',
          icon: 'success'
        });
      }).catch(() => {
        this.isRefreshing = false;
        uni.showToast({
          title: '刷新失败',
          icon: 'none'
        });
      });
    },
    
    handleContractClick(contract) {
      console.log('点击合同:', contract);
      // 跳转到合同详情页面
      uni.navigateTo({
        url: `/pages/contract/contract-detail?id=${contract.id}`
      });
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
    
    viewContract(contract) {
      console.log('查看合同:', contract);
      // 跳转到合同详情页面
      uni.navigateTo({
        url: `/pages/contract/contract-detail?id=${contract.id}&name=${encodeURIComponent(contract.name)}&number=${encodeURIComponent(contract.number)}&client=${encodeURIComponent(contract.client)}&amount=${contract.amount}&signDate=${encodeURIComponent(contract.signDate)}&endDate=${encodeURIComponent(contract.endDate)}&status=${contract.status}`,
        success: () => {
          console.log('跳转到合同详情页面成功');
        },
        fail: (err) => {
          console.error('跳转到合同详情页面失败:', err);
          uni.showModal({
            title: '提示',
            content: '合同详情页面正在开发中，敬请期待！',
            showCancel: false
          });
        }
      });
    },
    
    editContract(contract) {
      console.log('编辑合同:', contract);
      uni.showToast({
        title: '编辑合同功能开发中',
        icon: 'none'
      });
    },
    
    downloadContract(contract) {
      console.log('下载合同:', contract);
      uni.showToast({
        title: '下载合同文件',
        icon: 'none'
      });
    },
    
    showAddContract() {
      console.log('显示添加合同弹窗');
      this.showAddModal = true;
      console.log('showAddModal 状态:', this.showAddModal);
    },
    
    hideAddContract() {
      this.showAddModal = false;
      this.resetNewContract();
    },
    
    resetNewContract() {
      this.newContract = {
        name: '',
        number: '',
        client: '',
        amount: '',
        signDate: '',
        endDate: ''
      };
    },
    
    showSignDatePicker() {
      // 使用系统日期选择器
      uni.showModal({
        title: '选择签署日期',
        content: '请输入日期 (YYYY-MM-DD)',
        editable: true,
        placeholderText: '例如: 2024-01-20',
        success: (res) => {
          if (res.confirm && res.content) {
            // 简单的日期格式验证
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (dateRegex.test(res.content)) {
              console.log('选择签署日期:', res.content);
              this.newContract.signDate = res.content;
              this.$forceUpdate();
            } else {
              uni.showToast({
                title: '日期格式错误',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    
    showEndDatePicker() {
      // 使用系统日期选择器
      uni.showModal({
        title: '选择到期日期',
        content: '请输入日期 (YYYY-MM-DD)',
        editable: true,
        placeholderText: '例如: 2024-12-31',
        success: (res) => {
          if (res.confirm && res.content) {
            // 简单的日期格式验证
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (dateRegex.test(res.content)) {
              console.log('选择到期日期:', res.content);
              this.newContract.endDate = res.content;
              this.$forceUpdate();
            } else {
              uni.showToast({
                title: '日期格式错误',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    
    async addContract() {
      console.log('开始添加合同，当前数据:', this.newContract);
      
      // 验证必填字段
      if (!this.newContract.name || !this.newContract.name.trim()) {
        uni.showToast({
          title: '请输入合同名称',
          icon: 'none'
        });
        return;
      }
      
      if (!this.newContract.number || !this.newContract.number.trim()) {
        uni.showToast({
          title: '请输入合同编号',
          icon: 'none'
        });
        return;
      }
      
      if (!this.newContract.client || !this.newContract.client.trim()) {
        uni.showToast({
          title: '请输入客户名称',
          icon: 'none'
        });
        return;
      }
      
      if (!this.newContract.amount || parseFloat(this.newContract.amount) <= 0) {
        uni.showToast({
          title: '请输入有效的合同金额',
          icon: 'none'
        });
        return;
      }
      
      try {
        uni.showLoading({
          title: '添加中...'
        });
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 创建新合同对象
        const newContract = {
          id: Date.now(),
          name: this.newContract.name.trim(),
          number: this.newContract.number.trim(),
          client: this.newContract.client.trim(),
          amount: parseFloat(this.newContract.amount),
          signDate: this.newContract.signDate || new Date().toISOString().split('T')[0],
          endDate: this.newContract.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending'
        };
        
        console.log('创建的新合同:', newContract);
        
        // 添加到列表开头
        this.contracts.unshift(newContract);
        
        // 强制更新视图
        this.$forceUpdate();
        
        // 关闭弹窗并重置表单
        this.hideAddContract();
        
        uni.hideLoading();
        uni.showToast({
          title: '添加成功',
          icon: 'success'
        });
        
        console.log('合同添加成功，当前列表长度:', this.contracts.length);
        
      } catch (error) {
        console.error('添加合同失败:', error);
        uni.hideLoading();
        uni.showToast({
          title: '添加失败',
          icon: 'none'
        });
      }
    }
  }
};
</script>

<style scoped>
.contract-container {
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

.add-icon {
  font-size: 40rpx;
  font-weight: bold;
}

/* 搜索和筛选区域 */
.search-section {
  background: white;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #eee;
}

.search-box {
  position: relative;
  margin-bottom: 20rpx;
}

.search-icon {
  position: absolute;
  left: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 28rpx;
  color: #999;
}

.search-input {
  width: 100%;
  height: 80rpx;
  padding: 0 80rpx 0 60rpx;
  border: 1rpx solid #ddd;
  border-radius: 40rpx;
  font-size: 28rpx;
  background: #f8f9fa;
}

.clear-icon {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 32rpx;
  color: #999;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-tabs {
  display: flex;
  gap: 20rpx;
}

.filter-tab {
  flex: 1;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 30rpx;
  background: #f8f9fa;
  border: 1rpx solid #eee;
}

.filter-tab.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.tab-text {
  font-size: 24rpx;
}

/* 合同列表 */
.contract-list {
  flex: 1;
  padding: 20rpx 30rpx;
}

.contract-item {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.contract-header {
  margin-bottom: 20rpx;
}

.contract-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.title {
  font-size: 32rpx;
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
  font-size: 24rpx;
  color: #666;
}

.number-text {
  font-size: 24rpx;
  color: #666;
}

.contract-info {
  margin-bottom: 20rpx;
}

.info-row {
  display: flex;
  margin-bottom: 10rpx;
}

.info-label {
  width: 140rpx;
  font-size: 26rpx;
  color: #666;
}

.info-value {
  flex: 1;
  font-size: 26rpx;
  color: #333;
}

.info-value.amount {
  color: #e74c3c;
  font-weight: bold;
}

.info-value.expired {
  color: #e74c3c;
}

.contract-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 30rpx;
  font-size: 24rpx;
}

.action-btn.view {
  background: #e3f2fd;
  color: #1976d2;
}

.action-btn.edit {
  background: #fff3e0;
  color: #f57c00;
}

.action-btn.download {
  background: #e8f5e8;
  color: #388e3c;
}

.action-text {
  font-size: 24rpx;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 20rpx;
  display: block;
}

.empty-text {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.empty-desc {
  font-size: 26rpx;
  color: #999;
  display: block;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 600rpx;
  background: white;
  border-radius: 20rpx;
  overflow: visible;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  font-size: 28rpx;
  background: #f8f9fa;
}

.date-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.date-input {
  flex: 1;
  padding-right: 80rpx;
}

.date-picker-btn {
  position: absolute;
  right: 10rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #667eea;
  border-radius: 30rpx;
  z-index: 1002;
}

.picker-icon {
  font-size: 24rpx;
  color: white;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 1rpx solid #eee;
}

.btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.btn-cancel {
  background: #f8f9fa;
  color: #666;
}

.btn-confirm {
  background: #667eea;
  color: white;
}

.btn-text {
  font-size: 28rpx;
}
</style>
