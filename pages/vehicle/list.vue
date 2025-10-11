<template>
  <view class="vehicle-list-container">
    <!-- 车辆列表 -->
    <view class="card-list">
      <view class="vehicle-card" v-for="(vehicle, index) in vehicleList" :key="vehicle.id">
        <view class="card-main">
          <view class="type-tag">{{ vehicle.vehicleType === 'DianDong' ? '纯电动汽车' : '其他' }}</view>
          <view class="plate-number">{{ vehicle.plateNo }}</view>
          <view class="separator"></view>
          <view class="card-footer">
            <view class="default-option" @click="setDefault(vehicle)">
              <view class="radio-btn" :class="{ checked: vehicle.defaultVehicle === 0 }">
                <text v-if="vehicle.defaultVehicle === 0">✓</text>
              </view>
              <text :class="{ 'default-text-active': vehicle.defaultVehicle === 0 }">设为默认</text>
            </view>
            <view class="more-actions" @click="toggleActions(index)">
              <text>更多</text><uv-icon name="arrow-down" size="20"></uv-icon>
            </view>
          </view>
        </view>
        <!-- 更多操作面板 -->
        <view class="actions-panel" v-if="vehicle.showActions">
          <view class="action-btn delete-btn" @click="deleteVehicle(vehicle)">删除</view>
          <view class="action-btn edit-btn" @click="editVehicle(vehicle)">编辑</view>
        </view>
      </view>
    </view>

    <!-- 添加车辆按钮 -->
    <view class="add-vehicle-button" @click="showAddVehiclePopup">
      <text class="plus-icon">+</text>
      <text>添加爱车，享专属服务</text>
    </view>

    <!-- 车牌号输入弹窗 -->
    <uv-popup ref="addVehiclePopup" mode="bottom" :close-on-click-overlay="false" custom-style="height: 500rpx;">
      <view class="popup-container">
        <view class="popup-header">
          <text class="popup-title">{{ isEditMode ? '编辑车辆' : '添加车辆' }}</text>
          <text class="close-btn" @click="closeAddVehiclePopup">✕</text>
        </view>
        <view class="popup-content">
          <vehicle-plate-input
            @plateInput="plateInput"
            ref="plateInput"
            :value="newVehiclePlate"
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
import { getVehicleList, addVehicle, updateVehicleInfo, delVehicleInfo, updateDefaultVehicle } from '@/api/vehicle.js';
import VehiclePlateInput from '@/components/vehicle-plate-input/vehicle-plate-input.vue';

export default {
  components: {
    VehiclePlateInput
  },
  data() {
    return {
      vehicleList: [],
      newVehiclePlate: '',
      isEditMode: false, // 是否为编辑模式
      currentEditVehicle: null // 当前编辑的车辆信息
    };
  },
  onLoad() {
    this.fetchVehicleList();
  },
  methods: {
    plateInput(plateNo) {
      this.newVehiclePlate = plateNo;
      console.log('车牌号输入:', this.newVehiclePlate);
    },
    async fetchVehicleList() {
      uni.showLoading({ title: '加载中...' });
      try {
        const res = await getVehicleList();
        if (res.code === 0) {
          // 为每项添加一个用于控制操作面板显示的属性
          this.vehicleList = res.data.map(vehicle => ({
            ...vehicle,
            showActions: false
          }));
        } else {
          uni.showToast({ title: '加载失败', icon: 'none' });
        }
      } catch (error) {
        console.error('获取车辆列表失败:', error);
        uni.showToast({ title: '网络错误', icon: 'none' });
      } finally {
        uni.hideLoading();
      }
    },
    /**
     * @description 设为默认车辆
     * @param {object} vehicle - 被点击的车辆对象
     */
    async setDefault(vehicle) {
      if (!vehicle.id) {
        uni.showToast({
          title: '设置失败：车辆ID无效',
          icon: 'none'
        });
        return;
      }

      // 如果已经是默认车辆，则不需要操作
      if (vehicle.defaultVehicle === 0) {
        uni.showToast({
          title: '该车辆已是默认车辆',
          icon: 'none'
        });
        return;
      }

      try {
        uni.showLoading({ title: '设置中...' });

        const response = await updateDefaultVehicle(vehicle.id);

        if (response.code === 0) {
          // 设置成功后重新获取车辆列表以更新状态
          await this.fetchVehicleList();
          
          uni.showToast({
            title: '设置默认车辆成功',
            icon: 'success'
          });
        } else {
          uni.showToast({
            title: response.msg || '设置失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('设置默认车辆失败:', error);
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
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
      this.$refs.addVehiclePopup.open('bottom');
    },

    /**
     * @description 编辑车辆
     * @param {object} vehicle - 要编辑的车辆信息
     */
    editVehicle(vehicle) {
      this.isEditMode = true;
      this.currentEditVehicle = vehicle;
      this.newVehiclePlate = vehicle.plateNo || '';
      // 关闭操作面板
      vehicle.showActions = false;
      this.$refs.addVehiclePopup.open('bottom');
    },

    /**
     * @description 关闭添加车辆弹窗
     */
    closeAddVehiclePopup() {
      this.$refs.addVehiclePopup.close();
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
      if (plateNo.length < 2) {
        uni.showToast({
          title: '请输入完整的车牌号',
          icon: 'none'
        });
        return;
      }

      try {
        uni.showLoading({ title: '添加中...' });

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
      if (plateNo.length < 2) {
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
        uni.showLoading({ title: '更新中...' });

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
            this.confirmDeleteVehicle(vehicle.id);
          }
        }
      });
      // 关闭操作面板
      vehicle.showActions = false;
    },

    /**
     * @description 确认删除车辆
     * @param {number} vehicleId - 车辆ID
     */
    async confirmDeleteVehicle(vehicleId) {
      if (!vehicleId) {
        uni.showToast({
          title: '删除失败：车辆ID无效',
          icon: 'none'
        });
        return;
      }

      try {
        uni.showLoading({ title: '删除中...' });

        const response = await delVehicleInfo(vehicleId);

        if (response.code === 0) {
          // 删除成功后重新获取车辆列表
          await this.fetchVehicleList();
          
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
  background-color: #f5f5f5;
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
}
.card-list {
  padding-bottom: 150rpx; /* 为底部按钮留出空间 */
}
.vehicle-card {
  background-color: white;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.card-main {
    position: relative;
    padding: 24rpx;
}
.type-tag {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #e6f7f2;
  color: #00c777;
  padding: 4rpx 12rpx;
  font-size: 22rpx;
  border-radius: 0 16rpx 0 16rpx;
}
.plate-number {
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  padding: 32rpx 0;
}
.separator {
  height: 1rpx;
  background-color: #f0f0f0;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24rpx;
}
.default-option {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #999;
}
.default-text-active {
    color: #007AFF;
}
.radio-btn {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 2rpx solid #ccc;
  margin-right: 12rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}
.radio-btn.checked {
  background-color: #007AFF;
  border-color: #007AFF;
  color: white;
}
.more-actions {
  font-size: 28rpx;
  color: #666;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

/* 操作面板 */
.actions-panel {
  display: flex;
  background-color: #f7f7f7;
}
.action-btn {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  color: white;
  font-size: 28rpx;
}
.delete-btn {
  background-color: #f01f1f;
}
.edit-btn {
  background-color: #007aff;
}

/* 添加按钮 */
.add-vehicle-button {
  position: fixed;
  bottom: 32rpx;
  left: 5%;
  width: 90%;
  background-color: #007aff;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24rpx;
  border-radius: 40rpx;
  font-size: 32rpx;
}
.plus-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
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
}

.button-container {
  display: flex;
  margin-top: 40rpx;
  /* flex: 1; */
  justify-content: space-between;
}
</style>
