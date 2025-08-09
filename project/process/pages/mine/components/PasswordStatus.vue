<template>
	<view class="password-status">
		<view class="status-header">
			<text class="status-title">密码安全状态</text>
			<view class="refresh-btn" @click="checkPasswordStatus">
				<text class="refresh-icon">🔄</text>
			</view>
		</view>
		
		<view v-if="passwordInfo" class="status-content">
			<!-- 密码强度显示 -->
			<view class="status-item">
				<view class="item-label">密码强度：</view>
				<view class="strength-indicator">
					<view class="strength-bar" :class="passwordInfo.passwordStrength"></view>
					<text class="strength-text" :class="passwordInfo.passwordStrength">
						{{ getStrengthText(passwordInfo.passwordStrength) }}
					</text>
				</view>
			</view>
			
			<!-- 密码年龄 -->
			<view class="status-item">
				<view class="item-label">密码使用：</view>
				<text class="item-value">{{ passwordInfo.passwordAge }}天</text>
			</view>
			
			<!-- 过期状态 -->
			<view class="status-item">
				<view class="item-label">过期状态：</view>
				<text class="item-value" :class="{ 'expired': passwordInfo.passwordExpired, 'warning': passwordInfo.daysUntilExpiry <= 7 && !passwordInfo.passwordExpired }">
					{{ getExpiryStatus() }}
				</text>
			</view>
			
			<!-- 警告提示 -->
			<view v-if="passwordInfo.needsUpdate" class="warning-box">
				<text class="warning-icon">⚠️</text>
				<text class="warning-text">
					{{ passwordInfo.passwordExpired ? '密码已过期，请立即更新！' : `密码将在${passwordInfo.daysUntilExpiry}天后过期，建议尽快更新。` }}
				</text>
			</view>
		</view>
		
		<view v-else class="loading">
			<text>正在获取密码状态...</text>
		</view>
	</view>
</template>

<script>
export default {
	props: {
		userPhone: {
			type: String,
			required: true
		}
	},
	data() {
		return {
			passwordInfo: null
		}
	},
	mounted() {
		this.checkPasswordStatus()
	},
	methods: {
		// 检查密码状态
		async checkPasswordStatus() {
			try {
				const response = await new Promise((resolve, reject) => {
					uni.request({
						url: 'http://localhost:3000/zjf/get-password-info',
						method: 'POST',
						header: { 'Content-Type': 'application/json' },
						data: { phone: this.userPhone },
						success: (res) => {
							if (res.statusCode === 200 && res.data.success) {
								resolve(res.data)
							} else {
								reject(new Error(res.data?.message || '获取失败'))
							}
						},
						fail: reject
					})
				})
				
				this.passwordInfo = response.data
				console.log('密码状态信息:', this.passwordInfo)
				
			} catch (error) {
				console.error('获取密码状态失败:', error)
				uni.showToast({
					title: '获取密码状态失败',
					icon: 'none'
				})
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
		
		// 获取过期状态文本
		getExpiryStatus() {
			if (!this.passwordInfo) return '未知'
			
			if (this.passwordInfo.passwordExpired) {
				return '已过期'
			} else if (this.passwordInfo.daysUntilExpiry <= 7) {
				return `${this.passwordInfo.daysUntilExpiry}天后过期`
			} else {
				return '正常'
			}
		}
	}
}
</script>

<style scoped>
.password-status {
	margin: 20rpx;
	padding: 24rpx;
	background-color: #ffffff;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.1);
}

.status-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.status-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333333;
}

.refresh-btn {
	padding: 8rpx;
	border-radius: 8rpx;
	background-color: #f5f5f5;
}

.refresh-icon {
	font-size: 24rpx;
}

.status-content {
	/* 内容样式 */
}

.status-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
	padding: 12rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.status-item:last-child {
	border-bottom: none;
	margin-bottom: 0;
}

.item-label {
	font-size: 28rpx;
	color: #666666;
}

.item-value {
	font-size: 28rpx;
	color: #333333;
}

.item-value.expired {
	color: #ff4444;
	font-weight: 600;
}

.item-value.warning {
	color: #ffaa00;
	font-weight: 600;
}

.strength-indicator {
	display: flex;
	align-items: center;
}

.strength-bar {
	width: 60rpx;
	height: 6rpx;
	border-radius: 3rpx;
	margin-right: 12rpx;
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

.warning-box {
	margin-top: 20rpx;
	padding: 16rpx;
	background-color: #fff3cd;
	border: 1rpx solid #ffeaa7;
	border-radius: 8rpx;
	display: flex;
	align-items: flex-start;
}

.warning-icon {
	margin-right: 12rpx;
	font-size: 28rpx;
}

.warning-text {
	flex: 1;
	font-size: 26rpx;
	color: #856404;
	line-height: 1.4;
}

.loading {
	text-align: center;
	padding: 40rpx;
	color: #999999;
	font-size: 28rpx;
}
</style> 