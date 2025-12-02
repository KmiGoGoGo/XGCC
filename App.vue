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

.server-icon-wrapper {
    width: 55rpx;
    height: 55rpx;
    border-radius: 50%;
    background-color: #FEFFFF;
    opacity: 0.8;
    display: flex;
    align-items: center;
    justify-content: center;
	/* 灰色外边框 */
	border: 1rpx solid #E5E7EB;
}

::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
  background: transparent;
}
</style>
