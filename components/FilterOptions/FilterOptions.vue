<template>
	<view class="filter-options">
		<!-- 标题 -->
		<view class="filter-title">{{ data.name }}</view>
		
		<!-- 选项列表 -->
		<view class="options-grid">
			<view 
				v-for="(option, index) in data.list" 
				:key="index"
				class="option-item"
				:class="{ 'option-active': selectedKey === option.key }"
				@click="selectOption(option)"
			>
				{{ option.value }}
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'FilterOptions',
	props: {
		// 筛选数据
		data: {
			type: Object,
			required: true,
			default: () => ({
				name: '',
				list: []
			})
		},
		// 默认选中的值
		defaultValue: {
			type: [String, Number],
			default: null
		}
	},
	data() {
		return {
			selectedKey: null
		};
	},
	watch: {
		defaultValue: {
			immediate: true,
			handler(newVal) {
				this.selectedKey = newVal;
			}
		}
	},
	methods: {
		/**
		 * 选择选项
		 * @param {Object} option - 选中的选项 { value: '1KM', key: 1 }
		 */
		selectOption(option) {
			this.selectedKey = option.key;
			
			// 向父组件传递选中的值
			this.$emit('change', {
				key: option.key,
				value: option.value,
				name: this.data.name
			});
		},
		
		/**
		 * 重置选择
		 */
		reset() {
			this.selectedKey = null;
		}
	}
};
</script>

<style lang="scss" scoped>
.filter-options {
	padding: 24rpx 0;
}

.filter-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 24rpx;
}

.options-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16rpx;
}

.option-item {
	height: 64rpx;
	border: 2rpx solid #e5e5e5;
	border-radius: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 26rpx;
	color: #666;
	background-color: #fff;
	transition: all 0.3s ease;
	cursor: pointer;
	
	&:hover {
		border-color: #2594FB;
		color: #2594FB;
	}
	
	&.option-active {
		border-color: #2594FB;
		background-color: #2594FB;
		color: #fff;
	}
}

/* 响应式布局调整 */
@media (max-width: 750rpx) {
	.options-grid {
		grid-template-columns: repeat(3, 1fr);
	}
}

@media (max-width: 500rpx) {
	.options-grid {
		grid-template-columns: repeat(2, 1fr);
	}
	
	.option-item {
		font-size: 24rpx;
		height: 60rpx;
	}
}
</style>
