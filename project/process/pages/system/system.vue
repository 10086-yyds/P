<template>
	<view class="system-page">
		<HeaderNav
			title="系统设置"
			:showBack="true"
			rightText=""
			@back="goBack"
		/>
		
		<!-- 页面内容区域 -->
		<view class="content" :style="{ paddingTop: navHeight + 'px' }">
			<!-- 设置列表 -->
			<view class="setting-list">
				<view class="setting-item" @click="changePassword">
					<view class="setting-left">
						<text class="setting-label">修改密码</text>
					</view>
					<text class="arrow">〉</text>
				</view>
				
				<view class="setting-item" @click="goToAbout">
					<view class="setting-left">
						<text class="setting-label">关于</text>
					</view>
					<text class="arrow">〉</text>
				</view>
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
			navHeight: 88
		}
	},
	mounted() {
		// 获取状态栏高度来计算完整的导航栏高度
		uni.getSystemInfo({
			success: (res) => {
				this.navHeight = 40 + (res.statusBarHeight || 0)
			}
		})
	},
	methods: {
		// 返回上一页
		goBack() {
			uni.navigateBack()
		},
		// 修改密码
		changePassword() {
			console.log('修改密码')
			uni.navigateTo({
				url: '/pages/system/updatePassword'
			})
		},
		// 跳转到关于页面
		goToAbout() {
			console.log('关于')
			uni.navigateTo({
				url: '/pages/system/about'
			})
		}
	}
}
</script>

<style scoped>
.system-page {
	min-height: 100vh;
	background-color: #f5f5f5;
}

.content {
	padding: 0;
}

/* 设置列表 */
.setting-list {
	background-color: #ffffff;
	margin-top: 20rpx;
}

.setting-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.setting-item:last-child {
	border-bottom: none;
}

.setting-left {
	display: flex;
	align-items: center;
}

.setting-label {
	font-size: 30rpx;
	color: #333333;
}

.arrow {
	font-size: 24rpx;
	color: #cccccc;
}
</style>
