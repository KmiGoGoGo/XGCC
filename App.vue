<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	/* 全局禁用点击高亮效果 */
page {
  -webkit-tap-highlight-color: transparent;
  tap-highlight-color: transparent; /* 兼容部分环境 */
}
</style>
