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
				<!-- 调试按钮 -->
				<view class="debug-btn" @click="showDebugInfo">
					<text class="debug-icon">🐛</text>
				</view>
			</view>
		</view>

		<!-- 调试面板 -->
		<view class="debug-panel" v-if="showDebugPanel">
			<view class="debug-title">调试工具</view>
			
			<!-- 数据统计 -->
			<view class="debug-stats">
				<view class="stat-row">
					<text class="stat-label">总项目数:</text>
					<text class="stat-value">{{ totalCount }}</text>
				</view>
				<view class="stat-row">
					<text class="stat-label">筛选后数量:</text>
					<text class="stat-value">{{ filteredProjects.length }}</text>
				</view>
				<view class="stat-row">
					<text class="stat-label">当前页:</text>
					<text class="stat-value">{{ currentPage }}</text>
				</view>
				<view class="stat-row">
					<text class="stat-label">重试次数:</text>
					<text class="stat-value">{{ retryCount }}/{{ maxRetries }}</text>
				</view>
			</view>
			
			<!-- 实时数据状态 -->
			<view class="debug-stats">
				<view class="stat-row">
					<text class="stat-label">allProjects长度:</text>
					<text class="stat-value">{{ allProjects.length }}</text>
				</view>
				<view class="stat-row">
					<text class="stat-label">filteredProjects长度:</text>
					<text class="stat-value">{{ filteredProjects.length }}</text>
				</view>
				<view class="stat-row">
					<text class="stat-label">isLoading:</text>
					<text class="stat-value">{{ isLoading }}</text>
				</view>
				<view class="stat-row">
					<text class="stat-label">hasMore:</text>
					<text class="stat-value">{{ hasMore }}</text>
				</view>
			</view>
			
			<view class="debug-buttons">
				<view class="debug-action-btn" @click="checkNetworkStatus">
					<text class="debug-action-text">检查网络</text>
				</view>
				<view class="debug-action-btn" @click="testAPIConnection">
					<text class="debug-action-text">测试API</text>
				</view>
				<view class="debug-action-btn" @click="refreshData">
					<text class="debug-action-text">刷新数据</text>
				</view>
				<view class="debug-action-btn" @click="checkDataFormat">
					<text class="debug-action-text">检查数据格式</text>
				</view>
				<view class="debug-action-btn" @click="checkReactivity">
					<text class="debug-action-text">检查响应式</text>
				</view>
				<view class="debug-action-btn" @click="forceReRender">
					<text class="debug-action-text">强制重新渲染</text>
				</view>
				<view class="debug-action-btn" @click="manualRetry" v-if="retryCount > 0">
					<text class="debug-action-text">手动重试 ({{ retryCount }}/{{ maxRetries }})</text>
				</view>
				<view class="debug-action-btn reset-btn" @click="resetAllState">
					<text class="debug-action-text">重置状态</text>
				</view>
			</view>
		</view>

		<!-- 实时数据状态显示 -->
		<view class="data-status-panel" v-if="showDebugPanel">
			<view class="status-title">实时数据状态</view>
			<view class="status-content">
				<view class="status-item">
					<text class="status-label">allProjects长度:</text>
					<text class="status-value">{{ allProjects.length }} 项</text>
				</view>
				<view class="status-item">
					<text class="status-label">filteredProjects长度:</text>
					<text class="status-value">{{ filteredProjects.length }} 项</text>
				</view>
				<view class="status-item">
					<text class="status-label">渲染条件:</text>
					<text class="status-value">{{ !isLoading && filteredProjects.length > 0 ? '满足' : '不满足' }}</text>
				</view>
				<view class="status-item">
					<text class="status-label">空状态条件:</text>
					<text class="status-value">{{ !isLoading && filteredProjects.length === 0 ? '满足' : '不满足' }}</text>
				</view>
			</view>
		</view>

		<!-- 原始数据显示 -->
		<view class="raw-data-panel" v-if="showDebugPanel">
			<view class="raw-data-title">原始数据内容</view>
			<view class="raw-data-content">
				<view class="raw-data-section">
					<text class="section-title">allProjects ({{ allProjects.length }}):</text>
					<text class="data-content">{{ JSON.stringify(allProjects, null, 2) }}</text>
				</view>
				<view class="raw-data-section">
					<text class="section-title">filteredProjects ({{ filteredProjects.length }}):</text>
					<text class="data-content">{{ JSON.stringify(filteredProjects, null, 2) }}</text>
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
			],
			// 调试面板
			showDebugPanel: false,
			// 重试相关
			retryCount: 0,
			maxRetries: 3,
			isRetrying: false
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
	
	onShow() {
		console.log('页面显示，当前数据状态:');
		console.log('- allProjects:', this.allProjects);
		console.log('- filteredProjects:', this.filteredProjects);
		console.log('- isLoading:', this.isLoading);
		console.log('- totalCount:', this.totalCount);
		
		// 如果数据为空且不在加载中，尝试重新加载
		if (this.allProjects.length === 0 && !this.isLoading) {
			console.log('数据为空，尝试重新加载...');
			this.loadProjectData();
		}
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
				console.log('开始加载项目数据...');
				const projectsData = await this.fetchProjectsFromBackend();
				
				// 验证数据
				if (!projectsData || !Array.isArray(projectsData)) {
					console.error('❌ 获取到的项目数据格式不正确:', projectsData);
					throw new Error('项目数据格式不正确');
				}
				
				console.log('✅ 数据验证通过，项目数量:', projectsData.length);
				console.log('赋值前的 allProjects:', this.allProjects);
				this.allProjects = projectsData;
				console.log('赋值后的 allProjects:', this.allProjects);
				console.log('赋值后的 allProjects 长度:', this.allProjects.length);
				console.log('赋值后的 allProjects 类型:', typeof this.allProjects);
				console.log('赋值后的 allProjects 是否为数组:', Array.isArray(this.allProjects));
				
				// 强制更新数据
				this.$forceUpdate();
				console.log('已强制更新 allProjects');
				
				console.log('调用 applyFilters 前的状态:');
				console.log('- allProjects:', this.allProjects);
				console.log('- filteredProjects:', this.filteredProjects);
				
				this.applyFilters();
				
				console.log('调用 applyFilters 后的状态:');
				console.log('- allProjects:', this.allProjects);
				console.log('- filteredProjects:', this.filteredProjects);
				console.log('- totalCount:', this.totalCount);
				
				console.log('✅ 项目数据加载完成，共', projectsData.length, '条');
				
				// 显示成功提示
				if (projectsData.length > 0) {
					uni.showToast({
						title: `成功加载 ${projectsData.length} 个项目`,
						icon: 'success',
						duration: 1500
					});
				}
				
			} catch (error) {
				console.error('❌ 加载项目数据失败:', error);
				
				// 显示详细的错误信息
				let errorMessage = '数据加载失败';
				if (error.message) {
					if (error.message.includes('timeout')) {
						errorMessage = '请求超时，请检查网络连接';
					} else if (error.message.includes('401')) {
						errorMessage = '登录已过期，请重新登录';
					} else if (error.message.includes('403')) {
						errorMessage = '没有权限访问项目数据';
					} else if (error.message.includes('500')) {
						errorMessage = '服务器内部错误，请稍后重试';
					} else if (error.message.includes('network')) {
						errorMessage = '网络连接失败，请检查网络设置';
					} else if (error.message.includes('格式不正确')) {
						errorMessage = '服务器数据格式错误，请联系管理员';
					}
				}
				
				uni.showToast({
					title: errorMessage,
					icon: 'none',
					duration: 3000
				});
				
				// 使用模拟数据作为备选方案
				console.log('使用模拟数据作为备选方案');
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
				console.log('API地址:', `${API_CONFIG.BASE_URL}${API_CONFIG.PROJECT_API}`);
				console.log('用户Token:', this.getToken() ? '已设置' : '未设置');
				
				const params = {
					page: this.currentPage,
					pageSize: this.pageSize,
					includeTasks: true,
					includeMembers: true
				};
				
				console.log('请求参数:', params);
				
				const response = await uni.request({
					url: `${API_CONFIG.BASE_URL}${API_CONFIG.PROJECT_API}`,
					method: 'GET',
					data: params,
					header: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${this.getToken()}`
					}
				});
				
				console.log('后端API响应:', response);
				console.log('响应状态码:', response.statusCode);
				console.log('响应数据:', response.data);
				
				if (response.statusCode === 200 && response.data) {
					console.log('解析响应数据结构...');
					
					// 检查数据结构
					let projectsData = null;
					let totalCount = 0;
					
					if (response.data.success && response.data.data) {
						// 标准格式：{success: true, data: {projects: [...], total: 6}}
						if (response.data.data.projects && Array.isArray(response.data.data.projects)) {
							projectsData = response.data.data.projects;
							totalCount = response.data.data.total || projectsData.length;
							console.log('✅ 使用标准格式解析数据');
						} else if (Array.isArray(response.data.data)) {
							// 直接数组格式：{success: true, data: [...]}
							projectsData = response.data.data;
							totalCount = response.data.total || projectsData.length;
							console.log('✅ 使用直接数组格式解析数据');
						}
					} else if (Array.isArray(response.data)) {
						// 纯数组格式：[...]
						projectsData = response.data;
						totalCount = projectsData.length;
						console.log('✅ 使用纯数组格式解析数据');
					} else if (response.data.data && Array.isArray(response.data.data)) {
						// 嵌套格式：{data: [...]}
						projectsData = response.data.data;
						totalCount = response.data.total || projectsData.length;
						console.log('✅ 使用嵌套格式解析数据');
					}
					
					if (projectsData && Array.isArray(projectsData)) {
						this.totalCount = totalCount;
						this.hasMore = projectsData.length === this.pageSize;
						console.log('✅ 项目数据解析成功，共', projectsData.length, '条');
						console.log('项目数据示例:', projectsData[0]);
						return projectsData;
					} else {
						console.error('❌ 无法解析项目数据，响应结构:', response.data);
						throw new Error('API返回的数据格式不正确');
					}
				} else {
					console.error('❌ API请求失败，状态码:', response.statusCode);
					throw new Error(`API请求失败: ${response.statusCode}`);
				}
				
			} catch (error) {
				console.error('❌ 获取项目数据失败:', error);
				console.error('错误详情:', error.message || error);
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
			// 安全检查
			if (!this.allProjects || !Array.isArray(this.allProjects)) {
				console.error('❌ this.allProjects 不是数组:', this.allProjects);
				this.filteredProjects = [];
				this.updateActiveFilters();
				return;
			}
			
			console.log('开始应用筛选，原始项目数量:', this.allProjects.length);
			console.log('原始项目数据:', this.allProjects);
			let filtered = [...this.allProjects];
			
			// 类型筛选
			if (this.selectedTypes.length > 0) {
				filtered = filtered.filter(project => 
					project && project.type && this.selectedTypes.includes(project.type)
				);
				console.log('类型筛选后数量:', filtered.length);
			}
			
			// 状态筛选
			if (this.selectedStatuses.length > 0) {
				filtered = filtered.filter(project => 
					project && project.status && this.selectedStatuses.includes(project.status)
				);
				console.log('状态筛选后数量:', filtered.length);
			}
			
			console.log('筛选前的 filteredProjects:', this.filteredProjects);
			this.filteredProjects = filtered;
			console.log('筛选完成，最终数量:', this.filteredProjects.length);
			console.log('筛选后的 filteredProjects:', this.filteredProjects);
			
			// 强制更新视图
			this.$forceUpdate();
			console.log('已强制更新视图');
			
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
			uni.showModal({
				title: '搜索项目',
				content: '请输入项目名称或描述关键词',
				editable: true,
				placeholderText: '例如：地铁、桥梁、装修',
				success: (res) => {
					if (res.confirm && res.content) {
						this.searchProjects(res.content);
					}
				}
			});
		},
		
		// 搜索项目
		searchProjects(keyword) {
			console.log('搜索关键词:', keyword);
			
			if (!keyword.trim()) {
				this.applyFilters();
				return;
			}
			
			// 安全检查
			if (!this.allProjects || !Array.isArray(this.allProjects)) {
				console.error('❌ 搜索时 this.allProjects 不是数组:', this.allProjects);
				this.filteredProjects = [];
				this.updateActiveFilters();
				return;
			}
			
			const filtered = this.allProjects.filter(project => 
				project && project.name && project.description &&
				(project.name.toLowerCase().includes(keyword.toLowerCase()) ||
				project.description.toLowerCase().includes(keyword.toLowerCase()))
			);
			
			console.log('搜索完成，找到', filtered.length, '个项目');
			this.filteredProjects = filtered;
			this.updateActiveFilters();
			
			uni.showToast({
				title: `找到 ${filtered.length} 个项目`,
				icon: 'none',
				duration: 2000
			});
		},
		
		// 显示筛选弹窗
		showFilterModal() {
			uni.showActionSheet({
				itemList: ['按类型筛选', '按状态筛选', '清除所有筛选'],
				success: (res) => {
					switch (res.tapIndex) {
						case 0:
							this.showTypeFilter();
							break;
						case 1:
							this.showStatusFilter();
							break;
						case 2:
							this.clearAllFilters();
							break;
					}
				}
			});
		},
		
		// 显示类型筛选
		showTypeFilter() {
			const typeOptions = this.projectTypes.map(type => type.label);
			uni.showActionSheet({
				itemList: typeOptions,
				success: (res) => {
					const selectedType = this.projectTypes[res.tapIndex];
					if (selectedType) {
						this.selectedTypes = [selectedType.value];
						this.applyFilters();
						uni.showToast({
							title: `已筛选: ${selectedType.label}`,
							icon: 'none'
						});
					}
				}
			});
		},
		
		// 显示状态筛选
		showStatusFilter() {
			const statusOptions = this.projectStatuses.map(status => status.label);
			uni.showActionSheet({
				itemList: statusOptions,
				success: (res) => {
					const selectedStatus = this.projectStatuses[res.tapIndex];
					if (selectedStatus) {
						this.selectedStatuses = [selectedStatus.value];
						this.applyFilters();
						uni.showToast({
							title: `已筛选: ${selectedStatus.label}`,
							icon: 'none'
						});
					}
				}
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
				console.log('加载更多数据，第', this.currentPage, '页');
				const moreData = await this.fetchProjectsFromBackend();
				
				if (moreData && moreData.length > 0) {
					this.allProjects = [...this.allProjects, ...moreData];
					this.applyFilters();
					this.retryCount = 0; // 重置重试计数
					console.log('✅ 成功加载更多数据，新增', moreData.length, '条');
					
					uni.showToast({
						title: `新增 ${moreData.length} 个项目`,
						icon: 'success',
						duration: 1500
					});
				} else {
					this.hasMore = false;
					console.log('没有更多数据了');
					uni.showToast({
						title: '没有更多数据了',
						icon: 'none'
					});
				}
				
			} catch (error) {
				console.error('❌ 加载更多数据失败:', error);
				this.currentPage--; // 回退页码
				
				// 重试机制
				if (this.retryCount < this.maxRetries) {
					this.retryCount++;
					console.log(`尝试重试 (${this.retryCount}/${this.maxRetries})...`);
					
					uni.showToast({
						title: `加载失败，正在重试 (${this.retryCount}/${this.maxRetries})`,
						icon: 'none',
						duration: 2000
					});
					
					// 延迟重试
					setTimeout(() => {
						this.loadMore();
					}, 2000);
					
				} else {
					console.error('重试次数已达上限，停止重试');
					this.retryCount = 0;
					
					uni.showToast({
						title: '加载失败，请检查网络后重试',
						icon: 'none',
						duration: 3000
					});
				}
				
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
		},
		
		// 检查网络状态
		checkNetworkStatus() {
			uni.getNetworkType({
				success: (res) => {
					console.log('当前网络类型:', res.networkType);
					if (res.networkType === 'none') {
						uni.showToast({
							title: '网络连接失败，请检查网络设置',
							icon: 'none',
							duration: 3000
						});
					} else {
						uni.showToast({
							title: `当前网络: ${res.networkType}`,
							icon: 'none',
							duration: 2000
						});
					}
				},
				fail: (error) => {
					console.error('获取网络状态失败:', error);
					uni.showToast({
						title: '无法获取网络状态',
						icon: 'none'
					});
				}
			});
		},
		
		// 测试API连接
		async testAPIConnection() {
			try {
				console.log('测试API连接...');
				console.log('测试URL:', `${API_CONFIG.BASE_URL}/health`);
				
				const response = await uni.request({
					url: `${API_CONFIG.BASE_URL}/health`,
					method: 'GET',
					timeout: 10000
				});
				
				console.log('API连接测试响应:', response);
				
				if (response.statusCode === 200) {
					uni.showToast({
						title: 'API连接正常',
						icon: 'success'
					});
				} else {
					uni.showToast({
						title: `API响应异常: ${response.statusCode}`,
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('❌ API连接测试失败:', error);
				uni.showToast({
					title: 'API连接失败，请检查网络',
					icon: 'none',
					duration: 3000
				});
			}
		},
		
		// 手动重试
		manualRetry() {
			console.log('手动触发重试...');
			this.loadMore(); // 重新尝试加载更多
		},
		
		// 强制重新渲染
		forceReRender() {
			console.log('强制重新渲染...');
			this.$forceUpdate();
			uni.showToast({
				title: '已强制重新渲染',
				icon: 'none'
			});
		},
		
		// 重置所有状态
		resetAllState() {
			console.log('重置所有状态...');
			this.currentPage = 1;
			this.hasMore = true;
			this.selectedTypes = [];
			this.selectedStatuses = [];
			this.activeFilters = [];
			this.filteredProjects = [];
			this.retryCount = 0;
			this.applyFilters();
			uni.showToast({
				title: '状态已重置',
				icon: 'none'
			});
		},
		
		// 调试信息
		showDebugInfo() {
			// 切换调试面板显示状态
			this.showDebugPanel = !this.showDebugPanel;
			
			const debugInfo = {
				'当前页面': this.pageTitle,
				'项目总数': this.totalCount,
				'筛选后数量': this.filteredProjects.length,
				'当前页': this.currentPage,
				'每页大小': this.pageSize,
				'是否有更多': this.hasMore,
				'加载状态': this.isLoading,
				'API地址': `${API_CONFIG.BASE_URL}${API_CONFIG.PROJECT_API}`,
				'用户Token': this.getToken() ? '已设置' : '未设置',
				'筛选条件': {
					'类型': this.selectedTypes,
					'状态': this.selectedStatuses
				}
			};
			
			console.log('调试信息:', debugInfo);
			
			if (this.showDebugPanel) {
				uni.showToast({
					title: '调试面板已开启',
					icon: 'none'
				});
			}
		},

		// 检查数据格式
		checkDataFormat() {
			console.log('检查数据格式...');
			if (!this.allProjects || !Array.isArray(this.allProjects)) {
				console.error('❌ this.allProjects 不是数组，无法检查数据格式');
				uni.showToast({
					title: '数据格式异常，无法检查',
					icon: 'none'
				});
				return;
			}

			let hasError = false;
			let errorMessage = '';

			this.allProjects.forEach(project => {
				if (typeof project !== 'object' || project === null) {
					hasError = true;
					errorMessage += `项目 ${project.id || '未知ID'} 不是对象\n`;
				} else {
					if (typeof project.id !== 'number' && typeof project.id !== 'string') {
						hasError = true;
						errorMessage += `项目 ${project.id || '未知ID'} 的 ID 不是字符串或数字\n`;
					}
					if (typeof project.name !== 'string') {
						hasError = true;
						errorMessage += `项目 ${project.id || '未知ID'} 的名称不是字符串\n`;
					}
					if (typeof project.type !== 'string') {
						hasError = true;
						errorMessage += `项目 ${project.id || '未知ID'} 的类型不是字符串\n`;
					}
					if (typeof project.status !== 'string') {
						hasError = true;
						errorMessage += `项目 ${project.id || '未知ID'} 的状态不是字符串\n`;
					}
					if (typeof project.createTime !== 'string') {
						hasError = true;
						errorMessage += `项目 ${project.id || '未知ID'} 的创建时间不是字符串\n`;
					}
					if (typeof project.icon !== 'string') {
						hasError = true;
						errorMessage += `项目 ${project.id || '未知ID'} 的图标不是字符串\n`;
					}
					if (typeof project.taskCount !== 'number' && typeof project.taskCount !== 'string') {
						hasError = true;
						errorMessage += `项目 ${project.id || '未知ID'} 的任务数不是数字或字符串\n`;
					}
					if (typeof project.memberCount !== 'number' && typeof project.memberCount !== 'string') {
						hasError = true;
						errorMessage += `项目 ${project.id || '未知ID'} 的成员数不是数字或字符串\n`;
					}
					if (typeof project.progress !== 'number' && typeof project.progress !== 'string') {
						hasError = true;
						errorMessage += `项目 ${project.id || '未知ID'} 的进度不是数字或字符串\n`;
					}
				}
			});

			if (hasError) {
				uni.showModal({
					title: '数据格式异常',
					content: errorMessage,
					showCancel: false,
					success: () => {
						console.error('数据格式检查发现错误，请修复后重试。');
					}
				});
			} else {
				uni.showToast({
					title: '数据格式正常',
					icon: 'success'
				});
				console.log('数据格式检查通过，所有项目都符合预期。');
			}
		},

		// 检查响应式
		checkReactivity() {
			console.log('检查响应式...');
			// 尝试修改一个响应式数据，观察是否触发更新
			const originalCount = this.totalCount;
			this.totalCount = 999; // 修改一个不存在的值，看看是否报错
			console.log('尝试修改 totalCount 后，totalCount 的值:', this.totalCount);

			// 恢复原始值
			this.totalCount = originalCount;
			console.log('恢复 totalCount 到原始值:', this.totalCount);

			// 尝试修改一个不存在的属性，看看是否报错
			this.someNonExistentProperty = 'This should not be reactive';
			console.log('尝试修改不存在的属性后，someNonExistentProperty 的值:', this.someNonExistentProperty);

			// 删除一个不存在的属性，看看是否报错
			delete this.someNonExistentProperty;
			console.log('尝试删除不存在的属性后，someNonExistentProperty 的值:', this.someNonExistentProperty);

			// 尝试修改一个响应式数组，看看是否触发更新
			const originalProjects = [...this.allProjects];
			originalProjects.push({ id: 999, name: 'New Project', type: 'design', status: 'pending' });
			this.allProjects = originalProjects;
			console.log('尝试修改 allProjects 后，allProjects 的值:', this.allProjects);

			// 恢复原始值
			this.allProjects = originalProjects.slice(0, -1); // 移除新添加的项目
			console.log('恢复 allProjects 到原始值:', this.allProjects);

			uni.showToast({
				title: '响应式检查完成',
				icon: 'none'
			});
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

/* 调试按钮 */
.debug-btn {
	padding: 15rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.2);
	transition: all 0.3s ease;
}

.debug-btn:active {
	background: rgba(255, 255, 255, 0.3);
	transform: scale(0.9);
}

.debug-icon {
	font-size: 32rpx;
	display: block;
}

/* 调试面板 */
.debug-panel {
	background: #f0f2f5;
	border-radius: 15rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
}

.debug-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 15rpx;
	padding-bottom: 10rpx;
	border-bottom: 1rpx solid #eee;
}

.debug-stats {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
	margin-bottom: 15rpx;
	padding-bottom: 10rpx;
	border-bottom: 1rpx solid #eee;
}

.stat-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.stat-label {
	font-size: 24rpx;
	color: #555;
}

.stat-value {
	font-size: 24rpx;
	font-weight: bold;
	color: #333;
}

.debug-buttons {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.debug-action-btn {
	padding: 15rpx 20rpx;
	background: #667eea;
	color: white;
	border-radius: 10rpx;
	text-align: center;
	transition: all 0.3s ease;
}

.debug-action-btn:active {
	background: #5a6fd8;
	transform: scale(0.95);
}

.debug-action-text {
	font-size: 26rpx;
}

.reset-btn {
	background: #dc3545; /* 红色重置按钮 */
}

.reset-btn:active {
	background: #c82333;
}

/* 实时数据状态显示 */
.data-status-panel {
	background: #f0f2f5;
	border-radius: 15rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
}

.status-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 15rpx;
	padding-bottom: 10rpx;
	border-bottom: 1rpx solid #eee;
}

.status-content {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.status-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.status-label {
	font-size: 24rpx;
	color: #555;
}

.status-value {
	font-size: 24rpx;
	font-weight: bold;
	color: #333;
}

/* 原始数据显示 */
.raw-data-panel {
	background: #f0f2f5;
	border-radius: 15rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
}

.raw-data-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 15rpx;
	padding-bottom: 10rpx;
	border-bottom: 1rpx solid #eee;
}

.raw-data-content {
	display: flex;
	flex-direction: column;
	gap: 15rpx;
}

.raw-data-section {
	background: #fff;
	border-radius: 10rpx;
	padding: 15rpx 20rpx;
}

.section-title {
	font-size: 26rpx;
	font-weight: bold;
	color: #555;
	margin-bottom: 10rpx;
}

.data-content {
	font-size: 24rpx;
	color: #333;
	white-space: pre-wrap; /* 保留换行和缩进 */
	word-break: break-all; /* 允许长单词换行 */
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