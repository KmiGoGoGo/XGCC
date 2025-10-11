<template>
	<view class="page-container">
		<!-- 顶部Tab -->
		<uv-subsection 
				:list="tabList" 
				:current="activeTab" 
				mode="button"
				activeColor="#007aff"
				inactiveColor="#333"
				bgColor="#EEEEEF"
				custom-style="margin-bottom: 20rpx; border-radius: 30rpx; height: 80rpx;"
				custom-item-style="border-radius: 30rpx;"
				@change="changeTab">
		</uv-subsection>
		<view class="top-tab-bar" @click="updateChart">
			<view class="gun-state-info">
				<view class="state-item">
					<text class="label">总枪数</text>
					<text class="value">{{ gunState.sum || 0 }}</text>
				</view>
				<view class="state-item">
					<text class="label">空闲枪</text>
					<text class="value free">{{ gunState.free || 0 }}</text>
				</view>
				<view class="state-item">
					<text class="label">充电中</text>
					<text class="value charging">{{ gunState.charging || 0 }}</text>
				</view>
				<view class="state-item">
					<text class="label">将充满</text>
					<text class="value about-finish">{{ gunState.aboutFinish || 0 }}</text>
				</view>
			</view>
		</view>

		<!-- 枪列表 -->
		<view class="gun-list">
			<station-gun-list-item v-for="gun in filteredGunList" :key="gun.gunId" :gun-info="gun" @click="goToDetails(gun.gunId)" />
		</view>
	</view>
</template>

<script>
	import {
		getStationGunState,
		getStationGunList
	} from '@/api/stationGun.js'
	import stationGunListItem from '@/components/station/stationGunListItem.vue'


	export default {
		components: {
			stationGunListItem,
		},
		data() {
			return {
				stationId: '', // 接收路由参数
				dataType: 0, // 接收路由参数
				hulianinterfaceId: '', // 接收路由参数
				gunState: {},
				gunList: [],
				activeTab: 0,
				tabList: ['全部', '超充', '快充', '慢充'], // uv-subsection组件使用的数组
				tabs: [{
					name: '全部',
					type: 0 // 0 代表全部
				}, {
					name: '超充',
					type: 3 // gunType for Super Charge
				}, {
					name: '快充',
					type: 1 // gunType for Fast Charge
				},{
					name: '慢充',
					type: 2 // gunType for Slow Charge
				}],
				chartData: {},
			}
		},
		computed: {
			filteredGunList() {
				const currentType = this.tabs[this.activeTab].type
				if (currentType === 0) {
					return this.gunList
				}
				return this.gunList.filter(gun => gun.gunType === currentType)
			}
		},
		onLoad(options) {
			// 如果通过路由传递了stationId，则使用它
			if (options.stationId) {
				this.stationId = options.stationId;
			} else {
				uni.showToast({
					title: '缺少必要参数',
					icon: 'none'
				});
				uni.navigateBack();
			}
			if (options.hulianinterfaceId) {
				this.hulianinterfaceId = options.hulianinterfaceId;
			}
			this.fetchStationGunData()
		},
		methods: {
			async fetchStationGunData() {
				const params = {
					stationId: this.stationId,
					dataType: 0
				}

				try {
					uni.showLoading({ title: '加载中...' });
					const [stateRes, listRes] = await Promise.all([
						getStationGunState(params),
						getStationGunList(params)
					])

					if (stateRes.code === 0) {
						this.gunState = stateRes.data
					}

					if (listRes.code === 0) {
						this.gunList = listRes.data
					}
				} catch (error) {
					console.error('获取充电枪数据失败', error)
					uni.showToast({
						title: '数据加载失败',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},
			updateChart() {
			},
			changeTab(index) {
				this.activeTab = index
			},
			goToDetails(gunId) {
				uni.navigateTo({
					url: `/pages/station/stationGunDetails?gunId=${gunId}&hulianinterfaceId=${this.hulianinterfaceId}`
				})
			}
		}
	}
</script>

<style scoped>
	.page-container {
		padding: 20rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.top-tab-bar {
		background-color: #fff;
		padding: 20rpx;
		border-radius: 10rpx;
		margin-bottom: 20rpx;
	}


	.gun-state-info {
		display: flex;
		justify-content: space-around;
	}

	.state-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.label {
		font-size: 28rpx;
		color: #333;
	}

	.value {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.value.free {
		color: #6DB12E;
	}

	.value.charging {
		color: #FC724C;
	}

	.value.about-finish {
		color: #4096EC;
	}

	.gun-list {
		padding-bottom: 20rpx;
	}
</style>
