<template>
	<view class="sms-login-container">
		<!-- 背景装饰 -->
		<view class="bg-decoration">
			<view class="circle circle-1"></view>
			<view class="circle circle-2"></view>
			<view class="circle circle-3"></view>
		</view>
		
		<!-- 短信登录卡片 -->
		<view class="login-card">
			<!-- 头部 -->
			<view class="header-section">
				<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
				<text class="title">短信登录</text>
				<text class="subtitle">安全便捷，无需记住密码</text>
			</view>
			
			<!-- 登录表单 -->
			<view class="form-section">
				<!-- 手机号输入 -->
				<view class="input-group">
					<view class="input-label">
						<text class="icon">📱</text>
						<text>手机号</text>
					</view>
					<input 
						class="input-field"
						type="number"
						placeholder="请输入手机号"
						v-model="phone"
						:class="{ 'input-error': phoneError }"
						maxlength="11"
						@blur="validatePhone"
						@input="onPhoneInput"
					/>
					<text v-if="phoneError" class="error-text">{{ phoneError }}</text>
				</view>
				
				<!-- 验证码输入 -->
				<view class="input-group">
					<view class="input-label">
						<text class="icon">💬</text>
						<text>验证码</text>
					</view>
					<view class="verify-code-wrapper">
						<input 
							class="input-field verify-input"
							type="number"
							placeholder="请输入验证码"
							v-model="verifyCode"
							:class="{ 'input-error': codeError }"
							maxlength="4"
							@blur="validateCode"
							@input="onCodeInput"
						/>
						<button 
							class="send-code-btn"
							:class="{ 'btn-disabled': !canSendCode || sendLoading }"
							:disabled="!canSendCode || sendLoading"
							@click="sendVerifyCode"
						>
							<text v-if="sendLoading">发送中...</text>
							<text v-else-if="countdown > 0">{{ countdown }}s</text>
							<text v-else>获取验证码</text>
						</button>
					</view>
					<text v-if="codeError" class="error-text">{{ codeError }}</text>
				</view>
				
				<!-- 登录按钮 -->
				<button 
					class="login-btn"
					:class="{ 'btn-disabled': !isFormValid || loginLoading }"
					:disabled="!isFormValid || loginLoading"
					@click="handleSmsLogin"
				>
					<text v-if="loginLoading">登录中...</text>
					<text v-else>立即登录</text>
				</button>
				
				<!-- 返回普通登录 -->
				<view class="back-section">
					<text class="back-link" @click="goBackToLogin">返回密码登录</text>
				</view>
			</view>
			
			<!-- 用户协议提示 -->
			<view class="agreement-tip">
				<text class="tip-text">登录即表示同意</text>
				<text class="agreement-link" @click="showUserAgreement">《用户协议》</text>
				<text class="tip-text">和</text>
				<text class="agreement-link" @click="showPrivacyPolicy">《隐私政策》</text>
			</view>
		</view>
		
		<!-- 加载遮罩 -->
		<view v-if="sendLoading || loginLoading" class="loading-overlay">
			<view class="loading-spinner"></view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 表单数据
				phone: '',
				verifyCode: '',
				
				// 错误信息
				phoneError: '',
				codeError: '',
				
				// 状态控制
				sendLoading: false,
				loginLoading: false,
				countdown: 0,
				countdownTimer: null
			}
		},
		
		computed: {
			// 是否可以发送验证码
			canSendCode() {
				return this.phone && 
					   !this.phoneError && 
					   this.countdown === 0
			},
			
			// 表单是否有效
			isFormValid() {
				return this.phone && 
					   this.verifyCode && 
					   !this.phoneError && 
					   !this.codeError
			}
		},
		
		// 页面卸载时清除定时器
		onUnload() {
			this.clearCountdownTimer()
		},
		
		methods: {
			// 验证手机号
			validatePhone() {
				const phone = this.phone.trim()
				if (!phone) {
					this.phoneError = '请输入手机号'
				} else if (!/^1[3-9]\d{9}$/.test(phone)) {
					this.phoneError = '请输入正确的手机号格式'
				} else {
					this.phoneError = ''
				}
			},
			
			// 验证验证码
			validateCode() {
				const code = this.verifyCode.trim()
				if (!code) {
					this.codeError = '请输入验证码'
				} else if (!/^\d{4}$/.test(code)) {
					this.codeError = '请输入4位数字验证码'
				} else {
					this.codeError = ''
				}
			},
			
			// 手机号输入事件
			onPhoneInput() {
				this.phoneError = ''
			},
			
			// 验证码输入事件
			onCodeInput() {
				this.codeError = ''
			},
			
			// 发送验证码
			async sendVerifyCode() {
				// 验证手机号
				this.validatePhone()
				
				if (this.phoneError) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					})
					return
				}
				
				this.sendLoading = true
				
				try {
					// {{ AURA-X: Add - 调用后端发送短信登录验证码API. }}
					const response = await uni.request({
						url: 'http://localhost:3000/wxy/auth/send-login-code',
						method: 'POST',
						data: {
							phone: this.phone.trim()
						},
						header: {
							'Content-Type': 'application/json'
						},
						timeout: 10000
					})

					// 检查响应
					if (response.statusCode === 200 && response.data && response.data.code === 200) {
						// 成功处理
						console.log('✅ 短信登录验证码发送成功:', response.data)
						
						// 开始倒计时
						this.startCountdown()
						
						uni.showToast({
							title: '验证码发送成功',
							icon: 'success'
						})
					} else {
						throw new Error(response.data?.message || '发送验证码失败')
					}
					
				} catch (error) {
					console.error('发送验证码失败:', error)
					let errorMessage = '发送验证码失败'
					
					if (error.message) {
						errorMessage = error.message
					}
					
					// 如果是未注册的提示，引导用户去注册
					if (errorMessage.includes('未注册')) {
						uni.showModal({
							title: '手机号未注册',
							content: '该手机号尚未注册，是否前往注册页面？',
							confirmText: '去注册',
							cancelText: '取消',
							success: (res) => {
								if (res.confirm) {
									// 跳转到注册页面（切换到注册模式）
									uni.navigateBack({
										success: () => {
											// 通过事件或其他方式通知主页面切换到注册模式
											// 这里可以使用 uni.$emit 或者直接跳转
										}
									})
								}
							}
						})
					} else {
						uni.showToast({
							title: errorMessage,
							icon: 'none',
							duration: 3000
						})
					}
				} finally {
					this.sendLoading = false
				}
			},
			
			// 处理短信登录
			async handleSmsLogin() {
				// 表单验证
				this.validatePhone()
				this.validateCode()
				
				if (!this.isFormValid) {
					uni.showToast({
						title: '请检查输入信息',
						icon: 'none'
					})
					return
				}
				
				this.loginLoading = true
				
				try {
					// {{ AURA-X: Add - 调用后端短信登录API. }}
					const result = await uni.request({
						url: 'http://localhost:3000/wxy/auth/sms-login',
						method: 'POST',
						data: {
							phone: this.phone.trim(),
							verifyCode: this.verifyCode.trim()
						},
						header: {
							'Content-Type': 'application/json'
						},
						timeout: 10000
					})
					
					// 检查响应并提取数据
					if (result.statusCode === 200 && result.data && result.data.code === 200) {
						const response = result.data.data || {}
						console.log('✅ 短信登录成功:', result.data)
						
						// 登录成功处理
						if (response && response.token) {
							// 保存token和用户信息
							uni.setStorageSync('token', response.token)
							uni.setStorageSync('userInfo', {
								phone: this.phone,
								loginType: 'sms'
							})
							
							// 显示成功提示
							uni.showToast({
								title: '登录成功',
								icon: 'success'
							})
							
							// 延迟跳转到首页
							setTimeout(() => {
								uni.switchTab({
									url: '/pages/home/home'
								})
							}, 1500)
						}
					} else {
						throw new Error(result.data?.message || '登录失败')
					}
					
				} catch (error) {
					console.error('短信登录失败:', error)
					let errorMessage = '登录失败，请重试'
					
					if (error.message) {
						errorMessage = error.message
					}
					
					uni.showToast({
						title: errorMessage,
						icon: 'none',
						duration: 3000
					})
				} finally {
					this.loginLoading = false
				}
			},
			
			// 开始验证码倒计时
			startCountdown() {
				this.countdown = 60
				this.countdownTimer = setInterval(() => {
					this.countdown--
					if (this.countdown <= 0) {
						this.clearCountdownTimer()
					}
				}, 1000)
			},
			
			// 清除倒计时定时器
			clearCountdownTimer() {
				if (this.countdownTimer) {
					clearInterval(this.countdownTimer)
					this.countdownTimer = null
					this.countdown = 0
				}
			},
			
			// 返回普通登录
			goBackToLogin() {
				uni.navigateBack({
					delta: 1
				})
			},
			
			// 显示用户协议
			showUserAgreement() {
				uni.showModal({
					title: '用户协议',
					content: '这里是用户协议内容...',
					showCancel: false,
					confirmText: '知道了'
				})
			},
			
			// 显示隐私政策
			showPrivacyPolicy() {
				uni.showModal({
					title: '隐私政策',
					content: '这里是隐私政策内容...',
					showCancel: false,
					confirmText: '知道了'
				})
			}
		}
	}
</script>

<style scoped>
	/* 主容器样式 */
	.sms-login-container {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40rpx;
		position: relative;
		overflow: hidden;
	}
	
	/* 背景装饰 */
	.bg-decoration {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
	
	.circle {
		position: absolute;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.1);
		animation: float 6s ease-in-out infinite;
	}
	
	.circle-1 {
		width: 300rpx;
		height: 300rpx;
		top: 10%;
		left: -10%;
		animation-delay: 0s;
	}
	
	.circle-2 {
		width: 200rpx;
		height: 200rpx;
		top: 70%;
		right: -5%;
		animation-delay: 2s;
	}
	
	.circle-3 {
		width: 150rpx;
		height: 150rpx;
		top: 30%;
		right: 20%;
		animation-delay: 4s;
	}
	
	@keyframes float {
		0%, 100% { transform: translateY(0px) rotate(0deg); }
		50% { transform: translateY(-20px) rotate(180deg); }
	}
	
	/* 登录卡片 */
	.login-card {
		width: 100%;
		max-width: 540rpx;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20rpx);
		border-radius: 24rpx;
		padding: 60rpx 40rpx;
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.1);
		position: relative;
		z-index: 2;
	}
	
	/* 头部区域 */
	.header-section {
		text-align: center;
		margin-bottom: 40rpx;
	}
	
	.logo {
		width: 100rpx;
		height: 100rpx;
		margin-bottom: 20rpx;
	}
	
	.title {
		display: block;
		font-size: 44rpx;
		font-weight: bold;
		color: #2c3e50;
		margin-bottom: 8rpx;
	}
	
	.subtitle {
		display: block;
		font-size: 26rpx;
		color: #7f8c8d;
	}
	
	/* 表单区域 */
	.form-section {
		width: 100%;
	}
	
	.input-group {
		margin-bottom: 32rpx;
	}
	
	.input-label {
		display: flex;
		align-items: center;
		margin-bottom: 12rpx;
		font-size: 28rpx;
		color: #2c3e50;
		font-weight: 500;
	}
	
	.input-label .icon {
		margin-right: 12rpx;
		font-size: 32rpx;
	}
	
	.input-field {
		width: 100%;
		height: 88rpx;
		padding: 0 24rpx;
		border: 2rpx solid #e1e8ed;
		border-radius: 12rpx;
		font-size: 30rpx;
		background: #fff;
		transition: all 0.3s ease;
		box-sizing: border-box;
	}
	
	.input-field:focus {
		border-color: #667eea;
		box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
	}
	
	.input-error {
		border-color: #e74c3c !important;
		box-shadow: 0 0 0 4rpx rgba(231, 76, 60, 0.1) !important;
	}
	
	.verify-code-wrapper {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}
	
	.verify-input {
		flex: 1;
	}
	
	.send-code-btn {
		width: 180rpx;
		height: 88rpx;
		background: #667eea;
		color: white;
		border: none;
		border-radius: 12rpx;
		font-size: 24rpx;
		font-weight: 500;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.send-code-btn.btn-disabled {
		background: #bdc3c7;
		cursor: not-allowed;
	}
	
	.error-text {
		display: block;
		font-size: 24rpx;
		color: #e74c3c;
		margin-top: 8rpx;
	}
	
	/* 登录按钮 */
	.login-btn {
		width: 100%;
		height: 88rpx;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 12rpx;
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 30rpx;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.login-btn:not(.btn-disabled):active {
		transform: translateY(2rpx);
		box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.3);
	}
	
	.btn-disabled {
		background: #bdc3c7 !important;
		cursor: not-allowed;
	}
	
	/* 返回登录 */
	.back-section {
		text-align: center;
		margin-bottom: 30rpx;
	}
	
	.back-link {
		font-size: 28rpx;
		color: #667eea;
		cursor: pointer;
	}
	
	/* 用户协议提示 */
	.agreement-tip {
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
	}
	
	.tip-text {
		font-size: 24rpx;
		color: #7f8c8d;
		margin-right: 8rpx;
	}
	
	.agreement-link {
		font-size: 24rpx;
		color: #667eea;
		cursor: pointer;
		margin-right: 8rpx;
	}
	
	/* 加载遮罩 */
	.loading-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
	}
	
	.loading-spinner {
		width: 80rpx;
		height: 80rpx;
		border: 6rpx solid rgba(255, 255, 255, 0.3);
		border-top: 6rpx solid #fff;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
</style> 