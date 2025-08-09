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
			<view class="filter-btn">
				<text class="filter-icon">⚙️</text>
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
					<view class="item-detail" v-if="item.amount">
						<text class="detail-label">合同金额：</text>
						<text class="detail-value amount">¥{{ formatAmount(item.amount) }}</text>
					</view>
				</view>

				<view class="item-footer">
					<view class="applicant">
						<text class="applicant-icon">👤</text>
						<text class="applicant-name">{{ item.applicant }}</text>
						<text class="applicant-action">{{ item.action }}</text>
					</view>
					
					<view class="action-buttons" v-if="currentTab === 0">
						<button class="btn-secondary" @click.stop="reject(item)">驳回</button>
						<button class="btn-primary" @click.stop="approve(item)">通过</button>
					</view>
					
					<view class="status-tag" v-else>
						<text 
							class="status-text" 
							:class="getStatusClass(item.status)"
						>
							{{ item.statusText }}
						</text>
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
	</view>
</template>

<script>
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
					
					// 暂时使用模拟数据，等API连接问题解决后再切换
					console.log('使用模拟数据，当前标签:', tabKey);
					
					// 模拟API延迟
					await new Promise(resolve => setTimeout(resolve, 500));
					
					// 模拟数据
					const mockData = {
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
					
					// 根据搜索关键词过滤
					let filteredData = mockData[tabKey] || [];
					if (this.searchKeyword) {
						filteredData = filteredData.filter(item => 
							item.title.includes(this.searchKeyword) ||
							item.company.includes(this.searchKeyword) ||
							item.contractName.includes(this.searchKeyword)
						);
					}
					
					// 如果是第一页，直接替换数据；否则追加数据
					if (this.page === 1) {
						this.approvalData[tabKey] = filteredData;
					} else {
						this.approvalData[tabKey] = [...this.approvalData[tabKey], ...filteredData];
					}
					
					console.log('模拟数据加载完成:', filteredData.length, '条记录');
					
				} catch (error) {
					console.error('加载审批数据错误:', error);
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					});
				} finally {
					this.loading = false;
				}
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
					
					// 模拟API延迟
					await new Promise(resolve => setTimeout(resolve, 1000));
					
					uni.hideLoading();
					
					// 模拟审批操作
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
						title: action === 'approve' ? '审批通过' : '审批驳回',
						icon: 'success'
					});
					
				} catch (error) {
					uni.hideLoading();
					console.error('审批操作错误:', error);
					uni.showToast({
						title: '操作失败',
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
					'pending': 'status-pending'
				};
				return statusMap[status] || '';
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
					console.log('开始加载统计数据...');
					
					// 模拟API延迟
					await new Promise(resolve => setTimeout(resolve, 300));
					
					// 模拟统计数据
					this.stats = {
						total: 5,
						draft: 1,
						pending: 2,
						approved: 2,
						rejected: 0
					};
					
					console.log('统计数据加载完成:', this.stats);
				} catch (error) {
					console.error('加载统计数据错误:', error);
				}
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
</style>
