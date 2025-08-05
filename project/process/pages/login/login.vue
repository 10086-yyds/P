<template>
	<view>
		<button @click="login">登录</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {

			}
		},
		methods: {
			login: () => {
				// console.log(123)
				uni.switchTab({
					url: "/pages/home/home"
				})
			}
		}
	}
</script>

<style>

</style>