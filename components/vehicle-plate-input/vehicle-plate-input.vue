<template>
  <view class="vehicle-plate-input">
    <view class="input-container">
      <!-- 省份选择 -->
      <view class="province-selector" @click="showProvincePicker">
        <text class="province-text">{{ selectedProvince || '省' }}</text>
        <text class="arrow">▼</text>
      </view>

      <!-- 车牌号输入 -->
      <uv-input
        class="plate-input"
        v-model="plateNumber"
        :placeholder="selectedProvince ? '请输入车牌号' : '请先选择省份'"
        :maxlength="6"
        :formatter="plateFormatter"
        :focus="inputFocus"
        @focus="inputFocus = true"
        @blur="inputFocus = false"
        @input="onPlateInput"
        @change="onPlateInput"
        border="none"
        :customStyle="{
          flex: 1,
          padding: '24rpx',
          fontSize: '32rpx'
        }"
      />
    </view>

    <!-- 省份选择器 -->
    <uv-picker 
      ref="provincePicker" 
      :columns="[provinces]" 
      title="选择省份"
      @confirm="confirmProvince"
      @cancel="hideProvincePicker"
    ></uv-picker>
  </view>
</template>

<script>
export default {
  name: 'VehiclePlateInput',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      selectedProvince: '',
      plateNumber: '',
      inputFocus: false,
      // 中国大陆车牌省份缩写
      provinces: [
        '京', '津', '冀', '晋', '蒙', '辽', '吉', '黑',
        '沪', '苏', '浙', '皖', '闽', '赣', '鲁', '豫',
        '鄂', '湘', '粤', '桂', '琼', '渝', '川', '黔',
        '滇', '藏', '陕', '甘', '青', '宁', '新'
      ]
    };
  },
  computed: {
    fullPlateNumber() {
      return this.selectedProvince + this.plateNumber;
    }
  },
  watch: {
    value: {
      handler(newVal) {
        if (newVal) {
          // 解析已有的车牌号
          const province = newVal.charAt(0);
          const number = newVal.slice(1);
          this.selectedProvince = province;
          this.plateNumber = number;
        }
      },
      immediate: true
    },
    fullPlateNumber: {
      handler(newVal) {
        this.$emit('input', newVal);
      },
      immediate: true
    }
  },
  methods: {
    showProvincePicker() {
      this.$refs.provincePicker.open();
    },

    hideProvincePicker() {
      this.$refs.provincePicker.close();
    },

    confirmProvince(e) {
      // e.value 是选中的值数组，e.index 是选中的索引数组
      if (e.value && e.value.length > 0) {
        this.selectedProvince = e.value[0];
        // 触发v-model更新
        this.$emit('input', this.fullPlateNumber);
      }
      this.hideProvincePicker();
    },

    onPlateInput(e) {
      // uv-input的input事件可能返回事件对象，需要获取value
      let value = e;
      if (typeof e === 'object' && e.detail) {
        value = e.detail.value;
      }
      
      value = value.toUpperCase();
      value = value.replace(/[^0-9A-Z]/g, '');
      this.plateNumber = value;
      
      // 调试信息
      console.log('车牌号输入:', {
        inputValue: e,
        processedValue: value,
        plateNumber: this.plateNumber,
        selectedProvince: this.selectedProvince,
        fullPlateNumber: this.fullPlateNumber
      });
      
      // 手动触发v-model更新
      this.$emit('plateInput', this.fullPlateNumber);
    },

    // 车牌号格式化函数
    plateFormatter(value) {
      // 只允许输入数字和大写字母
      return value.toUpperCase().replace(/[^0-9A-Z]/g, '');
    },

    // 提交车牌号
    submit() {
      if (!this.selectedProvince) {
        uni.showToast({
          title: '请选择省份',
          icon: 'none'
        });
        return;
      }

      if (!this.plateNumber) {
        uni.showToast({
          title: '请输入车牌号',
          icon: 'none'
        });
        return;
      }

      this.$emit('submit', this.fullPlateNumber);
    },

    // 获取完整的车牌号（供父组件调用）
    getFullPlateNumber() {
      return this.fullPlateNumber;
    }
  }
};
</script>

<style scoped>
.vehicle-plate-input {
  position: relative;
}

.input-container {
  display: flex;
  align-items: center;
  background: #fff;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  overflow: hidden;
  margin-bottom: 40rpx;
}

.province-selector {
  display: flex;
  align-items: center;
  padding: 24rpx 20rpx;
  background: #f8f9fa;
  border-right: 2rpx solid #e0e0e0;
  min-width: 120rpx;
  justify-content: center;
}

.province-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-right: 8rpx;
}

.arrow {
  font-size: 20rpx;
  color: #999;
}

.plate-input {
  flex: 1;
}

</style>
