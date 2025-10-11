<template>
  <uv-popup 
    ref="popup" 
    mode="center" 
    :width="600" 
    :height="520" 
    :round="20" 
    :maskCloseAble="false"
    @close="handleClose"
  >
    <view class="popup-container">
      <!-- 关闭按钮 -->
      <view class="close-btn" @click="handleClose">
        <uv-icon name="close" size="20" color="#999"></uv-icon>
      </view>
      
      <!-- 弹窗内容 -->
      <view class="popup-content">
        <!-- 标题 -->
        <view class="title">
          你有{{ totalCount }}笔超时占位订单待支付
        </view>
        
        <!-- 站点信息 -->
        <view class="station-info">
          <text class="station-name">{{ billData?.stationName || '节能测试站' }}</text>
        </view>
        
        <!-- 时间信息 -->
        <view class="time-info">
          <text class="time-text">{{ formattedTime }}</text>
        </view>
        
        <!-- 费用信息 -->
        <view class="fee-info">
          <text class="fee-label">超时占位时长：</text>
          <text class="fee-duration">{{ occupyDuration }}分钟</text>
        </view>
        
        <view class="fee-info">
          <text class="fee-label">应付费用：</text>
          <text class="fee-amount">￥ {{ formattedFee }}</text>
        </view>
        
        <!-- 操作按钮 -->
        <view class="button-group">
          <button class="later-btn" @click="handleLater">稍后再说</button>
          <button class="pay-btn" @click="handlePay">立即支付</button>
        </view>
      </view>
    </view>
  </uv-popup>
</template>

<script>
export default {
  name: 'OccupyBillPopup',
  props: {
    billData: {
      type: Object,
      default: () => null
    }
  },
  computed: {
    // 格式化时间
    formattedTime() {
      if (!this.billData?.timeS) {
        return '2025.08.20 16:07:10';
      }
      
      const date = new Date(this.billData.timeS);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
    },
    
    // 格式化费用（分转元）
    formattedFee() {
      if (!this.billData?.busBalance) {
        return '0.40';
      }
      return (this.billData.busBalance / 100).toFixed(2);
    },
    
    // 计算超时占位时长
    occupyDuration() {
      if (!this.billData?.actualDuration) {
        return '4';
      }
      return this.billData.actualDuration.toString();
    },
    
    // 总订单数量
    totalCount() {
      return this.billData?.totalCount || 2;
    }
  },
  methods: {
    // 显示弹窗
    show() {
      this.$refs.popup.open();
    },
    
    // 隐藏弹窗
    hide() {
      this.$refs.popup.close();
    },
    
    // 处理关闭事件
    handleClose() {
      this.hide();
      this.$emit('close');
    },
    
    // 处理稍后再说
    handleLater() {
      this.hide();
      this.$emit('later');
    },
    
    // 处理立即支付
    handlePay() {
      this.hide();
      this.$emit('pay', this.billData);
    }
  }
}
</script>

<style lang="less" scoped>
.popup-container {
  position: relative;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.popup-content {
  padding: 60rpx 40rpx 40rpx;
  text-align: center;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 40rpx;
  line-height: 1.4;
}

.station-info {
  margin-bottom: 20rpx;
}

.station-name {
  font-size: 28rpx;
  color: #666;
}

.time-info {
  margin-bottom: 30rpx;
}

.time-text {
  font-size: 24rpx;
  color: #999;
}

.fee-info {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20rpx;
  
  .fee-label {
    font-size: 28rpx;
    color: #666;
  }
  
  .fee-duration {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
  }
  
  .fee-amount {
    font-size: 28rpx;
    color: #ff6b6b;
    font-weight: bold;
  }
}

.button-group {
  display: flex;
  gap: 20rpx;
  margin-top: 50rpx;
}

.later-btn,
.pay-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  border: none;
  font-size: 28rpx;
  line-height: 80rpx;
}

.later-btn {
  background: #f5f5f5;
  color: #666;
}

.pay-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: #fff;
}
</style>