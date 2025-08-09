<template>
	<view class="change-password-page">
		<HeaderNav
			title="修改密码"
			:showBack="true"
			rightText="确认"
			rightTextColor="#007AFF"
			@back="goBack"
			@rightClick="confirmChange"
		/>
		
		<view class="content" :style="{ paddingTop: navHeight + 'px' }">
			<view class="form-list">
				<view class="form-item">
					<view class="form-label">
						<text class="label-text">旧密码</text>
						<text class="required">*</text>
					</view>
					<input 
						class="form-input" 
						type="password" 
						placeholder="请输入" 
						v-model="oldPassword"
						placeholder-style="color: #999999;"
					/>
				</view>
				
				<view class="form-item">
					<view class="form-label">
						<text class="label-text">新密码</text>
						<text class="required">*</text>
					</view>
					<input 
						class="form-input" 
						type="password" 
						placeholder="请输入" 
						v-model="newPassword"
						placeholder-style="color: #999999;"
						@input="checkPasswordStrength"
					/>
				</view>
				
				<!-- 密码强度指示器 -->
				<view v-if="newPassword && passwordStrength" class="password-strength">
					<view class="strength-label">密码强度：</view>
					<view class="strength-indicator">
						<view 
							class="strength-bar" 
							:class="passwordStrength.strength"
						></view>
						<text class="strength-text" :class="passwordStrength.strength">
							{{ getStrengthText(passwordStrength.strength) }}
						</text>
					</view>
					<view v-if="passwordStrength.suggestions.length > 0" class="strength-suggestions">
						<text class="suggestion-title">建议：</text>
						<text class="suggestion-text">{{ passwordStrength.suggestions.join('、') }}</text>
					</view>
				</view>
				
				<view class="form-item">
					<view class="form-label">
						<text class="label-text">确认密码</text>
						<text class="required">*</text>
					</view>
					<input 
						class="form-input" 
						type="password" 
						placeholder="请输入" 
						v-model="confirmPassword"
						placeholder-style="color: #999999;"
					/>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import HeaderNav from '../../components/HeaderNav.vue'
import request from '@/utils/request.js'

export default {
	components: {
		HeaderNav
	},
	data() {
		return {
			navHeight: 88,
			oldPassword: '',
			newPassword: '',
			confirmPassword: '',
			passwordStrength: null, // 密码强度信息
			strengthCheckTimer: null // 防抖定时器
		}
	},
	mounted() {
		uni.getSystemInfo({
			success: (res) => {
				this.navHeight = 88 + (res.statusBarHeight || 0)
			}
		})
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		
		// 检测密码强度（防抖）
		checkPasswordStrength() {
			// 清除之前的定时器
			if (this.strengthCheckTimer) {
				clearTimeout(this.strengthCheckTimer)
			}
			
			// 设置新的定时器，延迟500ms执行
			this.strengthCheckTimer = setTimeout(() => {
				this.doPasswordStrengthCheck()
			}, 500)
		},
		
		// 执行密码强度检测
		async doPasswordStrengthCheck() {
			if (!this.newPassword) {
				this.passwordStrength = null
				return
			}
			
			try {
				const response = await new Promise((resolve, reject) => {
					uni.request({
						url: 'http://localhost:3000/zjf/check-password-strength',
						method: 'POST',
						header: { 'Content-Type': 'application/json' },
						data: { password: this.newPassword },
						success: (res) => {
							if (res.statusCode === 200 && res.data.success) {
								resolve(res.data)
							} else {
								reject(new Error(res.data?.message || '检测失败'))
							}
						},
						fail: reject
					})
				})
				
				this.passwordStrength = response.data
				console.log('密码强度检测结果:', this.passwordStrength)
				
			} catch (error) {
				console.error('密码强度检测失败:', error)
				this.passwordStrength = null
			}
		},
		
		// 获取强度文本
		getStrengthText(strength) {
			const texts = {
				'weak': '弱',
				'medium': '中',
				'strong': '强'
			}
			return texts[strength] || '未知'
		},
		
		// 确认修改密码
		async confirmChange() {
			// 表单验证
			if (!this.oldPassword) {
				uni.showToast({
					title: '请输入旧密码',
					icon: 'none'
				})
				return
			}
			if (!this.newPassword) {
				uni.showToast({
					title: '请输入新密码',
					icon: 'none'
				})
				return
			}
			if (!this.confirmPassword) {
				uni.showToast({
					title: '请输入确认密码',
					icon: 'none'
				})
				return
			}
			if (this.newPassword !== this.confirmPassword) {
				uni.showToast({
					title: '两次密码输入不一致',
					icon: 'none'
				})
				return
			}
			
			try {
				// 显示加载提示
				uni.showLoading({
					title: '修改中...'
				})
				
				const response = await new Promise((resolve, reject) => {
					uni.request({
						url: 'http://localhost:3000/zjf/change-password',
						method: 'POST',
						header: {
							'Content-Type': 'application/json'
						},
						data: {
							oldPassword: this.oldPassword,
							newPassword: this.newPassword,
							phone: '19033651282'
						},
						success: (res) => {
							console.log('API响应:', res)
							if (res.statusCode === 200) {
								resolve(res.data) 
							} else {
								reject(new Error(`请求失败: ${res.statusCode}`))
							}
						},
						fail: (error) => {
							console.error('请求失败:', error)
							reject(error)
						}
					})
				})
				
				console.log('密码修改成功:', response)
				
				// 显示成功提示
				uni.showToast({
					title: '密码修改成功',
					icon: 'success'
				})
				
				// 修改成功后返回上一页
				setTimeout(() => {
					uni.navigateBack()
				}, 1500)
				
			} catch (error) {
				console.error('密码修改失败:', error)
				uni.showToast({
					title: '密码修改失败',
					icon: 'none'
				})
			} finally {
				uni.hideLoading()
			}
		}
	}
}
</script>

<style scoped>
.change-password-page {
	min-height: 100vh;
	background-color: #f5f5f5;
}

.content {
	padding: 0;
}

/* 表单列表 */
.form-list {
	background-color: #ffffff;
	margin-top: 20rpx;
}

.form-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.form-item:last-child {
	border-bottom: none;
}

.form-label {
	display: flex;
	align-items: center;
}

.label-text {
	font-size: 30rpx;
	color: #333333;
}

.required {
	font-size: 30rpx;
	color: #ff0000;
	margin-left: 4rpx;
}

.form-input {
	flex: 1;
	text-align: right;
	font-size: 30rpx;
	color: #333333;
	margin-left: 20rpx;
}

/* 密码强度样式 */
.password-strength {
	margin: 20rpx 30rpx;
	padding: 20rpx;
	background-color: #f8f9fa;
	border-radius: 12rpx;
	border-left: 4rpx solid #007AFF;
}

.strength-label {
	font-size: 28rpx;
	color: #333333;
	margin-bottom: 10rpx;
}

.strength-indicator {
	display: flex;
	align-items: center;
	margin-bottom: 10rpx;
}

.strength-bar {
	width: 100rpx;
	height: 8rpx;
	border-radius: 4rpx;
	margin-right: 16rpx;
}

.strength-bar.weak {
	background-color: #ff4444;
}

.strength-bar.medium {
	background-color: #ffaa00;
}

.strength-bar.strong {
	background-color: #00cc44;
}

.strength-text {
	font-size: 26rpx;
	font-weight: 600;
}

.strength-text.weak {
	color: #ff4444;
}

.strength-text.medium {
	color: #ffaa00;
}

.strength-text.strong {
	color: #00cc44;
}

.strength-suggestions {
	margin-top: 10rpx;
}

.suggestion-title {
	font-size: 24rpx;
	color: #666666;
	font-weight: 600;
}

.suggestion-text {
	font-size: 24rpx;
	color: #999999;
	margin-left: 10rpx;
}
</style>