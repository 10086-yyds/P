<template>
	<view class="header-nav" :style="{ background: bgColor, paddingTop: statusBarHeight + 'px' }">
		<view class="nav-content">
			<view class="nav-left" v-if="showBack" @click="onBack">
			      <text class="nav-icon">←</text>
			      <text class="nav-text" v-if="backText">{{ backText }}</text>
			    </view>
			<!-- 中间标题 -->
			<view class="nav-center">
				<text class="nav-title" :style="{ color: titleColor }">{{ title }}</text>
			</view>
			
			<!-- 右侧操作区域 -->
			<view class="nav-right">
				<slot name="right">
					<view v-if="rightText" @click="onRightClick" class="nav-right-btn">
						<text class="nav-right-text" :style="{ color: rightTextColor }">{{ rightText }}</text>
					</view>
				</slot>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'HeaderNav',
	props: {
		// 标题
		title: {
			type: String,
			default: ''
		},
		// 标题颜色
		titleColor: {
			type: String,
			default: '#333333'
		},
		// 背景颜色
		bgColor: {
			type: String,
			default: '#ffffff'
		},
		// 是否显示返回按钮
		showBack: {
			type: Boolean,
			default: true
		},
		// 返回按钮文字
		backText: {
			type: String,
			default: ''
		},
		// 右侧按钮文字
		rightText: {
			type: String,
			default: ''
		},
		// 右侧按钮文字颜色
		rightTextColor: {
			type: String,
			default: '#007AFF'
		},
		// 是否开启安全区域适配
		safeAreaInsetTop: {
			type: Boolean,
			default: true
		}
	},
	data() {
		return {
			statusBarHeight: 0
		}
	},
	mounted() {
		// 获取状态栏高度
		this.getSystemInfo()
	},
	methods: {
		// 获取系统信息
		getSystemInfo() {
			if (this.safeAreaInsetTop) {
				uni.getSystemInfo({
					success: (res) => {
						this.statusBarHeight = res.statusBarHeight || 0
					}
				})
			}
		},
		// 返回按钮点击事件
			onBack() {
				this.$emit('back'); 
				uni.navigateBack();
			},
		// 右侧按钮点击事件
		onRightClick() {
			this.$emit('rightClick')
		}
	}
}
</script>

<style scoped>
.header-nav {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 999;
	border-bottom: 1rpx solid #e5e5e5;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
}


.nav-left {
	display: flex;
	align-items: center;
	flex-shrink: 0;
	min-width: 120rpx;
}

.nav-icon {
	font-size: 48rpx;
	color: #007AFF;
	font-weight: bold;
	margin-right: 8rpx;
}

.nav-text {
	font-size: 32rpx;
	color: #007AFF;
}

.nav-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
}

.nav-title {
	font-size: 36rpx;
	font-weight: 600;
	max-width: 400rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.nav-right {
	display: flex;
	align-items: center;
	flex-shrink: 0;
	min-width: 120rpx;
	justify-content: flex-end;
}

.nav-right-btn {
	padding: 10rpx 20rpx;
}

.nav-right-text {
	font-size: 32rpx;
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
	.header-nav {
		border-bottom-color: #2c2c2e;
	}
}
</style> 