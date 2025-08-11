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
            <view class="status-badge" :class="contract.originalStatus === '草稿' ? 'draft' : contract.status">
              <text class="status-text">{{ getDetailedStatusText(contract) }}</text>
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
          <view class="action-btn edit" @click.stop="editContract(contract)" v-if="contract.status === 'pending'">
            <text class="action-text">编辑</text>
          </view>
          <!-- 只有草稿状态的合同才显示提交审批按钮 -->
          <view class="action-btn submit" @click.stop="submitForApproval(contract)" v-if="isDraftStatus(contract)">
            <text class="action-text">提交审批</text>
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
            <picker 
              mode="date" 
              :value="newContract.signDate" 
              @change="onSignDateChange"
              class="date-picker"
              :disabled="false"
            >
              <view class="picker-input">
                <input 
                  class="form-input date-input" 
                  :value="newContract.signDate || '请选择签署日期'" 
                  placeholder="请选择签署日期"
                  disabled
                />
                <view class="date-picker-btn">
                  <text class="picker-icon">📅</text>
                </view>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">到期日期</text>
            <picker 
              mode="date" 
              :value="newContract.endDate" 
              @change="onEndDateChange"
              class="date-picker"
              :disabled="false"
            >
              <view class="picker-input">
                <input 
                  class="form-input date-input" 
                  :value="newContract.endDate || '请选择到期日期'" 
                  placeholder="请选择到期日期"
                  disabled
                />
                <view class="date-picker-btn">
                  <text class="picker-icon">📅</text>
                </view>
              </view>
            </picker>
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
import { API_CONFIG } from '@/config/api.js';

export default {
  data() {
    return {
      searchKeyword: '',
      currentFilter: 'all',
      isRefreshing: false,
      showAddModal: false,
      contracts: [],
      searchTimeout: null,
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
    
    // 获取token
    getToken() {
      return uni.getStorageSync('token') || '';
    },

    // 加载合同数据
    async loadContractData() {
      try {
        console.log('🔍 开始加载合同数据...');
        
        uni.showLoading({
          title: '加载中...'
        });
        
        // 构建查询参数
        const queryParams = new URLSearchParams();
        if (this.searchKeyword) {
          queryParams.append('keyword', this.searchKeyword);
        }
        if (this.currentFilter !== 'all') {
          // 将前端状态映射为后端状态
          const backendStatus = this.mapFrontendToBackendStatus(this.currentFilter);
          if (backendStatus) {
            queryParams.append('status', backendStatus);
          }
        }
        
        const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.CONTRACT_API}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        console.log('📡 API请求URL:', apiUrl);
        
        // 调用真实的API
        const result = await uni.request({
          url: apiUrl,
          method: 'GET',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`
          },
          timeout: 10000
        });
        
        console.log('📊 合同API响应:', result);
        
        if (result.statusCode === 200 && result.data) {
          let contractsData = [];
          
          // 检查API返回的数据结构
          if (result.data.success && result.data.data) {
            // 后端返回的数据结构：{success: true, data: {applications: [...], pagination: {...}}}
            if (result.data.data.applications) {
              contractsData = result.data.data.applications;
            } else if (Array.isArray(result.data.data)) {
              contractsData = result.data.data;
            }
          } else if (Array.isArray(result.data)) {
            contractsData = result.data;
          }
          
          console.log('📊 解析后的合同数据:', contractsData);
          
          // 转换后端数据格式到前端格式
          this.contracts = contractsData.map(contract => {
            return {
              id: contract._id || contract.id,
              name: contract.contract?.name || contract.name || '未知合同',
              number: contract.contract?.projectCode || contract.number || '无编号',
              client: contract.contract?.partyB?.name || contract.client || '未知客户',
              amount: contract.financial?.amountIncludingTax || contract.amount || 0,
              signDate: contract.contract?.startDate ? 
                new Date(contract.contract.startDate).toISOString().split('T')[0] : 
                (contract.signDate || '未知'),
              endDate: contract.contract?.endDate ? 
                new Date(contract.contract.endDate).toISOString().split('T')[0] : 
                (contract.endDate || '未知'),
              status: this.mapBackendStatus(contract.status) || 'pending',
              originalStatus: contract.status || '草稿' // 保存原始状态，用于判断是否需要显示提交审批按钮
            };
          });
          
          console.log('✅ 合同数据转换完成:', this.contracts);
        } else {
          throw new Error(`API响应错误: ${result.statusCode}`);
        }
        
        uni.hideLoading();
      } catch (error) {
        console.error('❌ 加载合同数据失败:', error);
        uni.hideLoading();
        
        // 使用模拟数据作为降级方案
        console.log('🔄 使用模拟数据...');
        this.contracts = [
          {
            id: 'mock-1',
            name: '软件开发服务合同',
            number: 'HT2024001',
            client: 'ABC科技有限公司',
            amount: 500000,
            signDate: '2024-01-15',
            endDate: '2024-12-31',
            status: 'active'
          },
          {
            id: 'mock-2',
            name: '系统维护合同',
            number: 'HT2024002',
            client: 'XYZ企业集团',
            amount: 120000,
            signDate: '2024-02-01',
            endDate: '2024-11-30',
            status: 'pending'
          }
        ];
        
        uni.showToast({
          title: '使用模拟数据',
          icon: 'none'
        });
      }
    },

    // 映射后端状态到前端状态
    mapBackendStatus(backendStatus) {
      const statusMap = {
        '草稿': 'pending',
        '待审批': 'pending',
        '审批中': 'pending',
        '已批准': 'active',
        '已拒绝': 'completed',
        '已取消': 'completed'
      };
      return statusMap[backendStatus] || 'pending';
    },

    // 映射前端状态到后端状态
    mapFrontendToBackendStatus(frontendStatus) {
      const statusMap = {
        'pending': '待审批',
        'active': '已批准', 
        'completed': '已拒绝'
      };
      return statusMap[frontendStatus] || null;
    },
    
    // 处理搜索 - 使用防抖
    handleSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.loadContractData();
      }, 500);
    },
    
    clearSearch() {
      this.searchKeyword = '';
    },
    
    setFilter(filter) {
      this.currentFilter = filter;
      this.loadContractData(); // 改变筛选条件时重新加载数据
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

    // 根据原始状态显示更准确的状态文本
    getDetailedStatusText(contract) {
      if (contract.originalStatus === '草稿') {
        return '草稿';
      } else if (contract.originalStatus === '待审批') {
        return '待审批';
      } else if (contract.originalStatus === '审批中') {
        return '审批中';
      } else if (contract.originalStatus === '已批准') {
        return '已批准';
      } else if (contract.originalStatus === '已拒绝') {
        return '已拒绝';
      }
      return this.getStatusText(contract.status);
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

    // 判断是否为草稿状态（需要显示提交审批按钮）
    isDraftStatus(contract) {
      // 检查原始状态，如果是草稿则显示提交审批按钮
      return contract.originalStatus === '草稿' || 
             (contract.status === 'pending' && contract.originalStatus !== '待审批');
    },

    // 提交审批
    async submitForApproval(contract) {
      try {
        console.log('提交合同审批:', contract);
        
        uni.showModal({
          title: '确认提交',
          content: `确定要将合同"${contract.name}"提交审批吗？`,
          success: async (res) => {
            if (res.confirm) {
              try {
                uni.showLoading({
                  title: '提交中...'
                });

                // 调用后端API提交审批
                const result = await uni.request({
                  url: `${API_CONFIG.BASE_URL}${API_CONFIG.CONTRACT_API}/${contract.id}/submit`,
                  method: 'POST',
                  header: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`
                  },
                  data: {
                    approvers: [
                      // 这里可以添加审批人信息，目前使用默认审批流程
                    ]
                  },
                  timeout: 10000
                });

                console.log('提交审批响应:', result);

                if ((result.statusCode === 200 || result.statusCode === 201) && result.data && result.data.success) {
                  console.log('✅ 提交审批成功');
                  
                  uni.hideLoading();
                  uni.showToast({
                    title: '提交成功',
                    icon: 'success'
                  });

                  // 刷新数据
                  await this.loadContractData();
                  
                  // 可选：跳转到审批页面
                  setTimeout(() => {
                    uni.showModal({
                      title: '提示',
                      content: '合同已提交审批，是否前往审批页面查看？',
                      success: (modalRes) => {
                        if (modalRes.confirm) {
                          uni.navigateTo({
                            url: '/pages/approval/approval'
                          });
                        }
                      }
                    });
                  }, 1000);

                } else {
                  throw new Error(`提交失败: ${result.data?.message || '未知错误'}`);
                }

              } catch (error) {
                uni.hideLoading();
                console.error('❌ 提交审批失败:', error);
                
                uni.showModal({
                  title: '提交失败',
                  content: error.message || '网络错误，请重试',
                  showCancel: false
                });
              }
            }
          }
        });

      } catch (error) {
        console.error('提交审批操作失败:', error);
      }
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
    
    // 签署日期选择器事件
    onSignDateChange(e) {
      console.log('选择签署日期:', e.detail.value);
      this.newContract.signDate = e.detail.value;
      this.resetPickerZIndex();
    },
    
    // 到期日期选择器事件
    onEndDateChange(e) {
      console.log('选择到期日期:', e.detail.value);
      this.newContract.endDate = e.detail.value;
      this.resetPickerZIndex();
    },
    
    // 重置picker的z-index
    resetPickerZIndex() {
      this.$nextTick(() => {
        // 确保picker弹出层在模态框之上
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
          modalOverlay.style.zIndex = '998';
          setTimeout(() => {
            modalOverlay.style.zIndex = '999';
          }, 100);
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
      
      // 检查日期字段（可选验证）
      if (this.newContract.signDate && this.newContract.endDate) {
        const signDate = new Date(this.newContract.signDate);
        const endDate = new Date(this.newContract.endDate);
        
        if (signDate >= endDate) {
          uni.showToast({
            title: '到期日期必须晚于签署日期',
            icon: 'none'
          });
          return;
        }
      }
      
      try {
        uni.showLoading({
          title: '添加中...'
        });
        
        // 构造符合后端API要求的数据格式
        const contractData = {
          applicant: {
            name: '当前用户', // 这里应该从用户信息获取
            userId: '64f8b8b8b8b8b8b8b8b8b8b8' // 这里应该从用户信息获取
          },
          project: {
            name: `${this.newContract.name}相关项目`,
            description: `与合同${this.newContract.name}相关的项目`
          },
          contract: {
            name: this.newContract.name.trim(),
            type: '工程合同',
            partyA: {
              name: '本公司',
              contact: ''
            },
            partyB: {
              name: this.newContract.client.trim(),
              contact: ''
            },
            startDate: this.newContract.signDate || new Date().toISOString().split('T')[0],
            endDate: this.newContract.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            paymentTerms: '按合同约定支付'
          },
          financial: {
            amountIncludingTax: parseFloat(this.newContract.amount),
            taxRate: 0,
            taxAmount: 0,
            amountExcludingTax: parseFloat(this.newContract.amount),
            invoiceType: '增值税普通发票(蓝)'
          },
          remarks: '通过前端合同管理页面创建'
        };
        
        console.log('📤 发送合同数据:', contractData);
        
        // 调用真实的API
        const result = await uni.request({
          url: `${API_CONFIG.BASE_URL}${API_CONFIG.CONTRACT_API}`,
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`
          },
          data: contractData,
          timeout: 10000
        });
        
        console.log('📊 创建合同API响应:', result);
        
        console.log('📊 创建合同API完整响应:', {
          statusCode: result.statusCode,
          data: result.data,
          success: result.data?.success
        });
        
        if ((result.statusCode === 201 || result.statusCode === 200) && result.data && result.data.success) {
          console.log('✅ 合同创建成功');
          
          // 重新加载数据
          await this.loadContractData();
          
          // 关闭弹窗并重置表单
          this.hideAddContract();
          
          uni.hideLoading();
          uni.showToast({
            title: '添加成功',
            icon: 'success'
          });
        } else {
          console.error('❌ API响应异常:', {
            statusCode: result.statusCode,
            success: result.data?.success,
            message: result.data?.message
          });
          throw new Error(`API错误: ${result.data?.message || '创建失败'}`);
        }
        
      } catch (error) {
        console.error('❌ 添加合同失败:', error);
        uni.hideLoading();
        
        // 降级方案：添加到本地列表
        const newContract = {
          id: 'local-' + Date.now(),
          name: this.newContract.name.trim(),
          number: this.newContract.number.trim(),
          client: this.newContract.client.trim(),
          amount: parseFloat(this.newContract.amount),
          signDate: this.newContract.signDate || new Date().toISOString().split('T')[0],
          endDate: this.newContract.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending'
        };
        
        this.contracts.unshift(newContract);
        this.hideAddContract();
        
        uni.showToast({
          title: '已添加到本地',
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

.status-badge.draft {
  background: #e2e3e5;
  color: #495057;
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

.action-btn.submit {
  background: #fff3e0;
  color: #ff6f00;
  border: 1px solid #ffb74d;
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
  z-index: 999;
}

.modal-content {
  width: 90%;
  max-width: 600rpx;
  background: white;
  border-radius: 20rpx;
  overflow: visible;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  z-index: 1000;
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

.date-picker {
  width: 100%;
  position: relative;
  z-index: 1001;
}

.picker-input {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  z-index: 1;
}

.date-input {
  flex: 1;
  padding-right: 80rpx;
  color: #333 !important;
  background: transparent !important;
}

.date-input[disabled] {
  color: #333 !important;
  opacity: 1 !important;
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
  z-index: 1;
  pointer-events: none;
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

/* 修复picker在模态框中的z-index问题 */
.modal-content :deep(.uni-picker-container) {
  z-index: 10000 !important;
}

.modal-content :deep(.uni-picker) {
  z-index: 10000 !important;
}

/* 微信小程序picker修复 */
.modal-content :deep(.wx-picker-view) {
  z-index: 10000 !important;
}

/* H5端picker修复 */
.modal-content :deep(.uni-picker-system) {
  z-index: 10000 !important;
}

/* 兼容旧版本语法 */
.modal-content >>> .uni-picker-container,
.modal-content /deep/ .uni-picker-container {
  z-index: 10000 !important;
}

/* 全局picker修复 - 针对模态框场景 */
page {
  --picker-z-index: 10000;
}

/* 确保picker的遮罩层不会被模态框遮挡 */
.uni-modal {
  z-index: 9999 !important;
}

/* APP端picker修复 */
.date-picker picker-view {
  z-index: 10001 !important;
}

/* 小程序端特殊处理 */
.modal-overlay.picker-active {
  z-index: 998 !important;
}
</style>
