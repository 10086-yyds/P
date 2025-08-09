 <template>
	<view class="project-detail-container">
		<!-- 页面头部 -->
		<view class="page-header">
			<view class="header-back" @click="goBack">
				<text class="back-icon">←</text>
			</view>
			<view class="header-title">
				<text class="title-text">{{ projectInfo.name || '项目详情' }}</text>
			</view>
			<view class="header-actions">
				<view class="action-btn" @click="handleEdit">
					<text class="action-icon">✏️</text>
				</view>
				<view class="action-btn" @click="handleShare">
					<text class="action-icon">📤</text>
				</view>
			</view>
		</view>

		<!-- 加载状态 -->
		<view class="loading-container" v-if="isLoading">
			<view class="loading-spinner"></view>
			<text class="loading-text">加载中...</text>
		</view>

		<!-- 项目详情内容 -->
		<view class="project-content" v-else-if="projectInfo._id || projectInfo.id">
			<!-- 项目基本信息 -->
			<view class="info-section">
				<view class="section-header">
					<text class="section-title">基本信息</text>
				</view>
				<view class="info-card">
					<view class="project-header">
						<view class="project-icon">{{ projectInfo.icon || '📋' }}</view>
						<view class="project-main-info">
							<text class="project-name">{{ projectInfo.name }}</text>
							<text class="project-desc">{{ projectInfo.description }}</text>
						</view>
						<view class="project-status" :class="projectInfo.status">
							<text class="status-text">{{ getStatusText(projectInfo.status) }}</text>
						</view>
					</view>
					<view class="project-meta">
						<view class="meta-item">
							<text class="meta-label">项目类型</text>
							<text class="meta-value">{{ getTypeText(projectInfo.type) }}</text>
						</view>
						<view class="meta-item">
							<text class="meta-label">创建时间</text>
							<text class="meta-value">{{ formatDate(projectInfo.createTime) }}</text>
						</view>
						<view class="meta-item">
							<text class="meta-label">更新时间</text>
							<text class="meta-value">{{ formatDate(projectInfo.updateTime) }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 项目统计 -->
			<view class="stats-section">
				<view class="section-header">
					<text class="section-title">项目统计</text>
				</view>
				<view class="stats-grid">
					<view class="stat-card">
						<view class="stat-icon">📊</view>
						<view class="stat-number">{{ projectStats.totalTasks }}</view>
						<view class="stat-label">总任务</view>
					</view>
					<view class="stat-card">
						<view class="stat-icon">✅</view>
						<view class="stat-number">{{ projectStats.completedTasks }}</view>
						<view class="stat-label">已完成</view>
					</view>
					<view class="stat-card">
						<view class="stat-icon">👥</view>
						<view class="stat-number">{{ projectStats.totalMembers }}</view>
						<view class="stat-label">团队成员</view>
					</view>
					<view class="stat-card">
						<view class="stat-icon">📈</view>
						<view class="stat-number">{{ projectStats.progress }}%</view>
						<view class="stat-label">完成进度</view>
					</view>
				</view>
			</view>

			<!-- 进度条 -->
			<view class="progress-section">
				<view class="section-header">
					<text class="section-title">项目进度</text>
				</view>
				<view class="progress-card">
					<view class="progress-info">
						<text class="progress-text">整体进度</text>
						<text class="progress-percentage">{{ projectStats.progress }}%</text>
					</view>
					<view class="progress-bar">
						<view class="progress-fill" :style="{ width: projectStats.progress + '%' }"></view>
					</view>
				</view>
			</view>

			<!-- 任务列表 -->
			<view class="tasks-section">
				<view class="section-header">
					<text class="section-title">任务列表</text>
					<view class="section-action" @click="handleAddTask">
						<text class="action-text">添加任务</text>
					</view>
				</view>
				<view class="tasks-list">
					<view 
						class="task-item" 
						v-for="task in projectTasks" 
						:key="task.id"
						@click="handleTaskClick(task)"
					>
						<view class="task-status" :class="task.status"></view>
						<view class="task-info">
							<text class="task-name">{{ task.name }}</text>
							<text class="task-desc">{{ task.description }}</text>
							<view class="task-meta">
								<text class="task-assignee">负责人: {{ task.assignee || '未分配' }}</text>
								<text class="task-deadline">截止: {{ formatDate(task.deadline) }}</text>
							</view>
						</view>
						<view class="task-progress">
							<text class="progress-text">{{ task.progress || 0 }}%</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 团队成员 -->
			<view class="members-section">
				<view class="section-header">
					<text class="section-title">团队成员</text>
					<view class="section-action" @click="handleAddMember">
						<text class="action-text">添加成员</text>
					</view>
				</view>
				<view class="members-list">
					<view 
						class="member-item" 
						v-for="member in projectMembers" 
						:key="member.id"
					>
						<view class="member-avatar">{{ member.avatar || '👤' }}</view>
						<view class="member-info">
							<text class="member-name">{{ member.name }}</text>
							<text class="member-role">{{ member.role }}</text>
						</view>
						<view class="member-status" :class="member.status">
							<text class="status-text">{{ getMemberStatusText(member.status) }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 空状态 -->
		<view class="empty-container" v-else-if="!isLoading">
			<text class="empty-icon">📋</text>
			<text class="empty-text">项目信息不存在</text>
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
			projectId: null,
			projectName: '',
			
			// 项目信息
			projectInfo: {},
			
			// 统计数据
			projectStats: {
				totalTasks: 0,
				completedTasks: 0,
				totalMembers: 0,
				progress: 0
			},
			
			// 项目数据
			projectTasks: [],
			projectMembers: []
		}
	},
	
	onLoad(options) {
		// 获取页面参数
		if (options.id) {
			this.projectId = options.id;
			console.log('项目ID:', this.projectId);
		} else {
			// 如果没有项目ID，显示错误并返回
			uni.showToast({
				title: '缺少项目ID',
				icon: 'error',
				duration: 2000
			});
			setTimeout(() => {
				uni.navigateBack();
			}, 2000);
			return;
		}
		
		if (options.name) {
			this.projectName = decodeURIComponent(options.name);
			console.log('项目名称:', this.projectName);
		}
		
		// 加载项目数据
		this.loadProjectData();
	},
	
	methods: {
		// 加载项目数据
		async loadProjectData() {
			this.isLoading = true;
			
			try {
				// 获取项目基本信息
				await this.fetchProjectInfo();
				
				// 获取项目统计数据
				this.calculateProjectStats();
				
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
			}
		},
		
		// 从后端获取项目信息
		async fetchProjectInfo() {
			try {
				console.log('正在获取项目信息...');
				
				const result = await uni.request({
					url: `${API_CONFIG.BASE_URL}/lz/api/projects/${this.projectId}`,
					method: 'GET',
					header: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${this.getToken()}`
					}
				});
				
				// 处理不同平台的返回值格式
				let error, response;
				if (Array.isArray(result)) {
					[error, response] = result;
				} else {
					// 检查是否是错误响应
					if (result.errMsg && result.errMsg !== 'request:ok') {
						error = result;
						response = null;
					} else {
						error = null;
						response = result;
					}
				}
				
				if (error) {
					throw new Error(`网络请求失败: ${error.errMsg || error}`);
				}
				
				console.log('项目信息API响应:', response);
				
				if (response.statusCode === 200 && response.data) {
					// 检查API返回的数据结构
					if (response.data.success && response.data.data) {
						this.projectInfo = response.data.data;
					} else {
						this.projectInfo = response.data;
					}
					
					// 计算项目统计数据
					this.calculateProjectStats();
					
				} else {
					throw new Error(`API请求失败: ${response.statusCode}`);
				}
				
			} catch (error) {
				console.error('获取项目信息失败:', error);
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
			
			this.projectInfo = {
				id: this.projectId || 1,
				name: this.projectName || '地铁3号线项目',
				description: '城市轨道交通建设项目，包括车站建设、轨道铺设、信号系统安装等工程',
				type: 'infrastructure',
				status: 'ongoing',
				createTime: '2024-01-15T10:30:00Z',
				updateTime: '2024-01-25T16:45:00Z',
				icon: '🚇'
			};
			
			this.projectTasks = [
				{
					id: 1,
					name: '施工图纸审核',
					description: '审核施工图纸的准确性和可行性',
					status: 'completed',
					assignee: '张工程师',
					deadline: '2024-01-20T00:00:00Z',
					progress: 100
				},
				{
					id: 2,
					name: '材料采购',
					description: '采购施工所需的钢材、混凝土等材料',
					status: 'ongoing',
					assignee: '李采购',
					deadline: '2024-01-25T00:00:00Z',
					progress: 75
				},
				{
					id: 3,
					name: '现场施工',
					description: '进行车站主体结构施工',
					status: 'pending',
					assignee: '王施工',
					deadline: '2024-02-10T00:00:00Z',
					progress: 0
				}
			];
			
			this.projectMembers = [
				{
					id: 1,
					name: '张工程师',
					role: '项目经理',
					status: 'active',
					avatar: '👨‍💼'
				},
				{
					id: 2,
					name: '李采购',
					role: '采购专员',
					status: 'active',
					avatar: '👩‍💼'
				},
				{
					id: 3,
					name: '王施工',
					role: '施工队长',
					status: 'active',
					avatar: '👷‍♂️'
				}
			];
			
			this.calculateProjectStats();
		},
		
		// 计算项目统计数据
		calculateProjectStats() {
			const stats = {
				totalTasks: this.projectTasks.length,
				completedTasks: this.projectTasks.filter(task => task.status === 'completed').length,
				totalMembers: this.projectMembers.length,
				progress: 0
			};
			
			// 计算进度
			if (stats.totalTasks > 0) {
				const totalProgress = this.projectTasks.reduce((sum, task) => {
					const progress = task.progress || 0;
					// 确保进度值在0-100之间
					return sum + Math.max(0, Math.min(100, progress));
				}, 0);
				stats.progress = Math.round(totalProgress / stats.totalTasks);
			}
			
			// 确保进度不超过100%
			stats.progress = Math.min(100, Math.max(0, stats.progress));
			
			this.projectStats = stats;
		},
		
		// 返回上一页
		goBack() {
			uni.navigateBack();
		},
		
		// 编辑项目
		handleEdit() {
			console.log('跳转到编辑页面，项目ID:', this.projectId);
			uni.navigateTo({
				url: `/pages/project/project-edit?id=${this.projectId}`,
				success: () => {
					console.log('跳转到编辑页面成功');
				},
				fail: (error) => {
					console.error('跳转到编辑页面失败:', error);
					uni.showToast({
						title: '跳转失败',
						icon: 'error'
					});
				}
			});
		},
		
		// 分享项目
		handleShare() {
			uni.showToast({
				title: '分享功能开发中',
				icon: 'none'
			});
		},
		
		// 添加任务
		handleAddTask() {
			uni.showToast({
				title: '添加任务功能开发中',
				icon: 'none'
			});
		},
		
		// 添加成员
		handleAddMember() {
			uni.showToast({
				title: '添加成员功能开发中',
				icon: 'none'
			});
		},
		
		// 处理任务点击
		handleTaskClick(task) {
			console.log('点击任务:', task);
			uni.showToast({
				title: '任务详情功能开发中',
				icon: 'none'
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
			const typeMap = {
				'construction': '建筑工程',
				'infrastructure': '基础设施',
				'renovation': '装修工程',
				'maintenance': '维护工程',
				'design': '设计项目',
				'consulting': '咨询项目'
			};
			return typeMap[type] || '未知类型';
		},
		
		// 获取成员状态文本
		getMemberStatusText(status) {
			const statusMap = {
				'active': '在线',
				'offline': '离线',
				'busy': '忙碌'
			};
			return statusMap[status] || '未知状态';
		},
		
		// 格式化日期
		formatDate(dateString) {
			if (!dateString) return '';
			
			try {
				const date = new Date(dateString);
				
				// 检查日期是否有效
				if (isNaN(date.getTime())) {
					return '日期无效';
				}
				
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
			} catch (error) {
				console.error('日期格式化失败:', error);
				return '日期格式错误';
			}
		}
	}
}
</script>

<style scoped>
.project-detail-container {
	background-color: #f5f5f5;
	min-height: 100vh;
}

/* 页面头部 */
.page-header {
	display: flex;
	align-items: center;
	padding: 30rpx 20rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
}

.header-back {
	padding: 15rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.2);
	margin-right: 20rpx;
	transition: all 0.3s ease;
}

.header-back:active {
	background: rgba(255, 255, 255, 0.3);
	transform: scale(0.9);
}

.back-icon {
	font-size: 32rpx;
}

.header-title {
	flex: 1;
}

.title-text {
	font-size: 32rpx;
	font-weight: bold;
}

.header-actions {
	display: flex;
	gap: 15rpx;
}

.action-btn {
	padding: 15rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.2);
	transition: all 0.3s ease;
}

.action-btn:active {
	background: rgba(255, 255, 255, 0.3);
	transform: scale(0.9);
}

.action-icon {
	font-size: 28rpx;
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

/* 项目内容 */
.project-content {
	padding: 20rpx;
}

/* 通用样式 */
.info-section,
.stats-section,
.progress-section,
.tasks-section,
.members-section {
	margin-bottom: 30rpx;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.section-action {
	padding: 10rpx 20rpx;
	background: #667eea;
	color: white;
	border-radius: 20rpx;
	transition: all 0.3s ease;
}

.section-action:active {
	background: #5a6fd8;
	transform: scale(0.95);
}

.action-text {
	font-size: 24rpx;
}

/* 基本信息 */
.info-card {
	background: white;
	border-radius: 20rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.project-header {
	display: flex;
	align-items: center;
	margin-bottom: 30rpx;
}

.project-icon {
	font-size: 60rpx;
	margin-right: 30rpx;
}

.project-main-info {
	flex: 1;
}

.project-name {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 10rpx;
	display: block;
}

.project-desc {
	font-size: 26rpx;
	color: #666;
	line-height: 1.4;
}

.project-status {
	padding: 10rpx 20rpx;
	border-radius: 20rpx;
	font-size: 24rpx;
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

.status-text {
	font-weight: bold;
}

.project-meta {
	display: flex;
	flex-direction: column;
	gap: 15rpx;
}

.meta-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 15rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.meta-item:last-child {
	border-bottom: none;
}

.meta-label {
	font-size: 26rpx;
	color: #666;
}

.meta-value {
	font-size: 26rpx;
	color: #333;
	font-weight: bold;
}

/* 统计卡片 */
.stats-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 20rpx;
}

.stat-card {
	background: white;
	border-radius: 20rpx;
	padding: 30rpx;
	text-align: center;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
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

/* 进度条 */
.progress-card {
	background: white;
	border-radius: 20rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.progress-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.progress-text {
	font-size: 28rpx;
	color: #333;
}

.progress-percentage {
	font-size: 28rpx;
	font-weight: bold;
	color: #667eea;
}

.progress-bar {
	width: 100%;
	height: 20rpx;
	background: #f0f0f0;
	border-radius: 10rpx;
	overflow: hidden;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
	transition: width 0.3s ease;
}

/* 任务列表 */
.tasks-list {
	background: white;
	border-radius: 20rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.task-item {
	display: flex;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
	transition: all 0.3s ease;
	cursor: pointer;
}

.task-item:last-child {
	border-bottom: none;
}

.task-item:active {
	background: #f8f9ff;
}

.task-status {
	width: 12rpx;
	height: 60rpx;
	border-radius: 6rpx;
	margin-right: 20rpx;
}

.task-status.completed {
	background: #2ed573;
}

.task-status.ongoing {
	background: #ffa502;
}

.task-status.pending {
	background: #667eea;
}

.task-info {
	flex: 1;
}

.task-name {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 8rpx;
	display: block;
}

.task-desc {
	font-size: 24rpx;
	color: #666;
	margin-bottom: 10rpx;
	display: block;
}

.task-meta {
	display: flex;
	gap: 20rpx;
}

.task-assignee,
.task-deadline {
	font-size: 22rpx;
	color: #999;
}

.task-progress {
	padding: 10rpx 20rpx;
	background: #f8f9ff;
	border-radius: 15rpx;
}

.progress-text {
	font-size: 24rpx;
	color: #667eea;
	font-weight: bold;
}

/* 成员列表 */
.members-list {
	background: white;
	border-radius: 20rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.member-item {
	display: flex;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.member-item:last-child {
	border-bottom: none;
}

.member-avatar {
	font-size: 50rpx;
	margin-right: 20rpx;
}

.member-info {
	flex: 1;
}

.member-name {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 5rpx;
	display: block;
}

.member-role {
	font-size: 24rpx;
	color: #666;
}

.member-status {
	padding: 8rpx 16rpx;
	border-radius: 15rpx;
	font-size: 22rpx;
}

.member-status.active {
	background: #d4edda;
	color: #2ed573;
}

.member-status.offline {
	background: #f8d7da;
	color: #dc3545;
}

.member-status.busy {
	background: #fff3cd;
	color: #ffa502;
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
 