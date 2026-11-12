<template>
  <view class="vehicle-plate-input">
    <!-- 车牌号输入框 -->
    <view class="plate-container" :class="{ 'keyboard-active': showKeyboard }">
      <!-- 前7位车牌号 -->
      <view
          v-for="index in 7"
          :key="index"
          class="plate-char-box"
          :class="{
          'active': currentIndex === index - 1,
          'has-value': plateChars[index - 1] !== ''
        }"
          @click="focusInput(index - 1)"
      >
        <text class="plate-char">{{ plateChars[index - 1] || (index === 1 ? '省' : '') }}</text>
      </view>
      <!-- 新能源车牌第8位（可选） -->
      <view
          v-if="showNewEnergySlot"
          class="plate-char-box"
          :class="{
          'active': currentIndex === 7,
          'has-value': plateChars[7] !== ''
        }"
          @click="focusInput(7)"
      >
        <text class="plate-char">{{ plateChars[7] }}</text>
      </view>
    </view>

    <!-- 自定义键盘 -->
    <view class="custom-keyboard" v-if="showKeyboard">
      <view class="keyboard-header">
        <text class="keyboard-title">{{ keyboardTitle }}</text>
        <text class="keyboard-close" @click="closeKeyboard">完成</text>
      </view>

      <!-- 省份键盘 -->
      <view class="keyboard-content province-keyboard" v-if="currentIndex === 0">
        <view class="keyboard-row" v-for="(row, rowIndex) in provinceKeyboard" :key="rowIndex">
          <view
              v-for="(key, keyIndex) in row"
              :key="keyIndex"
              class="keyboard-key province-key"
              @click="onKeyPress(key)"
          >
            <text>{{ key }}</text>
          </view>
        </view>
      </view>

      <!-- 字母数字键盘 -->
      <view class="keyboard-content char-keyboard" v-else>
        <view class="keyboard-row" v-for="(row, rowIndex) in charKeyboard" :key="rowIndex">
          <view
              v-for="(key, keyIndex) in row"
              :key="keyIndex"
              class="keyboard-key"
              :class="{ 'delete-key': key === 'del' }"
              @click="onKeyPress(key)"
          >
            <text v-if="key !== 'del'">{{ key }}</text>
            <text v-else class="delete-icon">⌫</text>
          </view>
        </view>
        <view class="keyboard-row bottom-row">
          <view class="keyboard-key special-key" @click="onKeyPress('学')">
            <text>学</text>
          </view>
          <view class="keyboard-key special-key" @click="onKeyPress('警')">
            <text>警</text>
          </view>
          <view class="keyboard-key special-key" @click="onKeyPress('港')">
            <text>港</text>
          </view>
          <view class="keyboard-key special-key" @click="onKeyPress('澳')">
            <text>澳</text>
          </view>
          <view class="keyboard-key special-key" @click="onKeyPress('领')">
            <text>领</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'VehiclePlateInput',
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    autoFocus: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      plateChars: ['', '', '', '', '', '', '', ''], // 8位车牌号（含新能源）
      currentIndex: 0, // 当前输入位置
      showKeyboard: false, // 是否显示键盘
      showNewEnergySlot: true, // 是否显示新能源车牌第8位（默认显示，只接收新能源车牌）
      isUpdatingFromParent: false, // 标记是否正在从父组件更新
      // 省份键盘布局
      provinceKeyboard: [
        ['京', '津', '冀', '晋', '蒙', '辽', '吉', '黑'],
        ['沪', '苏', '浙', '皖', '闽', '赣', '鲁', '豫'],
        ['鄂', '湘', '粤', '桂', '琼', '渝', '川', '贵'],
        ['云', '藏', '陕', '甘', '青', '宁', '新'],
        ['使', '领', '警', '学', '港', '澳']
      ],
      // 字母数字键盘布局
      charKeyboard: [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'del']
      ]
    };
  },
  computed: {
    fullPlateNumber() {
      return this.plateChars.join('').replace(/\s/g, '');
    },
    keyboardTitle() {
      if (this.currentIndex === 0) {
        return '请选择省份';
      }
      return '请输入新能源车牌号';
    }
  },
  watch: {
    value: {
      handler(newVal) {
        // 避免循环更新
        if (this.isUpdatingFromParent) {
          return;
        }

        if (newVal !== undefined && newVal !== null && newVal !== this.fullPlateNumber) {
          this.isUpdatingFromParent = true;

          if (newVal === '') {
            // 如果是空值，清空所有输入
            this.plateChars = ['', '', '', '', '', '', '', ''];
            this.showNewEnergySlot = true; // 保持显示第8位输入框（默认只接收新能源车牌）
          } else {
            // 解析已有的车牌号
            const chars = newVal.split('');
            for (let i = 0; i < 8; i++) {
              this.plateChars[i] = chars[i] || '';
            }
            // 默认显示新能源车牌位（只接收新能源车牌）
            this.showNewEnergySlot = true;
          }

          this.$nextTick(() => {
            this.isUpdatingFromParent = false;
          });
        }
      },
      immediate: true
    }
  },
  mounted() {
    // 如果开启自动聚焦，延迟一点时间后自动打开键盘
    if (this.autoFocus) {
      setTimeout(() => {
        this.focusInput(0);
      }, 300);
    }
  },
  methods: {
    // 聚焦到指定输入位置
    focusInput(index) {
      this.currentIndex = index;
      this.showKeyboard = true;

      // 延迟一点，等待键盘动画完成后再滚动
      this.$nextTick(() => {
        setTimeout(() => {
          // 触发父组件滚动（如果在scrollView中）
          this.$emit('keyboard-show');
        }, 100);
      });
    },

    // 关闭键盘
    closeKeyboard() {
      this.showKeyboard = false;
      this.$emit('keyboard-hide');
    },

    // 按键按下
    onKeyPress(key) {
      if (key === 'del') {
        this.handleDelete();
        return;
      }

      // 特殊字符（学、警、港、澳、领）只能在第一位（索引0）和倒数两位（索引6和7）输入
      const specialChars = ['学', '警', '港', '澳', '领'];
      if (specialChars.includes(key)) {
        if (this.currentIndex !== 0 && this.currentIndex !== 6 && this.currentIndex !== 7) {
          // 不在允许的位置，不允许输入
          uni.showToast({
            title: '特殊字符只能在第一位或最后两位输入',
            icon: 'none',
            duration: 2000
          });
          return;
        }
      }

      // 输入字符
      if (this.currentIndex < 8) {
        this.$set(this.plateChars, this.currentIndex, key);

        // 在 nextTick 中触发 emit，确保 fullPlateNumber 已经更新
        this.$nextTick(() => {
          const newPlateNumber = this.fullPlateNumber;
          this.$emit('input', newPlateNumber);
          this.$emit('change', newPlateNumber);
        });

        // 自动跳转到下一位
        if (this.currentIndex < 7) {
          // 前7位，直接跳转到下一位
          this.currentIndex++;
          // 如果输入完第7位，确保显示第8位输入框
          if (this.currentIndex === 7) {
            this.showNewEnergySlot = true;
          }
        } else if (this.currentIndex === 7) {
          // 输入完第8位（新能源），关闭键盘
          this.closeKeyboard();
        }
      }
    },

    // 删除字符
    handleDelete() {
      if (this.plateChars[this.currentIndex]) {
        // 当前位有字符，删除当前位
        this.$set(this.plateChars, this.currentIndex, '');
      } else if (this.currentIndex > 0) {
        // 当前位无字符，删除上一位并回退
        this.currentIndex--;
        this.$set(this.plateChars, this.currentIndex, '');
        // 保持显示第8位输入框（默认只接收新能源车牌）
        this.showNewEnergySlot = true;
      }

      // 在 nextTick 中触发 emit，确保 fullPlateNumber 已经更新
      this.$nextTick(() => {
        const newPlateNumber = this.fullPlateNumber;
        this.$emit('input', newPlateNumber);
        this.$emit('change', newPlateNumber);
      });
    },

    // 提交车牌号
    submit() {
      const plateNumber = this.fullPlateNumber;

      if (!plateNumber || plateNumber.length < 8) {
        uni.showToast({
          title: '请输入完整的新能源车牌号（8位）',
          icon: 'none'
        });
        return false;
      }

      this.$emit('submit', plateNumber);
      return true;
    },

    // 获取完整的车牌号（供父组件调用）
    getFullPlateNumber() {
      return this.fullPlateNumber;
    },

    // 清空输入
    clear() {
      this.plateChars = ['', '', '', '', '', '', '', ''];
      this.currentIndex = 0;
      this.showNewEnergySlot = true; // 保持显示第8位输入框（默认只接收新能源车牌）
      this.$emit('input', '');
    }
  }
};
</script>

<style scoped>
.vehicle-plate-input {
  width: 100%;
}

/* 车牌输入框容器 */
.plate-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40rpx 20rpx;
  gap: 12rpx;
  transition: padding 0.3s ease;
}

.plate-container.keyboard-active {
  padding-bottom: 580rpx;
  /* 键盘头部(60rpx) + 键盘内容(约500rpx) + 额外间距(20rpx) */
}

/* 车牌字符框 */
.plate-char-box {
  width: 70rpx;
  height: 90rpx;
  background: #FFFFFF;
  border: 2rpx solid #E5E5E5;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.plate-char-box.active {
  border-color: #1989FA;
  background: #F0F8FF;
  box-shadow: 0 0 8rpx rgba(25, 137, 250, 0.3);
}

.plate-char-box.has-value {
  background: #F8F9FA;
  border-color: #E5E5E5;
}

/* 选中状态优先级最高 */
.plate-char-box.active.has-value {
  border-color: #1989FA;
  background: #F0F8FF;
}

.plate-char {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.plate-char-box:not(.has-value) .plate-char {
  color: #CCCCCC;
  font-size: 28rpx;
}

/* 自定义键盘 */
.custom-keyboard {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #D3D6DB;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 9999;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

/* 键盘头部 */
.keyboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #F7F8FA;
  border-bottom: 1rpx solid #E5E5E5;
}

.keyboard-title {
  font-size: 28rpx;
  color: #666;
}

.keyboard-close {
  font-size: 28rpx;
  color: #FF8C00;
  font-weight: bold;
  padding: 10rpx 20rpx;
}

/* 键盘内容区 */
.keyboard-content {
  padding: 20rpx 10rpx;
}

.keyboard-row {
  display: flex;
  justify-content: center;
  margin-bottom: 16rpx;
  gap: 12rpx;
}

/* 键盘按键 */
.keyboard-key {
  min-width: 64rpx;
  height: 80rpx;
  background: #FFFFFF;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  font-weight: 500;
  color: #333;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  flex: 1;
  max-width: 80rpx;
}

.keyboard-key:active {
  background: #E5E5E5;
  transform: scale(0.95);
}

/* 省份键盘按键 */
.province-key {
  min-width: 80rpx;
  max-width: 80rpx;
}

/* 删除键 */
.delete-key {
  background: #ABB3BF;
  color: #FFFFFF;
  min-width: 90rpx;
  max-width: 90rpx;
}

.delete-icon {
  font-size: 40rpx;
  color: #FFFFFF;
}

/* 底部特殊按键 */
.bottom-row {
  margin-top: 10rpx;
}

.special-key {
  min-width: 120rpx;
  max-width: 120rpx;
  background: #ABB3BF;
  color: #333;
}

.special-key text {
  font-size: 32rpx;
}
</style>
