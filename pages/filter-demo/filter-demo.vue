<template>
	<view class="container">
		<view class="demo-title">筛选组件示例</view>
		
		<!-- 距离筛选 -->
		<FilterOptions 
			:data="distanceList" 
			:defaultValue="selectedDistance"
			@change="onDistanceChange"
		/>
		
		<!-- 站点类型筛选 -->
		<FilterOptions 
			:data="stationTypeList" 
			:defaultValue="selectedStationType"
			@change="onStationTypeChange"
		/>
		
		<!-- 显示选中结果 -->
		<view class="result-section">
			<view class="result-title">选中结果：</view>
			<view class="result-item" v-if="selectedDistanceInfo">
				距离：{{ selectedDistanceInfo.value }}
			</view>
			<view class="result-item" v-if="selectedStationTypeInfo">
				站点类型：{{ selectedStationTypeInfo.value }}
			</view>
		</view>
		
		<!-- 重置按钮 -->
		<view class="action-section">
			<button class="reset-btn" @click="resetFilters">重置筛选</button>
		</view>
	</view>
</template>

<script>
import FilterOptions from '@/components/FilterOptions/FilterOptions.vue';

export default {
	components: {
		FilterOptions
	},
	data() {
		return {
			// 距离筛选数据
			distanceList: {
				name: '距离',
				list: [{
					value: '不限',
					key: null
				}, {
					value: '1KM',
					key: 1
				}, {
					value: '3KM',
					key: 3
				}, {
					value: '5KM',
					key: 5
				}, {
					value: '10KM',
					key: 10
				}, {
					value: '20KM',
					key: 20
				}, {
					value: '50KM',
					key: 50
				}, {
					value: '100KM',
					key: 100
				}]
			},
			
			// 站点类型筛选数据
			stationTypeList: {
				name: '站点类型',
				list: [{
					value: '不限',
					key: null
				}, {
					value: '公共',
					key: 'public'
				}, {
					value: '个人',
					key: 'private'
				}, {
					value: '公交',
					key: 'bus'
				}, {
					value: '环卫',
					key: 'sanitation'
				}, {
					value: '物流',
					key: 'logistics'
				}, {
					value: '出租车',
					key: 'taxi'
				}, {
					value: '其他',
					key: 'other'
				}]
			},
			
			// 选中的值
			selectedDistance: null,
			selectedStationType: null,
			
			// 选中的详细信息
			selectedDistanceInfo: null,
			selectedStationTypeInfo: null
		};
	},
	methods: {
		/**
		 * 距离筛选变化回调
		 */
		onDistanceChange(option) {
			console.log('距离筛选变化：', option);
			this.selectedDistance = option.key;
			this.selectedDistanceInfo = option;
		},
		
		/**
		 * 站点类型筛选变化回调
		 */
		onStationTypeChange(option) {
			console.log('站点类型筛选变化：', option);
			this.selectedStationType = option.key;
			this.selectedStationTypeInfo = option;
		},
		
		/**
		 * 重置所有筛选
		 */
		resetFilters() {
			this.selectedDistance = null;
			this.selectedStationType = null;
			this.selectedDistanceInfo = null;
			this.selectedStationTypeInfo = null;
			
			// 也可以通过 ref 调用组件的 reset 方法
			// this.$refs.distanceFilter.reset();
			// this.$refs.stationTypeFilter.reset();
		}
	}
};
</script>

<style lang="scss" scoped>
.container {
	padding: 32rpx;
	background-color: #f7f8fa;
	min-height: 100vh;
}

.demo-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	text-align: center;
	margin-bottom: 40rpx;
}

.result-section {
	margin-top: 40rpx;
	padding: 24rpx;
	background-color: #fff;
	border-radius: 16rpx;
}

.result-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 16rpx;
}

.result-item {
	font-size: 26rpx;
	color: #666;
	margin-bottom: 8rpx;
}

.action-section {
	margin-top: 40rpx;
	text-align: center;
}

.reset-btn {
	background-color: #ff4757;
	color: #fff;
	border: none;
	border-radius: 8rpx;
	padding: 16rpx 32rpx;
	font-size: 28rpx;
}
</style>
