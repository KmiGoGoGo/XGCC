<template>
  <view class="tabbar-container">
    <view 
      v-for="item in tabList" 
      :key="item.id"
      :class="['tabbar-item', { 'center-item': item.centerItem }]"
      @tap="changeItem(item)"
    >
      <view class="item-top">
        <image :src="activeId === item.id ? item.selectIcon : item.icon"/>
      </view>
      <view :class="['item-bottom', { 'item-active': activeId === item.id }]">
        {{ item.text }}
      </view>
    </view>
  </view>
</template>

<script>
	export default {
		props: {
		    activeId: {  // 改名为更语义化的activeId
		      type: Number,
		      default: 0
		    }
		  },
		data() {
			return {
				
				tabList: [{
						id: 0,
						path: '/pages/index/index',
						icon: 'https://oos-cn.ctyunapi.cn/front-end/static/static/home.png',
						selectIcon: 'https://oos-cn.ctyunapi.cn/front-end/static/static/home_sel.png',
						text: '充电',
						centerItem: false
					},
					
					{
						id: 1,
						path: '',
						icon: 'https://oos-cn.ctyunapi.cn/front-end/static/static/scan.png',
						selectIcon: 'https://oos-cn.ctyunapi.cn/front-end/static/static/scan.png',
						text: '',
						centerItem: true
					},

					{
						id: 2,
						path: '/pages/my/my',
						icon: 'https://oos-cn.ctyunapi.cn/front-end/static/static/mime.png',
						selectIcon: 'https://oos-cn.ctyunapi.cn/front-end/static/static/mime_sel.png',
						text: '我的',
						centerItem: false
					}
				]
			};
		},
		methods: {
			async changeItem(item) {
				console.log('changeItem', item);
				console.log('准备跳转到页面:', item.path);
			      if (item.id === 1) {
			        // 扫码功能
			        my.scan({ type: 'qr' });
			        return;
			      }
			      
			      // 立即更新状态（关键点1）
			      this.$emit('update:activeId', item.id);
			      this.$emit('change', item.id);
			      
			      try {
			        // 等待页面切换完成（关键点2）
			        await new Promise(resolve => {
			          uni.switchTab({
			            url: item.path,
			            success: (res) => {
			              console.log('switchTab 成功:', res);
			              resolve(res);
			            },
			            fail: (err) => {
			              console.error('switchTab 失败:', err);
			              resolve(err);
			            },
			            complete: resolve
			          });
			        });
			      } catch (err) {
			        console.error('切换失败:', err);
			      }
			    }
		}
	};
</script>

<style>
	/* 在每个 tab 页面的样式文件中添加 */
	
	.tabbar-container {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		z-index: 9999;
		background: linear-gradient(0deg, #FFFFFF, #f4f6f8);
		border: 2rpx solid rgba(255, 255, 255, 0.55);
		box-shadow: 0rpx -25rpx 67rpx 0rpx rgba(177, 182, 190, 0.2);
		display: flex;
		align-items: center;
		padding: 5rpx 0;
		color: #707485;
		/* 适配底部安全区域 */
		padding-bottom: calc(5rpx + env(safe-area-inset-bottom));
	}

	.tabbar-item {
		width: 33%;
		height: 118rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		position: relative;
	}

	.item-top {
		width: 48rpx;
		height: 48rpx;
	}

	.item-top image {
		width: 100%;
		height: 100%;
	}

	.new {
		width: 10rpx;
		height: 10rpx;
		position: absolute;
		top: 25rpx;
		right: 55rpx;
		border-radius: 50%;
		background-color: red;
	}

	.item-bottom {
		font-size: 22rpx;
		width: 100%;
	}

	.item-active {
		color: var(--textColor);
	}

	.center-item .item-top {
		flex-shrink: 0;
		width: 138rpx;
		height: 138rpx;
		position: absolute;
		top: -50rpx;
		left: calc(50% - 70rpx);
		border-radius: 50%;
	}

	.center-item .item-bottom {
		position: absolute;
		bottom: 2rpx;
	}
</style>