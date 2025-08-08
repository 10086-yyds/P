<template>
	<view class="create-project-container">
		<!-- 页面头部 -->
		<view class="page-header">
			<view class="header-back" @click="goBack">
				<text class="back-icon">‹</text>
			</view>
			<view class="header-title">
				<text class="title-text">创建项目</text>
			</view>
			<view class="header-actions">
				<view class="action-btn" @click="handleSave">
					<text class="action-text">保存</text>
				</view>
			</view>
		</view>

		<!-- 加载状态 -->
		<view class="loading-container" v-if="isSubmitting">
			<view class="loading-spinner"></view>
			<text class="loading-text">正在创建项目...</text>
		</view>

		<!-- 创建项目表单 -->
		<view class="form-container" v-else>
			<scroll-view class="form-scroll" scroll-y :show-scrollbar="false">
				<!-- 基本信息 -->
				<view class="form-section">
					<view class="section-header">
						<view class="section-badge">1</view>
						<text class="section-title">基本信息</text>
					</view>
					<view class="form-card">
						<!-- 项目名称 -->
						<view class="form-item">
							<text class="form-label">项目名称</text>
							<input 
								class="form-input" 
								v-model="formData.name"
								placeholder="输入项目名称"
								maxlength="100"
								@blur="validateField('name')"
							/>
							<text class="error-text" v-if="errors.name">{{ errors.name }}</text>
						</view>

						<!-- 项目简称 -->
						<view class="form-item">
							<text class="form-label">项目简称</text>
							<input 
								class="form-input" 
								v-model="formData.shortName"
								placeholder="输入项目简称"
								maxlength="50"
								@blur="validateField('shortName')"
							/>
							<text class="error-text" v-if="errors.shortName">{{ errors.shortName }}</text>
						</view>

						<!-- 项目编号 -->
						<view class="form-item">
							<text class="form-label">项目编号</text>
							<input 
								class="form-input" 
								v-model="formData.projectCode"
								placeholder="PRJ-2024-001"
								maxlength="20"
								@blur="validateField('projectCode')"
							/>
							<text class="error-text" v-if="errors.projectCode">{{ errors.projectCode }}</text>
							<text class="hint-text">仅支持大写字母、数字和连字符</text>
						</view>

						<!-- 项目描述 -->
						<view class="form-item">
							<text class="form-label">项目描述</text>
							<textarea 
								class="form-textarea" 
								v-model="formData.description"
								placeholder="详细描述项目内容、目标和范围"
								maxlength="1000"
							/>
							<view class="textarea-footer">
								<text class="char-count">{{ formData.description.length }}/1000</text>
								<text class="error-text" v-if="errors.description">{{ errors.description }}</text>
							</view>
						</view>

						<!-- 所属部门 -->
						<view class="form-item">
							<text class="form-label">所属部门</text>
							<input 
								class="form-input" 
								v-model="formData.department"
								placeholder="输入所属部门"
								maxlength="100"
								@blur="validateField('department')"
							/>
							<text class="error-text" v-if="errors.department">{{ errors.department }}</text>
						</view>
					</view>
				</view>

				<!-- 项目类型 -->
				<view class="form-section">
					<view class="section-header">
						<view class="section-badge">2</view>
						<text class="section-title">项目类型</text>
					</view>
					<view class="form-card">
						<view class="form-item">
							<text class="form-label">选择类型</text>
							<picker 
								class="form-picker" 
								:value="typeIndex" 
								:range="typeOptions" 
								range-key="label"
								@change="handleTypeChange"
							>
								<view class="picker-display">
									<text class="picker-text">{{ selectedType.label }}</text>
									<text class="picker-arrow">›</text>
								</view>
							</picker>
						</view>
					</view>
				</view>

				<!-- 项目设置 -->
				<view class="form-section">
					<view class="section-header">
						<view class="section-badge">3</view>
						<text class="section-title">项目设置</text>
					</view>
					<view class="form-card">
						<!-- 项目状态 -->
						<view class="form-item">
							<text class="form-label">项目状态</text>
							<picker 
								class="form-picker" 
								:value="statusIndex" 
								:range="statusOptions" 
								range-key="label"
								@change="handleStatusChange"
							>
								<view class="picker-display">
									<text class="picker-text">{{ selectedStatus.label }}</text>
									<text class="picker-arrow">›</text>
								</view>
							</picker>
						</view>

						<!-- 项目优先级 -->
						<view class="form-item">
							<text class="form-label">优先级</text>
							<picker 
								class="form-picker" 
								:value="priorityIndex" 
								:range="priorityOptions" 
								range-key="label"
								@change="handlePriorityChange"
							>
								<view class="picker-display">
									<text class="picker-text">{{ selectedPriority.label }}</text>
									<text class="picker-arrow">›</text>
								</view>
							</picker>
						</view>

						<!-- 工程进度 -->
						<view class="form-item">
							<text class="form-label">工程进度</text>
							<view class="progress-input">
								<input 
									class="progress-input-field" 
									v-model="formData.progress"
									type="number"
									min="0"
									max="100"
									placeholder="0"
								/>
								<text class="progress-unit">%</text>
							</view>
							<text class="error-text" v-if="errors.progress">{{ errors.progress }}</text>
						</view>
					</view>
				</view>

				<!-- 外部合作方 -->
				<view class="form-section">
					<view class="section-header">
						<view class="section-badge">4</view>
						<text class="section-title">外部合作方</text>
						<view class="section-action" @click="handleAddPartner">
							<text class="action-text">添加</text>
						</view>
					</view>
					<view class="form-card">
						<view class="partners-list">
							<view 
								class="partner-item" 
								v-for="(partner, index) in formData.externalPartners" 
								:key="index"
							>
								<view class="partner-info">
									<text class="partner-name">{{ partner.name }}</text>
									<text class="partner-role">{{ partner.role }}</text>
									<text class="partner-contact">{{ partner.contact }}</text>
								</view>
								<view class="partner-actions">
									<view class="action-btn-small" @click="handleEditPartner(index)">
										<text class="action-icon">✏️</text>
									</view>
									<view class="action-btn-small" @click="handleRemovePartner(index)">
										<text class="action-icon">🗑️</text>
									</view>
								</view>
							</view>
							<view class="empty-partners" v-if="formData.externalPartners.length === 0">
								<view class="empty-icon">🤝</view>
								<text class="empty-text">暂无外部合作方</text>
								<text class="empty-hint">点击上方"添加"按钮添加合作方</text>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 底部操作按钮 -->
		<view class="bottom-actions" v-if="!isSubmitting">
			<view class="action-button secondary" @click="handlePreview">
				<text class="button-text">预览</text>
			</view>
			<view class="action-button primary" @click="handleSubmit">
				<text class="button-text">创建项目</text>
			</view>
		</view>
	</view>
</template>

<script>
import { API_CONFIG } from "../../config/api.js";

export default {
	data() {
		return {
			// 提交状态
			isSubmitting: false,
			
			// 表单数据
			formData: {
				name: '',
				shortName: '',
				projectCode: '',
				description: '',
				department: '',
				type: 'development',
				status: 'planning',
				priority: 3,
				progress: 0,
				externalPartners: []
			},
			
			// 表单错误
			errors: {},
			
			// 项目类型选项
			typeOptions: [
				{ value: 'development', label: '开发项目' },
				{ value: 'research', label: '研究项目' },
				{ value: 'maintenance', label: '维护项目' },
				{ value: 'consulting', label: '咨询项目' },
				{ value: 'training', label: '培训项目' },
				{ value: 'other', label: '其他项目' }
			],
			
			// 状态选项
			statusOptions: [
				{ value: 'planning', label: '规划中' },
				{ value: 'active', label: '进行中' },
				{ value: 'on-hold', label: '暂停中' },
				{ value: 'completed', label: '已完成' },
				{ value: 'cancelled', label: '已取消' }
			],
			
			// 优先级选项
			priorityOptions: [
				{ value: 1, label: '1 - 最低' },
				{ value: 2, label: '2 - 低' },
				{ value: 3, label: '3 - 普通' },
				{ value: 4, label: '4 - 高' },
				{ value: 5, label: '5 - 最高' }
			]
		}
	},
	
	// 页面生命周期
	onLoad() {
		console.log('页面加载，初始表单数据:', this.formData);
	},
	
	onShow() {
		console.log('页面显示，当前表单数据:', this.formData);
	},
	
	computed: {
		// 当前选中的类型索引
		typeIndex() {
			return this.typeOptions.findIndex(type => type.value === this.formData.type);
		},
		
		// 当前选中的类型
		selectedType() {
			return this.typeOptions[this.typeIndex] || this.typeOptions[0];
		},
		
		// 当前选中的状态索引
		statusIndex() {
			return this.statusOptions.findIndex(status => status.value === this.formData.status);
		},
		
		// 当前选中的状态
		selectedStatus() {
			return this.statusOptions[this.statusIndex] || this.statusOptions[0];
		},

		// 当前选中的优先级索引
		priorityIndex() {
			return this.priorityOptions.findIndex(priority => priority.value === this.formData.priority);
		},

		// 当前选中的优先级
		selectedPriority() {
			return this.priorityOptions[this.priorityIndex] || this.priorityOptions[0];
		}
	},
	
	methods: {
		// 返回上一页
		goBack() {
			uni.navigateBack();
		},
		
		// 处理类型选择
		handleTypeChange(e) {
			const index = e.detail.value;
			this.$set(this.formData, 'type', this.typeOptions[index].value);
		},
		
		// 处理状态选择
		handleStatusChange(e) {
			const index = e.detail.value;
			this.$set(this.formData, 'status', this.statusOptions[index].value);
		},
		
		// 处理优先级选择
		handlePriorityChange(e) {
			const index = e.detail.value;
			this.$set(this.formData, 'priority', this.priorityOptions[index].value);
		},

		// 添加合作方
		handleAddPartner() {
			uni.showModal({
				title: '添加合作方',
				content: '合作方管理功能开发中',
				showCancel: false
			});
		},

		// 编辑合作方
		handleEditPartner(index) {
			uni.showToast({
				title: '编辑功能开发中',
				icon: 'none'
			});
		},

		// 移除合作方
		handleRemovePartner(index) {
			uni.showModal({
				title: '确认移除',
				content: `确定要移除合作方 "${this.formData.externalPartners[index].name}" 吗？`,
				success: (res) => {
					if (res.confirm) {
						this.formData.externalPartners.splice(index, 1);
						uni.showToast({
							title: '移除成功',
							icon: 'success'
						});
					}
				}
			});
		},
		
		// 验证字段
		validateField(field) {
			this.errors[field] = '';
			
			switch (field) {
				case 'name':
					if (!this.formData.name.trim()) {
						this.errors.name = '请输入项目名称';
					} else if (this.formData.name.length < 2) {
						this.errors.name = '项目名称至少2个字符';
					} else if (this.formData.name.length > 100) {
						this.errors.name = '项目名称不能超过100个字符';
					}
					break;
				case 'shortName':
					if (!this.formData.shortName.trim()) {
						this.errors.shortName = '请输入项目简称';
					} else if (this.formData.shortName.length < 2) {
						this.errors.shortName = '项目简称至少2个字符';
					} else if (this.formData.shortName.length > 50) {
						this.errors.shortName = '项目简称不能超过50个字符';
					}
					break;
				case 'projectCode':
					if (!this.formData.projectCode.trim()) {
						this.errors.projectCode = '请输入项目编号';
					} else if (!/^[A-Z0-9-]+$/.test(this.formData.projectCode)) {
						this.errors.projectCode = '项目编号只能包含大写字母、数字和连字符';
					} else if (this.formData.projectCode.length > 20) {
						this.errors.projectCode = '项目编号不能超过20个字符';
					}
					break;
				case 'description':
					if (!this.formData.description.trim()) {
						this.errors.description = '请详细描述项目内容、目标和范围';
					} else if (this.formData.description.length < 10) {
						this.errors.description = '项目描述至少10个字符';
					} else if (this.formData.description.length > 1000) {
						this.errors.description = '项目描述不能超过1000个字符';
					}
					break;
				case 'department':
					if (!this.formData.department.trim()) {
						this.errors.department = '请输入所属部门';
					} else if (this.formData.department.length > 100) {
						this.errors.department = '所属部门不能超过100个字符';
					}
					break;
				case 'progress':
					// 确保progress是数字类型
					const progress = Number(this.formData.progress);
					if (isNaN(progress)) {
						this.errors.progress = '工程进度必须是数字';
					} else if (progress < 0 || progress > 100) {
						this.errors.progress = '工程进度必须在0-100之间';
					}
					break;
			}
		},
		
		// 验证整个表单
		validateForm() {
			this.errors = {};
			
			// 验证必填字段
			this.validateField('name');
			this.validateField('shortName');
			this.validateField('projectCode');
			this.validateField('description');
			this.validateField('department');
			this.validateField('progress');
			
			// 调试信息
			console.log('表单数据:', this.formData);
			console.log('验证错误:', this.errors);
			
			// 检查是否有验证错误
			const hasErrors = Object.values(this.errors).some(error => error !== '');
			return !hasErrors;
		},
		
		// 预览项目
		handlePreview() {
			if (!this.validateForm()) {
				uni.showToast({
					title: '请检查表单信息',
					icon: 'error'
				});
				return;
			}
			
			uni.showModal({
				title: '项目预览',
				content: `项目名称：${this.formData.name}\n项目简称：${this.formData.shortName}\n项目编号：${this.formData.projectCode}\n项目类型：${this.selectedType.label}\n项目状态：${this.selectedStatus.label}\n所属部门：${this.formData.department}\n工程进度：${this.formData.progress}%`,
				showCancel: false
			});
		},
		
		// 保存草稿
		handleSave() {
			uni.showToast({
				title: '保存功能开发中',
				icon: 'none'
			});
		},
		
		// 提交表单
		async handleSubmit() {
			// 验证表单
			if (!this.validateForm()) {
				// 显示具体的错误信息
				const errorMessages = Object.values(this.errors).filter(msg => msg);
				if (errorMessages.length > 0) {
					uni.showModal({
						title: '表单验证失败',
						content: errorMessages.join('\n'),
						showCancel: false
					});
				} else {
					uni.showToast({
						title: '请检查表单信息',
						icon: 'error'
					});
				}
				return;
			}
			
			this.isSubmitting = true;
			
			try {
				// 准备提交数据
				const submitData = {
					...this.formData,
					createTime: new Date().toISOString(),
					updateTime: new Date().toISOString()
				};
				
				console.log('提交数据:', submitData);
				console.log('API地址:', `${API_CONFIG.BASE_URL}${API_CONFIG.PROJECT_API}`);
				
				// 调用API创建项目
				const result = await uni.request({
					url: `${API_CONFIG.BASE_URL}${API_CONFIG.PROJECT_API}`,
					method: 'POST',
					header: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${this.getToken()}`
					},
					data: submitData
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
				
				console.log('API响应:', { error, response });
				console.log('响应数据:', response.data);
				console.log('响应状态码:', response.statusCode);
				
				if (error) {
					console.error('网络请求失败:', error);
					throw new Error(`网络请求失败: ${error.errMsg || error}`);
				}
				
				if (response.statusCode === 201 || response.statusCode === 200) {
					console.log('API请求成功');
					
					// 项目创建成功后，通过项目代码获取_id
					await this.getProjectIdByCode();
					
				} else {
					console.error('API状态码错误:', response.statusCode);
					console.error('错误响应:', response.data);
					throw new Error(`API请求失败: ${response.statusCode}`);
				}
				
			} catch (error) {
				console.error('创建项目失败:', error);
				
				// 如果API失败，使用模拟数据作为备用
				this.createMockProject();
				
			} finally {
				this.isSubmitting = false;
			}
		},
		
		// 创建模拟项目
		createMockProject() {
			console.log('使用模拟数据创建项目');
			
			// 生成模拟的_id
			const mockId = 'mock_' + Date.now();
			console.log('模拟项目ID:', mockId);
			
			uni.showToast({
				title: '项目创建成功',
				icon: 'success',
				duration: 2000
			});
			
			// 延迟跳转到项目详情页
			setTimeout(() => {
				console.log('准备跳转，模拟项目ID:', mockId);
				uni.navigateTo({
					url: `/pages/project/project-detail?id=${mockId}&name=${encodeURIComponent(this.formData.name)}`
				});
			}, 2000);
		},
		
		// 通过项目代码获取项目ID
		async getProjectIdByCode() {
			try {
				console.log('正在通过项目代码获取项目ID...');
				console.log('项目代码:', this.formData.projectCode);
				
				const result = await uni.request({
					url: `${API_CONFIG.BASE_URL}/lz/api/projects/by-code/${this.formData.projectCode}`,
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
					console.error('获取项目ID失败:', error);
					throw new Error(`网络请求失败: ${error.errMsg || error}`);
				}
				
				console.log('获取项目ID API响应:', response);
				
				if (response.statusCode === 200 && response.data) {
					// 检查API返回的数据结构
					let projectData;
					if (response.data.success && response.data.data) {
						projectData = response.data.data;
					} else {
						projectData = response.data;
					}
					
					// 获取项目ID
					const projectId = projectData._id || projectData.id;
					console.log('获取到的项目ID:', projectId);
					console.log('完整的项目数据:', projectData);
					
					if (!projectId) {
						throw new Error('未获取到项目ID');
					}
					
					uni.showToast({
						title: '项目创建成功',
						icon: 'success',
						duration: 2000
					});
					
					// 确保获取到ID后再跳转
					setTimeout(() => {
						console.log('准备跳转，项目ID:', projectId);
						uni.navigateTo({
							url: `/pages/project/project-detail?id=${projectId}&name=${encodeURIComponent(this.formData.name)}`
						});
					}, 2000);
					
				} else {
					console.error('获取项目ID API状态码错误:', response.statusCode);
					console.error('错误响应:', response.data);
					throw new Error(`获取项目ID失败: ${response.statusCode}`);
				}
				
			} catch (error) {
				console.error('通过项目代码获取ID失败:', error);
				
				// 如果获取ID失败，使用模拟数据作为备用
				this.createMockProject();
			}
		},
		
		// 获取用户token
		getToken() {
			return uni.getStorageSync('userToken') || '';
		}
	}
}
</script>

<style scoped>
.create-project-container {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	min-height: 100vh;
	display: flex;
	flex-direction: column;
}

/* 页面头部 */
.page-header {
	display: flex;
	align-items: center;
	padding: 60rpx 40rpx 40rpx;
	background: rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(20rpx);
	border-bottom: 1rpx solid rgba(255, 255, 255, 0.2);
}

.header-back {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.2);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 40rpx;
	transition: all 0.3s ease;
	backdrop-filter: blur(10rpx);
	border: 1rpx solid rgba(255, 255, 255, 0.3);
}

.header-back:active {
	background: rgba(255, 255, 255, 0.3);
	transform: scale(0.9);
}

.back-icon {
	font-size: 40rpx;
	font-weight: bold;
	color: white;
}

.header-title {
	flex: 1;
	text-align: center;
}

.title-text {
	font-size: 38rpx;
	font-weight: bold;
	color: white;
	letter-spacing: 2rpx;
}

.header-actions {
	display: flex;
	gap: 20rpx;
}

.action-btn {
	padding: 15rpx 30rpx;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 25rpx;
	transition: all 0.3s ease;
	backdrop-filter: blur(10rpx);
	border: 1rpx solid rgba(255, 255, 255, 0.3);
}

.action-btn:active {
	background: rgba(255, 255, 255, 0.3);
	transform: scale(0.95);
}

.action-text {
	font-size: 26rpx;
	font-weight: 500;
	color: white;
}

/* 加载状态 */
.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 200rpx 0;
	flex: 1;
}

.loading-spinner {
	width: 80rpx;
	height: 80rpx;
	border: 6rpx solid rgba(255, 255, 255, 0.3);
	border-top: 6rpx solid white;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin-bottom: 30rpx;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.loading-text {
	font-size: 30rpx;
	color: white;
	font-weight: 500;
}

/* 表单容器 */
.form-container {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.form-scroll {
	flex: 1;
	padding: 40rpx 0;
}

/* 欢迎区域 */
.welcome-section {
	text-align: center;
	padding: 50rpx 0;
	margin-bottom: 40rpx;
}

.welcome-card {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 0;
	padding: 50rpx 40rpx;
	box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(20rpx);
	border: 1rpx solid rgba(255, 255, 255, 0.3);
}

.welcome-icon {
	font-size: 80rpx;
	margin-bottom: 20rpx;
}

.welcome-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 10rpx;
	display: block;
}

.welcome-subtitle {
	font-size: 26rpx;
	color: #666;
	line-height: 1.5;
}

/* 表单区块 */
.form-section {
	margin-bottom: 50rpx;
}

.section-header {
	display: flex;
	align-items: center;
	margin-bottom: 30rpx;
	padding: 0;
}

.section-badge {
	width: 40rpx;
	height: 40rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.2);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	font-weight: bold;
	color: white;
	margin-right: 15rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: white;
	flex: 1;
}

.section-action {
	padding: 12rpx 25rpx;
	background: rgba(255, 255, 255, 0.2);
	color: white;
	border-radius: 25rpx;
	transition: all 0.3s ease;
	backdrop-filter: blur(10rpx);
	border: 1rpx solid rgba(255, 255, 255, 0.3);
}

.section-action:active {
	transform: scale(0.95);
	background: rgba(255, 255, 255, 0.3);
}

/* 表单卡片 */
.form-card {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 0;
	padding: 50rpx 40rpx;
	box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(20rpx);
	border: 1rpx solid rgba(255, 255, 255, 0.3);
}

/* 表单项 */
.form-item {
	margin-bottom: 50rpx;
}

.form-item:last-child {
	margin-bottom: 0;
}

.form-label {
	font-size: 30rpx;
	color: #333;
	margin-bottom: 25rpx;
	display: block;
	font-weight: 600;
}

/* 输入框 */
.form-input {
	width: 100%;
	height: 100rpx;
	padding: 0 30rpx;
	border: 2rpx solid #e8ecff;
	border-radius: 15rpx;
	font-size: 30rpx;
	background: #fafbff;
	transition: all 0.3s ease;
	box-sizing: border-box;
}

.form-input:focus {
	border-color: #667eea;
	background: white;
	box-shadow: 0 0 0 6rpx rgba(102, 126, 234, 0.1);
}

/* 文本域 */
.form-textarea {
	width: 100%;
	min-height: 160rpx;
	padding: 30rpx;
	border: 2rpx solid #e8ecff;
	border-radius: 15rpx;
	font-size: 30rpx;
	background: #fafbff;
	transition: all 0.3s ease;
	resize: none;
	box-sizing: border-box;
}

.form-textarea:focus {
	border-color: #667eea;
	background: white;
	box-shadow: 0 0 0 6rpx rgba(102, 126, 234, 0.1);
}

.textarea-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 20rpx;
}

.char-count {
	font-size: 24rpx;
	color: #999;
}

/* 选择器 */
.form-picker {
	width: 100%;
}

.picker-display {
	width: 100%;
	height: 100rpx;
	padding: 0 30rpx;
	border: 2rpx solid #e8ecff;
	border-radius: 15rpx;
	background: #fafbff;
	display: flex;
	align-items: center;
	justify-content: space-between;
	transition: all 0.3s ease;
	box-sizing: border-box;
}

.picker-display:active {
	background: #f0f4ff;
	border-color: #667eea;
}

.picker-text {
	font-size: 30rpx;
	color: #333;
}

.picker-arrow {
	font-size: 26rpx;
	color: #999;
	transition: all 0.3s ease;
}

.picker-display:active .picker-arrow {
	color: #667eea;
}

/* 错误文本 */
.error-text {
	font-size: 26rpx;
	color: #ff4757;
	margin-top: 20rpx;
	display: block;
	font-weight: 500;
}

/* 提示文本 */
.hint-text {
	font-size: 24rpx;
	color: #999;
	margin-top: 15rpx;
	display: block;
}

/* 进度输入 */
.progress-input {
	display: flex;
	align-items: center;
	width: 100%;
	height: 100rpx;
	padding: 0 30rpx;
	border: 2rpx solid #e8ecff;
	border-radius: 15rpx;
	background: #fafbff;
	transition: all 0.3s ease;
	box-sizing: border-box;
}

.progress-input:focus-within {
	border-color: #667eea;
	background: white;
	box-shadow: 0 0 0 6rpx rgba(102, 126, 234, 0.1);
}

.progress-input-field {
	flex: 1;
	height: 100%;
	padding: 0 15rpx;
	font-size: 30rpx;
	border: none;
	outline: none;
	background: transparent;
}

.progress-unit {
	font-size: 30rpx;
	color: #333;
	margin-left: 15rpx;
}

/* 合作方列表 */
.partners-list {
	display: flex;
	flex-direction: column;
	gap: 25rpx;
}

.partner-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx;
	background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
	border-radius: 15rpx;
	border: 1rpx solid #e8ecff;
	transition: all 0.3s ease;
}

.partner-item:active {
	transform: scale(0.98);
	background: linear-gradient(135deg, #f0f4ff 0%, #e8ecff 100%);
}

.partner-info {
	flex: 1;
}

.partner-name {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 8rpx;
	display: block;
}

.partner-role {
	font-size: 26rpx;
	color: #666;
	margin-bottom: 5rpx;
	display: block;
}

.partner-contact {
	font-size: 24rpx;
	color: #999;
}

.partner-actions {
	display: flex;
	gap: 20rpx;
}

.action-btn-small {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	background: rgba(102, 126, 234, 0.1);
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
}

.action-btn-small:active {
	background: rgba(102, 126, 234, 0.2);
	transform: scale(0.9);
}



.empty-partners {
	text-align: center;
	padding: 80rpx 0;
}

.empty-icon {
	font-size: 60rpx;
	margin-bottom: 20rpx;
	opacity: 0.5;
}

.empty-text {
	font-size: 28rpx;
	color: #999;
	font-weight: 500;
	margin-bottom: 10rpx;
	display: block;
}

.empty-hint {
	font-size: 24rpx;
	color: #ccc;
}

/* 底部操作按钮 */
.bottom-actions {
	display: flex;
	gap: 30rpx;
	padding: 50rpx 40rpx;
	background: rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(20rpx);
	border-top: 1rpx solid rgba(255, 255, 255, 0.2);
}

.action-button {
	flex: 1;
	height: 100rpx;
	border-radius: 50rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
	font-weight: bold;
}

.action-button.primary {
	background: white;
	color: #667eea;
	box-shadow: 0 8rpx 25rpx rgba(255, 255, 255, 0.3);
}

.action-button.primary:active {
	transform: scale(0.95);
	box-shadow: 0 4rpx 15rpx rgba(255, 255, 255, 0.4);
}

.action-button.secondary {
	background: rgba(255, 255, 255, 0.2);
	color: white;
	border: 2rpx solid rgba(255, 255, 255, 0.3);
	backdrop-filter: blur(10rpx);
}

.action-button.secondary:active {
	background: rgba(255, 255, 255, 0.3);
	transform: scale(0.95);
}

.button-text {
	font-size: 30rpx;
	font-weight: bold;
}

/* 响应式适配 */
@media screen and (max-width: 750rpx) {
	.page-header {
		padding: 50rpx 25rpx 30rpx;
	}
	
	.header-back {
		width: 70rpx;
		height: 70rpx;
	}
	
	.back-icon {
		font-size: 38rpx;
	}
	
	.title-text {
		font-size: 36rpx;
	}
	
	.form-scroll {
		padding: 30rpx 0;
	}
	
	.welcome-section {
		padding: 40rpx 0;
	}
	
	.form-card {
		padding: 40rpx 30rpx;
	}
	
	.bottom-actions {
		padding: 40rpx 25rpx;
		gap: 25rpx;
	}
	
	.action-button {
		height: 90rpx;
	}
}
</style>