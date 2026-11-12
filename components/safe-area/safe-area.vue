<template>
	<view class="safe-area" :style="safeAreaStyle">
		<slot></slot>
	</view>
</template>

<script>
	export default {
		name: 'SafeArea',
		props: {
			// 是否包含状态栏高度
			includeStatusBar: {
				type: Boolean,
				default: true
			},
			// 是否包含导航栏高度
			includeNavBar: {
				type: Boolean,
				default: true
			},
			// 是否包含搜索栏高度
			includeSearchBar: {
				type: Boolean,
				default: false
			},
			// 自定义顶部偏移量
			topOffset: {
				type: Number,
				default: 0
			},
			// 自定义底部偏移量
			bottomOffset: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				statusBarHeight: 0,
				navBarHeight: 44, // 默认导航栏高度
				searchBarHeight: 0, // 搜索栏高度
				systemInfo: null
			}
		},
		computed: {
			safeAreaStyle() {
				let top = 0;
				
				// 现在使用uv-navbar组件，它已经处理了安全区域适配
				// 只需要处理自定义偏移量
				top += this.topOffset;
				
				// 计算底部安全区域
				let bottom = this.bottomOffset;
				if (this.systemInfo && this.systemInfo.safeAreaInsets) {
					bottom += this.systemInfo.safeAreaInsets.bottom;
				}
				
				console.log('安全区域计算（使用uv-navbar）:', {
					calculatedTop: top,
					topOffset: this.topOffset,
					bottomOffset: bottom
				});
				
				return {
					paddingTop: `${top}px`,
					paddingBottom: `${bottom}px`
				};
			}
		},
		mounted() {
			this.initSystemInfo();
			// uv-navbar组件已经处理了安全区域适配，不需要额外计算
		},
		methods: {
			// 初始化系统信息
			initSystemInfo() {
				try {
					this.systemInfo = uni.getSystemInfoSync();
					
					// 获取状态栏高度
					this.statusBarHeight = this.systemInfo.statusBarHeight || 20;
					
					// 获取导航栏高度（通常为44px）
					this.navBarHeight = 44;
					
					// 计算搜索栏高度（如果有的话）
					// this.calculateSearchBarHeight();
					
					console.log('安全区域组件初始化完成:', {
						statusBarHeight: this.statusBarHeight,
						navBarHeight: this.navBarHeight,
						searchBarHeight: this.searchBarHeight,
						safeAreaInsets: this.systemInfo.safeAreaInsets
					});
				} catch (error) {
					console.error('获取系统信息失败:', error);
					// 使用默认值
					this.statusBarHeight = 20;
					this.navBarHeight = 44;
				}
			},
			
			// 更新搜索栏高度
			updateSearchBarHeight(height) {
				this.searchBarHeight = height;
			},
			
			// 计算自定义导航栏高度（现在使用uv-navbar，不需要特殊处理）
			calculateCustomNavigationHeight() {
				// uv-navbar组件已经处理了安全区域适配，不需要额外计算
				console.log('使用uv-navbar组件，跳过自定义导航栏高度计算');
			},
			
			// 获取当前安全区域高度
			getSafeAreaHeight() {
				let height = 0;
				
				if (this.includeStatusBar) {
					height += this.statusBarHeight;
				}
				
				if (this.includeNavBar) {
					height += this.navBarHeight;
				}
				
				if (this.includeSearchBar) {
					height += this.searchBarHeight;
				}
				
				height += this.topOffset;
				
				return height;
			}
		}
	}
</script>

<style scoped>
	.safe-area {
		width: 100%;
		min-height: 100vh;
		box-sizing: border-box;
	}
</style>
