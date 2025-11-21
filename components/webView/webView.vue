<template>
	<view class="webview-container">
		<web-view :src="url" @message="handleMessage" @error="handleError"></web-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			url: ''
		};
	},
	onLoad(options) {
		console.log('webView 接收到的参数:', options);
		
		if (options.link) {
			this.url = decodeURIComponent(options.link);
			console.log('将要打开的链接:', this.url);
		} else {
			uni.showToast({
				title: '链接地址为空',
				icon: 'none'
			});
			setTimeout(() => {
				uni.navigateBack();
			}, 1500);
		}
	},
	methods: {
		// 接收网页消息
		handleMessage(e) {
			console.log('收到网页消息:', e);
		},
		
		// 网页加载失败
		handleError(e) {
			console.error('网页加载失败:', e);
			uni.showToast({
				title: '网页加载失败',
				icon: 'none'
			});
		}
	}
};
</script>

<style scoped>
.webview-container {
	width: 100%;
	height: 100vh;
}
</style>

