<template>
	<view class="oauth-container">
		<!-- 顶部导航 -->
		<view class="oauth-header">
			<view class="header-left" @click="goBack">
				<text class="back-icon">←</text>
				<text class="back-text">返回</text>
			</view>
			<view class="header-title">
				<text>{{ platformName }}登录</text>
			</view>
			<view class="header-right"></view>
		</view>
		
		<!-- WebView容器 -->
		<web-view 
			v-if="authUrl" 
			:src="authUrl" 
			@message="handleMessage"
			@load="handleLoad"
			@error="handleError"
		></web-view>
		
		<!-- 加载状态 -->
		<view v-if="loading" class="loading-container">
			<view class="loading-spinner"></view>
			<text class="loading-text">正在加载授权页面...</text>
		</view>
		
		<!-- 错误状态 -->
		<view v-if="error" class="error-container">
			<text class="error-icon">⚠️</text>
			<text class="error-message">{{ error }}</text>
			<button class="retry-btn" @click="retry">重试</button>
		</view>
	</view>
</template>

<script>
	import { shuidiLogin } from '@/config/shuidi-login.js'
	
	export default {
		data() {
			return {
				authUrl: '',
				platform: '',
				platformName: '',
				loading: true,
				error: '',
				urlCheckTimer: null
			}
		},
		
		onLoad(options) {
			console.log('OAuth页面参数:', options)
			
			if (options.url) {
				this.authUrl = decodeURIComponent(options.url)
			}
			
			if (options.platform) {
				this.platform = options.platform
				this.platformName = this.getPlatformName(options.platform)
			}
			
			// 开始监控URL变化
			this.startUrlMonitoring()
		},
		
		onUnload() {
			// 清除定时器
			if (this.urlCheckTimer) {
				clearInterval(this.urlCheckTimer)
			}
		},
		
		methods: {
			// 获取平台中文名称
			getPlatformName(platform) {
				const names = {
					wechat: '微信',
					qq: 'QQ',
					alipay: '支付宝',
					weibo: '微博',
					dingtalk: '钉钉',
					baidu: '百度'
				}
				return names[platform] || platform
			},
			
			// 返回上一页
			goBack() {
				uni.navigateBack({
					success: () => {
						// 发送取消登录事件
						uni.$emit('oauthLoginResult', {
							success: false,
							message: '用户取消登录'
						})
					}
				})
			},
			
			// WebView加载完成
			handleLoad(event) {
				console.log('WebView加载完成:', event)
				this.loading = false
				
				// 检查是否是回调URL
				this.checkCallbackUrl(event.detail.src)
			},
			
			// WebView加载错误
			handleError(event) {
				console.error('WebView加载错误:', event)
				this.loading = false
				this.error = '授权页面加载失败，请检查网络连接'
			},
			
			// 处理WebView消息
			handleMessage(event) {
				console.log('WebView消息:', event)
				// 处理来自WebView的消息
			},
			
			// 开始监控URL变化
			startUrlMonitoring() {
				this.urlCheckTimer = setInterval(() => {
					// 这里可以添加URL监控逻辑
					// 由于uni-app的限制，主要通过handleLoad来检测URL变化
				}, 1000)
			},
			
			// 检查是否是回调URL
			async checkCallbackUrl(url) {
				if (!url) return
				
				console.log('检查URL:', url)
				
				// 检查是否包含回调域名
				if (url.includes('localhost:3000/wxy/auth/shuidi-callback')) {
					try {
						// 提取code和state参数
						const urlObj = new URL(url)
						const code = urlObj.searchParams.get('code')
						const state = urlObj.searchParams.get('state')
						const error = urlObj.searchParams.get('error')
						
						if (error) {
							throw new Error(urlObj.searchParams.get('error_description') || '授权失败')
						}
						
						if (code && state) {
							console.log('获到授权码:', { code, state })
							await this.handleAuthCallback(code, state)
						}
					} catch (error) {
						console.error('处理回调URL失败:', error)
						this.handleLoginError(error.message)
					}
				}
			},
			
			// 处理授权回调
			async handleAuthCallback(code, state) {
				try {
					uni.showLoading({
						title: '登录中...'
					})
					
					// 调用水滴聚合登录处理
					const result = await shuidiLogin.handleCallback(code, state)
					
					// 保存登录信息
					uni.setStorageSync('token', result.token)
					uni.setStorageSync('userInfo', result.userInfo)
					
					// 发送成功事件
					uni.$emit('oauthLoginResult', {
						success: true,
						data: result,
						message: `${this.platformName}登录成功`
					})
					
					// 显示成功提示
					uni.showToast({
						title: `${this.platformName}登录成功`,
						icon: 'success'
					})
					
					// 延迟跳转
					setTimeout(() => {
						uni.switchTab({
							url: '/pages/home/home'
						})
					}, 1500)
					
				} catch (error) {
					console.error('授权回调处理失败:', error)
					this.handleLoginError(error.message)
				} finally {
					uni.hideLoading()
				}
			},
			
			// 处理登录错误
			handleLoginError(message) {
				// 发送失败事件
				uni.$emit('oauthLoginResult', {
					success: false,
					message: message || '登录失败'
				})
				
				// 显示错误提示
				uni.showToast({
					title: message || '登录失败',
					icon: 'none'
				})
				
				// 延迟返回
				setTimeout(() => {
					uni.navigateBack()
				}, 2000)
			},
			
			// 重试
			retry() {
				this.error = ''
				this.loading = true
				// 重新加载页面
				this.$forceUpdate()
			}
		}
	}
</script>

<style scoped>
	.oauth-container {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
	}
	
	/* 顶部导航 */
	.oauth-header {
		height: 88rpx;
		background: #f8f9fa;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 24rpx;
		border-bottom: 1rpx solid #e1e8ed;
	}
	
	.header-left {
		display: flex;
		align-items: center;
		cursor: pointer;
	}
	
	.back-icon {
		font-size: 36rpx;
		color: #667eea;
		margin-right: 8rpx;
	}
	
	.back-text {
		font-size: 28rpx;
		color: #667eea;
	}
	
	.header-title {
		flex: 1;
		text-align: center;
	}
	
	.header-title text {
		font-size: 32rpx;
		font-weight: 500;
		color: #2c3e50;
	}
	
	.header-right {
		width: 120rpx;
	}
	
	/* WebView容器 */
	web-view {
		flex: 1;
		width: 100%;
	}
	
	/* 加载状态 */
	.loading-container {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.loading-spinner {
		width: 80rpx;
		height: 80rpx;
		border: 6rpx solid rgba(102, 126, 234, 0.2);
		border-top: 6rpx solid #667eea;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 24rpx;
	}
	
	.loading-text {
		font-size: 28rpx;
		color: #7f8c8d;
	}
	
	/* 错误状态 */
	.error-container {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40rpx;
	}
	
	.error-icon {
		font-size: 80rpx;
		margin-bottom: 24rpx;
	}
	
	.error-message {
		font-size: 28rpx;
		color: #e74c3c;
		text-align: center;
		margin-bottom: 40rpx;
		line-height: 1.6;
	}
	
	.retry-btn {
		width: 200rpx;
		height: 72rpx;
		background: #667eea;
		color: white;
		border: none;
		border-radius: 36rpx;
		font-size: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
</style> 