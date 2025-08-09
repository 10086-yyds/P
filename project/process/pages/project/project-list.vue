<template>
	<view class="project-list-container">
		<!-- 页面头部 -->
		<view class="page-header">
			<view class="header-title">
				<text class="title-text">{{ pageTitle }}</text>
				<text class="subtitle-text">共{{ totalCount }}个项目</text>
			</view>
			<view class="header-actions">
				<view class="search-btn" @click="showSearchModal">
					<text class="search-icon">🔍</text>
				</view>
				<view class="filter-btn" @click="showFilterModal">
					<text class="filter-icon">⚙️</text>
				</view>
			</view>
		</view>

		<!-- 筛选标签 -->
		<view class="filter-tags" v-if="activeFilters.length > 0">
			<view class="tags-container">
				<view 
					class="filter-tag" 
					v-for="filter in activeFilters" 
					:key="filter.key"
					@click="removeFilter(filter.key)"
				>
					<text class="tag-text">{{ filter.label }}</text>
					<text class="tag-close">×</text>
				</view>
				<view class="clear-all" @click="clearAllFilters">
					<text class="clear-text">清除全部</text>
				</view>
			</view>
		</view>

		<!-- 项目列表 -->
		<view class="project-list" v-if="!isLoading && filteredProjects.length > 0">
			<view 
				class="project-item" 
				v-for="project in filteredProjects" 
				:key="project.id"
				@click="handleProjectClick(project)"
			>
				<view class="project-icon">{{ project.icon || '📋' }}</view>
				<view class="project-info">
					<text class="project-name">{{ project.name }}</text>
					<text class="project-desc">{{ project.description }}</text>
					<view class="project-meta">
						<text class="project-status" :class="project.status">{{ getStatusText(project.status) }}</text>
						<text class="project-type">{{ getTypeText(project.type) }}</text>
						<text class="project-date">{{ formatDate(project.createTime) }}</text>
					</view>
					<view class="project-stats">
						<text class="stat-item">任务: {{ project.taskCount || 0 }}</text>
						<text class="stat-item">成员: {{ project.memberCount || 0 }}</text>
						<text class="stat-item">进度: {{ project.progress || 0 }}%</text>
					</view>
				</view>
				<view class="project-arrow">></view>
			</view>
		</view>

		<!-- 加载状态 -->
		<view class="loading-container" v-if="isLoading">
			<view class="loading-spinner"></view>
			<text class="loading-text">加载中...</text>
		</view>

		<!-- 空状态 -->
		<view class="empty-container" v-if="!isLoading && filteredProjects.length === 0">
			<text class="empty-icon">📋</text>
			<text class="empty-text">{{ emptyText }}</text>
		</view>

		<!-- 加载更多 -->
		<view class="load-more" v-if="hasMore && !isLoading && filteredProjects.length > 0">
			<view class="load-more-btn" @click="loadMore">
				<text class="load-more-text">加载更多</text>
			</view>
		</view>
	</view>
</template>

<script>
import { API_CONFIG } from "../../config/api.js";

export default {
	data() {
		return {
			// 页面状态
			isLoading: false,
			pageTitle: '项目列表',
			totalCount: 0,
			hasMore: true,
			
			// 数据
			allProjects: [],
			filteredProjects: [],
			
			// 分页
			currentPage: 1,
			pageSize: 20,
			
			// 筛选
			selectedTypes: [],
			selectedStatuses: [],
			activeFilters: [],
			
			// 筛选选项
			projectTypes: [
				{ value: 'construction', label: '建筑工程' },
				{ value: 'infrastructure', label: '基础设施' },
				{ value: 'renovation', label: '装修工程' },
				{ value: 'maintenance', label: '维护工程' },
				{ value: 'design', label: '设计项目' },
				{ value: 'consulting', label: '咨询项目' }
			],
			projectStatuses: [
				{ value: 'ongoing', label: '进行中' },
				{ value: 'completed', label: '已完成' },
				{ value: 'pending', label: '待开始' },
				{ value: 'paused', label: '已暂停' }
			]
		}
	},
	
	computed: {
		emptyText() {
			if (this.activeFilters.length > 0) {
				return '没有符合条件的项目';
			}
			return '暂无项目数据';
		}
	},
	
	onLoad(options) {
		// 获取页面参数
		if (options.type) {
			console.log('项目类型:', options.type);
			this.selectedTypes = [options.type];
		}
		if (options.title) {
			this.pageTitle = decodeURIComponent(options.title);
		}
		
		// 加载数据
		this.loadProjectData();
	},
	
	onPullDownRefresh() {
		// 下拉刷新
		this.refreshData();
	},
	
	onReachBottom() {
		// 上拉加载更多
		if (this.hasMore && !this.isLoading) {
			this.loadMore();
		}
	},
	
	methods: {
		// 从后端获取项目数据
		async loadProjectData() {
			this.isLoading = true;
			
			try {
				const projectsData = await this.fetchProjectsFromBackend();
				this.allProjects = projectsData;
				this.applyFilters();
				console.log('项目数据加载完成');
				
			} catch (error) {
				console.error('加载项目数据失败:', error);
				uni.showToast({
					title: '数据加载失败',
					icon: 'error',
					duration: 2000
				});
				
				// 使用模拟数据
				this.loadMockData();
			} finally {
				this.isLoading = false;
				uni.stopPullDownRefresh();
			}
		},
		
		// 从后端数据库获取项目数据
		async fetchProjectsFromBackend() {
			try {
				console.log('正在从后端获取项目数据...');
				
				const params = {
					page: this.currentPage,
					pageSize: this.pageSize,
					includeTasks: true,
					includeMembers: true
				};
				
				const response = await uni.request({
					url: `${API_CONFIG.BASE_URL}/api/projects`,
					method: 'GET',
					data: params,
					header: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${this.getToken()}`
					}
				});
				
				console.log('后端API响应:', response);
				
				if (response.statusCode === 200 && response.data) {
					const data = response.data.data || response.data;
					this.totalCount = response.data.total || data.length;
					this.hasMore = data.length === this.pageSize;
					return data;
				} else {
					throw new Error(`API请求失败: ${response.statusCode}`);
				}
				
			} catch (error) {
				console.error('获取项目数据失败:', error);
				throw error;
			}
		},
		
		// 获取用户token
		getToken() {
			return uni.getStorageSync('userToken') || '';
		},
		
		// 加载模拟数据
		loadMockData() {
			console.log('使用模拟数据');
			
			const mockProjects = [
				{
					id: 1,
					name: '地铁3号线项目',
					description: '城市轨道交通建设项目，包括车站建设、轨道铺设等',
					type: 'infrastructure',
					status: 'ongoing',
					createTime: '2024-01-15T10:30:00Z',
					icon: '🚇',
					taskCount: 15,
					memberCount: 8,
					progress: 65
				},
				{
					id: 2,
					name: '商业中心建设',
					description: '大型商业综合体开发项目，包含购物中心、办公楼等',
					type: 'construction',
					status: 'completed',
					createTime: '2024-01-10T14:20:00Z',
					icon: '🏢',
					taskCount: 12,
					memberCount: 6,
					progress: 100
				},
				{
					id: 3,
					name: '桥梁维修工程',
					description: '城市桥梁维护和加固项目，确保桥梁安全使用',
					type: 'maintenance',
					status: 'ongoing',
					createTime: '2024-01-20T09:15:00Z',
					icon: '🌉',
					taskCount: 8,
					memberCount: 4,
					progress: 45
				},
				{
					id: 4,
					name: '办公楼装修',
					description: '现代化办公楼内部装修项目，提升办公环境',
					type: 'renovation',
					status: 'pending',
					createTime: '2024-01-25T16:45:00Z',
					icon: '🏢',
					taskCount: 10,
					memberCount: 5,
					progress: 0
				},
				{
					id: 5,
					name: '城市规划设计',
					description: '城市新区规划设计方案，包含道路、绿化等',
					type: 'design',
					status: 'ongoing',
					createTime: '2024-01-18T11:20:00Z',
					icon: '📐',
					taskCount: 6,
					memberCount: 3,
					progress: 80
				}
			];
			
			this.allProjects = mockProjects;
			this.totalCount = mockProjects.length;
			this.hasMore = false;
			this.applyFilters();
		},
		
		// 应用筛选条件
		applyFilters() {
			let filtered = [...this.allProjects];
			
			// 类型筛选
			if (this.selectedTypes.length > 0) {
				filtered = filtered.filter(project => 
					this.selectedTypes.includes(project.type)
				);
			}
			
			// 状态筛选
			if (this.selectedStatuses.length > 0) {
				filtered = filtered.filter(project => 
					this.selectedStatuses.includes(project.status)
				);
			}
			
			this.filteredProjects = filtered;
			this.updateActiveFilters();
		},
		
		// 更新活跃筛选标签
		updateActiveFilters() {
			this.activeFilters = [];
			
			// 添加类型筛选标签
			this.selectedTypes.forEach(type => {
				const typeInfo = this.projectTypes.find(t => t.value === type);
				if (typeInfo) {
					this.activeFilters.push({
						key: `type_${type}`,
						label: typeInfo.label,
						type: 'type',
						value: type
					});
				}
			});
			
			// 添加状态筛选标签
			this.selectedStatuses.forEach(status => {
				const statusInfo = this.projectStatuses.find(s => s.value === status);
				if (statusInfo) {
					this.activeFilters.push({
						key: `status_${status}`,
						label: statusInfo.label,
						type: 'status',
						value: status
					});
				}
			});
		},
		
		// 移除筛选条件
		removeFilter(filterKey) {
			const filter = this.activeFilters.find(f => f.key === filterKey);
			if (filter) {
				switch (filter.type) {
					case 'type':
						this.selectedTypes = this.selectedTypes.filter(t => t !== filter.value);
						break;
					case 'status':
						this.selectedStatuses = this.selectedStatuses.filter(s => s !== filter.value);
						break;
				}
				this.applyFilters();
			}
		},
		
		// 清除所有筛选条件
		clearAllFilters() {
			this.selectedTypes = [];
			this.selectedStatuses = [];
			this.applyFilters();
		},
		
		// 显示搜索弹窗
		showSearchModal() {
			uni.showToast({
				title: '搜索功能开发中',
				icon: 'none'
			});
		},
		
		// 显示筛选弹窗
		showFilterModal() {
			uni.showToast({
				title: '筛选功能开发中',
				icon: 'none'
			});
		},
		
		// 刷新数据
		async refreshData() {
			this.currentPage = 1;
			this.hasMore = true;
			await this.loadProjectData();
		},
		
		// 加载更多
		async loadMore() {
			if (!this.hasMore || this.isLoading) return;
			
			this.currentPage++;
			this.isLoading = true;
			
			try {
				const moreData = await this.fetchProjectsFromBackend();
				this.allProjects = [...this.allProjects, ...moreData];
				this.applyFilters();
			} catch (error) {
				console.error('加载更多数据失败:', error);
				this.currentPage--;
			} finally {
				this.isLoading = false;
			}
		},
		
		// 处理项目点击
		handleProjectClick(project) {
			console.log('点击项目:', project);
			
			uni.navigateTo({
				url: `/pages/project/project-detail?id=${project.id}&name=${encodeURIComponent(project.name)}`,
				success: () => {
					console.log('跳转到项目详情成功');
				},
				fail: (err) => {
					console.error('跳转到项目详情失败:', err);
					uni.showModal({
						title: '提示',
						content: '项目详情页面正在开发中，敬请期待！',
						showCancel: false
					});
				}
			});
		},
		
		// 获取状态文本
		getStatusText(status) {
			const statusMap = {
				'ongoing': '进行中',
				'completed': '已完成',
				'pending': '待开始',
				'paused': '已暂停'
			};
			return statusMap[status] || '未知状态';
		},
		
		// 获取类型文本
		getTypeText(type) {
			const typeInfo = this.projectTypes.find(t => t.value === type);
			return typeInfo ? typeInfo.label : '未知类型';
		},
		
		// 格式化日期
		formatDate(dateString) {
			if (!dateString) return '';
			
			const date = new Date(dateString);
			const now = new Date();
			const diffTime = now - date;
			const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
			
			if (diffDays === 0) {
				return '今天';
			} else if (diffDays === 1) {
				return '昨天';
			} else if (diffDays < 7) {
				return `${diffDays}天前`;
			} else {
				return `${date.getMonth() + 1}月${date.getDate()}日`;
			}
		}
	}
}
</script>

<style scoped>
.project-list-container {
	padding: 20rpx;
	background-color: #f5f5f5;
	min-height: 100vh;
}

/* 页面头部 */
.page-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 20rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 20rpx;
	margin-bottom: 30rpx;
	color: white;
}

.header-title {
	flex: 1;
}

.title-text {
	font-size: 36rpx;
	font-weight: bold;
	display: block;
	margin-bottom: 8rpx;
}

.subtitle-text {
	font-size: 24rpx;
	opacity: 0.8;
}

.header-actions {
	display: flex;
	gap: 20rpx;
}

.search-btn,
.filter-btn {
	padding: 15rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.2);
	transition: all 0.3s ease;
}

.search-btn:active,
.filter-btn:active {
	background: rgba(255, 255, 255, 0.3);
	transform: scale(0.9);
}

.search-icon,
.filter-icon {
	font-size: 32rpx;
	display: block;
}

/* 筛选标签 */
.filter-tags {
	margin-bottom: 20rpx;
}

.tags-container {
	display: flex;
	flex-wrap: wrap;
	gap: 15rpx;
}

.filter-tag {
	display: flex;
	align-items: center;
	padding: 10rpx 20rpx;
	background: #667eea;
	color: white;
	border-radius: 20rpx;
	font-size: 24rpx;
	transition: all 0.3s ease;
}

.filter-tag:active {
	background: #5a6fd8;
	transform: scale(0.95);
}

.tag-close {
	margin-left: 10rpx;
	font-size: 28rpx;
	font-weight: bold;
}

.clear-all {
	padding: 10rpx 20rpx;
	color: #667eea;
	font-size: 24rpx;
	text-decoration: underline;
}

/* 项目列表 */
.project-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.project-item {
	display: flex;
	align-items: center;
	padding: 30rpx;
	background: white;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;
	cursor: pointer;
}

.project-item:active {
	transform: scale(0.98);
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.15);
}

.project-icon {
	font-size: 50rpx;
	margin-right: 30rpx;
}

.project-info {
	flex: 1;
}

.project-name {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 10rpx;
	display: block;
}

.project-desc {
	font-size: 26rpx;
	color: #666;
	margin-bottom: 15rpx;
	display: block;
	line-height: 1.4;
}

.project-meta {
	display: flex;
	align-items: center;
	gap: 20rpx;
	margin-bottom: 10rpx;
}

.project-status {
	font-size: 22rpx;
	padding: 6rpx 16rpx;
	border-radius: 12rpx;
	background: #f0f2ff;
	color: #667eea;
}

.project-status.ongoing {
	background: #fff3cd;
	color: #ffa502;
}

.project-status.completed {
	background: #d4edda;
	color: #2ed573;
}

.project-status.pending {
	background: #e8ecff;
	color: #667eea;
}

.project-status.paused {
	background: #f8d7da;
	color: #dc3545;
}

.project-type {
	font-size: 22rpx;
	color: #999;
}

.project-date {
	font-size: 22rpx;
	color: #999;
}

.project-stats {
	display: flex;
	gap: 20rpx;
}

.stat-item {
	font-size: 22rpx;
	color: #666;
}

.project-arrow {
	font-size: 28rpx;
	color: #ccc;
	margin-left: 20rpx;
}

/* 加载状态 */
.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
}

.loading-spinner {
	width: 60rpx;
	height: 60rpx;
	border: 4rpx solid #f3f3f3;
	border-top: 4rpx solid #667eea;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin-bottom: 20rpx;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.loading-text {
	font-size: 28rpx;
	color: #666;
}

/* 空状态 */
.empty-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
}

.empty-icon {
	font-size: 80rpx;
	margin-bottom: 20rpx;
	opacity: 0.5;
}

.empty-text {
	font-size: 28rpx;
	color: #999;
}

/* 加载更多 */
.load-more {
	display: flex;
	justify-content: center;
	padding: 40rpx 0;
}

.load-more-btn {
	padding: 20rpx 40rpx;
	background: #667eea;
	color: white;
	border-radius: 25rpx;
	transition: all 0.3s ease;
}

.load-more-btn:active {
	background: #5a6fd8;
	transform: scale(0.95);
}

.load-more-text {
	font-size: 28rpx;
}
</style>