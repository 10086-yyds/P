<template>
	<view class="approval-container">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="navbar-content">
				<view class="back-btn" @click="goBack">
					<text class="iconfont">&#xe603;</text>
				</view>
				<view class="navbar-title">我的审批</view>
			</view>
		</view>

		<!-- 标签页导航 -->
		<view class="tab-container">
			<scroll-view class="tab-scroll" scroll-x="true" :scroll-left="scrollLeft">
				<view class="tab-list">
					<view 
						v-for="(tab, index) in tabs" 
						:key="index"
						class="tab-item"
						:class="{ active: currentTab === index }"
						@click="switchTab(index)"
					>
						<text class="tab-text">{{ tab.name }}</text>
						<view class="tab-line" v-if="currentTab === index"></view>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 搜索栏 -->
		<view class="search-container">
			<view class="search-box">
				<text class="search-icon">🔍</text>
				<input 
					class="search-input" 
					placeholder="搜索名称、编码"
					v-model="searchKeyword"
					@input="onSearch"
				/>
			</view>
			<view class="filter-btn" @click="testApiConnection">
				<text class="filter-icon">🔧</text>
			</view>
		</view>
		
		<!-- 调试信息面板 -->
		<view class="debug-panel" v-if="showDebugPanel">
			<view class="debug-header">
				<text class="debug-title">API调试信息</text>
				<view class="close-debug-btn" @click="showDebugPanel = false">✕</view>
			</view>
			<view class="debug-content">
				<view class="debug-item">
					<text class="debug-label">API状态:</text>
					<text class="debug-value">{{ debugInfo.apiStatus }}</text>
				</view>
				<view class="debug-item">
					<text class="debug-label">最后请求:</text>
					<text class="debug-value">{{ debugInfo.lastRequest }}</text>
				</view>
				<view class="debug-item">
					<text class="debug-label">响应状态:</text>
					<text class="debug-value">{{ debugInfo.responseStatus }}</text>
				</view>
				<view class="debug-item">
					<text class="debug-label">数据条数:</text>
					<text class="debug-value">{{ debugInfo.dataCount }}</text>
				</view>
				<view class="debug-actions">
					<button class="debug-btn" @click="testDatabase">测试数据库</button>
					<button class="debug-btn" @click="createTestData">创建测试数据</button>
					<button class="debug-btn" @click="refreshData">刷新数据</button>
				</view>
			</view>
		</view>

		<!-- 审批列表 -->
		<scroll-view class="approval-list" scroll-y="true" @scrolltolower="loadMore">
			<view 
				v-for="(item, index) in currentList" 
				:key="index"
				class="approval-item"
				@click="goToDetail(item)"
			>
				<view class="item-header">
					<view class="item-title">{{ item.title }}</view>
					<view class="item-time">{{ item.time }}</view>
				</view>
				
				<view class="item-content">
					<view class="item-info">{{ item.company }}</view>
					<view class="item-detail">
						<text class="detail-label">合同名称：</text>
						<text class="detail-value">{{ item.contractName }}</text>
					</view>
					<view class="item-detail">
						<text class="detail-label">合同类型：</text>
						<text class="detail-value">{{ item.contractType }}</text>
					</view>
					<view class="item-detail">
						<text class="detail-label">甲方：</text>
						<text class="detail-value">{{ item.partyA || '未知' }}</text>
					</view>
					<view class="item-detail">
						<text class="detail-label">乙方：</text>
						<text class="detail-value">{{ item.partyB || '未知' }}</text>
					</view>
					<view class="item-detail" v-if="item.amount">
						<text class="detail-label">合同金额：</text>
						<text class="detail-value amount">¥{{ formatAmount(item.amount) }}</text>
					</view>
					<view class="item-detail" v-if="item.startDate">
						<text class="detail-label">开始日期：</text>
						<text class="detail-value">{{ item.startDate }}</text>
					</view>
					<view class="item-detail" v-if="item.endDate">
						<text class="detail-label">结束日期：</text>
						<text class="detail-value">{{ item.endDate }}</text>
					</view>
				</view>

				<view class="item-footer">
					<view class="applicant">
						<text class="applicant-icon">👤</text>
						<text class="applicant-name">{{ item.applicant }}</text>
						<text class="applicant-action">{{ item.action }}</text>
					</view>
					
					<!-- 待审批标签页：显示审批按钮 -->
					<view class="action-buttons" v-if="currentTab === 0">
						<button class="btn-secondary" @click.stop="reject(item)">驳回</button>
						<button class="btn-primary" @click.stop="approve(item)">通过</button>
					</view>
					
					<!-- 其他标签页：显示状态并支持修改 -->
					<view class="status-section" v-else>
						<view class="status-tag" @click.stop="showStatusModal(item)">
							<text 
								class="status-text" 
								:class="getStatusClass(item.status)"
							>
								{{ item.statusText }}
							</text>
							<text class="edit-icon">📝</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载更多 -->
			<view class="load-more" v-if="hasMore">
				<text class="load-text">加载更多...</text>
			</view>
			
			<!-- 暂无数据 -->
			<view class="empty-state" v-if="currentList.length === 0 && !loading">
				<text class="empty-text">暂无审批数据</text>
			</view>
		</scroll-view>
		
		<!-- 状态修改模态框 -->
		<view class="status-modal" v-if="showStatusEdit" @click="closeStatusModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">修改合同状态</text>
					<view class="close-btn" @click="closeStatusModal">✕</view>
				</view>
				
				<view class="modal-body">
					<view class="contract-info">
						<text class="contract-name">{{ currentEditItem?.contractName }}</text>
						<text class="contract-company">{{ currentEditItem?.company }}</text>
					</view>
					
					<view class="status-options">
						<text class="section-title">选择新状态:</text>
						<view class="status-list">
							<view 
								v-for="status in availableStatuses" 
								:key="status.value"
								class="status-option"
								:class="{ active: selectedStatus === status.value }"
								@click="selectStatus(status.value)"
							>
								<view class="status-indicator" :class="getStatusClass(status.value)"></view>
								<text class="status-name">{{ status.label }}</text>
							</view>
						</view>
					</view>
					
					<view class="comments-section">
						<text class="section-title">备注 (可选):</text>
						<textarea 
							class="comments-input" 
							placeholder="请输入修改原因或备注信息..."
							v-model="statusComments"
							maxlength="200"
						></textarea>
					</view>
				</view>
				
				<view class="modal-footer">
					<button class="btn-cancel" @click="closeStatusModal">取消</button>
					<button class="btn-confirm" @click="confirmStatusChange" :disabled="!selectedStatus">确认修改</button>
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
				currentTab: 0,
				scrollLeft: 0,
				searchKeyword: '',
				loading: false,
				hasMore: true,
				page: 1,
				limit: 10,
				tabs: [
					{ name: '待审批', key: 'pending' },
					{ name: '已处理', key: 'processed' },
					{ name: '抄送我的', key: 'copied' },
					{ name: '我发起的', key: 'initiated' }
				],
				// 审批数据
				approvalData: {
					pending: [],
					processed: [],
					copied: [],
					initiated: []
				},
				// 统计数据
				stats: {
					total: 0,
					draft: 0,
					pending: 0,
					approved: 0,
					rejected: 0
				},
				// 状态修改相关
				showStatusEdit: false,
				currentEditItem: null,
				selectedStatus: '',
				statusComments: '',
				availableStatuses: [
					{ value: '草稿', label: '草稿' },
					{ value: '待审批', label: '待审批' },
					{ value: '审批中', label: '审批中' },
					{ value: '已批准', label: '已批准' },
					{ value: '已拒绝', label: '已拒绝' },
					{ value: '已取消', label: '已取消' }
				],
				// 调试相关
				showDebugPanel: false,
				debugInfo: {
					apiStatus: '未测试',
					lastRequest: '无',
					responseStatus: '无',
					dataCount: 0
				}
			}
		},
		computed: {
			currentList() {
				const tabKey = this.tabs[this.currentTab].key;
				let list = this.approvalData[tabKey] || [];
				
				if (this.searchKeyword) {
					list = list.filter(item => 
						item.title.includes(this.searchKeyword) ||
						item.company.includes(this.searchKeyword) ||
						item.contractName.includes(this.searchKeyword)
					);
				}
				
				return list;
			}
		},
		methods: {
			// 获取token
			getToken() {
				return uni.getStorageSync('token') || '';
			},
			
			// 返回上一页
			goBack() {
				uni.navigateBack();
			},
			
			// 切换标签页
			switchTab(index) {
				this.currentTab = index;
				this.page = 1; // 重置页码
				this.hasMore = true; // 重置加载更多状态
				this.loadApprovalData();
			},
			
			// 搜索
			onSearch() {
				// 实际项目中这里可以添加防抖逻辑
				console.log('搜索关键词：', this.searchKeyword);
				this.page = 1; // 重置页码
				this.hasMore = true; // 重置加载更多状态
				this.loadApprovalData();
			},
			
			// 加载审批数据
			async loadApprovalData() {
				try {
					this.loading = true;
					
					const tabKey = this.tabs[this.currentTab].key;
					console.log('🔍 开始加载审批数据，当前标签:', tabKey);
					
					// 构建查询参数
					const queryParams = new URLSearchParams();
					if (this.searchKeyword) {
						queryParams.append('keyword', this.searchKeyword);
					}
					queryParams.append('page', this.page.toString());
					queryParams.append('limit', this.limit.toString());
					
					// 根据标签页映射API状态
					const statusMap = {
						'pending': '待审批',
						'processed': null, // 已处理需要特殊处理，不传状态参数，在前端过滤
						'copied': null, // 抄送功能暂未实现，返回null不传递状态参数
						'initiated': null // 我发起的需要根据创建者查询，暂不使用状态过滤
					};
					
					const mappedStatus = statusMap[tabKey];
					if (mappedStatus) {
						queryParams.append('status', mappedStatus);
					} else if (tabKey === 'initiated') {
						// 我发起的：根据当前用户ID查询
						const userId = uni.getStorageSync('userId');
						if (userId) {
							queryParams.append('applicantId', userId);
						}
					}
					// 对于已处理和抄送，不传递状态参数，获取所有数据后在前端过滤
					
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
					
					console.log('📊 审批API响应:', {
						statusCode: result.statusCode,
						dataKeys: result.data ? Object.keys(result.data) : [],
						success: result.data?.success,
						message: result.data?.message,
						dataLength: result.data?.data ? (Array.isArray(result.data.data) ? result.data.data.length : 'not array') : 'no data'
					});
					
					if (result.statusCode === 200 && result.data) {
						let approvalData = [];
						
						// 检查API返回的数据结构
						if (result.data.success && result.data.data) {
							if (result.data.data.applications) {
								approvalData = result.data.data.applications;
							} else if (Array.isArray(result.data.data)) {
								approvalData = result.data.data;
							}
						} else if (Array.isArray(result.data)) {
							approvalData = result.data;
						}
						
						console.log('📊 解析后的审批数据:', approvalData);
						
						// 转换后端数据格式到前端格式
						const transformedData = approvalData.map(item => {
							return {
								id: item._id || item.id,
								title: '合同申请',
								time: this.formatDate(item.createdAt || item.time),
								company: item.project?.name || item.company || '未知项目',
								contractName: item.contract?.name || item.contractName || '未知合同',
								contractType: item.contract?.type || item.contractType || '工程合同',
								partyA: item.contract?.partyA?.name || item.partyA || '未知甲方',
								partyB: item.contract?.partyB?.name || item.partyB || '未知乙方',
								startDate: item.contract?.startDate ? new Date(item.contract.startDate).toISOString().split('T')[0] : (item.startDate || ''),
								endDate: item.contract?.endDate ? new Date(item.contract.endDate).toISOString().split('T')[0] : (item.endDate || ''),
								applicant: item.applicant?.name || item.applicant || '未知',
								action: '提交',
								status: item.status || '待审批',
								statusText: this.getStatusText(item.status || '待审批'),
								amount: item.financial?.amountIncludingTax || item.amount || 0,
								originalData: item
							};
						});
						
						// 对于特殊标签页，进行数据过滤
						let finalData = transformedData;
						if (tabKey === 'processed') {
							// 已处理：只显示已批准和已拒绝的记录
							finalData = transformedData.filter(item => 
								['已批准', '已拒绝'].includes(item.status)
							);
						} else if (tabKey === 'copied') {
							// 抄送：暂时显示空数据，因为后端未实现抄送功能
							finalData = [];
						}
						
						// 如果是第一页，直接替换数据；否则追加数据
						if (this.page === 1) {
							this.approvalData[tabKey] = finalData;
						} else {
							this.approvalData[tabKey] = [...this.approvalData[tabKey], ...finalData];
						}
						
						console.log('✅ 审批数据转换完成:', finalData.length, '条记录');
						
						// 检查是否还有更多数据
						if (finalData.length < this.limit) {
							this.hasMore = false;
						}
						
					} else {
						throw new Error(`API响应错误: ${result.statusCode}`);
					}
					
				} catch (error) {
					console.error('❌ 加载审批数据失败:', error);
					
					// 使用模拟数据作为降级方案
					console.log('🔄 使用模拟数据...');
					const mockData = this.getMockData();
					const tabKey = this.tabs[this.currentTab].key;
					
					let filteredData = mockData[tabKey] || [];
					if (this.searchKeyword) {
						filteredData = filteredData.filter(item => 
							item.title.includes(this.searchKeyword) ||
							item.company.includes(this.searchKeyword) ||
							item.contractName.includes(this.searchKeyword)
						);
					}
					
					if (this.page === 1) {
						this.approvalData[tabKey] = filteredData;
					} else {
						this.approvalData[tabKey] = [...this.approvalData[tabKey], ...filteredData];
					}
					
					uni.showToast({
						title: '使用模拟数据',
						icon: 'none'
					});
					
				} finally {
					this.loading = false;
				}
			},
			
			// 获取模拟数据
			getMockData() {
				return {
					pending: [
						{
							id: '1',
							title: '合同申请',
							time: this.formatDate(new Date()),
							company: '某兰公园一区改造工程',
							contractName: '大大建设对外合同',
							contractType: '工程合同',
							applicant: '李想',
							action: '提交',
							status: '待审批',
							statusText: '待审批',
							amount: 100000,
							originalData: {}
						},
						{
							id: '2',
							title: '合同申请',
							time: this.formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000)),
							company: '办公楼装修项目',
							contractName: '装修工程合同',
							contractType: '工程合同',
							applicant: '张三',
							action: '提交',
							status: '待审批',
							statusText: '待审批',
							amount: 500000,
							originalData: {}
						}
					],
					processed: [
						{
							id: '3',
							title: '合同申请',
							time: this.formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
							company: '数据分析系统项目',
							contractName: '软件开发合同',
							contractType: '服务合同',
							applicant: '王五',
							action: '提交',
							status: '已批准',
							statusText: '已通过',
							amount: 200000,
							originalData: {}
						}
					],
					copied: [
						{
							id: '4',
							title: '合同申请',
							time: this.formatDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
							company: '客户管理系统',
							contractName: 'CRM系统开发合同',
							contractType: '服务合同',
							applicant: '赵六',
							action: '提交',
							status: '已批准',
							statusText: '已通过',
							amount: 300000,
							originalData: {}
						}
					],
					initiated: [
						{
							id: '5',
							title: '合同申请',
							time: this.formatDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
							company: '员工培训系统',
							contractName: '培训系统开发合同',
							contractType: '服务合同',
							applicant: '孙七',
							action: '提交',
							status: '草稿',
							statusText: '草稿',
							amount: 150000,
							originalData: {}
						}
					]
				};
			},
			
			// 格式化日期
			formatDate(dateString) {
				if (!dateString) return '';
				const date = new Date(dateString);
				const now = new Date();
				const diff = now - date;
				const days = Math.floor(diff / (1000 * 60 * 60 * 24));
				
				if (days === 0) {
					return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
				} else if (days < 7) {
					return `${days}天前`;
				} else {
					return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
				}
			},
			
			// 获取状态文本
			getStatusText(status) {
				const statusMap = {
					'草稿': '草稿',
					'待审批': '待审批',
					'审批中': '审批中',
					'已批准': '已通过',
					'已拒绝': '已驳回',
					'已取消': '已撤销'
				};
				return statusMap[status] || status;
			},
			
			// 格式化金额
			formatAmount(amount) {
				if (!amount) return '0';
				return amount.toLocaleString();
			},
			
			// 跳转到详情页
			goToDetail(item) {
				uni.navigateTo({
					url: `/pages/todo/todo-detail?id=${item.id}`
				});
			},
			
			// 审批通过
			approve(item) {
				uni.showModal({
					title: '确认',
					content: '确定要通过该审批吗？',
					success: (res) => {
						if (res.confirm) {
							this.handleApproval(item.id, 'approve');
						}
					}
				});
			},
			
			// 审批驳回
			reject(item) {
				uni.showModal({
					title: '确认',
					content: '确定要驳回该审批吗？',
					success: (res) => {
						if (res.confirm) {
							this.handleApproval(item.id, 'reject');
						}
					}
				});
			},
			
			// 处理审批
			async handleApproval(id, action) {
				try {
					uni.showLoading({ title: '处理中...' });
					
					console.log('🔍 开始处理审批，ID:', id, '操作:', action);
					
					// 构建审批数据
					const approvalData = {
						action: action, // 'approve' 或 'reject'
						comments: action === 'approve' ? '审批通过' : '审批驳回'
					};
					
					const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.CONTRACT_API}/${id}/approve`;
					console.log('📡 审批API请求URL:', apiUrl);
					
					// 调用真实的API
					const result = await uni.request({
						url: apiUrl,
						method: 'POST',
						header: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${this.getToken()}`
						},
						data: approvalData,
						timeout: 10000
					});
					
					console.log('📊 审批API响应:', result);
					
					if ((result.statusCode === 200 || result.statusCode === 201) && result.data && result.data.success) {
						console.log('✅ 审批操作成功');
						
						// 更新本地数据
						const tabKey = this.tabs[this.currentTab].key;
						const itemIndex = this.approvalData[tabKey].findIndex(item => item.id === id);
						
						if (itemIndex !== -1) {
							const item = this.approvalData[tabKey][itemIndex];
							item.status = action === 'approve' ? '已批准' : '已拒绝';
							item.statusText = action === 'approve' ? '已通过' : '已驳回';
							
							// 从待审批列表移除
							this.approvalData[tabKey].splice(itemIndex, 1);
							
							// 添加到已处理列表
							this.approvalData.processed.unshift(item);
						}
						
						uni.hideLoading();
						uni.showToast({
							title: action === 'approve' ? '审批通过' : '审批驳回',
							icon: 'success'
						});
						
					} else {
						throw new Error(`API错误: ${result.data?.message || '审批操作失败'}`);
					}
					
				} catch (error) {
					uni.hideLoading();
					console.error('❌ 审批操作失败:', error);
					
					// 降级方案：仅更新本地状态
					console.log('🔄 使用本地状态更新...');
					const tabKey = this.tabs[this.currentTab].key;
					const itemIndex = this.approvalData[tabKey].findIndex(item => item.id === id);
					
					if (itemIndex !== -1) {
						const item = this.approvalData[tabKey][itemIndex];
						item.status = action === 'approve' ? '已批准' : '已拒绝';
						item.statusText = action === 'approve' ? '已通过' : '已驳回';
						
						// 从待审批列表移除
						this.approvalData[tabKey].splice(itemIndex, 1);
						
						// 添加到已处理列表
						this.approvalData.processed.unshift(item);
					}
					
					uni.showToast({
						title: action === 'approve' ? '审批通过（本地）' : '审批驳回（本地）',
						icon: 'none'
					});
				}
			},
			
			// 获取状态样式类
			getStatusClass(status) {
				const statusMap = {
					'approved': 'status-approved',
					'rejected': 'status-rejected',
					'cancelled': 'status-cancelled',
					'pending': 'status-pending',
					'草稿': 'status-草稿',
					'待审批': 'status-待审批',
					'审批中': 'status-审批中',
					'已批准': 'status-已批准',
					'已拒绝': 'status-已拒绝',
					'已取消': 'status-已取消'
				};
				return statusMap[status] || `status-${status}`;
			},
			
			// 加载更多
			async loadMore() {
				if (this.loading || !this.hasMore) return;
				
				this.loading = true;
				this.page += 1;
				
				try {
					await this.loadApprovalData();
					
					// 检查是否还有更多数据
					const currentList = this.currentList;
					if (currentList.length < this.limit) {
						this.hasMore = false;
					}
				} catch (error) {
					console.error('加载更多数据错误:', error);
					this.page -= 1; // 恢复页码
				} finally {
					this.loading = false;
				}
			},
			
			// 加载统计数据
			async loadStats() {
				try {
					console.log('🔍 开始加载统计数据...');
					
					const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.CONTRACT_API}/stats/overview`;
					console.log('📡 统计API请求URL:', apiUrl);
					
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
					
					console.log('📊 统计API响应:', result);
					
					if (result.statusCode === 200 && result.data) {
						let statsData = {};
						
						// 检查API返回的数据结构
						if (result.data.success && result.data.data) {
							statsData = result.data.data;
						} else if (result.data.stats) {
							statsData = result.data.stats;
						} else {
							statsData = result.data;
						}
						
						this.stats = {
							total: statsData.total || 0,
							draft: statsData.draft || 0,
							pending: statsData.pending || 0,
							approved: statsData.approved || 0,
							rejected: statsData.rejected || 0
						};
						
						console.log('✅ 统计数据加载完成:', this.stats);
						
					} else {
						throw new Error(`API响应错误: ${result.statusCode}`);
					}
					
				} catch (error) {
					console.error('❌ 加载统计数据失败:', error);
					
					// 使用模拟数据作为降级方案
					console.log('🔄 使用模拟统计数据...');
					this.stats = {
						total: 5,
						draft: 1,
						pending: 2,
						approved: 2,
						rejected: 0
					};
					
					console.log('模拟统计数据:', this.stats);
				}
			},
			
			// 显示状态修改模态框
			showStatusModal(item) {
				console.log('准备修改状态，合同:', item);
				this.currentEditItem = item;
				this.selectedStatus = '';
				this.statusComments = '';
				this.showStatusEdit = true;
			},
			
			// 关闭状态修改模态框
			closeStatusModal() {
				this.showStatusEdit = false;
				this.currentEditItem = null;
				this.selectedStatus = '';
				this.statusComments = '';
			},
			
			// 选择状态
			selectStatus(status) {
				this.selectedStatus = status;
			},
			
			// 确认状态修改
			async confirmStatusChange() {
				if (!this.selectedStatus || !this.currentEditItem) {
					return;
				}
				
				try {
					uni.showLoading({ title: '修改中...' });
					
					console.log('🔄 开始修改合同状态:', {
						id: this.currentEditItem.id,
						newStatus: this.selectedStatus,
						comments: this.statusComments
					});
					
					// 构建状态修改请求数据
					const updateData = {
						status: this.selectedStatus,
						comments: this.statusComments || '状态修改',
						updatedBy: uni.getStorageSync('userId') || 'current_user'
					};
					
					const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.CONTRACT_API}/${this.currentEditItem.id}`;
					console.log('📡 状态修改API请求URL:', apiUrl);
					
					// 调用API修改状态
					const result = await uni.request({
						url: apiUrl,
						method: 'PUT',
						header: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${this.getToken()}`
						},
						data: updateData,
						timeout: 10000
					});
					
					console.log('📊 状态修改API响应:', result);
					
					if ((result.statusCode === 200 || result.statusCode === 201) && result.data && result.data.success) {
						console.log('✅ 状态修改成功');
						
						// 更新本地数据
						const tabKey = this.tabs[this.currentTab].key;
						const itemIndex = this.approvalData[tabKey].findIndex(item => item.id === this.currentEditItem.id);
						
						if (itemIndex !== -1) {
							this.approvalData[tabKey][itemIndex].status = this.selectedStatus;
							this.approvalData[tabKey][itemIndex].statusText = this.getStatusText(this.selectedStatus);
						}
						
						uni.hideLoading();
						uni.showToast({
							title: '状态修改成功',
							icon: 'success'
						});
						
						this.closeStatusModal();
						
						// 刷新当前标签页数据
						setTimeout(() => {
							this.page = 1;
							this.hasMore = true;
							this.loadApprovalData();
						}, 1000);
						
					} else {
						throw new Error(`API错误: ${result.data?.message || '状态修改失败'}`);
					}
					
				} catch (error) {
					uni.hideLoading();
					console.error('❌ 状态修改失败:', error);
					
					// 降级方案：仅更新本地状态
					console.log('🔄 使用本地状态更新...');
					const tabKey = this.tabs[this.currentTab].key;
					const itemIndex = this.approvalData[tabKey].findIndex(item => item.id === this.currentEditItem.id);
					
					if (itemIndex !== -1) {
						this.approvalData[tabKey][itemIndex].status = this.selectedStatus;
						this.approvalData[tabKey][itemIndex].statusText = this.getStatusText(this.selectedStatus);
					}
					
					uni.showToast({
						title: '状态修改成功（本地）',
						icon: 'none'
					});
					
					this.closeStatusModal();
				}
			},
			
			// API连接测试
			async testApiConnection() {
				console.log('🔧 开始API连接测试...');
				this.showDebugPanel = true;
				
				try {
					const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.CONTRACT_API}`;
					this.debugInfo.lastRequest = apiUrl;
					
					uni.showLoading({ title: '测试中...' });
					
					const result = await uni.request({
						url: apiUrl,
						method: 'GET',
						header: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${this.getToken()}`
						},
						timeout: 10000
					});
					
					uni.hideLoading();
					
					this.debugInfo.responseStatus = `${result.statusCode} - ${result.data?.success ? '成功' : '失败'}`;
					this.debugInfo.apiStatus = result.statusCode === 200 ? '正常' : '异常';
					
					if (result.data?.data?.applications) {
						this.debugInfo.dataCount = result.data.data.applications.length;
					} else if (Array.isArray(result.data?.data)) {
						this.debugInfo.dataCount = result.data.data.length;
					} else {
						this.debugInfo.dataCount = 0;
					}
					
					console.log('✅ API测试完成:', result);
					
					uni.showToast({
						title: `API状态: ${this.debugInfo.apiStatus}`,
						icon: 'none'
					});
					
				} catch (error) {
					uni.hideLoading();
					console.error('❌ API测试失败:', error);
					
					this.debugInfo.apiStatus = '连接失败';
					this.debugInfo.responseStatus = error.message;
					this.debugInfo.dataCount = 0;
					
					uni.showToast({
						title: 'API连接失败',
						icon: 'none'
					});
				}
			},
			
			// 测试数据库状态
			async testDatabase() {
				try {
					uni.showLoading({ title: '检查数据库...' });
					
					const result = await uni.request({
						url: `${API_CONFIG.BASE_URL}${API_CONFIG.CONTRACT_API}/debug`,
						method: 'GET',
						header: {
							'Content-Type': 'application/json'
						},
						timeout: 10000
					});
					
					uni.hideLoading();
					
					console.log('📊 数据库状态:', result.data);
					
					if (result.data?.success) {
						const data = result.data.data;
						const message = `数据库: ${data.database.connected ? '已连接' : '未连接'}\n` +
										`集合: ${data.collection.exists ? '存在' : '不存在'}\n` +
										`数据条数: ${data.data?.total || 0}`;
						
						uni.showModal({
							title: '数据库状态',
							content: message,
							showCancel: false
						});
					} else {
						throw new Error(result.data?.message || '检查失败');
					}
					
				} catch (error) {
					uni.hideLoading();
					console.error('❌ 数据库检查失败:', error);
					
					uni.showModal({
						title: '数据库检查失败',
						content: error.message,
						showCancel: false
					});
				}
			},
			
			// 创建测试数据
			async createTestData() {
				try {
					uni.showLoading({ title: '创建测试数据...' });
					
					const result = await uni.request({
						url: `${API_CONFIG.BASE_URL}${API_CONFIG.CONTRACT_API}/test-data`,
						method: 'POST',
						header: {
							'Content-Type': 'application/json'
						},
						timeout: 30000
					});
					
					uni.hideLoading();
					
					console.log('📊 测试数据创建结果:', result.data);
					
					if (result.data?.success) {
						uni.showToast({
							title: '测试数据创建成功',
							icon: 'success'
						});
						
						// 刷新数据
						setTimeout(() => {
							this.refreshData();
						}, 1000);
					} else {
						throw new Error(result.data?.message || '创建失败');
					}
					
				} catch (error) {
					uni.hideLoading();
					console.error('❌ 创建测试数据失败:', error);
					
					uni.showToast({
						title: '创建测试数据失败',
						icon: 'none'
					});
				}
			},
			
			// 刷新数据
			refreshData() {
				console.log('🔄 手动刷新数据...');
				this.page = 1;
				this.hasMore = true;
				this.loadApprovalData();
				this.loadStats();
			}
		},
		
		onLoad() {
			// 页面加载时的初始化
			console.log('页面加载，开始初始化...');
			this.loadApprovalData();
			this.loadStats();
		},
		
		// 页面显示时刷新数据
		onShow() {
			// 检查是否有从合同详情页面传递的数据
			const app = getApp();
			if (app.globalData && app.globalData.contractForApproval) {
				console.log('收到合同审批数据:', app.globalData.contractForApproval);
				// 可以在这里处理传递的合同数据
				// 比如自动切换到待审批标签页
				this.currentTab = 0; // 切换到待审批
				this.loadApprovalData();
				// 清除全局数据
				delete app.globalData.contractForApproval;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.approval-container {
		background-color: #f8f8f8;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
	}

	/* 自定义导航栏 */
	.custom-navbar {
		background-color: #ffffff;
		padding-top: var(--status-bar-height);
		
		.navbar-content {
			height: 44px;
			display: flex;
			align-items: center;
			position: relative;
			
			.back-btn {
				position: absolute;
				left: 15px;
				width: 30px;
				height: 30px;
				display: flex;
				align-items: center;
				justify-content: center;
				
				.iconfont {
					font-size: 18px;
					color: #333;
				}
			}
			
			.navbar-title {
				flex: 1;
				text-align: center;
				font-size: 17px;
				font-weight: 600;
				color: #333;
			}
		}
	}

	/* 标签页导航 */
	.tab-container {
		background-color: #ffffff;
		border-bottom: 1px solid #e5e5e5;
		
		.tab-scroll {
			white-space: nowrap;
			
			.tab-list {
				display: flex;
				padding: 0 15px;
				
				.tab-item {
					flex-shrink: 0;
					padding: 12px 20px;
					position: relative;
					
					.tab-text {
						font-size: 15px;
						color: #666;
						transition: color 0.3s;
					}
					
					.tab-line {
						position: absolute;
						bottom: 0;
						left: 50%;
						transform: translateX(-50%);
						width: 20px;
						height: 2px;
						background-color: #00d4aa;
						border-radius: 1px;
					}
					
					&.active .tab-text {
						color: #00d4aa;
						font-weight: 500;
					}
				}
			}
		}
	}

	/* 搜索栏 */
	.search-container {
		display: flex;
		align-items: center;
		padding: 12px 15px;
		background-color: #ffffff;
		margin-bottom: 8px;
		
		.search-box {
			flex: 1;
			background-color: #f5f5f5;
			border-radius: 20px;
			height: 36px;
			display: flex;
			align-items: center;
			padding: 0 15px;
			
			.search-icon {
				font-size: 16px;
				color: #999;
				margin-right: 8px;
			}
			
			.search-input {
				flex: 1;
				font-size: 14px;
				border: none;
				background: transparent;
				
				&::placeholder {
					color: #999;
				}
			}
		}
		
		.filter-btn {
			margin-left: 12px;
			width: 36px;
			height: 36px;
			display: flex;
			align-items: center;
			justify-content: center;
			
			.filter-icon {
				font-size: 18px;
				color: #666;
			}
		}
	}

	/* 审批列表 */
	.approval-list {
		flex: 1;
		padding: 0 15px 100px 15px;
		height: calc(100vh - 200px);
		box-sizing: border-box;
		
		.approval-item {
			background-color: #ffffff;
			border-radius: 8px;
			padding: 16px;
			margin-bottom: 12px;
			margin-right: 0;
			margin-left: 0;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
			width: 100%;
			box-sizing: border-box;
			
			.item-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 12px;
				
				.item-title {
					font-size: 16px;
					font-weight: 600;
					color: #333;
				}
				
				.item-time {
					font-size: 12px;
					color: #999;
				}
			}
			
			.item-content {
				margin-bottom: 12px;
				
				.item-info {
					font-size: 14px;
					color: #666;
					margin-bottom: 6px;
				}
				
				.item-detail {
					font-size: 13px;
					color: #666;
					margin-bottom: 4px;
					
					.detail-label {
						color: #999;
					}
					
					.detail-value {
						color: #333;
						
						&.amount {
							color: #e74c3c;
							font-weight: bold;
						}
					}
				}
			}
			
			.item-footer {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding-right: 0;
				
				.applicant {
					display: flex;
					align-items: center;
					font-size: 13px;
					color: #666;
					flex: 1;
					
					.applicant-icon {
						margin-right: 4px;
						font-size: 14px;
					}
					
					.applicant-name {
						margin-right: 4px;
					}
				}
				
				.action-buttons {
					display: flex;
					gap: 8px;
					flex-shrink: 0;
					
					button {
						padding: 6px 16px;
						border-radius: 16px;
						font-size: 13px;
						border: none;
						
						&.btn-secondary {
							background-color: #f5f5f5;
							color: #666;
						}
						
						&.btn-primary {
							background-color: #00d4aa;
							color: #ffffff;
						}
					}
				}
				
				.status-tag {
					flex-shrink: 0;
					
					.status-text {
						padding: 4px 12px;
						border-radius: 12px;
						font-size: 12px;
						
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
						
						&.status-pending {
							background-color: #fff7e6;
							color: #fa8c16;
						}
						
						&.status-草稿 {
							background-color: #f5f5f5;
							color: #999;
						}
						
						&.status-待审批 {
							background-color: #fff7e6;
							color: #fa8c16;
						}
						
						&.status-审批中 {
							background-color: #e6f7ff;
							color: #1890ff;
						}
						
						&.status-已批准 {
							background-color: #e8f5e8;
							color: #52c41a;
						}
						
						&.status-已拒绝 {
							background-color: #ffeaea;
							color: #ff4d4f;
						}
						
						&.status-已取消 {
							background-color: #f0f0f0;
							color: #999;
						}
					}
				}
			}
		}
	}

	/* 加载更多 */
	.load-more {
		text-align: center;
		padding: 20px;
		
		.load-text {
			font-size: 14px;
			color: #999;
		}
	}

	/* 空状态 */
	.empty-state {
		text-align: center;
		padding: 60px 20px;
		
		.empty-text {
			font-size: 14px;
			color: #999;
		}
	}

	/* 状态修改相关样式 */
	.status-section {
		flex-shrink: 0;
		
		.status-tag {
			display: flex;
			align-items: center;
			padding: 4px 8px;
			border-radius: 12px;
			cursor: pointer;
			transition: all 0.3s ease;
			
			&:hover {
				opacity: 0.8;
				transform: scale(1.05);
			}
			
			.edit-icon {
				margin-left: 4px;
				font-size: 10px;
				opacity: 0.7;
			}
		}
	}

	/* 状态修改模态框 */
	.status-modal {
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
		
		.modal-content {
			background: #ffffff;
			border-radius: 12px;
			width: 90%;
			max-width: 400px;
			max-height: 80vh;
			overflow: hidden;
			display: flex;
			flex-direction: column;
		}
		
		.modal-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 16px 20px;
			border-bottom: 1px solid #f0f0f0;
			
			.modal-title {
				font-size: 18px;
				font-weight: 600;
				color: #333;
			}
			
			.close-btn {
				width: 24px;
				height: 24px;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #999;
				font-size: 16px;
				cursor: pointer;
			}
		}
		
		.modal-body {
			flex: 1;
			padding: 20px;
			overflow-y: auto;
			
			.contract-info {
				margin-bottom: 20px;
				padding: 12px;
				background: #f8f9fa;
				border-radius: 8px;
				
				.contract-name {
					display: block;
					font-size: 16px;
					font-weight: 600;
					color: #333;
					margin-bottom: 4px;
				}
				
				.contract-company {
					display: block;
					font-size: 14px;
					color: #666;
				}
			}
			
			.section-title {
				display: block;
				font-size: 14px;
				font-weight: 600;
				color: #333;
				margin-bottom: 12px;
			}
		}
		
		.status-options {
			margin-bottom: 20px;
			
			.status-list {
				display: flex;
				flex-direction: column;
				gap: 8px;
			}
			
			.status-option {
				display: flex;
				align-items: center;
				padding: 12px;
				border: 1px solid #e5e5e5;
				border-radius: 8px;
				cursor: pointer;
				transition: all 0.3s ease;
				
				&:hover {
					border-color: #00d4aa;
					background: #f0fffe;
				}
				
				&.active {
					border-color: #00d4aa;
					background: #e8f5f0;
				}
				
				.status-indicator {
					width: 12px;
					height: 12px;
					border-radius: 50%;
					margin-right: 8px;
					
					&.status-approved {
						background: #52c41a;
					}
					
					&.status-rejected {
						background: #ff4d4f;
					}
					
					&.status-cancelled {
						background: #999;
					}
					
					&.status-pending {
						background: #fa8c16;
					}
					
					&.status-草稿 {
						background: #d9d9d9;
					}
					
					&.status-待审批 {
						background: #fa8c16;
					}
					
					&.status-审批中 {
						background: #1890ff;
					}
					
					&.status-已批准 {
						background: #52c41a;
					}
					
					&.status-已拒绝 {
						background: #ff4d4f;
					}
					
					&.status-已取消 {
						background: #999;
					}
				}
				
				.status-name {
					font-size: 14px;
					color: #333;
				}
			}
		}
		
		.comments-section {
			.comments-input {
				width: 100%;
				min-height: 80px;
				padding: 12px;
				border: 1px solid #e5e5e5;
				border-radius: 8px;
				font-size: 14px;
				color: #333;
				background: #ffffff;
				resize: none;
				
				&:focus {
					border-color: #00d4aa;
					outline: none;
				}
				
				&::placeholder {
					color: #999;
				}
			}
		}
		
		.modal-footer {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			gap: 12px;
			padding: 16px 20px;
			border-top: 1px solid #f0f0f0;
			
			button {
				padding: 8px 16px;
				border-radius: 6px;
				font-size: 14px;
				border: none;
				cursor: pointer;
				
				&.btn-cancel {
					background: #f5f5f5;
					color: #666;
				}
				
				&.btn-confirm {
					background: #00d4aa;
					color: #ffffff;
					
					&:disabled {
						background: #ccc;
						cursor: not-allowed;
					}
				}
			}
		}
	}

	/* 调试面板样式 */
	.debug-panel {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: #ffffff;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
		width: 90%;
		max-width: 400px;
		z-index: 2000;
		
		.debug-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 16px 20px;
			border-bottom: 1px solid #f0f0f0;
			background: #f8f9fa;
			border-radius: 12px 12px 0 0;
			
			.debug-title {
				font-size: 16px;
				font-weight: 600;
				color: #333;
			}
			
			.close-debug-btn {
				width: 24px;
				height: 24px;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #999;
				font-size: 16px;
				cursor: pointer;
			}
		}
		
		.debug-content {
			padding: 20px;
			
			.debug-item {
				display: flex;
				align-items: center;
				margin-bottom: 12px;
				
				.debug-label {
					width: 80px;
					font-size: 14px;
					color: #666;
					flex-shrink: 0;
				}
				
				.debug-value {
					flex: 1;
					font-size: 14px;
					color: #333;
					word-break: break-all;
				}
			}
			
			.debug-actions {
				margin-top: 20px;
				display: flex;
				flex-wrap: wrap;
				gap: 8px;
				
				.debug-btn {
					flex: 1;
					min-width: 80px;
					padding: 8px 12px;
					border: 1px solid #00d4aa;
					border-radius: 6px;
					background: #ffffff;
					color: #00d4aa;
					font-size: 12px;
					text-align: center;
					
					&:active {
						background: #00d4aa;
						color: #ffffff;
					}
				}
			}
		}
	}
</style>
