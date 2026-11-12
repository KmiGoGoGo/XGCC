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
import globalData from '../../globalData';
	export default {
		props: {
		    activeId: {  // 改名为更语义化的activeId
		      type: Number,
		      default: 0
		    }
		  },
		data() {
			return {
				// 二维码解析策略
				qrCodeStrategies: {
					// XG策略：支持三种格式
					xg: {
						validate: (url) => url.includes('cc.gy-ev.com') && !url.includes('/shicheng/'),
						parse: (url) => {
							console.log('使用XG策略解析:', url);
							
							// 提取路径部分
							const pathMatch = url.match(/cc\.gy-ev\.com(\/.*)$/);
							if (!pathMatch) {
								console.log('无法提取路径');
								return null;
							}
							const path = pathMatch[1];
							console.log('提取的路径:', path);
							
							let pileNum, gunNo;
							
							// 判断是否有下划线
							if (path.includes('_')) {
								// 有下划线的情况
								const parts = path.split('_');
								const pilePart = parts[0].substring(1); // 去掉开头的斜杠
								const gunPart = parts[1];
								
								console.log('桩号部分:', pilePart, '枪号部分:', gunPart);
								
								// 判断桩号长度
								if (pilePart.length === 8) {
									// 8位桩号
									pileNum = pilePart;
									gunNo = gunPart;
								} else if (pilePart.length === 14) {
									// 14位桩号
									pileNum = pilePart;
									// 枪号为 01/02 这类两位数字时，二维码里是 1-based，需转成 0-based 传参
									gunNo = /^\d{2}$/.test(gunPart) ? (parseInt(gunPart, 10) - 1).toString() : gunPart;
								}
							} else {
								// 没有下划线的情况，长度为16位
								const fullPath = path.substring(1); // 去掉开头的斜杠
								if (fullPath.length === 16) {
									pileNum = fullPath.substring(0, 14); // 前14位是桩号
									const gunNum = parseInt(fullPath.substring(14, 16)); // 后两位
									gunNo = (gunNum - 1).toString(); // gunNo = gunNum - 1
								}
							}
							
							console.log('XG策略解析结果 - 桩号:', pileNum, '枪号:', gunNo);
							
							if (pileNum && gunNo !== undefined) {
								return {
									pileNum: pileNum,
									gunNo: gunNo
								};
							}
							
							return null;
						}
					},
					
					// 石城策略：格式为 /shicheng/pileNum_gunNo
					shicheng: {
						validate: (url) => url.includes('cc.gy-ev.com/shicheng/'),
						parse: (url) => {
							console.log('使用石城策略解析:', url);
							
							// 提取shicheng路径部分
							const pathMatch = url.match(/cc\.gy-ev\.com\/shicheng\/(.*)$/);
							if (!pathMatch) {
								console.log('无法提取石城路径');
								return null;
							}
							const path = pathMatch[1];
							console.log('提取的石城路径:', path);
							
							// 解析桩号和枪号
							if (path.includes('_')) {
								const parts = path.split('_');
								const pileNum = parts[0];
								const gunNum = parseInt(parts[1]);
								const gunNo = (gunNum - 1).toString(); // gunNo = gunNum - 1
								
								console.log('石城策略解析结果 - 桩号:', pileNum, '枪号:', gunNo);
								
								return {
									pileNum: pileNum,
									gunNo: gunNo
								};
							}
							
							return null;
						}
					}
				},
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
			// 解析二维码链接，提取桩号和枪号
			parseQRCode(url) {
				console.log('解析二维码链接:', url);
				
				// 遍历所有策略，找到匹配的策略
				if (this.qrCodeStrategies[globalData.sellerNo].validate(url)) {
					console.log(`匹配到策略: ${globalData.sellerNo}`);
					return this.qrCodeStrategies[globalData.sellerNo].parse(url);
				}
				
				console.log('没有匹配的解析策略', globalData.sellerNo);
				return null;
			},
			
			// 处理扫码结果
			handleScanResult(result) {
				console.log('扫码结果:', result);
				
				const qrData = this.parseQRCode(result);
				if (qrData) {
					// 跳转到充电页面
					uni.navigateTo({
						url: `/pages/charge/gunStartingCharge?pileNum=${qrData.pileNum}&gunNo=${qrData.gunNo}`,
						success: () => {
							console.log('跳转成功');
						},
						fail: (err) => {
							console.error('跳转失败:', err);
						}
					});
				} else {
					uni.showToast({
						title: '二维码格式不正确',
						icon: 'none'
					});
				}
			},
			
			async changeItem(item) {
				console.log('changeItem', item);
				console.log('准备跳转到页面:', item.path);
			      if (item.id === 1) {
			        // 扫码功能
			        // #ifdef MP-ALIPAY
			        my.scan({
			          type: 'qr',
			          success: (res) => {
			            console.log('支付宝扫码成功:', res);
			            this.handleScanResult(res.code);
			          },
			          fail: (err) => {
			            console.error('支付宝扫码失败:', err);
			          }
			        });
			        // #endif
			        
			        // #ifdef MP-WEIXIN
			        wx.scanCode({
			          success: (res) => {
			            console.log('微信扫码成功:', res);
			            this.handleScanResult(res.result);
			          },
			          fail: (err) => {
			            console.error('微信扫码失败:', err);
			          }
			        });
			        // #endif
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