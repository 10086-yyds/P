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
			userName: ''
		}
	},
	onLoad(option) {
		// 接收页面传递的用户名参数
		if (option.name) {
            console.log(option.name,'1111')
			this.userName = decodeURIComponent(option.name)
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
			
            const response = await new Promise((resolve,reject) => {
                uni.request({
                    url:'http://localhost:3000/zjf/edit',
                    method:"POST",
                    header:{
                        'Content-Type':'application/json'
                    },
                    success:(res) => {
                        if (res.statusCode === 200) {
								resolve(res.data) 
							} else {
								reject(new Error(`请求失败: ${res.statusCode}`))
							}
                    },
                    fail:(error) => {
                        console.error("请求失败")
                        reject(error)
                    }
                })
            })


			// 提交用户名
			console.log('提交用户名:', this.userName)
			
			uni.showToast({
				title: '提交成功',
				icon: 'success'
			})
			
			// 提交成功后返回上一页
			setTimeout(() => {
				uni.navigateBack()
			}, 1500)
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
