<template>
	<view class="mine-page">
		<!-- 头部导航组件 -->
		<HeaderNav 
			title="我的"
			:showBack="true"
			rightText=""
			@back="goBack"
		>
		</HeaderNav>
		
		<!-- 页面内容区域 -->
		<view class="content" :style="{ paddingTop: navHeight + 'px' }">
			<!-- 用户头像区域 -->
			<view class="avatar-section">
				<view class="avatar-container">
					<view class="avatar-placeholder">
						<text class="camera-icon">📷</text>
					</view>
				</view>
			</view>
			
			<!-- 用户信息列表 -->
			<view class="info-list">
				<view class="info-item" @click="editUserName">
					<view class="info-left">
						<text class="info-icon">👤</text>
						<text class="info-label">用户名称</text>
					</view>
					<view class="info-right">
						<text class="info-value">{{ userInfo.name || '李想' }}</text>
						<text class="arrow">〉</text>
					</view>
				</view>
				
				<view class="info-item" @click="editPhone">
					<view class="info-left">
						<text class="info-icon">📱</text>
						<text class="info-label">手机号码</text>
					</view>
					<view class="info-right">
						<text class="info-value">{{ userInfo.phone || '18505137898' }}</text>
						<text class="arrow">〉</text>
					</view>
				</view>
				
				<view class="info-item" @click="editEmail">
					<view class="info-left">
						<text class="info-icon">✉️</text>
						<text class="info-label">用户邮箱</text>
					</view>
					<view class="info-right">
						<text class="info-value">{{ userInfo.email || 'lixiang@163.com' }}</text>
						<text class="arrow">〉</text>
					</view>
				</view>
				
				<view class="info-item">
					<view class="info-left">
						<text class="info-icon">⚥</text>
						<text class="info-label">性别</text>
					</view>
					<view class="info-right">
						<text class="info-value">{{ userInfo.gender || '男' }}</text>
						<text class="arrow">〉</text>
					</view>
				</view>
				
				<view class="info-item">
					<view class="info-left">
						<text class="info-icon">🏢</text>
						<text class="info-label">所属部门</text>
					</view>
					<view class="info-right">
						<text class="info-value">{{ userInfo.department || '财务部' }}</text>
						<text class="arrow">〉</text>
					</view>
				</view>
				
				<view class="info-item">
					<view class="info-left">
						<text class="info-icon">👔</text>
						<text class="info-label">所属角色</text>
					</view>
					<view class="info-right">
						<text class="info-value">{{ userInfo.role || '财务主管' }}</text>
						<text class="arrow">〉</text>
					</view>
				</view>
				
				<view class="info-item">
					<view class="info-left">
						<text class="info-icon">📅</text>
						<text class="info-label">创建日期</text>
					</view>
					<view class="info-right">
						<text class="info-value">{{ userInfo.createTime || '2020.02.12' }}</text>
						<text class="arrow">〉</text>
					</view>
				</view>
			</view>
			
			<!-- 密码安全状态 -->
			<PasswordStatus :userPhone="userInfo.phone" />
			
			<!-- 系统设置 -->
			<view class="setting-section">
				<view class="setting-item" @click="goToSystemSetting">
					<view class="setting-left">
						<text class="setting-icon">⚙️</text>
						<text class="setting-label">系统设置</text>
					</view>
					<text class="arrow">〉</text>
				</view>
			</view>
		</view>
		
		<!-- AI助手弹框 -->
		<view class="ai-modal" v-if="showAiModal" @click="closeAiModal">
			<view class="ai-content" @click.stop>
				<view class="ai-close" @click="closeAiModal">×</view>
				
				<view class="ai-header">
					<view class="ai-avatar">
						<view class="ai-icon">🤖</view>
					</view>
					<text class="ai-title">AI助手</text>
				</view>
				
				<view class="ai-greeting">
					<text class="greeting-text">您好，有什么可以帮您？</text>
				</view>
				
				<view class="ai-options">
					<view class="option-item" @click="handleOption('password')">
						<text class="option-text">忘记密码怎么办</text>
					</view>
					<view class="option-item" @click="handleOption('info')">
						<text class="option-text">如何修改个人信息</text>
					</view>
					<view class="option-item" @click="handleOption('guide')">
						<text class="option-text">查看新手入门指南</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- AI对话页面 -->
		<view class="ai-chat-modal" v-if="showAiChat">
			<view class="ai-chat-page">
				<!-- 头部导航 -->
				<view class="ai-chat-header">
					<view class="chat-back" @click="closeAiChat">
						<text class="back-icon">←</text>
					</view>
					<text class="chat-title">AI助手</text>
					<view class="chat-date">{{ currentDate }}</view>
				</view>
				
				<!-- 对话内容区域 -->
				<scroll-view class="ai-chat-content" scroll-y="true" :scroll-top="scrollTop">
					<!-- 如果没有对话消息，显示默认界面 -->
					<view v-if="chatMessages.length === 0" class="ai-welcome">
						<view class="ai-avatar-large">
							<view class="ai-icon-large">😊</view>
						</view>
						<text class="ai-greeting-large">您好，请问有什么可以帮您？</text>
					</view>
					
					<!-- 对话消息列表 -->
					<view v-else class="messages-container">
						<view 
							v-for="message in chatMessages" 
							:key="message.id" 
							:class="['message-item', message.sender === 'user' ? 'user-message' : 'ai-message']"
						>
							<view v-if="message.sender === 'ai'" class="ai-avatar-small">
								<text class="ai-icon-small">🤖</text>
							</view>
							<view class="message-bubble">
								<text class="message-text">{{ message.content }}</text>
							</view>
						</view>
						
						<!-- 加载状态 -->
						<view v-if="isLoading" class="message-item ai-message">
							<view class="ai-avatar-small">
								<text class="ai-icon-small">🤖</text>
							</view>
							<view class="message-bubble loading">
								<text class="loading-text">正在思考中...</text>
							</view>
						</view>
						
						<!-- 底部占位空间，确保最后一条消息不被输入框遮挡 -->
						<view class="bottom-placeholder"></view>
					</view>
				</scroll-view>
			</view>
			
			<!-- 底部输入区域 - 固定在页面底部 -->
			<view class="ai-chat-input-fixed">
				<input 
					class="chat-input-field" 
					type="text" 
					placeholder="请输入..."
					v-model="chatInput"
					placeholder-style="color: #cccccc;"
				/>
				<view class="send-button" @click="sendMessage">
					<text class="send-text">发送</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import HeaderNav from '../../components/HeaderNav.vue'
import PasswordStatus from './components/PasswordStatus.vue'
import { callGLM, getPresetResponse } from './api/chat'
export default {
	components: {
		HeaderNav,
		PasswordStatus
	},
	data() {
		return {
			navHeight: 88, // 导航栏高度，用于内容区域的padding-top
			showAiModal: false, // 控制AI助手弹框显示
			showAiChat: false, // 控制AI对话页面显示
			currentChatType: '', // 当前对话类型
			chatInput: '', // 聊天输入框内容
			chatMessages: [], // 对话消息列表
			isLoading: false, // AI回复加载状态
			scrollTop: 0, // 滚动位置
			stateUpdateTimer: null, // 状态更新定时器
			currentDate: '', // 当前日期
			userInfo: {
				avatar: '',
				name: '李想',
				phone: '19033651282',
				email: 'lixiang@163.com',
				gender: '男',
				department: '财务部',
				role: '财务主管',
				createTime: '2020.02.12'
			}
		}
	},
	mounted() {
		// 获取状态栏高度来计算完整的导航栏高度
		uni.getSystemInfo({
			success: (res) => {
				this.navHeight = 20 + (res.statusBarHeight || 0)
			}
		})
		
		// 检查是否是页面刷新（只有刷新时才恢复状态）
		this.checkAndRestoreOnRefresh()
		
		// 页面加载完成后延迟显示AI助手弹框（只有在没有恢复到聊天界面时才显示）
		if (!this.showAiChat) {
			this.showAiHelper()
		}
	},
	
	// 页面显示时触发
	onShow() {
		// 每次页面显示时都弹出AI助手
		this.showAiHelper()
	},
	
	// 页面卸载时清理定时器
	beforeDestroy() {
		this.stopStateUpdateTimer()
	},
	
	methods: {
		onSettingClick() {
			console.log('点击了设置按钮')
			// 这里可以跳转到设置页面
			uni.navigateTo({
				url: '/pages/setting/setting'
			})
		},
		// 编辑用户名
		editUserName() {
			console.log('编辑用户名')
			// 跳转到编辑信息页面，传递用户名参数
			uni.navigateTo({
				url: `/pages/mine/editInfo?name=${this.userInfo.name}`
			})
		},
		// 编辑手机号
		editPhone() {
			console.log('编辑手机号')
		},
		// 编辑邮箱
		editEmail() {
			console.log('编辑邮箱')
		},
		// 跳转系统设置
		goToSystemSetting() {
			console.log('跳转系统设置')
			uni.navigateTo({
				url: '/pages/system/system'
			})
		},
		// 返回上一页
		onBack() {
		  const hasCustomBack = this.$listeners.back; 
		  this.$emit('back'); 
		  
		  if (!hasCustomBack) { 
			uni.navigateBack();
		  }
		},
		
		// 显示AI助手弹框
		showAiHelper() {
			// 延迟显示，确保页面渲染完成
			setTimeout(() => {
				this.showAiModal = true
			}, 500)
		},
		
		// 关闭AI助手弹框
		closeAiModal() {
			this.showAiModal = false
		},
		
		// 处理AI助手选项点击
		handleOption(type) {
			this.closeAiModal()
			
			// 延迟一点显示AI对话页面
			setTimeout(() => {
				this.showAiChat = true
				this.currentChatType = type
				
				// 获取当前时间
				this.updateCurrentDate()
				
				// 保存页面状态
				this.savePageState()
				
				// 启动状态更新定时器
				this.startStateUpdateTimer()
				
				this.initChat(type)
			}, 300)
		},
		
		// 初始化对话
		initChat(type) {
			// 尝试从缓存加载对话记录
			const cachedMessages = this.loadChatHistory(type)
			
			if (cachedMessages && cachedMessages.length > 0) {
				// 如果有缓存的对话记录，直接使用
				this.chatMessages = cachedMessages
			} else {
				// 如果没有缓存，创建新对话
				this.chatMessages = []
				
				// 添加预设的AI回复
				const presetResponse = getPresetResponse(type)
				this.addMessage('ai', presetResponse)
			}
		},
		
		// 添加消息到对话列表
		addMessage(sender, content) {
			const message = {
				id: Date.now(),
				sender: sender, // 'user' 或 'ai'
				content: content,
				timestamp: new Date()
			}
			
			this.chatMessages.push(message)
			
			// 保存到本地缓存
			this.saveChatHistory()
			
			// 自动滚动到底部
			this.$nextTick(() => {
				// 重置滚动位置，然后设置到最大值
				this.scrollTop = 0
				setTimeout(() => {
					this.scrollTop = 999999
				}, 100)
			})
		},
		
		// 关闭AI对话页面
		closeAiChat() {
			this.showAiChat = false
			// 清除页面状态缓存
			this.clearPageState()
			// 停止状态更新定时器
			this.stopStateUpdateTimer()
		},
		
		// 保存对话记录到本地缓存
		saveChatHistory() {
			try {
				const cacheKey = `ai_chat_${this.currentChatType}`
				const chatData = {
					type: this.currentChatType,
					messages: this.chatMessages,
					lastUpdate: new Date().toISOString()
				}
				
				uni.setStorageSync(cacheKey, JSON.stringify(chatData))
				console.log('对话记录已保存到缓存')
			} catch (error) {
				console.error('保存对话记录失败:', error)
			}
		},
		
		// 从本地缓存加载对话记录
		loadChatHistory(type) {
			try {
				const cacheKey = `ai_chat_${type}`
				const cachedData = uni.getStorageSync(cacheKey)
				
				if (cachedData) {
					const chatData = JSON.parse(cachedData)
					
					// 检查缓存是否过期（可选：设置7天过期）
					const lastUpdate = new Date(chatData.lastUpdate)
					const now = new Date()
					const daysDiff = (now - lastUpdate) / (1000 * 60 * 60 * 24)
					
					if (daysDiff <= 7) { // 7天内的缓存有效
						console.log('从缓存加载对话记录:', chatData.messages.length, '条消息')
						return chatData.messages
					} else {
						// 缓存过期，清除旧数据
						uni.removeStorageSync(cacheKey)
						console.log('缓存已过期，已清除')
					}
				}
				
				return null
			} catch (error) {
				console.error('加载对话记录失败:', error)
				return null
			}
		},
		

		

		
		// 保存页面状态
		savePageState() {
			try {
				const pageState = {
					showAiChat: this.showAiChat,
					currentChatType: this.currentChatType,
					timestamp: Date.now()
				}
				
				uni.setStorageSync('mine_page_state', JSON.stringify(pageState))
				console.log('页面状态已保存')
			} catch (error) {
				console.error('保存页面状态失败:', error)
			}
		},
		
		// 恢复页面状态
		restorePageState() {
			try {
				const savedState = uni.getStorageSync('mine_page_state')
				
				if (savedState) {
					const pageState = JSON.parse(savedState)
					
					// 检查状态是否过期（30分钟）
					const now = Date.now()
					const timeDiff = now - pageState.timestamp
					const maxAge = 30 * 60 * 1000 // 30分钟
					
					if (timeDiff <= maxAge && pageState.showAiChat) {
						// 恢复AI聊天界面状态
						this.showAiChat = true
						this.currentChatType = pageState.currentChatType
						
						// 获取当前时间
						this.updateCurrentDate()
						
						// 加载对话记录
						this.initChat(pageState.currentChatType)
						
						console.log('页面状态已恢复:', pageState.currentChatType)
					} else {
						// 状态过期，清除缓存
						this.clearPageState()
						console.log('页面状态已过期，已清除')
					}
				}
			} catch (error) {
				console.error('恢复页面状态失败:', error)
				// 发生错误时清除可能损坏的缓存
				this.clearPageState()
			}
		},
		
		// 清除页面状态
		clearPageState() {
			try {
				uni.removeStorageSync('mine_page_state')
				console.log('页面状态缓存已清除')
			} catch (error) {
				console.error('清除页面状态失败:', error)
			}
		},
		
		// 检查并在刷新时恢复状态
		checkAndRestoreOnRefresh() {
			// 简化逻辑：只有在AI聊天界面刷新时才恢复状态
			// 通过检查页面状态的时间戳来判断是否是最近的刷新
			try {
				const savedState = uni.getStorageSync('mine_page_state')
				
				if (savedState) {
					const pageState = JSON.parse(savedState)
					const now = Date.now()
					const timeDiff = now - pageState.timestamp
					
					// 如果状态保存时间在10秒内，且确实是在AI聊天界面，才恢复
					if (timeDiff <= 10000 && pageState.showAiChat) {
						this.restorePageState()
						console.log('检测到AI聊天界面刷新，恢复状态')
					} else {
						// 其他情况清除状态
						this.clearPageState()
						console.log('正常页面访问，不恢复AI聊天状态')
					}
				}
			} catch (error) {
				console.error('检查页面状态失败:', error)
			}
		},
		
		// 启动状态更新定时器
		startStateUpdateTimer() {
			// 清除之前的定时器
			this.stopStateUpdateTimer()
			
			// 每5秒更新一次状态时间戳，确保AI聊天界面状态保持最新
			this.stateUpdateTimer = setInterval(() => {
				if (this.showAiChat) {
					this.savePageState()
				}
			}, 5000)
		},
		
		// 停止状态更新定时器
		stopStateUpdateTimer() {
			if (this.stateUpdateTimer) {
				clearInterval(this.stateUpdateTimer)
				this.stateUpdateTimer = null
			}
		},
		
		// 更新当前日期
		updateCurrentDate() {
			const now = new Date()
			const year = now.getFullYear()
			const month = String(now.getMonth() + 1).padStart(2, '0')
			const day = String(now.getDate()).padStart(2, '0')
			
			this.currentDate = `${year}.${month}.${day}`
			console.log('更新聊天界面时间:', this.currentDate)
		},
		
		// 发送消息
		async sendMessage() {
			if (!this.chatInput.trim() || this.isLoading) return
			
			const userMessage = this.chatInput.trim()
			
			// 添加用户消息
			this.addMessage('user', userMessage)
			
			// 清空输入框
			this.chatInput = ''
			
			// 设置加载状态
			this.isLoading = true
			
			try {
				// 构建对话历史
				const history = this.chatMessages.slice(0, -1).map(msg => ({
					role: msg.sender === 'user' ? 'user' : 'assistant',
					content: msg.content
				}))
				
				// 调用GLM大模型
				const aiResponse = await callGLM(userMessage, history)
				
				// 添加AI回复
				this.addMessage('ai', aiResponse)
				
			} catch (error) {
				console.error('AI回复失败:', error)
				this.addMessage('ai', '抱歉，我现在有点忙，请稍后再试或者联系管理员帮助您。')
			} finally {
				this.isLoading = false
			}
		}
	}
}
</script>

<style scoped>
.mine-page {
	min-height: 100vh;
	background-color: #f5f5f5;
}

.content {
	padding: 0;
}

/* 头像区域 */
.avatar-section {
	background-color: #ffffff;
	padding: 40rpx 0;
	display: flex;
	justify-content: center;
	margin-bottom: 20rpx;
}

.avatar-container {
	position: relative;
}

.avatar-placeholder {
	width: 160rpx;
	height: 160rpx;
	border-radius: 16rpx;
	background-color: #e5e5e5;
	display: flex;
	align-items: center;
	justify-content: center;
}

.camera-icon {
	font-size: 48rpx;
	color: #999999;
}

/* 信息列表 */
.info-list {
	background-color: #ffffff;
	margin-bottom: 20rpx;
}

.info-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
	border-bottom: none;
}

.info-left {
	display: flex;
	align-items: center;
}

.info-icon {
	font-size: 32rpx;
	margin-right: 20rpx;
	color: #999999;
}

.info-label {
	font-size: 30rpx;
	color: #333333;
}

.info-right {
	display: flex;
	align-items: center;
}

.info-value {
	font-size: 30rpx;
	color: #999999;
	margin-right: 10rpx;
}

.arrow {
	font-size: 24rpx;
	color: #cccccc;
}

/* 设置区域 */
.setting-section {
	background-color: #ffffff;
}

.setting-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 30rpx;
}

.setting-left {
	display: flex;
	align-items: center;
}

.setting-icon {
	font-size: 32rpx;
	margin-right: 20rpx;
	color: #999999;
}

.setting-label {
	font-size: 30rpx;
	color: #333333;
}

/* AI助手弹框样式 */
.ai-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
}

.ai-content {
	background-color: #ffffff;
	border-radius: 24rpx;
	width: 600rpx;
	max-width: 90%;
	padding: 60rpx 40rpx 40rpx;
	position: relative;
	margin: 40rpx;
}

.ai-close {
	position: absolute;
	top: 30rpx;
	right: 30rpx;
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 40rpx;
	color: #cccccc;
	cursor: pointer;
}

.ai-header {
	display: flex;
	align-items: center;
	margin-bottom: 30rpx;
}

.ai-avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
}

.ai-icon {
	font-size: 40rpx;
	color: #ffffff;
}

.ai-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #333333;
}

.ai-greeting {
	margin-bottom: 40rpx;
}

.greeting-text {
	font-size: 32rpx;
	color: #666666;
	line-height: 1.5;
}

.ai-options {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.option-item {
	border: 2rpx solid #4A90E2;
	border-radius: 50rpx;
	padding: 20rpx 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.3s ease;
}

.option-item:active {
	background-color: #4A90E2;
	transform: scale(0.98);
}

.option-item:active .option-text {
	color: #ffffff;
}

.option-text {
	font-size: 28rpx;
	color: #4A90E2;
	text-align: center;
}

/* AI对话页面样式 */
.ai-chat-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 10000;
	background-color: #ffffff;
}

.ai-chat-page {
	height: 100vh;
	display: flex;
	flex-direction: column;
	position: relative;
}

/* 对话页面头部 */
.ai-chat-header {
	background-color: #f8f8f8;
	height: 120rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 30rpx;
	border-bottom: 1rpx solid #e0e0e0;
}

.chat-back {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-icon {
	font-size: 40rpx;
	color: #333333;
}

.chat-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #333333;
}

.chat-date {
	font-size: 28rpx;
	color: #999999;
}

/* 对话内容区域 */
.ai-chat-content {
	flex: 1;
	background-color: #f8f8f8;
	height: 0; /* 关键：让flex子元素可以滚动 */
	overflow: hidden;
}

.ai-welcome {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60rpx 40rpx 140rpx 40rpx; /* 底部预留输入框空间 */
	min-height: calc(100vh - 260rpx); /* 减去头部和输入框的高度 */
	background-color: #ffffff;
}

.ai-avatar-large {
	width: 160rpx;
	height: 160rpx;
	border-radius: 50%;
	background-color: #e3f2fd;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 60rpx;
}

.ai-icon-large {
	font-size: 80rpx;
}

.ai-greeting-large {
	font-size: 36rpx;
	color: #333333;
	text-align: center;
	line-height: 1.5;
}

/* 消息容器 */
.messages-container {
	padding: 20rpx 20rpx 140rpx 20rpx; /* 底部留出更多空间给输入框 */
	min-height: calc(100% + 140rpx); /* 确保有足够的滚动空间 */
}

/* 底部占位空间 */
.bottom-placeholder {
	height: 40rpx;
}

.message-item {
	display: flex;
	margin-bottom: 30rpx;
	align-items: flex-start;
}

.user-message {
	justify-content: flex-end;
}

.ai-message {
	justify-content: flex-start;
}

.ai-avatar-small {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	background-color: #e3f2fd;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
	flex-shrink: 0;
}

.ai-icon-small {
	font-size: 30rpx;
}

.message-bubble {
	max-width: 70%;
	padding: 20rpx 30rpx;
	border-radius: 20rpx;
	position: relative;
}

.user-message .message-bubble {
	background-color: #4A90E2;
	border-bottom-right-radius: 6rpx;
}

.ai-message .message-bubble {
	background-color: #ffffff;
	border-bottom-left-radius: 6rpx;
	border: 1rpx solid #e0e0e0;
}

.message-text {
	font-size: 30rpx;
	line-height: 1.5;
	word-wrap: break-word;
}

.user-message .message-text {
	color: #ffffff;
}

.ai-message .message-text {
	color: #333333;
}

.loading {
	background-color: #f0f0f0;
}

.loading-text {
	color: #999999;
	font-style: italic;
}

/* 底部输入区域 - 固定在底部 */
.ai-chat-input-fixed {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #f8f8f8;
	padding: 20rpx 30rpx;
	display: flex;
	align-items: center;
	gap: 20rpx;
	border-top: 1rpx solid #e0e0e0;
	z-index: 10001;
}

.chat-input-field {
	flex: 1;
	background-color: #ffffff;
	border-radius: 50rpx;
	padding: 20rpx 30rpx;
	font-size: 32rpx;
	border: 1rpx solid #e0e0e0;
}

.send-button {
	background-color: #4A90E2;
	border-radius: 50rpx;
	padding: 20rpx 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 120rpx;
}

.send-text {
	font-size: 32rpx;
	color: #ffffff;
	font-weight: 500;
}
</style>
