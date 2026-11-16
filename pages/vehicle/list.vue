<template>
  <view class="vehicle-list-container">
    <uv-navbar :border="false" :autoBack="false" title="我的车辆" placeholder safeAreaInsetTop @leftClick="handleNavBack"></uv-navbar>

    <!-- 有车辆 -->
    <view class="card-list" v-if="vehicleList.length">
      <view
          class="vehicle-card"
          :class="{ 'is-active': vehicle.defaultVehicle === 0 }"
          v-for="vehicle in vehicleList"
          :key="vehicle.id"
          @click="handleSelect(vehicle)"
      >
        <!-- 车牌牌匾 -->
        <view class="plate-wrap">
          <view class="plate">
            <text class="plate-head">{{ vehicle.plateHead }}</text>
            <text class="plate-letter">{{ vehicle.plateLetter }}</text>
            <view class="plate-dot"></view>
            <text class="plate-rest">{{ vehicle.plateRest }}</text>
          </view>
          <view class="radio" :class="{ checked: vehicle.defaultVehicle === 0 }">
            <text v-if="vehicle.defaultVehicle === 0" class="radio-tick">✓</text>
          </view>
        </view>

        <!-- 操作行 -->
        <view class="card-footer">
          <view class="default-flag" :class="{ 'is-on': vehicle.defaultVehicle === 0 }">
            <view class="flag-dot"></view>
            <text>{{ vehicle.defaultVehicle === 0 ? '默认车辆' : '设为默认' }}</text>
          </view>
          <view class="more-actions">
            <view class="act act-edit" @click.stop="editVehicle(vehicle)">
              <uv-icon color="#24A4EF" name="edit-pen" size="15"></uv-icon>
              <text class="act-label">编辑</text>
            </view>
            <view class="act act-del" @click.stop="deleteVehicle(vehicle)">
              <uv-icon color="#E24B4A" name="trash" size="15"></uv-icon>
              <text class="act-label">删除</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 新增车牌（虚线位） -->
      <view class="add-plate" @click="showAddVehiclePopup">
        <text class="add-plate-plus">＋</text>
        <text>添加车牌</text>
      </view>
    </view>

    <!-- 空态 -->
    <view class="empty-state" v-else>
      <view class="empty-plate">
        <view class="empty-dot"></view>
        <view class="empty-dot"></view>
        <view class="empty-dot"></view>
        <view class="empty-dot"></view>
        <view class="empty-dot"></view>
      </view>
      <text class="empty-title">还没有添加爱车</text>
      <text class="empty-desc">绑定车牌后，充电时可直接享受站点停车减免</text>
      <view class="empty-btn" @click="showAddVehiclePopup">添加车牌</view>
    </view>

    <!-- 添加车辆按钮（空态时由页面中央按钮承担，避免重复） -->
    <view class="add-vehicle-button" v-if="vehicleList.length" @click="showAddVehiclePopup">
      <text>添加爱车，享专属服务</text>
    </view>

    <!-- 车牌号输入弹窗 -->
    <uv-popup ref="addVehiclePopup" mode="bottom" :close-on-click-overlay="false" :custom-style="popupStyle">
      <view class="popup-container">
        <view class="popup-header">
          <text class="popup-title">{{ isEditMode ? '编辑车辆' : '添加车辆' }}</text>
          <text class="close-btn" @click="closeAddVehiclePopup">✕</text>
        </view>
        <view class="popup-content">
          <vehicle-plate-input
              v-model="newVehiclePlate"
              ref="plateInput"
              @input="handlePlateInput"
              @change="handlePlateChange"
              @keyboard-show="onKeyboardShow"
              @keyboard-hide="onKeyboardHide"
          />
          <view class="button-container">
            <uv-button
                text="取消"
                type="default"
                size="large"
                :plain="true"
                @click="closeAddVehiclePopup"
            ></uv-button>
            <uv-button
                text="提交"
                type="primary"
                size="large"
                @click="handleSubmit"
            ></uv-button>
          </view>
        </view>
      </view>
    </uv-popup>
  </view>
</template>

<script>
import {getVehicleList, addVehicle, updateVehicleInfo, delVehicleInfo, updateDefaultVehicle} from '@/api/vehicle.js';
import VehiclePlateInput from '@/components/vehicle-plate-input/vehicle-plate-input.vue';
import { handleNavBack } from '@/utils/utils';
import globalData from '@/globalData';

export default {
  components: {
    VehiclePlateInput
  },
  data() {
    return {
      vehicleList: [],
      newVehiclePlate: '',
      isEditMode: false, // 是否为编辑模式
      currentEditVehicle: null, // 当前编辑的车辆信息
      keyboardVisible: false // 键盘是否显示
    };
  },
  computed: {
    popupStyle() {
      // 键盘显示时高度为80vh，隐藏时为350rpx
      const height = this.keyboardVisible ? '1000rpx' : '550rpx';
      return `height: ${height}; max-height: ${height}; transition: height 0.3s ease;`;
    }
  },
  onLoad() {
    this.fetchVehicleList();
  },
  onShareAppMessage() {
    return {
      title: this.getWxAppName(),
      path: '/pages/vehicle/list'
    }
  },
  methods: {
    handleNavBack,
    getWxAppName() {
      return globalData.wxAppName;
    },
    // 处理车牌号输入
    handlePlateInput(plateNo) {
      this.newVehiclePlate = plateNo;
    },

    // 处理车牌号变化
    handlePlateChange(plateNo) {
      this.newVehiclePlate = plateNo;
    },

    // 键盘显示时的回调
    onKeyboardShow() {
      this.keyboardVisible = true;
    },

    // 键盘隐藏时的回调
    onKeyboardHide() {
      this.keyboardVisible = false;
    },
    async fetchVehicleList() {
      uni.showLoading({title: '加载中...'});
      try {
        const res = await getVehicleList();
        if (res.code === 0) {
          // 拆解车牌（省份简称 / 字母 / 序号），用于牌匾式展示
          this.vehicleList = (res.data || []).map(vehicle => {
            const plate = vehicle.plateNo || '';
            return {
              ...vehicle,
              showActions: false,
              plateHead: plate.slice(0, 1),
              plateLetter: plate.slice(1, 2),
              plateRest: plate.slice(2)
            };
          });
        } else {
          uni.showToast({title: '加载失败', icon: 'none'});
        }
      } catch (error) {
        console.error('获取车辆列表失败:', error);
        if (error.code === 2) {
          uni.showToast({title: '请先登录', icon: 'none'});
          return;
        } else {
          uni.showToast({title: '网络错误', icon: 'none'});
          return;
        }
      } finally {
        uni.hideLoading();
      }
    },
    /**
     * @description 点击车牌卡片：设为默认车辆，成功后返回上一页
     * @param {object} vehicle - 被点击的车辆对象
     */
    async handleSelect(vehicle) {
      const isDefault = vehicle.defaultVehicle === 0;
      if (isDefault) {
        // 已经是默认车辆，直接返回
        this.goBackAfterSelect();
        return;
      }
      const success = await this.setDefault(vehicle);
      if (success) {
        this.goBackAfterSelect();
      }
    },

    /**
     * @description 选好车辆后返回上一页（无上一页则留在本页）
     */
    goBackAfterSelect() {
      const pages = getCurrentPages();
      if (pages && pages.length > 1) {
        setTimeout(() => {
          uni.navigateBack();
        }, 600);
      }
    },

    /**
     * @description 设为默认车辆
     * @param {object} vehicle - 被点击的车辆对象
     * @returns {Promise<boolean>} 是否设置成功
     */
    async setDefault(vehicle) {
      if (!vehicle.id) {
        uni.showToast({
          title: '设置失败：车辆ID无效',
          icon: 'none'
        });
        return false;
      }

      // 如果已经是默认车辆，则不需要操作
      if (vehicle.defaultVehicle === 0) {
        return true;
      }

      try {
        uni.showLoading({title: '设置中...'});

        const response = await updateDefaultVehicle(vehicle.id);

        if (response.code === 0) {
          // 设置成功后重新获取车辆列表以更新状态
          await this.fetchVehicleList();

          uni.showToast({
            title: '设置默认车辆成功',
            icon: 'success'
          });
          return true;
        } else {
          uni.showToast({
            title: response.msg || '设置失败',
            icon: 'none'
          });
          return false;
        }
      } catch (error) {
        console.error('设置默认车辆失败:', error);
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
        return false;
      } finally {
        uni.hideLoading();
      }
    },
    /**
     * @description 切换更多操作面板的显示
     * @param {number} index - 车辆在列表中的索引
     */
    toggleActions(index) {
      // 关闭其他所有面板，只打开或关闭当前的
      this.vehicleList.forEach((v, i) => {
        if (i !== index) {
          v.showActions = false;
        }
      });
      this.vehicleList[index].showActions = !this.vehicleList[index].showActions;
    },

    /**
     * @description 显示添加车辆弹窗
     */
    showAddVehiclePopup() {
      this.isEditMode = false;
      this.currentEditVehicle = null;
      this.newVehiclePlate = '';
      this.keyboardVisible = false;
      this.$refs.addVehiclePopup.open('bottom');

      // 延迟后自动聚焦到输入框
      setTimeout(() => {
        if (this.$refs.plateInput) {
          this.$refs.plateInput.focusInput(0);
        }
      }, 300);
    },

    /**
     * @description 编辑车辆
     * @param {object} vehicle - 要编辑的车辆信息
     */
    editVehicle(vehicle) {
      this.isEditMode = true;
      this.currentEditVehicle = vehicle;
      this.newVehiclePlate = vehicle.plateNo || '';
      this.keyboardVisible = false;
      // 关闭操作面板
      vehicle.showActions = false;
      this.$refs.addVehiclePopup.open('bottom');

      // 延迟后自动聚焦到输入框
      setTimeout(() => {
        if (this.$refs.plateInput) {
          // 如果是编辑模式，找到第一个空位或最后一位
          const emptyIndex = this.$refs.plateInput.plateChars.findIndex(char => char === '');
          const focusIndex = emptyIndex !== -1 ? emptyIndex : this.$refs.plateInput.plateChars.length - 1;
          this.$refs.plateInput.focusInput(focusIndex);
        }
      }, 300);
    },

    /**
     * @description 关闭添加车辆弹窗
     */
    closeAddVehiclePopup() {
      // 先关闭键盘
      if (this.$refs.plateInput) {
        this.$refs.plateInput.closeKeyboard();
      }
      this.keyboardVisible = false;
      // 延迟关闭弹窗，让键盘动画完成
      setTimeout(() => {
        this.$refs.addVehiclePopup.close();
      }, 100);
    },

    /**
     * @description 处理提交按钮点击
     */
    handleSubmit() {
      const plateNo = this.newVehiclePlate;

      if (this.isEditMode) {
        this.updateVehicle(plateNo);
      } else {
        this.submitVehicle(plateNo);
      }
    },

    /**
     * @description 提交车辆信息
     */
    async submitVehicle(plateNo) {
      if (!plateNo) {
        uni.showToast({
          title: '请输入车牌号',
          icon: 'none'
        });
        return;
      }

      // 验证车牌号格式
      if (plateNo.length < 7) {
        uni.showToast({
          title: '请输入完整的车牌号',
          icon: 'none'
        });
        return;
      }

      try {
        uni.showLoading({title: '添加中...'});

        // 调用添加车辆接口
        const requestData = {
          plateNo: plateNo,
          carNatureId: 0,
          mileage: '',
          vehicleType: 'DianDong',
          vin: ''
        };

        const response = await addVehicle(requestData);

        if (response.code === 0) {
          // 添加成功后重新获取车辆列表
          await this.fetchVehicleList();

          uni.showToast({
            title: '车辆添加成功',
            icon: 'success'
          });

          this.closeAddVehiclePopup();
        } else {
          uni.showToast({
            title: response.msg || '添加失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('添加车辆失败:', error);
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },

    /**
     * @description 更新车辆信息
     */
    async updateVehicle(plateNo) {
      if (!plateNo) {
        uni.showToast({
          title: '请输入车牌号',
          icon: 'none'
        });
        return;
      }

      // 验证车牌号格式
      if (plateNo.length < 7) {
        uni.showToast({
          title: '请输入完整的车牌号',
          icon: 'none'
        });
        return;
      }

      if (!this.currentEditVehicle || !this.currentEditVehicle.id) {
        uni.showToast({
          title: '编辑车辆信息错误',
          icon: 'none'
        });
        return;
      }

      try {
        uni.showLoading({title: '更新中...'});

        // 构建更新请求数据
        const requestData = {
          plateNo: plateNo,
          brandId: this.currentEditVehicle.brandId || null,
          carTypeId: this.currentEditVehicle.carTypeId || null,
          carNatureId: this.currentEditVehicle.carNatureId || 0,
          mileage: this.currentEditVehicle.mileage || null,
          vehicleType: this.currentEditVehicle.vehicleType || 'DianDong',
          vin: this.currentEditVehicle.vin || '',
          id: this.currentEditVehicle.id
        };

        const response = await updateVehicleInfo(requestData);

        if (response.code === 0) {
          // 更新成功后重新获取车辆列表
          await this.fetchVehicleList();

          uni.showToast({
            title: '车辆更新成功',
            icon: 'success'
          });

          this.closeAddVehiclePopup();
        } else {
          uni.showToast({
            title: response.msg || '更新失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('更新车辆失败:', error);
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },

    /**
     * @description 删除车辆
     * @param {object} vehicle - 要删除的车辆信息
     */
    deleteVehicle(vehicle) {
      // 显示确认对话框
      uni.showModal({
        title: '确认删除',
        content: `确定要删除车牌号为"${vehicle.plateNo}"的车辆吗？`,
        confirmText: '删除',
        cancelText: '取消',
        confirmColor: '#ff4757',
        success: (res) => {
          if (res.confirm) {
            // 检查是否是默认车辆，如果是，需要在删除后设置新的默认车辆
            const isDefaultVehicle = vehicle.defaultVehicle === 0;
            this.confirmDeleteVehicle(vehicle.id, isDefaultVehicle);
          }
        }
      });
      // 关闭操作面板
      vehicle.showActions = false;
    },

    /**
     * @description 确认删除车辆
     * @param {number} vehicleId - 车辆ID
     * @param {boolean} isDefaultVehicle - 是否是默认车辆
     */
    async confirmDeleteVehicle(vehicleId, isDefaultVehicle = false) {
      if (!vehicleId) {
        uni.showToast({
          title: '删除失败：车辆ID无效',
          icon: 'none'
        });
        return;
      }

      try {
        uni.showLoading({title: '删除中...'});

        const response = await delVehicleInfo(vehicleId);

        if (response.code === 0) {
          // 删除成功后重新获取车辆列表
          await this.fetchVehicleList();

          // 如果删除的是默认车辆，且还有剩余车辆，将第一个车辆设为默认
          if (isDefaultVehicle && this.vehicleList.length > 0) {
            const firstVehicle = this.vehicleList[0];
            if (firstVehicle && firstVehicle.id) {
              try {
                await updateDefaultVehicle(firstVehicle.id);
                // 重新获取列表以更新状态
                await this.fetchVehicleList();
              } catch (error) {
                console.error('设置默认车辆失败:', error);
              }
            }
          }

          uni.showToast({
            title: '车辆删除成功',
            icon: 'success'
          });
        } else {
          uni.showToast({
            title: response.msg || '删除失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('删除车辆失败:', error);
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    }
  }
};
</script>

<style scoped>
.vehicle-list-container {
  background-color: #F5F6F8;
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
}

.card-list {
  padding-bottom: 180rpx; /* 为底部按钮留出空间 */
}

/* ===== 车辆卡片：车牌牌匾 ===== */
.vehicle-card {
  background-color: #FFFFFF;
  border-radius: 32rpx;
  border: 3rpx solid transparent;
  padding: 28rpx 28rpx 6rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(17, 24, 39, 0.05);
}

.vehicle-card.is-active {
  border-color: #24A4EF;
  background: linear-gradient(180deg, #F7FBFF 0%, #FFFFFF 60%);
  box-shadow: 0 8rpx 28rpx rgba(36, 164, 239, 0.16);
}

.plate-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

/* 新能源绿牌 */
.plate {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  min-width: 300rpx;
  height: 84rpx;
  padding: 0 26rpx;
  box-sizing: border-box;
  border-radius: 14rpx;
  background: linear-gradient(180deg, #A7DE72 0%, #35A46A 100%);
  border: 1rpx solid #FFFFFF;
  box-shadow: 0 4rpx 14rpx rgba(53, 164, 106, 0.28);
}

.plate-head,
.plate-letter,
.plate-rest {
  font-size: 38rpx;
  font-weight: bold;
  color: #FFFFFF;
  letter-spacing: 2rpx;
  line-height: 1;
}

.plate-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #FFFFFF;
  margin: 0 10rpx;
}

.radio {
  flex-shrink: 0;
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  border: 3rpx solid #D8DCE3;
  background-color: #FFFFFF;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio.checked {
  border-color: #24A4EF;
  background-color: #24A4EF;
}

.radio-tick {
  font-size: 24rpx;
  font-weight: bold;
  color: #FFFFFF;
  line-height: 1;
}

/* 操作行 */
.card-footer {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 24rpx;
  padding: 20rpx 0 22rpx;
  border-top: 1rpx dashed #EDEFF3;
}

.default-flag {
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 24rpx;
  color: #6B7280;
}

.default-flag.is-on {
  color: #1B6EF3;
  font-weight: bold;
}

.flag-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background-color: #D1D5DB;
  margin-right: 10rpx;
}

.default-flag.is-on .flag-dot {
  background-color: #24A4EF;
}

.more-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.act {
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 24rpx;
  margin-left: 32rpx;
}

.act-label {
  margin-left: 6rpx;
  color: inherit;
}

.act-edit {
  color: #24A4EF;
}

.act-del {
  color: #E24B4A;
}

/* 新增车牌虚线位 */
.add-plate {
  height: 132rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #C9D2DE;
  border-radius: 32rpx;
  background-color: rgba(255, 255, 255, 0.6);
  font-size: 28rpx;
  color: #8B93A1;
  margin-bottom: 24rpx;
}

.add-plate-plus {
  font-size: 32rpx;
  color: #24A4EF;
  margin-right: 8rpx;
}

/* 空态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 48rpx 0;
}

.empty-plate {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 340rpx;
  height: 108rpx;
  border: 2rpx dashed #C9D2DE;
  border-radius: 16rpx;
  background-color: rgba(255, 255, 255, 0.7);
}

.empty-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: #D8DCE3;
  margin: 0 10rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-top: 40rpx;
}

.empty-desc {
  font-size: 24rpx;
  color: #8B93A1;
  margin-top: 16rpx;
  text-align: center;
  line-height: 1.6;
}

.empty-btn {
  margin-top: 48rpx;
  height: 80rpx;
  padding: 0 64rpx;
  border-radius: 40rpx;
  background-color: #24A4EF;
  color: #FFFFFF;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(36, 164, 239, 0.3);
}

/* 添加按钮 */
.add-vehicle-button {
  position: fixed;
  bottom: 32rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 600rpx;
  background-color: #24A4EF;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32rpx 24rpx;
  border-radius: 50rpx;
  font-size: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 122, 255, 0.3);
  z-index: 100;
}


/* 弹窗样式 */
.popup-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  font-size: 36rpx;
  color: #999;
  padding: 10rpx;
}

.popup-content {
  flex: 1;
  padding: 30rpx;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.button-container {
  display: flex;
  margin-top: 40rpx;
  /* flex: 1; */
  justify-content: space-between;
}
</style>
