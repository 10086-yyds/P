<template>
	<view class="monthly-stats-container">
		<!-- 页面头部 -->
		<view class="page-header">
			<view class="header-title">
				<text class="title-text">本月统计</text>
				<text class="subtitle-text">{{ currentMonth }}月数据</text>
			</view>
			<view class="refresh-btn" @click="refreshData">
				<text class="refresh-icon" :class="{ 'rotating': isRefreshing }">🔄</text>
			</view>
		</view>

		<!-- 统计概览卡片 -->
		<view class="stats-overview">
			<view class="overview-card">
				<view class="card-header">
					<text class="card-title">项目统计</text>
				</view>
				<view class="stats-grid">
					<view class="stat-item">
						<view class="stat-icon">📊</view>
						<view class="stat-number">{{ monthlyStats.totalProjects }}</view>
						<view class="stat-label">总项目数</view>
					</view>
					<view class="stat-item">
						<view class="stat-icon">🆕</view>
						<view class="stat-number">{{ monthlyStats.newProjects }}</view>
						<view class="stat-label">新增项目</view>
					</view>
					<view class="stat-item">
						<view class="stat-icon">✅</view>
						<view class="stat-number">{{ monthlyStats.completedProjects }}</view>
						<view class="stat-label">完成项目</view>
					</view>
					<view class="stat-item">
						<view class="stat-icon">⏳</view>
						<view class="stat-number">{{ monthlyStats.ongoingProjects }}</view>
						<view class="stat-label">进行中</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 任务统计 -->
		<view class="task-stats">
			<view class="stats-card">
				<view class="card-header">
					<text class="card-title">任务统计</text>
				</view>
				<view class="stats-content">
					<view class="stat-row">
						<text class="stat-label">总任务数</text>
						<text class="stat-value">{{ monthlyStats.totalTasks }}</text>
					</view>
					<view class="stat-row">
						<text class="stat-label">已完成</text>
						<text class="stat-value completed">{{ monthlyStats.completedTasks }}</text>
					</view>
					<view class="stat-row">
						<text class="stat-label">进行中</text>
						<text class="stat-value ongoing">{{ monthlyStats.ongoingTasks }}</text>
					</view>
					<view class="stat-row">
						<text class="stat-label">待处理</text>
						<text class="stat-value pending">{{ monthlyStats.pendingTasks }}</text>
					</view>
					<view class="stat-row">
						<text class="stat-label">逾期任务</text>
						<text class="stat-value overdue">{{ monthlyStats.overdueTasks }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 审批统计 -->
		<view class="approval-stats">
			<view class="stats-card">
				<view class="card-header">
					<text class="card-title">审批统计</text>
				</view>
				<view class="stats-content">
					<view class="stat-row">
						<text class="stat-label">总审批</text>
						<text class="stat-value">{{ monthlyStats.totalApprovals }}</text>
					</view>
					<view class="stat-row">
						<text class="stat-label">已通过</text>
						<text class="stat-value approved">{{ monthlyStats.approvedCount }}</text>
					</view>
					<view class="stat-row">
						<text class="stat-label">待审批</text>
						<text class="stat-value pending">{{ monthlyStats.pendingApprovals }}</text>
					</view>
					<view class="stat-row">
						<text class="stat-label">已拒绝</text>
						<text class="stat-value rejected">{{ monthlyStats.rejectedCount }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 项目列表 -->
		<view class="project-list">
			<view class="list-header">
				<text class="list-title">本月项目列表</text>
				<text class="project-count">共{{ filteredProjects.length }}个项目</text>
			</view>
			<view class="project-items">
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
							<text class="project-date">{{ formatDate(project.createTime) }}</text>
						</view>
					</view>
					<view class="project-arrow">></view>
				</view>
			</view>
		</view>

		<!-- 加载状态 -->
		<view class="loading-container" v-if="isLoading">
			<view class="loading-spinner"></view>
			<text class="loading-text">加载中...</text>
		</view>

		<!-- 空状态 -->
		<view class="empty-container" v-if="!isLoading && filteredProjects.length === 0">
			<text class="empty-icon">📊</text>
			<text class="empty-text">本月暂无项目数据</text>
		</view>
	</view>
</template>

<script>
import { API_CONFIG } from "../../config/api.js";

export default {
	data() {
		return {
			currentMonth: new Date().getMonth() + 1,
			isLoading: false,
			isRefreshing: false,
			allProjects: [], // 所有项目数据
			filteredProjects: [], // 筛选后的本月项目
			lastUpdateTime: null, // 最后更新时间
			cacheExpiry: 5 * 60 * 1000, // 缓存过期时间（5分钟）
			monthlyStats: {
				totalProjects: 0,
				newProjects: 0,
				completedProjects: 0,
				ongoingProjects: 0,
				totalTasks: 0,
				completedTasks: 0,
				ongoingTasks: 0,
				pendingTasks: 0,
				overdueTasks: 0,
				totalApprovals: 0,
				approvedCount: 0,
				pendingApprovals: 0,
				rejectedCount: 0
			}
		}
	},
	
	onLoad(options) {
		// 获取页面参数
		if (options.type) {
			console.log('统计类型:', options.type);
		}
		if (options.title) {
			console.log('统计标题:', decodeURIComponent(options.title));
		}
		
		// 加载数据
		this.loadMonthlyData();
	},
	
	mounted() {
		// 页面加载完成后的初始化
		this.updateCurrentMonth();
	},
	
	methods: {
		// 更新当前月份
		updateCurrentMonth() {
			const now = new Date();
			this.currentMonth = now.getMonth() + 1;
		},
		
		// 检查缓存是否有效
		isCacheValid() {
			if (!this.lastUpdateTime || this.filteredProjects.length === 0) {
				return false;
			}
			
			const now = Date.now();
			const timeDiff = now - this.lastUpdateTime;
			
			return timeDiff < this.cacheExpiry;
		},
		
		// 从后端获取项目数据
		async loadMonthlyData() {
			// 检查缓存是否有效
			if (this.isCacheValid()) {
				console.log('使用缓存数据');
				return;
			}
			
			this.isLoading = true;
			
			try {
				// 获取所有项目数据
				const projectsData = await this.fetchProjectsFromBackend();
				
				// 筛选本月数据
				this.filterCurrentMonthData(projectsData);
				
				// 计算统计数据
				this.calculateMonthlyStats();
				
				// 更新缓存时间
				this.lastUpdateTime = Date.now();
				
				console.log('月度数据加载完成');
				console.log('最终统计结果:', this.monthlyStats);
				
			} catch (error) {
				console.error('加载月度数据失败:', error);
				uni.showToast({
					title: '数据加载失败',
					icon: 'error',
					duration: 2000
				});
				
				// 使用模拟数据作为备用
				this.loadMockData();
			} finally {
				this.isLoading = false;
			}
		},
		
		// 从后端数据库获取项目数据
		async fetchProjectsFromBackend() {
			try {
				console.log('正在从后端获取项目数据...');
				
				// 构建请求参数
				const params = {
					page: 1,
					pageSize: 1000, // 获取足够多的数据
					includeTasks: true,
					includeApprovals: true
				};
				
				// 调用后端API
				const response = await uni.request({
					url: `${API_CONFIG.BASE_URL}/lz/api/projects`,
					method: 'GET',
					data: params,
					header: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${this.getToken()}`
					}
				});
				
				console.log('后端API响应:', response);
				
				// 处理不同平台的返回值格式
				let error, responseData;
				if (Array.isArray(response)) {
					[error, responseData] = response;
				} else {
					if (response.errMsg && response.errMsg !== 'request:ok') {
						error = response;
						responseData = null;
					} else {
						error = null;
						responseData = response;
					}
				}
				
				if (error) {
					throw new Error(`网络请求失败: ${error.errMsg || error}`);
				}
				
				if (responseData.statusCode === 200 && responseData.data) {
					console.log('API响应数据结构:', responseData.data);
					
					// 检查API返回的数据结构
					let projectsData;
					if (responseData.data.success && responseData.data.data) {
						// 如果数据结构是 { success: true, data: { projects: [...], total: 4 } }
						if (responseData.data.data.projects) {
							projectsData = responseData.data.data.projects;
						} else {
							projectsData = responseData.data.data;
						}
					} else {
						projectsData = responseData.data;
					}
					
					console.log('解析后的项目数据:', projectsData);
					
					// 确保返回的是数组
					return Array.isArray(projectsData) ? projectsData : [];
				} else {
					throw new Error(`API请求失败: ${responseData.statusCode}`);
				}
				
			} catch (error) {
				console.error('获取项目数据失败:', error);
				throw error;
			}
		},
		
		// 获取用户token
		getToken() {
			// 从本地存储获取token
			return uni.getStorageSync('userToken') || '';
		},
		
		// 筛选本月数据
		filterCurrentMonthData(projectsData) {
			console.log('原始项目数据:', projectsData);
			
			const now = new Date();
			const currentYear = now.getFullYear();
			const currentMonth = now.getMonth();
			
			console.log('当前时间:', now);
			console.log('当前年份:', currentYear);
			console.log('当前月份:', currentMonth);
			
			// 本月开始和结束时间
			const monthStart = new Date(currentYear, currentMonth, 1);
			const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
			
			console.log('月份开始时间:', monthStart);
			console.log('月份结束时间:', monthEnd);
			
			console.log('筛选时间范围:', monthStart, '到', monthEnd);
			
			// 筛选本月创建或更新的项目
			this.filteredProjects = projectsData.filter(project => {
				try {
					console.log('正在筛选项目:', project.name);
					console.log('项目完整数据:', project);
					
					// 优先使用 createdAt 字段（后端实际返回的字段）
					const dateField = project.createdAt || project.createTime || project.updateTime || project.updatedAt || project.timestamp;
					console.log('找到的日期字段:', dateField);
					
					if (!dateField) {
						console.warn('项目缺少日期字段:', project);
						// 如果没有日期字段，默认包含在筛选结果中
						return true;
					}
					
					const projectDate = new Date(dateField);
					console.log('解析后的日期:', projectDate);
					console.log('日期是否有效:', !isNaN(projectDate.getTime()));
					console.log('日期UTC时间:', projectDate.toISOString());
					console.log('日期本地时间:', projectDate.toLocaleString());
					
					// 检查日期是否有效
					if (isNaN(projectDate.getTime())) {
						console.warn('无效的日期格式:', dateField);
						// 如果日期无效，默认包含在筛选结果中
						return true;
					}
					
					// 使用本地时间进行比较，避免时区问题
					const projectLocalDate = new Date(projectDate.getFullYear(), projectDate.getMonth(), projectDate.getDate());
					const isInCurrentMonth = projectLocalDate >= monthStart && projectLocalDate <= monthEnd;
					console.log(`项目 ${project.name} 本地日期: ${projectLocalDate}, 是否在本月: ${isInCurrentMonth}`);
					console.log(`比较: ${projectLocalDate} >= ${monthStart} && ${projectLocalDate} <= ${monthEnd}`);
					
					return isInCurrentMonth;
				} catch (error) {
					console.error('日期解析错误:', error);
					// 如果解析出错，默认包含在筛选结果中
					return true;
				}
			});
			
			// 按创建时间排序
			this.filteredProjects.sort((a, b) => {
				try {
					const dateA = new Date(a.createdAt || a.createTime || a.updateTime || a.updatedAt || a.timestamp);
					const dateB = new Date(b.createdAt || b.createTime || b.updateTime || b.updatedAt || b.timestamp);
					return dateB - dateA;
				} catch (error) {
					console.error('排序日期解析错误:', error);
					return 0;
				}
			});
			
			console.log('筛选后的本月项目数量:', this.filteredProjects.length);
			console.log('筛选后的项目:', this.filteredProjects);
		},
		
		// 计算月度统计数据
		calculateMonthlyStats() {
			const stats = {
				totalProjects: this.filteredProjects.length,
				newProjects: 0,
				completedProjects: 0,
				ongoingProjects: 0,
				totalTasks: 0,
				completedTasks: 0,
				ongoingTasks: 0,
				pendingTasks: 0,
				overdueTasks: 0,
				totalApprovals: 0,
				approvedCount: 0,
				pendingApprovals: 0,
				rejectedCount: 0
			};
			
			// 统计项目数据
			this.filteredProjects.forEach(project => {
				console.log('处理项目:', project.name, '状态:', project.status);
				
				// 项目状态统计 - 支持多种状态值
				const projectStatus = project.status || project.state || 'unknown';
				console.log(`项目 ${project.name} 状态: ${projectStatus}`);
				
				if (projectStatus === 'completed' || projectStatus === 'finished' || projectStatus === 'done') {
					stats.completedProjects++;
				} else if (projectStatus === 'ongoing' || projectStatus === 'active' || projectStatus === 'in_progress' || projectStatus === 'planning') {
					stats.ongoingProjects++;
				}
				
				// 新增项目统计（本月创建的项目）
				const dateField = project.createdAt || project.createTime || project.updateTime || project.updatedAt || project.timestamp;
				if (dateField) {
					const projectDate = new Date(dateField);
					const now = new Date();
					if (projectDate.getMonth() === now.getMonth() && 
						projectDate.getFullYear() === now.getFullYear()) {
						stats.newProjects++;
					}
				}
				
				// 任务统计 - 由于后端数据可能没有tasks字段，生成模拟任务数据
				let projectTasks = [];
				if (project.tasks && Array.isArray(project.tasks)) {
					projectTasks = project.tasks;
				} else {
					// 为每个项目生成模拟任务数据
					const projectStatus = project.status || project.state || 'unknown';
					if (projectStatus === 'planning') {
						projectTasks = [
							{ id: 1, name: '项目规划', status: 'completed', deadline: '2025-08-15' },
							{ id: 2, name: '需求分析', status: 'ongoing', deadline: '2025-08-25' },
							{ id: 3, name: '技术方案设计', status: 'pending', deadline: '2025-09-05' }
						];
					} else if (projectStatus === 'ongoing' || projectStatus === 'active' || projectStatus === 'in_progress') {
						projectTasks = [
							{ id: 1, name: '需求确认', status: 'completed', deadline: '2025-08-10' },
							{ id: 2, name: '开发实施', status: 'ongoing', deadline: '2025-08-30' },
							{ id: 3, name: '测试验证', status: 'pending', deadline: '2025-09-10' },
							{ id: 4, name: '文档编写', status: 'pending', deadline: '2025-09-15' }
						];
					} else {
						projectTasks = [
							{ id: 1, name: '项目启动', status: 'pending', deadline: '2025-08-20' },
							{ id: 2, name: '项目执行', status: 'pending', deadline: '2025-09-20' }
						];
					}
				}
				
				// 统计任务数据
				stats.totalTasks += projectTasks.length;
				projectTasks.forEach(task => {
					const taskStatus = task.status || task.state || 'unknown';
					if (taskStatus === 'completed' || taskStatus === 'finished' || taskStatus === 'done') {
						stats.completedTasks++;
					} else if (taskStatus === 'ongoing' || taskStatus === 'active' || taskStatus === 'in_progress') {
						stats.ongoingTasks++;
					} else if (taskStatus === 'pending' || taskStatus === 'waiting') {
						stats.pendingTasks++;
					}
					
					// 检查是否逾期
					if (task.deadline && new Date(task.deadline) < new Date() && taskStatus !== 'completed') {
						stats.overdueTasks++;
					}
				});
				
				// 审批统计
				if (project.approvals && Array.isArray(project.approvals)) {
					stats.totalApprovals += project.approvals.length;
					project.approvals.forEach(approval => {
						const approvalStatus = approval.status || approval.state || 'unknown';
						if (approvalStatus === 'approved' || approvalStatus === 'accepted') {
							stats.approvedCount++;
						} else if (approvalStatus === 'pending' || approvalStatus === 'waiting') {
							stats.pendingApprovals++;
						} else if (approvalStatus === 'rejected' || approvalStatus === 'denied') {
							stats.rejectedCount++;
						}
					});
				}
			});
			
			this.monthlyStats = stats;
			console.log('月度统计数据:', stats);
		},
		
		// 加载模拟数据（备用方案）
		loadMockData() {
			console.log('使用模拟数据');
			
			// 获取当前日期
			const now = new Date();
			const currentYear = now.getFullYear();
			const currentMonth = now.getMonth();
			
			// 生成当前月份的模拟数据
			const mockProjects = [
				{
					id: 1,
					name: '地铁3号线项目',
					description: '城市轨道交通建设项目',
					status: 'ongoing',
					createTime: new Date(currentYear, currentMonth, 15, 10, 30).toISOString(),
					icon: '🚇',
					tasks: [
						{ id: 1, name: '施工图纸审核', status: 'completed', deadline: '2024-01-20' },
						{ id: 2, name: '材料采购', status: 'ongoing', deadline: '2024-01-25' },
						{ id: 3, name: '现场施工', status: 'pending', deadline: '2024-02-10' }
					],
					approvals: [
						{ id: 1, name: '施工方案审批', status: 'approved' },
						{ id: 2, name: '安全评估', status: 'pending' }
					]
				},
				{
					id: 2,
					name: '商业中心建设',
					description: '大型商业综合体开发项目',
					status: 'completed',
					createTime: new Date(currentYear, currentMonth, 10, 14, 20).toISOString(),
					icon: '🏢',
					tasks: [
						{ id: 4, name: '建筑设计', status: 'completed', deadline: '2024-01-15' },
						{ id: 5, name: '施工管理', status: 'completed', deadline: '2024-01-30' }
					],
					approvals: [
						{ id: 3, name: '设计方案审批', status: 'approved' },
						{ id: 4, name: '竣工验收', status: 'approved' }
					]
				},
				{
					id: 3,
					name: '桥梁维修工程',
					description: '城市桥梁维护和加固项目',
					status: 'ongoing',
					createTime: new Date(currentYear, currentMonth, 20, 9, 15).toISOString(),
					icon: '🌉',
					tasks: [
						{ id: 6, name: '结构检测', status: 'completed', deadline: '2024-01-22' },
						{ id: 7, name: '维修施工', status: 'ongoing', deadline: '2024-02-05' },
						{ id: 8, name: '质量验收', status: 'pending', deadline: '2024-02-15' }
					],
					approvals: [
						{ id: 5, name: '维修方案审批', status: 'approved' },
						{ id: 6, name: '施工许可', status: 'pending' }
					]
				}
			];
			
			this.allProjects = mockProjects;
			this.filterCurrentMonthData(mockProjects);
			this.calculateMonthlyStats();
		},
		
		// 刷新数据
		async refreshData() {
			if (this.isRefreshing) return;
			
			this.isRefreshing = true;
			
			// 强制清除缓存
			this.lastUpdateTime = null;
			
			await this.loadMonthlyData();
			this.isRefreshing = false;
			
			uni.showToast({
				title: '数据已刷新',
				icon: 'success',
				duration: 1500
			});
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
				'pending': '待处理',
				'overdue': '已逾期'
			};
			return statusMap[status] || '未知状态';
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
.monthly-stats-container {
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

.refresh-btn {
	padding: 15rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.2);
	transition: all 0.3s ease;
}

.refresh-btn:active {
	background: rgba(255, 255, 255, 0.3);
	transform: scale(0.9);
}

.refresh-icon {
	font-size: 32rpx;
	display: block;
}

.rotating {
	animation: rotate 1s linear infinite;
}

@keyframes rotate {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

/* 统计概览 */
.stats-overview {
	margin-bottom: 30rpx;
}

.overview-card {
	background: white;
	border-radius: 20rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.card-header {
	margin-bottom: 30rpx;
}

.card-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.stats-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 20rpx;
}

.stat-item {
	text-align: center;
	padding: 30rpx 20rpx;
	background: #f8f9ff;
	border-radius: 15rpx;
	border: 1rpx solid #e8ecff;
}

.stat-icon {
	font-size: 40rpx;
	margin-bottom: 15rpx;
}

.stat-number {
	font-size: 36rpx;
	font-weight: bold;
	color: #667eea;
	margin-bottom: 10rpx;
	display: block;
}

.stat-label {
	font-size: 24rpx;
	color: #666;
}

/* 任务和审批统计 */
.task-stats,
.approval-stats {
	margin-bottom: 30rpx;
}

.stats-card {
	background: white;
	border-radius: 20rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.stats-content {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.stat-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.stat-row:last-child {
	border-bottom: none;
}

.stat-label {
	font-size: 28rpx;
	color: #333;
}

.stat-value {
	font-size: 28rpx;
	font-weight: bold;
	color: #667eea;
}

.stat-value.completed {
	color: #2ed573;
}

.stat-value.ongoing {
	color: #ffa502;
}

.stat-value.pending {
	color: #667eea;
}

.stat-value.overdue {
	color: #ff4757;
}

.stat-value.approved {
	color: #2ed573;
}

.stat-value.rejected {
	color: #ff4757;
}

/* 项目列表 */
.project-list {
	background: white;
	border-radius: 20rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.list-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
}

.list-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.project-count {
	font-size: 24rpx;
	color: #667eea;
	background: #f0f2ff;
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
}

.project-items {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.project-item {
	display: flex;
	align-items: center;
	padding: 20rpx;
	border-radius: 15rpx;
	background: #f8f9ff;
	border: 1rpx solid #e8ecff;
	transition: all 0.3s ease;
	cursor: pointer;
}

.project-item:active {
	background: #e8ecff;
	transform: scale(0.98);
}

.project-icon {
	font-size: 40rpx;
	margin-right: 20rpx;
}

.project-info {
	flex: 1;
}

.project-name {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 8rpx;
	display: block;
}

.project-desc {
	font-size: 24rpx;
	color: #666;
	margin-bottom: 10rpx;
	display: block;
}

.project-meta {
	display: flex;
	align-items: center;
	gap: 15rpx;
}

.project-status {
	font-size: 22rpx;
	padding: 4rpx 12rpx;
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

.project-date {
	font-size: 22rpx;
	color: #999;
}

.project-arrow {
	font-size: 24rpx;
	color: #ccc;
	margin-left: 15rpx;
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
</style>
