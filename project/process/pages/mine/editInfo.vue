<template>
	<view class="edit-info-page">
		<HeaderNav
			title="用户名称"
			:showBack="true"
			rightText="提交"
			rightTextColor="#007AFF"
			@back="goBack"
			@rightClick="submitName"
		/>
		
		<view class="content" :style="{ paddingTop: navHeight + 'px' }">
			<!-- 用户名称编辑 -->
			<view class="form-item">
				<view class="form-label">
					<text class="label-text">用户名称:</text>
				</view>
				<input 
					class="form-input" 
					type="text" 
					placeholder="" 
					v-model="userName"
					:focus="true"
				/>
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
			userName: '',
			userPhone: ''
		}
	},
	onLoad(option) {
		// 接收页面传递的用户名和手机号参数
		if (option.name) {
            console.log(option.name,'用户名参数')
			this.userName = decodeURIComponent(option.name)
		}
		if (option.phone) {
            console.log(option.phone,'手机号参数')
			this.userPhone = decodeURIComponent(option.phone)
		}
	},
	mounted() {
		uni.getSystemInfo({
			success: (res) => {
				this.navHeight = 20 + (res.statusBarHeight || 0)
			}
		})
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		
		async submitName() {
			// 验证用户名
			if (!this.userName.trim()) {
				uni.showToast({
					title: '请输入用户名称',
					icon: 'none'
				})
				return
			}
			
			// 验证手机号
			if (!this.userPhone) {
				uni.showToast({
					title: '缺少手机号参数',
					icon: 'none'
				})
				return
			}
			
			try {
				const response = await new Promise((resolve, reject) => {
					uni.request({
						url: 'http://localhost:3000/zjf/edit',
						method: "POST",
						header: {
							'Content-Type': 'application/json'
						},
						data: {
							phone: this.userPhone,
							name: this.userName.trim()
						},
						success: (res) => {
							console.log('修改用户名响应:', res)
							if (res.statusCode === 200) {
								resolve(res.data)
							} else {
								reject(new Error(`请求失败: ${res.statusCode}`))
							}
						},
						fail: (error) => {
							console.error("请求失败:", error)
							reject(error)
						}
					})
				})

				// 检查后端响应
				if (response.success || response.code === 200) {
					console.log('用户名修改成功:', this.userName)
					
					uni.showToast({
						title: '修改成功',
						icon: 'success'
					})
					
					// 修改成功后返回到我的页面，并传递更新后的用户信息
					setTimeout(() => {
						// 通过页面事件通知上一页更新数据
						const pages = getCurrentPages()
						const prevPage = pages[pages.length - 2] // 获取上一页实例
						
						if (prevPage && prevPage.route === 'pages/mine/mine') {
							// 通知上一页更新用户信息
							if (prevPage.$vm && prevPage.$vm.updateUserName) {
								prevPage.$vm.updateUserName(this.userName.trim())
							} else {
								// 如果上一页没有更新方法，直接更新数据
								if (prevPage.$vm) {
									prevPage.$vm.userInfo.name = this.userName.trim()
								}
							}
						}
						
						uni.navigateBack()
					}, 1500)
				} else {
					throw new Error(response.message || '修改失败')
				}
				
			} catch (error) {
				console.error('修改用户名失败:', error)
				uni.showToast({
					title: error.message || '修改失败，请重试',
					icon: 'none'
				})
			}
		}
	}
}
</script>

<style scoped>
.edit-info-page {
	min-height: 100vh;
	background-color: #f5f5f5;
}

.content {
	padding: 0;
}

/* 表单项 */
.form-item {
	background-color: #ffffff;
	display: flex;
	align-items: center;
	padding: 30rpx;
	margin-top: 0;
}

.form-label {
	min-width: 140rpx;
}

.label-text {
	font-size: 32rpx;
	color: #333333;
}

.form-input {
	flex: 1;
	text-align: right;
	font-size: 32rpx;
	color: #333333;
	margin-left: 30rpx;
	border: none;
	outline: none;
}
</style>
