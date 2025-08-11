<template>
  <view class="approval-detail-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="back-btn" @click="goBack">
          <text class="back-icon">←</text>
        </view>
        <view class="navbar-title">详情</view>
        <view class="navbar-right">
          <text class="status-tag" :class="getHeaderStatusClass()">{{ detailData.statusText }}</text>
        </view>
      </view>
    </view>

    <scroll-view class="detail-content" scroll-y="true">
      <!-- 标题区域 -->
      <view class="header-section">
        <view class="title">{{ detailData.title }}</view>
        <view class="subtitle">{{ detailData.company }}</view>
      </view>

      <!-- 合同基本信息 -->
      <view class="info-section">
        <view class="section-header">
          <view class="section-title">{{ detailData.contractName || '合同名称' }}</view>
          <view class="contract-type-tag">{{ detailData.contractType || '合同类型' }}</view>
        </view>
        
        <view class="info-grid">
          <view class="info-row">
            <text class="info-label">甲方单位</text>
            <text class="info-value">{{ detailData.partyA || '大大建设' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">乙方单位</text>
            <text class="info-value">{{ detailData.partyB || '乙方单位' }}</text>
          </view>
        </view>
      </view>

      <!-- 财务信息 -->
      <view class="finance-section">
        <view class="section-title-with-dot">
          <view class="dot green"></view>
          <text class="section-title">财务</text>
        </view>
        
        <view class="finance-grid">
          <view class="finance-item">
            <text class="finance-label">含税金额</text>
            <text class="finance-value">¥{{ (detailData.amount || 100000).toLocaleString() }}</text>
          </view>
          <view class="finance-item">
            <text class="finance-label">税率</text>
            <text class="finance-value">{{ detailData.taxRate || 1 }}%</text>
          </view>
          <view class="finance-item">
            <text class="finance-label">税额</text>
            <text class="finance-value">¥{{ (detailData.taxAmount || 990).toLocaleString() }}</text>
          </view>
          <view class="finance-item">
            <text class="finance-label">不含税金额</text>
            <text class="finance-value">¥{{ (detailData.amountExcludingTax || 99001).toLocaleString() }}</text>
          </view>
          <view class="finance-item">
            <text class="finance-label">发票类型</text>
            <text class="finance-value">{{ detailData.invoiceType || '增值税普通发票（蓝）' }}</text>
          </view>
        </view>
      </view>

      <!-- 其他信息 -->
      <view class="other-section">
        <view class="section-title-with-dot">
          <view class="dot green"></view>
          <text class="section-title">其他</text>
        </view>
        
        <view class="other-grid">
          <view class="other-item">
            <text class="other-label">开始日期</text>
            <text class="other-value">{{ detailData.startDate || '2021.07.26' }}</text>
          </view>
          <view class="other-item">
            <text class="other-label">结束日期</text>
            <text class="other-value">{{ detailData.endDate || '2021.08.23' }}</text>
          </view>
          <view class="other-item">
            <text class="other-label">付款条件</text>
            <text class="other-value">{{ detailData.paymentTerms || '增值税普通发票（蓝）' }}</text>
          </view>
          <view class="other-item">
            <text class="other-label">备注</text>
            <text class="other-value">{{ detailData.remarks || '备注备注备注备注备注备注备注备注备注备注备注备注...' }}</text>
          </view>
        </view>
      </view>

      <!-- 收款计划 -->
      <view class="payment-plan-section">
        <view class="section-header-with-action">
          <view class="section-title-with-dot">
            <view class="dot green"></view>
            <text class="section-title">收款计划</text>
          </view>
          <text class="view-detail-btn">查看明细</text>
        </view>
        
        <view class="payment-plan-list">
          <view class="payment-item" v-for="(item, index) in paymentPlan" :key="index">
            <view class="payment-date">{{ item.date }}</view>
            <view class="payment-info">
              <text class="payment-label">收款金额</text>
              <text class="payment-amount">¥{{ item.amount }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 材料 -->
      <view class="material-section">
        <view class="section-header-with-action">
          <view class="section-title-with-dot">
            <view class="dot green"></view>
            <text class="section-title">材料</text>
          </view>
          <text class="view-detail-btn">查看明细</text>
        </view>
        
        <view class="material-list">
          <view class="material-item" v-for="(item, index) in materials" :key="index">
            <text class="material-name">{{ item.name }}</text>
            <text class="material-unit">{{ item.unit }}</text>
            <view class="material-price">
              <text class="price-label">采购合价</text>
              <text class="price-value">¥{{ item.price }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 附件 -->
      <view class="attachment-section">
        <view class="section-title-with-dot">
          <view class="dot green"></view>
          <text class="section-title">附件</text>
        </view>
        
        <view class="attachment-grid">
          <view class="attachment-item" v-for="(item, index) in attachments" :key="index" @click="previewFile(item)">
            <view class="file-icon">📄</view>
            <text class="file-name">{{ item.name }}</text>
          </view>
        </view>
      </view>

      <!-- 审批人 -->
      <view class="approval-flow-section">
        <view class="section-title-with-dot">
          <view class="dot green"></view>
          <text class="section-title">审批人</text>
        </view>
        
        <view class="approval-flow">
          <view class="approval-step" v-for="(step, index) in approvalFlow" :key="index">
            <view class="step-avatar">
              <text class="avatar-text">{{ step.name.charAt(0) }}</text>
            </view>
            <view class="step-info">
              <view class="step-name">{{ step.name }}</view>
              <view class="step-status" :class="step.statusClass">{{ step.status }}</view>
              <view class="step-time" v-if="step.time">{{ step.time }}</view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作按钮 -->
    <view class="bottom-actions" v-if="showActions">
      <button class="action-btn comment-btn" @click="addComment">
        评论
      </button>
    </view>

    <!-- 待审批时的操作按钮 -->
    <view class="approval-actions" v-if="needApproval">
      <button class="reject-btn" @click="rejectApproval">驳回</button>
      <button class="approve-btn" @click="approveApproval">通过</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      approvalId: '',
      detailData: {},
      showActions: true,
      needApproval: false,
      // 收款计划数据
      paymentPlan: [
        { date: '2021.08.12', amount: '990' },
        { date: '2021.08.20', amount: '990' },
        { date: '2021.08.20', amount: '990' }
      ],
      // 材料数据
      materials: [
        { name: '钢筋', unit: '1吨', price: '1,000' },
        { name: '水泥', unit: '1吨', price: '1,000' }
      ],
      // 附件数据
      attachments: [
        { name: '合同附件.pdf', type: 'pdf' },
        { name: '技术规范.docx', type: 'doc' },
        { name: '图纸文件.dwg', type: 'dwg' },
        { name: '文档附件.pdf', type: 'pdf' }
      ],
      // 审批流程数据
      approvalFlow: [
        { 
          name: '我', 
          status: '发起', 
          statusClass: 'status-initiated',
          time: '07.26 10:01' 
        },
        { 
          name: '刘玉笑', 
          status: '审批中', 
          statusClass: 'status-processing',
          time: '' 
        },
        { 
          name: '陈怡', 
          status: '待审批', 
          statusClass: 'status-pending',
          time: '' 
        }
      ]
    };
  },
  
  onLoad(options) {
    if (options.id) {
      this.approvalId = options.id;
      this.loadDetailData();
    }
  },

  onShow() {
    // 页面显示时刷新数据（处理从其他页面返回的情况）
    if (this.approvalId) {
      console.log('🔄 页面显示，刷新详情数据');
      this.loadDetailData();
    }
  },

  methods: {
    goBack() {
      uni.navigateBack();
    },

    async loadDetailData() {
      try {
        console.log('🔍 加载合同详情，ID:', this.approvalId);
        
        if (!this.approvalId) {
          console.error('❌ 缺少合同申请ID');
          uni.showToast({
            title: '参数错误',
            icon: 'none'
          });
          return;
        }

        uni.showLoading({ title: '加载中...' });

        // 调用真实API获取合同申请详情
        const result = await uni.request({
          url: `http://localhost:3000/lz/api/contracts/${this.approvalId}`,
          method: 'GET',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${uni.getStorageSync('token') || ''}`
          },
          timeout: 10000
        });

        console.log('📊 合同详情API响应:', result);

        if (result.statusCode === 200 && result.data && result.data.success) {
          const contractData = result.data.data;
          console.log('✅ 获取合同详情成功:', contractData);

          // 设置详情数据
          this.detailData = {
            title: `${contractData.applicant?.name || '未知'}的合同申请`,
            company: contractData.project?.name || '未知项目',
            statusText: this.getStatusText(contractData.status || '待审批'),
            status: contractData.status || '待审批',
            contractName: contractData.contract?.name || '未知合同',
            contractType: contractData.contract?.type || '工程合同',
            partyA: contractData.contract?.partyA?.name || '未知甲方',
            partyB: contractData.contract?.partyB?.name || '未知乙方',
            amount: contractData.financial?.amountIncludingTax || 0,
            taxRate: contractData.financial?.taxRate || 0,
            taxAmount: contractData.financial?.taxAmount || 0,
            amountExcludingTax: contractData.financial?.amountExcludingTax || 0,
            invoiceType: contractData.financial?.invoiceType || '增值税普通发票(蓝)',
            startDate: contractData.contract?.startDate ? 
              new Date(contractData.contract.startDate).toLocaleDateString('zh-CN') : '未知',
            endDate: contractData.contract?.endDate ? 
              new Date(contractData.contract.endDate).toLocaleDateString('zh-CN') : '未知',
            paymentTerms: contractData.contract?.paymentTerms || '未知',
            remarks: contractData.remarks || '无备注',
            rawData: contractData
          };

          // 根据状态决定是否显示审批按钮
          this.needApproval = ['待审批', '审批中'].includes(contractData.status);
          
          console.log('📋 详情数据设置完成:', {
            status: this.detailData.status,
            needApproval: this.needApproval
          });

        } else {
          throw new Error(`API错误: ${result.data?.message || '获取详情失败'}`);
        }

        uni.hideLoading();

      } catch (error) {
        uni.hideLoading();
        console.error('❌ 加载合同详情失败:', error);
        
        // 显示错误信息，不使用可能误导的模拟数据
        this.detailData = {
          title: '加载失败',
          company: '无法获取项目信息',
          statusText: '未知状态',
          status: 'error'
        };
        this.needApproval = false;
        
        uni.showModal({
          title: '加载失败',
          content: '无法获取合同详情，请检查网络连接后重试',
          showCancel: true,
          cancelText: '返回',
          confirmText: '重试',
          success: (res) => {
            if (res.confirm) {
              this.loadDetailData(); // 重新尝试加载
            } else {
              uni.navigateBack(); // 返回上一页
            }
          }
        });
      }
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        '草稿': '草稿',
        '待审批': '待核准审批',
        '审批中': '审批中',
        '已批准': '已通过',
        '已拒绝': '已驳回',
        '已取消': '已撤销'
      };
      return statusMap[status] || status;
    },

    getHeaderStatusClass() {
      const statusMap = {
        'pending': 'status-pending',
        'approved': 'status-approved', 
        'rejected': 'status-rejected',
        'cancelled': 'status-cancelled',
        '草稿': 'status-draft',
        '待审批': 'status-pending',
        '审批中': 'status-processing',
        '已批准': 'status-approved',
        '已拒绝': 'status-rejected',
        '已取消': 'status-cancelled'
      };
      return statusMap[this.detailData.status] || 'status-pending';
    },

    previewFile(file) {
      uni.showToast({
        title: `预览 ${file.name}`,
        icon: 'none'
      });
    },

    addComment() {
      uni.navigateTo({
        url: '/pages/comment/comment'
      });
    },

    approveApproval() {
      uni.showModal({
        title: '确认审批',
        content: '确定要通过该审批申请吗？',
        success: (res) => {
          if (res.confirm) {
            this.handleApproval('approve');
          }
        }
      });
    },

    rejectApproval() {
      uni.showModal({
        title: '确认驳回',
        content: '确定要驳回该审批申请吗？',
        success: (res) => {
          if (res.confirm) {
            this.handleApproval('reject');
          }
        }
      });
    },

    async handleApproval(action) {
      try {
        uni.showLoading({ title: '处理中...' });
        
        console.log('🔍 开始处理审批，操作:', action, 'ID:', this.approvalId);

        // 调用真实的审批API
        const result = await uni.request({
          url: `http://localhost:3000/lz/api/contracts/${this.approvalId}/approve`,
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${uni.getStorageSync('token') || ''}`
          },
          data: {
            action: action, // 'approve' 或 'reject'
            comments: action === 'approve' ? '审批通过' : '审批驳回'
          },
          timeout: 10000
        });

        console.log('📊 审批API响应:', result);

        if ((result.statusCode === 200 || result.statusCode === 201) && result.data && result.data.success) {
          console.log('✅ 审批操作成功');
          
          uni.hideLoading();
          uni.showToast({
            title: action === 'approve' ? '审批通过' : '审批驳回',
            icon: 'success'
          });
          
          // 重新加载详情数据以确保状态同步
          await this.loadDetailData();
          
          // 延迟返回上一页
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);

        } else {
          throw new Error(`API错误: ${result.data?.message || '审批操作失败'}`);
        }

      } catch (error) {
        uni.hideLoading();
        console.error('❌ 审批操作失败:', error);
        
        // 显示真实的错误信息
        uni.showModal({
          title: '审批失败',
          content: error.message || '网络错误，请检查网络连接后重试',
          showCancel: false,
          confirmText: '知道了'
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.approval-detail-container {
  background-color: #f8f8f8;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 自定义导航栏 */
.custom-navbar {
  background-color: #ffffff;
  padding-top: var(--status-bar-height);
  width: 100%;
  box-sizing: border-box;
  
  .navbar-content {
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 15px;
    width: 100%;
    box-sizing: border-box;
    
    .back-btn {
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .back-icon {
        font-size: 18px;
        color: #333;
      }
    }
    
    .navbar-title {
      font-size: 17px;
      font-weight: 600;
      color: #333;
    }
    
    .navbar-right {
      .status-tag {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        
        &.status-pending {
          background-color: #fff7e6;
          color: #fa8c16;
        }
        
        &.status-processing {
          background-color: #e6f7ff;
          color: #1890ff;
        }
        
        &.status-approved {
          background-color: #e8f5e8;
          color: #52c41a;
        }
        
        &.status-rejected {
          background-color: #ffeaea;
          color: #ff4d4f;
        }
        
        &.status-cancelled {
          background-color: #f0f0f0;
          color: #999;
        }
        
        &.status-draft {
          background-color: #f5f5f5;
          color: #666;
        }
      }
    }
  }
}

.detail-content {
  flex: 1;
  padding: 0 15px 80px 15px;
  width: 100%;
  box-sizing: border-box;
}

/* 标题区域 */
.header-section {
  padding: 20px 0;
  width: 100%;
  box-sizing: border-box;
  
  .title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
  }
  
  .subtitle {
    font-size: 14px;
    color: #666;
  }
}

/* 通用信息区域 */
.info-section, .finance-section, .other-section, 
.payment-plan-section, .material-section, 
.attachment-section, .approval-flow-section {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  margin-left: 0;
  margin-right: 0;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
  
  .contract-type-tag {
    background-color: #e6f7ff;
    color: #1890ff;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
  }
}

.section-title-with-dot {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 8px;
    
    &.green {
      background-color: #52c41a;
    }
  }
  
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }
}

.section-header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  .view-detail-btn {
    font-size: 12px;
    color: #1890ff;
  }
}

/* 信息网格 */
.info-grid {
  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-right: 0;
    
    .info-label {
      font-size: 14px;
      color: #666;
      flex-shrink: 0;
    }
    
    .info-value {
      font-size: 14px;
      color: #333;
      font-weight: 500;
      text-align: right;
      word-break: break-all;
      margin-left: 10px;
    }
  }
}

/* 财务信息 */
.finance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
  
  .finance-item {
    display: flex;
    justify-content: space-between;
    padding-right: 0;
    min-width: 0;
    
    .finance-label {
      font-size: 13px;
      color: #666;
      flex-shrink: 0;
    }
    
    .finance-value {
      font-size: 13px;
      color: #333;
      font-weight: 500;
      text-align: right;
      word-break: break-all;
      margin-left: 8px;
      min-width: 0;
    }
  }
}

/* 其他信息 */
.other-grid {
  .other-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-right: 0;
    
    .other-label {
      font-size: 13px;
      color: #666;
      flex-shrink: 0;
    }
    
    .other-value {
      font-size: 13px;
      color: #333;
      font-weight: 500;
      text-align: right;
      word-break: break-all;
      margin-left: 10px;
    }
  }
}

/* 收款计划 */
.payment-plan-list {
  .payment-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .payment-date {
      font-size: 13px;
      color: #333;
      font-weight: 500;
      flex-shrink: 0;
    }
    
    .payment-info {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .payment-label {
        font-size: 12px;
        color: #666;
      }
      
      .payment-amount {
        font-size: 13px;
        color: #333;
        font-weight: 600;
      }
    }
  }
}

/* 材料列表 */
.material-list {
  .material-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .material-name {
      font-size: 13px;
      color: #333;
      font-weight: 500;
      flex-shrink: 0;
    }
    
    .material-unit {
      font-size: 12px;
      color: #666;
      margin-left: 4px;
    }
    
    .material-price {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
      
      .price-label {
        font-size: 12px;
        color: #666;
      }
      
      .price-value {
        font-size: 13px;
        color: #333;
        font-weight: 600;
      }
    }
  }
}

/* 附件网格 */
.attachment-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  
  .attachment-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
    
    .file-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }
    
    .file-name {
      font-size: 12px;
      color: #666;
      text-align: center;
      line-height: 1.2;
    }
  }
}

/* 审批流程 */
.approval-flow {
  .approval-step {
    display: flex;
    align-items: center;
    padding: 12px 0;
    
    .step-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      
      .avatar-text {
        font-size: 14px;
        color: #666;
        font-weight: 500;
      }
    }
    
    .step-info {
      flex: 1;
      
      .step-name {
        font-size: 14px;
        color: #333;
        font-weight: 500;
        margin-bottom: 4px;
      }
      
      .step-status {
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 10px;
        display: inline-block;
        margin-bottom: 4px;
        
        &.status-initiated {
          background-color: #e8f5e8;
          color: #52c41a;
        }
        
        &.status-processing {
          background-color: #fff7e6;
          color: #fa8c16;
        }
        
        &.status-pending {
          background-color: #f0f0f0;
          color: #999;
        }
      }
      
      .step-time {
        font-size: 11px;
        color: #999;
      }
    }
  }
}

/* 底部操作按钮 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 12px 15px;
  border-top: 1px solid #e5e5e5;
  box-sizing: border-box;
  
  .comment-btn {
    width: 100%;
    background-color: #ffffff;
    color: #333;
    border: 1px solid #d9d9d9;
    border-radius: 20px;
    height: 40px;
    font-size: 14px;
    box-sizing: border-box;
  }
}

/* 审批操作按钮 */
.approval-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 12px 15px;
  border-top: 1px solid #e5e5e5;
  display: flex;
  gap: 12px;
  box-sizing: border-box;
  
  .reject-btn, .approve-btn {
    flex: 1;
    height: 40px;
    border-radius: 20px;
    font-size: 14px;
    border: none;
    box-sizing: border-box;
  }
  
  .reject-btn {
    background-color: #f5f5f5;
    color: #666;
  }
  
  .approve-btn {
    background-color: #00d4aa;
    color: #ffffff;
  }
}
</style> 