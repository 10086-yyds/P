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
				tabs: [
					{ name: '待审批', key: 'pending' },
					{ name: '已处理', key: 'processed' },
					{ name: '抄送我的', key: 'copied' },
					{ name: '我发起的', key: 'initiated' }
				],
				// 模拟数据
				approvalData: {
					pending: [
						{
							id: 1,
							title: '合同申请',
							time: '10:01',
							company: '某兰公园一区改造工程HT005',
							contractName: '大大建设对外合同',
							contractType: '对申合同',
							applicant: '李想',
							action: '提交',
							status: 'pending',
							statusText: '待审批'
						},
						{
							id: 2,
							title: '采购申请',
							time: '10:01',
							company: '某兰公园一区改造工程CG001',
							contractName: '大大建设对外合同',
							contractType: '对申合同',
							applicant: '李想',
							action: '提交',
							status: 'pending',
							statusText: '待审批'
						}
					],
					processed: [
						{
							id: 3,
							title: '合同申请',
							time: '07.23',
							company: '某兰公园一区改造工程HT005',
							contractName: '大大建设对外合同',
							contractType: '对申合同',
							applicant: '李想',
							action: '提交',
							status: 'approved',
							statusText: '已通过'
						},
						{
							id: 4,
							title: '采购执行单',
							time: '2020.07.21',
							company: '某兰公园一区改造工程HT005',
							contractName: '大大建设对外合同',
							contractType: '对申合同',
							applicant: '李想',
							action: '提交',
							status: 'rejected',
							statusText: '已驳回'
						},
						{
							id: 5,
							title: '采购执行单',
							time: '2020.07.20',
							company: '某兰公园一区改造工程HT005',
							contractName: '大大建设对外合同',
							contractType: '对申合同',
							applicant: '李想',
							action: '提交',
							status: 'cancelled',
							statusText: '已撤销'
						}
					],
					copied: [
						{
							id: 6,
							title: '合同申请',
							time: '07.23',
							company: '某兰公园一区改造工程HT005',
							contractName: '大大建设对外合同',
							contractType: '对申合同',
							applicant: '李想',
							action: '提交',
							status: 'approved',
							statusText: '已通过'
						},
						{
							id: 7,
							title: '采购申请',
							time: '2020.07.21',
							company: '某兰公园一区改造工程HT005',
							contractName: '大大建设对外合同',
							contractType: '对申合同',
							applicant: '李想',
							action: '提交',
							status: 'rejected',
							statusText: '已驳回'
						}
					],
					initiated: [
						{
							id: 8,
							title: '合同申请',
							time: '07.23',
							company: '某兰公园一区改造工程HT005',
							contractName: '大大建设对外合同',
							contractType: '对申合同',
							applicant: '李想',
							action: '提交',
							status: 'approved',
							statusText: '已通过'
						},
						{
							id: 9,
							title: '采购执行单',
							time: '2020.07.21',
							company: '某兰公园一区改造工程HT005',
							contractName: '大大建设对外合同',
							contractType: '对申合同',
							applicant: '李想',
							action: '提交',
							status: 'rejected',
							statusText: '已驳回'
						},
						{
							id: 10,
							title: '客户申请',
							time: '2020.07.20',
							company: '大大建设',
							contractName: '水电安装',
							contractType: '对申合同',
							applicant: '童鼎威',
							action: '提交',
							status: 'cancelled',
							statusText: '已撤销'
						}
					]
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
			},
			
			// 搜索
			onSearch() {
				// 实际项目中这里可以添加防抖逻辑
				console.log('搜索关键词：', this.searchKeyword);
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
							// 这里调用API处理审批
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
							// 这里调用API处理审批
							this.handleApproval(item.id, 'reject');
						}
					}
				});
			},
			
			// 处理审批
			handleApproval(id, action) {
				uni.showLoading({ title: '处理中...' });
				
				// 模拟API调用
				setTimeout(() => {
					uni.hideLoading();
					uni.showToast({
						title: action === 'approve' ? '审批通过' : '审批驳回',
						icon: 'success'
					});
					
					// 移除待审批列表中的项目
					const index = this.approvalData.pending.findIndex(item => item.id === id);
					if (index !== -1) {
						const item = this.approvalData.pending.splice(index, 1)[0];
						item.status = action === 'approve' ? 'approved' : 'rejected';
						item.statusText = action === 'approve' ? '已通过' : '已驳回';
						this.approvalData.processed.unshift(item);
					}
				}, 1000);
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
			loadMore() {
				if (this.loading || !this.hasMore) return;
				
				this.loading = true;
				// 模拟加载更多数据
				setTimeout(() => {
					this.loading = false;
					// 这里可以添加更多数据加载逻辑
				}, 1000);
			}
		},
		
		onLoad() {
			// 页面加载时的初始化
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
