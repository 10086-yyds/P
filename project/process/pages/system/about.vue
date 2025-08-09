<template>
	<view class="about-page">
		<HeaderNav
			title="关于我们"
			:showBack="true"
			@back="goBack"
		/>
		
		<view class="content" :style="{ paddingTop: navHeight + 'px' }">
			<!-- 应用图标 -->
			<view class="app-icon">
				<image src="/static/logo.png" mode="aspectFit" class="icon"></image>
			</view>
			
			<!-- 版本信息 -->
			<view class="version-info">
				<text class="version-text">版本号：{{ version }}</text>
			</view>
			
			<!-- 用户信息 -->
			<view class="user-info">
				<text class="user-name" @click="goToEditInfo">李想</text>
			</view>
			
			<!-- 版权信息 -->
			<view class="copyright">
				<text class="copyright-text">天天建设©版权所有</text>
			</view>
			
		</view>
	</view>
</template>

<script>
import HeaderNav from '../../components/HeaderNav.vue'

	export default {
	components: {
		HeaderNav
	},
		data() {
		return {
			navHeight: 88,
			version: '1.1'
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
		
		// 跳转到编辑信息页面
		goToEditInfo() {
			uni.navigateTo({
				url: '/pages/mine/editInfo?name=李想'
			})
		}
		}
	}
</script>

<style scoped>
.about-page {
	min-height: 100vh;
	background-color: #f5f5f5;
}

.content {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 60rpx 30rpx;
}

/* 应用图标 */
.app-icon {
	margin-bottom: 40rpx;
}

.icon {
	width: 120rpx;
	height: 120rpx;
	border-radius: 20rpx;
	background-color: #e0e0e0;
}

/* 版本信息 */
.version-info {
	margin-bottom: 60rpx;
}

.version-text {
	font-size: 32rpx;
	color: #333333;
	font-weight: 500;
}

/* 用户信息 */
.user-info {
	margin-bottom: 80rpx;
}

.user-name {
	font-size: 36rpx;
	color: #007AFF;
	font-weight: 600;
	padding: 20rpx 40rpx;
	border: 2rpx solid #007AFF;
	border-radius: 50rpx;
	cursor: pointer;
}

.user-name:hover {
	background-color: #007AFF;
	color: #ffffff;
}

/* 应用信息 */
.app-info {
	width: 100%;
	background-color: #ffffff;
	border-radius: 12rpx;
	padding: 40rpx 30rpx;
	margin-bottom: 60rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.info-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
	border-bottom: none;
}

.info-label {
	font-size: 28rpx;
	color: #666666;
}

.info-value {
	font-size: 28rpx;
	color: #333333;
	font-weight: 500;
}

/* 版权信息 */
.copyright {
	position: absolute;
	bottom: 60rpx;
	left: 50%;
	transform: translateX(-50%);
}

.copyright-text {
	font-size: 24rpx;
	color: #999999;
}
</style>
