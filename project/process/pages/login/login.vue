<template>
	<view class="auth-container">
		<!-- 背景装饰 -->
		<view class="bg-decoration">
			<view class="circle circle-1"></view>
			<view class="circle circle-2"></view>
			<view class="circle circle-3"></view>
		</view>
		
		<!-- 认证卡片 -->
		<view class="auth-card">
			<!-- 头部Logo和标题 -->
			<view class="header-section">
				<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
				<text class="app-title">{{ isLoginMode ? '欢迎登录' : '用户注册' }}</text>
				<text class="app-subtitle">{{ isLoginMode ? '请输入您的账号信息' : '请填写注册信息' }}</text>
			</view>
			
			<!-- 模式切换标签 -->
			<view class="mode-tabs">
				<view 
					class="tab-item" 
					:class="{ 'active': isLoginMode }"
					@click="switchMode(true)"
				>
					<text class="tab-text">登录</text>
				</view>
				<view 
					class="tab-item" 
					:class="{ 'active': !isLoginMode }"
					@click="switchMode(false)"
				>
					<text class="tab-text">注册</text>
				</view>
			</view>
			
			<!-- 登录表单 -->
			<view v-if="isLoginMode" class="form-section">
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
						v-model="loginForm.phone"
						:class="{ 'input-error': loginErrors.phone }"
						maxlength="11"
						@blur="validateLoginPhone"
						@input="onLoginPhoneInput"
					/>
					<text v-if="loginErrors.phone" class="error-text">{{ loginErrors.phone }}</text>
				</view>
				
				<!-- 密码输入 -->
				<view class="input-group">
					<view class="input-label">
						<text class="icon">🔒</text>
						<text>密码</text>
					</view>
					<view class="password-wrapper">
						<input 
							class="input-field"
							:type="showLoginPassword ? 'text' : 'password'"
							placeholder="请输入密码"
							v-model="loginForm.password"
							:class="{ 'input-error': loginErrors.password }"
							@blur="validateLoginPassword"
							@input="onLoginPasswordInput"
						/>
						<text 
							class="password-toggle"
							@click="toggleLoginPassword"
						>
							{{ showLoginPassword ? '👁️' : '👁️‍🗨️' }}
						</text>
					</view>
					<text v-if="loginErrors.password" class="error-text">{{ loginErrors.password }}</text>
				</view>
				
				<!-- 记住密码和忘记密码 -->
				<view class="options-row">
					<view class="remember-section" @click="toggleRemember">
						<text class="checkbox" :class="{ 'checked': rememberPassword }">
							{{ rememberPassword ? '☑️' : '☐' }}
						</text>
						<text class="option-text">记住密码</text>
					</view>
					<text class="forgot-password" @click="handleForgotPassword">忘记密码？</text>
				</view>
				
				<!-- 登录按钮 -->
				<button 
					class="auth-btn"
					:class="{ 'btn-disabled': !isLoginFormValid || loginLoading }"
					:disabled="!isLoginFormValid || loginLoading"
					@click="handleLogin"
				>
					<text v-if="loginLoading">登录中...</text>
					<text v-else>登录</text>
				</button>
			</view>
			
			<!-- 注册表单 -->
			<view v-else class="form-section">
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
						v-model="registerForm.phone"
						:class="{ 'input-error': registerErrors.phone }"
						maxlength="11"
						@blur="validateRegisterPhone"
					/>
					<text v-if="registerErrors.phone" class="error-text">{{ registerErrors.phone }}</text>
				</view>
				
				
				<!-- 密码输入 -->
				<view class="input-group">
					<view class="input-label">
						<text class="icon">🔒</text>
						<text>设置密码</text>
					</view>
					<view class="password-wrapper">
						<input 
							class="input-field"
							:type="showRegisterPassword ? 'text' : 'password'"
							placeholder="请设置6-20位密码"
							v-model="registerForm.password"
							:class="{ 'input-error': registerErrors.password }"
							@blur="validateRegisterPassword"
						/>
						<text 
							class="password-toggle"
							@click="toggleRegisterPassword"
						>
							{{ showRegisterPassword ? '👁️' : '👁️‍🗨️' }}
						</text>
					</view>
					<text v-if="registerErrors.password" class="error-text">{{ registerErrors.password }}</text>
				</view>
				
				<!-- 确认密码输入 -->
				<view class="input-group">
					<view class="input-label">
						<text class="icon">🔐</text>
						<text>确认密码</text>
					</view>
					<view class="password-wrapper">
						<input 
							class="input-field"
							:type="showConfirmPassword ? 'text' : 'password'"
							placeholder="请再次输入密码"
							v-model="registerForm.confirmPassword"
							:class="{ 'input-error': registerErrors.confirmPassword }"
							@blur="validateConfirmPassword"
						/>
						<text 
							class="password-toggle"
							@click="toggleConfirmPassword"
						>
							{{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
						</text>
					</view>
					<text v-if="registerErrors.confirmPassword" class="error-text">{{ registerErrors.confirmPassword }}</text>
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
							v-model="registerForm.verifyCode"
							:class="{ 'input-error': registerErrors.verifyCode }"
							maxlength="4"
							@blur="validateVerifyCode"
						/>
						<button 
							class="send-code-btn"
							:class="{ 'btn-disabled': !canSendCode || sendCodeLoading }"
							:disabled="!canSendCode || sendCodeLoading"
							@click="sendVerifyCode"
						>
							<text v-if="sendCodeLoading">发送中...</text>
							<text v-else-if="codeCountdown > 0">{{ codeCountdown }}s</text>
							<text v-else>获取验证码</text>
						</button>
					</view>
					<text v-if="registerErrors.verifyCode" class="error-text">{{ registerErrors.verifyCode }}</text>
				</view>
				
				<!-- 用户协议 -->
				<view class="agreement-row">
					<view class="agreement-section" @click="toggleAgreement">
						<text class="checkbox" :class="{ 'checked': agreeToTerms }">
							{{ agreeToTerms ? '☑️' : '☐' }}
						</text>
						<text class="agreement-text">我已阅读并同意</text>
						<text class="agreement-link" @click.stop="showUserAgreement">《用户协议》</text>
						<text class="agreement-text">和</text>
						<text class="agreement-link" @click.stop="showPrivacyPolicy">《隐私政策》</text>
					</view>
				</view>
				
				<!-- 注册按钮 -->
				<button 
					class="auth-btn"
					:class="{ 'btn-disabled': !isRegisterFormValid || registerLoading }"
					:disabled="!isRegisterFormValid || registerLoading"
					@click="handleRegister"
				>
					<text v-if="registerLoading">注册中...</text>
					<text v-else>立即注册</text>
				</button>
			</view>
			
			<!-- 快捷登录选项 -->
			<view v-if="isLoginMode" class="quick-login">
				<view class="divider">
					<text class="divider-text">其他登录方式</text>
				</view>
				<view class="quick-login-options">
					<view class="quick-option" @click="handleSMSLogin">
						<text class="quick-icon">📱</text>
						<text class="quick-text">短信登录</text>
					</view>
					<view class="quick-option" @click="handleWechatLogin">
						<text class="quick-icon">💬</text>
						<text class="quick-text">微信登录</text>
					</view>
					<view class="quick-option" @click="handleQQLogin">
						<text class="quick-icon">🐧</text>
						<text class="quick-text">QQ登录</text>
					</view>
				</view>
				
				<!-- 更多第三方登录 -->
				<view class="more-login-options">
					<view class="quick-option" @click="handleAlipayLogin">
						<text class="quick-icon">💰</text>
						<text class="quick-text">支付宝</text>
					</view>
					<view class="quick-option" @click="handleWeiboLogin">
						<text class="quick-icon">📱</text>
						<text class="quick-text">微博</text>
					</view>
					<view class="quick-option" @click="handleAppleLogin">
						<text class="quick-icon">🍎</text>
						<text class="quick-text">Apple</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 加载遮罩 -->
		<view v-if="loginLoading || registerLoading || sendCodeLoading" class="loading-overlay">
			<view class="loading-spinner"></view>
		</view>
	</view>
</template>

<script>
	import request from '@/utils/request.js'
	
	export default {
		data() {
			return {
				// 界面状态
				isLoginMode: true, // true: 登录模式, false: 注册模式
				
				// 登录表单数据
				loginForm: {
					phone: '',
					password: ''
				},
				
				// 注册表单数据
				registerForm: {
					phone: '',
					verifyCode: '',
					password: '',
					confirmPassword: ''
				},
				
				// 登录表单验证错误
				loginErrors: {
					phone: '',
					password: ''
				},
				
				// 注册表单验证错误
				registerErrors: {
					phone: '',
					verifyCode: '',
					password: '',
					confirmPassword: ''
				},
				
				// 界面状态
				showLoginPassword: false,
				showRegisterPassword: false,
				showConfirmPassword: false,
				rememberPassword: false,
				agreeToTerms: false,
				
				// 加载状态
				loginLoading: false,
				registerLoading: false,
				sendCodeLoading: false,
				
				// 验证码相关
				codeCountdown: 0,
				countdownTimer: null
			}
		},
		
		computed: {
			// 登录表单是否有效
			isLoginFormValid() {
				const isValid = this.loginForm.phone && 
					   this.loginForm.password && 
					   !this.loginErrors.phone && 
					   !this.loginErrors.password
				
				// {{ AURA-X: Add - 添加调试日志查看表单验证状态. }}
				console.log('🔍 [登录表单验证] 状态检查:', {
					phone: this.loginForm.phone,
					password: this.loginForm.password ? '***' : '',
					phoneError: this.loginErrors.phone,
					passwordError: this.loginErrors.password,
					isValid: isValid
				})
				
				return isValid
			},
			
			// 注册表单是否有效
			isRegisterFormValid() {
				return this.registerForm.phone && 
					   this.registerForm.verifyCode && 
					   this.registerForm.password && 
					   this.registerForm.confirmPassword &&
					   !this.registerErrors.phone && 
					   !this.registerErrors.verifyCode && 
					   !this.registerErrors.password && 
					   !this.registerErrors.confirmPassword &&
					   this.agreeToTerms
			},
			
			// 是否可以发送验证码
			canSendCode() {
				return this.registerForm.phone && 
					   !this.registerErrors.phone && 
					   this.codeCountdown === 0
			}
		},
		
		// 页面加载时恢复记住的账号信息
		onLoad() {
			this.loadRememberedAccount()
		},
		
		// 页面卸载时清除定时器
		onUnload() {
			this.clearCountdownTimer()
		},
		
		methods: {
			// 切换登录/注册模式
			switchMode(isLogin) {
				this.isLoginMode = isLogin
				this.clearAllErrors()
				
				// 切换到注册模式时，如果登录表单有手机号，复制到注册表单
				if (!isLogin && this.loginForm.phone && !this.registerForm.phone) {
					this.registerForm.phone = this.loginForm.phone
				}
			},
			
			// 清除所有错误信息
			clearAllErrors() {
				this.loginErrors = { phone: '', password: '' }
				this.registerErrors = { phone: '', verifyCode: '', password: '', confirmPassword: '' }
			},
			
			// === 登录相关方法 ===
			
			// 验证登录手机号
			validateLoginPhone() {
				const phone = this.loginForm.phone.trim()
				if (!phone) {
					this.loginErrors.phone = '请输入手机号'
				} else if (!/^1[3-9]\d{9}$/.test(phone)) {
					this.loginErrors.phone = '请输入正确的手机号格式'
				} else {
					this.loginErrors.phone = ''
				}
			},
			
			// 验证登录密码
			validateLoginPassword() {
				const password = this.loginForm.password.trim()
				if (!password) {
					this.loginErrors.password = '请输入密码'
				} else {
					this.loginErrors.password = ''
				}
			},
			
			// 切换登录密码可见性
			toggleLoginPassword() {
				this.showLoginPassword = !this.showLoginPassword
			},
			
			// 登录手机号输入事件
			onLoginPhoneInput() {
				// 实时清除错误状态
				if (this.loginErrors.phone) {
					this.loginErrors.phone = ''
				}
			},
			
			// 登录密码输入事件
			onLoginPasswordInput() {
				// 实时清除错误状态
				if (this.loginErrors.password) {
					this.loginErrors.password = ''
				}
			},
			
			// 切换记住密码
			toggleRemember() {
				this.rememberPassword = !this.rememberPassword
			},
			
			// 加载记住的账号信息
			loadRememberedAccount() {
				try {
					const rememberedAccount = uni.getStorageSync('rememberedAccount')
					if (rememberedAccount) {
						this.loginForm.phone = rememberedAccount.phone || ''
						this.loginForm.password = rememberedAccount.password || ''
						this.rememberPassword = true
					}
				} catch (error) {
					console.error('加载记住的账号失败:', error)
				}
			},
			
			// 保存账号信息
			saveAccountIfRemember() {
				try {
					if (this.rememberPassword) {
						uni.setStorageSync('rememberedAccount', {
							phone: this.loginForm.phone,
							password: this.loginForm.password
						})
					} else {
						uni.removeStorageSync('rememberedAccount')
					}
				} catch (error) {
					console.error('保存账号信息失败:', error)
				}
			},
			
			// 处理登录
			async handleLogin() {
				// 表单验证
				this.validateLoginPhone()
				this.validateLoginPassword()
				
				if (!this.isLoginFormValid) {
					uni.showToast({
						title: '请检查输入信息',
						icon: 'none'
					})
					return
				}
				
				this.loginLoading = true
				
				try {
					// {{ AURA-X: Modify - 强制使用完整的后端URL登录API. }}
					const result = await uni.request({
						url: 'http://localhost:3000/wxy/auth/login',
						method: 'POST',
						data: {
							phone: this.loginForm.phone.trim(),
							password: this.loginForm.password.trim()
						},
						header: {
							'Content-Type': 'application/json'
						},
						timeout: 10000
					})
					
					// 检查响应并提取数据
					if (result.statusCode === 200 && result.data && result.data.code === 200) {
						const response = result.data.data || {}
						console.log('✅ 登录成功:', result.data)
						
						// 登录成功处理
						if (response && response.token) {
							// 保存token和用户信息
							uni.setStorageSync('token', response.token)
							uni.setStorageSync('userInfo', {
								phone: this.loginForm.phone
							})
							
							// 保存账号信息（如果选择记住密码）
							this.saveAccountIfRemember()
							
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
					console.error('登录失败:', error)
					let errorMessage = '登录失败，请重试'
					
					// 根据错误类型显示不同提示
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
			
			// === 注册相关方法 ===
			
			// 验证注册手机号
			validateRegisterPhone() {
				const phone = this.registerForm.phone.trim()
				if (!phone) {
					this.registerErrors.phone = '请输入手机号'
				} else if (!/^1[3-9]\d{9}$/.test(phone)) {
					this.registerErrors.phone = '请输入正确的手机号格式'
				} else {
					this.registerErrors.phone = ''
				}
			},
			
			// 验证验证码
			validateVerifyCode() {
				const code = this.registerForm.verifyCode.trim()
				if (!code) {
					this.registerErrors.verifyCode = '请输入验证码'
				} else if (!/^\d{4}$/.test(code)) {
					this.registerErrors.verifyCode = '请输入4位数字验证码'
				} else {
					this.registerErrors.verifyCode = ''
				}
			},
			
			// 验证注册密码
			validateRegisterPassword() {
				const password = this.registerForm.password.trim()
				if (!password) {
					this.registerErrors.password = '请输入密码'
				} else if (password.length < 6 || password.length > 20) {
					this.registerErrors.password = '密码长度应在6-20位之间'
				} else {
					this.registerErrors.password = ''
				}
				
				// 如果确认密码已输入，重新验证确认密码
				if (this.registerForm.confirmPassword) {
					this.validateConfirmPassword()
				}
			},
			
			// 验证确认密码
			validateConfirmPassword() {
				const confirmPassword = this.registerForm.confirmPassword.trim()
				const password = this.registerForm.password.trim()
				
				if (!confirmPassword) {
					this.registerErrors.confirmPassword = '请再次输入密码'
				} else if (confirmPassword !== password) {
					this.registerErrors.confirmPassword = '两次输入的密码不一致'
				} else {
					this.registerErrors.confirmPassword = ''
				}
			},
			
			// 切换注册密码可见性
			toggleRegisterPassword() {
				this.showRegisterPassword = !this.showRegisterPassword
			},
			
			// 切换确认密码可见性
			toggleConfirmPassword() {
				this.showConfirmPassword = !this.showConfirmPassword
			},
			
			// 切换用户协议同意状态
			toggleAgreement() {
				this.agreeToTerms = !this.agreeToTerms
			},
			
			// 发送验证码
			async sendVerifyCode() {
				// 验证手机号
				this.validateRegisterPhone()
				
				if (this.registerErrors.phone) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					})
					return
				}
				
				this.sendCodeLoading = true
				
				try {
					const response = await uni.request({
						url: 'http://localhost:3000/wxy/auth/send-code',
						method: 'POST',
						data: {
							phone: this.registerForm.phone.trim()
						},
						header: {
							'Content-Type': 'application/json'
						},
						timeout: 10000
					})

					// 检查响应
					if (response.statusCode === 200 && response.data && response.data.code === 200) {
						// 成功处理
						console.log('✅ 验证码发送成功:', response.data)
					} else {
						throw new Error(response.data?.message || '发送验证码失败')
					}
					
					// 开始倒计时
					this.startCountdown()
					
					uni.showToast({
						title: '验证码发送成功',
						icon: 'success'
					})
					
				} catch (error) {
					console.error('发送验证码失败:', error)
					let errorMessage = '发送验证码失败'
					
					if (error.message) {
						errorMessage = error.message
					}
					
					uni.showToast({
						title: errorMessage,
						icon: 'none',
						duration: 3000
					})
				} finally {
					this.sendCodeLoading = false
				}
			},
			
			// 开始验证码倒计时
			startCountdown() {
				this.codeCountdown = 60
				this.countdownTimer = setInterval(() => {
					this.codeCountdown--
					if (this.codeCountdown <= 0) {
						this.clearCountdownTimer()
					}
				}, 1000)
			},
			
			// 清除倒计时定时器
			clearCountdownTimer() {
				if (this.countdownTimer) {
					clearInterval(this.countdownTimer)
					this.countdownTimer = null
					this.codeCountdown = 0
				}
			},
			
			// 处理注册
			async handleRegister() {
				// 表单验证
				this.validateRegisterPhone()
				this.validateVerifyCode()
				this.validateRegisterPassword()
				this.validateConfirmPassword()
				
				if (!this.isRegisterFormValid) {
					uni.showToast({
						title: '请检查输入信息',
						icon: 'none'
					})
					return
				}
				
				if (!this.agreeToTerms) {
					uni.showToast({
						title: '请同意用户协议和隐私政策',
						icon: 'none'
					})
					return
				}
				
				this.registerLoading = true
				
				try {
					// {{ AURA-X: Modify - 强制使用完整的后端URL注册API，添加调试日志. }}
					const requestData = {
						phone: this.registerForm.phone.trim(),
						verifyCode: this.registerForm.verifyCode.trim(),
						password: this.registerForm.password.trim()
					};
					
					console.log('🔍 [前端调试] 准备发送注册请求:', requestData);
					console.log('🔍 [前端调试] 验证码类型:', typeof requestData.verifyCode);
					
					const result = await uni.request({
						url: 'http://localhost:3000/wxy/auth/register',
						method: 'POST',
						data: requestData,
						header: {
							'Content-Type': 'application/json'
						},
						timeout: 10000
					})
					
					// 检查响应
					if (result.statusCode === 200 && result.data && result.data.code === 200) {
						console.log('✅ 注册成功:', result.data)
					} else {
						throw new Error(result.data?.message || '注册失败')
					}
					
					// 注册成功处理
					uni.showToast({
						title: '注册成功',
						icon: 'success'
					})
					
					// 清空注册表单
					this.registerForm = {
						phone: '',
						verifyCode: '',
						password: '',
						confirmPassword: ''
					}
					this.clearAllErrors()
					this.agreeToTerms = false
					
					// 延迟切换到登录模式
					setTimeout(() => {
						this.isLoginMode = true
						// 将注册的手机号复制到登录表单
						this.loginForm.phone = this.registerForm.phone
					}, 1500)
					
				} catch (error) {
					console.error('注册失败:', error)
					let errorMessage = '注册失败，请重试'
					
					if (error.message) {
						errorMessage = error.message
					}
					
					uni.showToast({
						title: errorMessage,
						icon: 'none',
						duration: 3000
					})
				} finally {
					this.registerLoading = false
				}
			},
			
			// === 其他功能 ===
			
			// 处理忘记密码
			handleForgotPassword() {
				uni.showModal({
					title: '忘记密码',
					content: '请联系管理员重置密码，或重新注册账号',
					showCancel: true,
					cancelText: '取消',
					confirmText: '重新注册',
					success: (res) => {
						if (res.confirm) {
							this.isLoginMode = false
						}
					}
				})
			},
			
			// 处理微信登录
			handleWechatLogin() {
				this.handleShuidiLogin('wechat', '微信登录')
			},
			
			// 处理QQ登录
			handleQQLogin() {
				this.handleShuidiLogin('qq', 'QQ登录')
			},
			
			// 处理支付宝登录
			handleAlipayLogin() {
				this.handleShuidiLogin('alipay', '支付宝登录')
			},
			
			// 处理微博登录
			handleWeiboLogin() {
				this.handleShuidiLogin('weibo', '微博登录')
			},
			
			// 处理Apple登录
			handleAppleLogin() {
				uni.showToast({
					title: 'Apple登录暂不支持',
					icon: 'none'
				})
			},
			
			// 统一水滴聚合第三方登录处理
			handleShuidiLogin(platform, platformName) {
				uni.showModal({
					title: `${platformName}`,
					content: `使用水滴聚合服务进行${platformName}，安全快捷`,
					confirmText: '确认登录',
					cancelText: '取消',
					success: (res) => {
						if (res.confirm) {
							this.startShuidiLogin(platform, platformName)
						}
					}
				})
			},
			
			// 启动水滴聚合登录流程
			async startShuidiLogin(platform, platformName) {
				try {
					// 导入水滴聚合登录模块
					const { shuidiLogin, generateShuidiAuthUrl } = await import('@/config/shuidi-login.js')
					
					uni.showLoading({
						title: `正在启动${platformName}...`
					})
					
					// 生成授权URL
					const authUrl = generateShuidiAuthUrl(platform)
					console.log('🔗 水滴聚合授权URL:', authUrl)
					
					// 跳转到OAuth页面
					uni.navigateTo({
						url: `/pages/login/oauth-webview?url=${encodeURIComponent(authUrl)}&platform=${platform}`,
						success: () => {
							console.log(`🚀 启动水滴聚合${platformName}登录`)
						},
						fail: (error) => {
							console.error('跳转OAuth页面失败:', error)
							uni.showToast({
								title: '跳转授权页面失败',
								icon: 'none'
							})
						}
					})
					
				} catch (error) {
					console.error(`水滴聚合${platformName}启动失败:`, error)
					uni.showToast({
						title: error.message || `${platformName}启动失败`,
						icon: 'none'
					})
				} finally {
					uni.hideLoading()
				}
			},
			

			
			// 处理短信登录 - 跳转到短信登录页面
			handleSMSLogin() {
				uni.navigateTo({
					url: '/pages/login/sms-login'
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
	.auth-container {
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
	
	/* 认证卡片 */
	.auth-card {
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
	
	.app-title {
		display: block;
		font-size: 44rpx;
		font-weight: bold;
		color: #2c3e50;
		margin-bottom: 8rpx;
	}
	
	.app-subtitle {
		display: block;
		font-size: 26rpx;
		color: #7f8c8d;
	}
	
	/* 模式切换标签 */
	.mode-tabs {
		display: flex;
		background: #f8f9fa;
		border-radius: 12rpx;
		padding: 8rpx;
		margin-bottom: 40rpx;
	}
	
	.tab-item {
		flex: 1;
		text-align: center;
		padding: 20rpx;
		border-radius: 8rpx;
		cursor: pointer;
		transition: all 0.3s ease;
	}
	
	.tab-item.active {
		background: #667eea;
		box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
	}
	
	.tab-text {
		font-size: 28rpx;
		font-weight: 500;
		color: #5a6c7d;
	}
	
	.tab-item.active .tab-text {
		color: white;
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
	
	.password-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}
	
	.password-toggle {
		position: absolute;
		right: 24rpx;
		font-size: 32rpx;
		color: #7f8c8d;
		cursor: pointer;
		z-index: 10;
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
	
	/* 选项行 */
	.options-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 40rpx;
	}
	
	.remember-section {
		display: flex;
		align-items: center;
		cursor: pointer;
	}
	
	.checkbox {
		font-size: 32rpx;
		margin-right: 12rpx;
		color: #667eea;
	}
	
	.option-text {
		font-size: 28rpx;
		color: #5a6c7d;
	}
	
	.forgot-password {
		font-size: 28rpx;
		color: #667eea;
		cursor: pointer;
	}
	
	/* 用户协议 */
	.agreement-row {
		margin-bottom: 40rpx;
	}
	
	.agreement-section {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		cursor: pointer;
	}
	
	.agreement-text {
		font-size: 26rpx;
		color: #5a6c7d;
		margin-right: 8rpx;
	}
	
	.agreement-link {
		font-size: 26rpx;
		color: #667eea;
		cursor: pointer;
		margin-right: 8rpx;
	}
	
	/* 认证按钮 */
	.auth-btn {
		width: 100%;
		height: 88rpx;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 12rpx;
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 40rpx;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.auth-btn:not(.btn-disabled):active {
		transform: translateY(2rpx);
		box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.3);
	}
	
	.btn-disabled {
		background: #bdc3c7 !important;
		cursor: not-allowed;
	}
	
	/* 快捷登录 */
	.quick-login {
		margin-bottom: 20rpx;
	}
	
	.divider {
		text-align: center;
		margin-bottom: 32rpx;
		position: relative;
	}
	
	.divider::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 2rpx;
		background: #e1e8ed;
	}
	
	.divider-text {
		background: rgba(255, 255, 255, 0.95);
		color: #7f8c8d;
		font-size: 24rpx;
		padding: 0 24rpx;
		position: relative;
		z-index: 1;
	}
	
	.quick-login-options {
		display: flex;
		justify-content: space-around;
		margin-bottom: 20rpx;
	}
	
	.more-login-options {
		display: flex;
		justify-content: space-around;
	}
	
	.quick-option {
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
		padding: 20rpx;
		border-radius: 12rpx;
		transition: all 0.3s ease;
	}
	
	.quick-option:active {
		background: rgba(102, 126, 234, 0.1);
	}
	
	.quick-icon {
		font-size: 48rpx;
		margin-bottom: 8rpx;
	}
	
	.quick-text {
		font-size: 24rpx;
		color: #5a6c7d;
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
