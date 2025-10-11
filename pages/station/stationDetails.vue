<template>
  <view class="page-container">
    <!-- 主内容区域 -->
    <view class="main-content">
      <!-- 顶部站点信息卡片 -->
      <view class="station-card">
        <view class="station-info">
          <!-- 站点名称 -->
          <view class="station-name">{{ stationInfo.name }}</view>
          <view class="station-images-container">
            <!-- 站点照片横向滚动列表 -->
            <uv-scroll-list 
              v-if="stationImages && stationImages.length > 0"
              :indicator="false"
              @left="onScrollLeft" 
              @right="onScrollRight"
            >
              <view class="image-scroll-list">
                <view 
                  v-for="(imageUrl, index) in stationImages" 
                  :key="index"
                  class="image-item"
                  @click="previewImage(imageUrl, index)"
                >
                  <image 
                    :src="imageUrl" 
                    mode="aspectFill"
                    class="station-image"
                    :lazy-load="true"
                  />
                </view>
              </view>
            </uv-scroll-list>
            <!-- 无图片时的占位 -->
            <view v-else class="no-image-placeholder">
              <text>暂无站点照片</text>
            </view>
          </view>
          <view class="station-address-distance">
            <!-- 地址 -->
            <view class="station-address">{{ stationInfo.street }}</view>
            <!-- 距离 -->
            <view class="station-distance">{{ stationInfo.distance }} km</view>
          </view>
        </view>



      </view>

      <!-- 费用信息 -->
      <view class="card">
        <view class="card-header">
          <text>费用信息</text>
          <uv-button text="终端列表 >" type="primary" plain shape="circle" size="small" @click="goToStationGunList"></uv-button>
        </view>

        <!-- 慢充价格信息（如果有） -->
        <PriceInfo
            v-if="stationInfo.gunPriceInfo && stationInfo.gunPriceInfo.slowItem"
            chargeType="慢"
            :gunCount="stationInfo.gunPriceInfo.slowItem.gunCount"
            :freeGunCount="stationInfo.gunPriceInfo.slowItem.freeGunCount"
            :timeRange="`${stationInfo.gunPriceInfo.slowItem.currentStartTime}-${stationInfo.gunPriceInfo.slowItem.currentEndTime}`"
            :currentPrice="stationInfo.gunPriceInfo.slowItem.currentPriceStr"
            :discountPriceStr="stationInfo.gunPriceInfo.slowItem.discountPriceStr"
            :electricPrice="stationInfo.gunPriceInfo.slowItem.currentPowerPriceStr || '暂无信息'"
            :servicePrice="stationInfo.gunPriceInfo.slowItem.currentServicePriceStr || '暂无信息'"
        />

        <!-- 快充价格信息 -->
        <PriceInfo
            v-if="stationInfo.gunPriceInfo && stationInfo.gunPriceInfo.fastItem"
            chargeType="快"
            :gunCount="stationInfo.gunPriceInfo.fastItem.gunCount"
            :freeGunCount="stationInfo.gunPriceInfo.fastItem.freeGunCount"
            :timeRange="`${stationInfo.gunPriceInfo.fastItem.currentStartTime}-${stationInfo.gunPriceInfo.fastItem.currentEndTime}`"
            :currentPrice="stationInfo.gunPriceInfo.fastItem.currentPriceStr"
            :discountPriceStr="stationInfo.gunPriceInfo.fastItem.discountPriceStr"
            :electricPrice="stationInfo.gunPriceInfo.fastItem.currentPowerPriceStr || '暂无信息'"
            :servicePrice="stationInfo.gunPriceInfo.fastItem.currentServicePriceStr || '暂无信息'"
        />

        <!-- 超充价格信息（如果有） -->
        <PriceInfo
            v-if="stationInfo.gunPriceInfo && stationInfo.gunPriceInfo.superItem"
            chargeType="超"
            :gunCount="stationInfo.gunPriceInfo.superItem.gunCount"
            :freeGunCount="stationInfo.gunPriceInfo.superItem.freeGunCount"
            :timeRange="`${stationInfo.gunPriceInfo.superItem.currentStartTime}-${stationInfo.gunPriceInfo.superItem.currentEndTime}`"
            :currentPrice="stationInfo.gunPriceInfo.superItem.currentPriceStr"
            :discountPriceStr="stationInfo.gunPriceInfo.superItem.discountPriceStr"
            :electricPrice="stationInfo.gunPriceInfo.superItem.currentPowerPriceStr || '暂无信息'"
            :servicePrice="stationInfo.gunPriceInfo.superItem.currentServicePriceStr || '暂无信息'"
        />
        <view class="collapse-wrapper">
          <view class="collapse-header" @click="toggleHasCouponsCollapse">
            <image
              :src="parkingSvg"
              mode="widthFix"
              style="width: 30rpx; height: 30rpx;"
            />
            <text class="collapse-title">优惠说明</text>
            <view class="collapse-arrow-icon" :class="{ 'rotated': isHasCouponsExpanded }">
              <uv-icon name="arrow-down" color="#999" size="14"></uv-icon>
            </view>
          </view>

          <view>
            <view class="collapse-header" @click="toggleSubsidyCollapse">
              <image
                :src="parkingSvg"
                mode="widthFix"
                style="width: 30rpx; height: 30rpx;"
              />
              <text class="collapse-title">停车费说明</text>
              <view class="collapse-arrow-icon" :class="{ 'rotated': isSubsidyExpanded }">
                <uv-icon name="arrow-down" color="#999" size="14"></uv-icon>
              </view>
            </view>
          </view>
        </view>
        <view class="collapse-content" :class="{ 'expanded': isSubsidyExpanded || isHasCouponsExpanded }">
          <text class="collapse-text">{{ lastCollapsedText }}</text>
        </view>
      </view>

      <!-- 站点信息 -->
      <view class="card">
        <view class="card-header">站点配套设施</view>
        <view class="card-body">
          <!-- 使用v-for uv-tags渲染tagList -->
          <uv-tags v-for="tag in tagList" :key="tag" :text="tag" plain type="success"></uv-tags>
          <text v-if="tagList.length === 0">暂无配套设施</text>
        </view>
      </view>

      <!-- 站点信息 -->
      <view class="card" v-if="stationInfo.occupyCostModel">
        <view class="card-header">
          <text>超时占位费说明</text>
          <!-- <uv-button text="查看详情 >" type="primary" plain shape="circle" size="small" @click="goToStationGunList"></uv-button> -->
        </view>
        <view class="card-body">
          <view style="direction: column; gap: 10rpx;">
            <view style="display: flex; justify-content: space-between; margin-top: 10rpx;">
              <text style="font-weight: bold;">超时占位费:</text>
              <text>{{ parseInt(stationInfo.occupyCostModel.occupyPhraseRules[0].price) / 100 }}元/分钟</text>
            </view>
            <view style="display: flex; justify-content: space-between; margin-top: 10rpx;">
              <text style="font-weight: bold;">当前收费时段:</text>
              <text>{{ stationInfo.occupyCostModel.occupyPhraseRules[0].stimeStr}}-{{ stationInfo.occupyCostModel.occupyPhraseRules[0].etimeStr }}</text>
            </view>
            <view style="display: flex; margin-top: 10rpx;">
              充电结束后请于{{ stationInfo.occupyCostModel.freeDuration }}分钟内拔枪驶离充电车位，若车辆充电结束{{ stationInfo.occupyCostModel.freeDuration }}分钟后仍继续占用充电车位或充电设备，将收取占位费用，单次封顶{{ parseInt(stationInfo.occupyCostModel.limitAmount) / 100 }}元
            </view>
          </view>
        </view>
      </view>
      <!-- 底部安全区域 -->
      <view class="bottom-safe-area"></view>
    </view>

    <!-- 固定底部扫码充电 -->
    <view class="bottom-bar">
      <uv-button text="扫码充电" type="primary" size="large" shape="circle" @click="goToScan"></uv-button>
    </view>
  </view>
</template>

<script>
import { getSellerBasicsConfig, getIconTwo } from '@/api/style.js';
import { getStationDetailByIdNotAuth, getStationDetailByIdNew } from '@/api/station.js';
import PriceInfo from '@/components/station/PriceInfo.vue';
import globalData from '@/globalData.js';

export default {
  components: {
    PriceInfo
  },
  data() {
    return {
      stationInfo: {},
      sellerBasicsConfig: {},
      icons: [],
      currentStationId: '', // 保存当前站点ID
      isHasCouponsExpanded: false,
      isSubsidyExpanded: false,
      lastCollapsedText: '',
      tagList: [],
      parkingSvg: 'data:image/svg+xml;base64,PHN2ZyB0PSIxNzU3MTI4NTY3NjI1IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjI3ODMiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNODY0IDY0SDE2MEMxMDcgNjQgNjQgMTA3IDY0IDE2MHY3MDRjMCA1MyA0MyA5NiA5NiA5Nmg3MDRjNTMgMCA5Ni00MyA5Ni05NlYxNjBjMC01My00My05Ni05Ni05NnpNNTQ0IDY0MGgtOTZ2OTZjMCAxNy42LTE0LjQgMzItMzIgMzJoLTY0Yy0xNy42IDAtMzItMTQuNC0zMi0zMlYyODhjMC0xNy42IDE0LjQtMzIgMzItMzJoMTkyYzEwNS44IDAgMTkyIDg2LjIgMTkyIDE5MnMtODYuMiAxOTItMTkyIDE5MnogbTAtMjU2aC05NnYxMjhoOTZjMzUuMiAwIDY0LTI4LjggNjQtNjRzLTI4LjgtNjQtNjQtNjR6IiBmaWxsPSIjMTI5NmRiIiBwLWlkPSIyNzg0Ij48L3BhdGg+PC9zdmc+'
    };
  },
  computed: {
    // 处理站点图片数据，确保兼容不同的数据格式
    stationImages() {
      if (!this.stationInfo.detailsImages) {
        return [];
      }
      
      // 如果已经是数组格式，直接返回
      if (Array.isArray(this.stationInfo.detailsImages)) {
        return this.stationInfo.detailsImages.filter(img => img && img.trim() !== '');
      }
      
      // 如果是字符串，尝试按逗号分割
      if (typeof this.stationInfo.detailsImages === 'string') {
        return this.stationInfo.detailsImages
          .split(',')
          .map(img => img.trim())
          .filter(img => img !== '');
      }
      
      return [];
    }
  },
  onLoad(options) {
    // 接收来自index.vue传递的充电站ID参数
    const stationId = options.id;
    const tagList = options.tagList;
    if (tagList && tagList.length > 0) {
      this.tagList = tagList.split(',');
    }
    console.log('解析得到充电站ID:', stationId);

    // 保存当前站点ID
    this.currentStationId = stationId;

    // 验证stationId是否有效
    if (!stationId || stationId === 'undefined' || stationId === 'null') {
      console.error('无效的充电站ID，使用默认值');
      uni.showToast({
        title: '充电站信息异常',
        icon: 'error'
      });
    } else {
      this.fetchAllData(stationId);
    }
  },
  methods: {
    async fetchAllData(stationId) {
      uni.showLoading({ title: '加载中...' });
      try {
        // 构建充电站详情请求参数
        const stationDetailPayload = {
          stationId: parseInt(stationId), // 确保ID为数字类型
          latitude: 23.02066993713379,
          longitude: 113.75179290771484
        };

        console.log('发送充电站详情请求:', stationDetailPayload);

        // 根据token判断使用哪个API
        const token = uni.getStorageSync('token');
        let stationRes;
        
        if (token && token.trim() !== '') {
          // 有token时使用认证接口
          console.log('使用认证接口获取充电站详情');
          stationRes = await getStationDetailByIdNew(stationDetailPayload);
        } else {
          // 无token时使用非认证接口
          console.log('使用非认证接口获取充电站详情');
          stationRes = await getStationDetailByIdNotAuth(stationDetailPayload);
        }
        if (stationRes.success) {
          console.log('充电站详情获取成功:', stationRes.data);
          this.stationInfo = stationRes.data;
        } else {
          console.error('充电站详情获取失败:', stationRes);
          uni.showToast({
            title: '获取充电站信息失败',
            icon: 'error'
          });
        }

        // const sellerId = globalData.sellerId;
        // const basicsConfigRes = await getSellerBasicsConfig({ sellerId });
        // if (basicsConfigRes.success) {
        //   this.sellerBasicsConfig = basicsConfigRes.data;
        // }

        // const iconEnums = [
        //   'PERSONAL_CENTER',
        //   'OTHER',
        //   'MY_BILL',
        //   'HUE',
        //   'DISCOUNT_COUPON_MODULE',
        //   'BASE_NAVIGATION_MODULE',
        //   'BALANCE_RECHARGE'
        // ];
        // const iconPromises = iconEnums.map(twoEnum => getIconTwo({ twoEnum, sellerId }));
        // const iconResults = await Promise.all(iconPromises);
        // this.icons = iconResults.filter(res => res.success).map(res => res.data);
      } catch (error) {
        console.error('获取数据时发生错误:', error);
        uni.showToast({
          title: '数据加载失败，请稍后重试',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
    // 跳转到终端列表页面
    goToStationGunList() {
      uni.navigateTo({
        url: `/pages/station/stationGunList?stationId=${this.currentStationId}&dataType=0&hulianinterfaceId=${this.stationInfo.hulianinterfaceId}`
      });
    },
    goToScan() {
      uni.navigateTo({
        url: '/pages/charge/charging'
      });
    },
    // 图片预览功能
    previewImage(currentUrl, currentIndex) {
      uni.previewImage({
        current: currentIndex,
        urls: this.stationImages,
        longPressActions: {
          itemList: ['保存图片'],
          success: (data) => {
            if (data.tapIndex === 0) {
              this.saveImageToAlbum(currentUrl);
            }
          }
        }
      });
    },
    // 保存图片到相册
    saveImageToAlbum(imageUrl) {
      uni.downloadFile({
        url: imageUrl,
        success: (res) => {
          if (res.statusCode === 200) {
            uni.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                uni.showToast({
                  title: '保存成功',
                  icon: 'success'
                });
              },
              fail: () => {
                uni.showToast({
                  title: '保存失败，请检查权限',
                  icon: 'none'
                });
              }
            });
          }
        },
        fail: () => {
          uni.showToast({
            title: '下载失败',
            icon: 'none'
          });
        }
      });
    },
    // 滚动到左边时触发
    onScrollLeft() {
      console.log('滚动到最左边');
    },
    // 滚动到右边时触发  
    onScrollRight() {
      console.log('滚动到最右边');
    },
    // 切换优惠说明展开/收起状态
    toggleHasCouponsCollapse() {
      this.isHasCouponsExpanded = !this.isHasCouponsExpanded;
      if (this.isHasCouponsExpanded && this.isSubsidyExpanded) {
        this.isSubsidyExpanded = false;
      }
      this.lastCollapsedText = this.stationInfo.hasCoupons || '暂无可适用卡券';
    },
    // 切换停车费说明展开/收起状态
    toggleSubsidyCollapse() {
      this.isSubsidyExpanded = !this.isSubsidyExpanded;
      if (this.isSubsidyExpanded && this.isHasCouponsExpanded) {
        this.isHasCouponsExpanded = false;
      }
      this.lastCollapsedText = this.stationInfo.subsidy || '暂无停车费说明';
    }
  }
};
</script>

<style>
.page-container {
  background-color: #f6f6f6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  /* 移除原来的底部padding，使用安全区域替代 */
}

/* 底部安全区域 */
.bottom-safe-area {
  height: calc(120rpx + env(safe-area-inset-bottom));
  background: transparent;
}

/* 顶部卡片 */
.station-card {
  background: #fff;
  border-radius: 16rpx;
  margin: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.05);
}
.station-images-container {
  padding: 20rpx 0 0 0;
}

.image-scroll-list {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: row;
  padding: 0 20rpx;
}

.image-item {
  margin-right: 16rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

/* .image-item:last-child {
  margin-right: 20rpx;
} */

.station-image {
  width: 200rpx;
  height: 150rpx;
  border-radius: 12rpx;
  /* 添加阴影效果 */
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

.no-image-placeholder {
  height: 150rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #ddd;
  margin: 0 20rpx;
}

.no-image-placeholder text {
  color: #999;
  font-size: 28rpx;
}
.station-info {
  padding: 20rpx;
}
.station-name {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}
.station-address-distance {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.station-address {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 8rpx;
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.station-distance {
  font-size: 24rpx;
  color: #007AFF;
}

/* 卡片通用 */
.card {
  background: #fff;
  margin: 20rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.05);
}
.card-header {
  font-weight: bold;
  font-size: 28rpx;
  margin-bottom: 10rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-body {
  flex-wrap: wrap;
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.info-row {
  display: flex;
  justify-content: space-between;
  margin: 10rpx 0;
}

/* 费用信息样式已移至PriceInfo组件 */

/* 按钮 */
.mini-btn {
  font-size: 24rpx;
  background: #007AFF;
  color: #fff;
  border-radius: 8rpx;
  padding: 4rpx 12rpx;
}
.service-btn {
  width: 100%;
  background: #fff;
  border: 1px solid #007AFF;
  color: #007AFF;
  padding: 20rpx;
  border-radius: 12rpx;
}

/* 底部扫码充电 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx;
  box-shadow: 0 -2rpx 6rpx rgba(0, 0, 0, 0.05);
  z-index: 999;
  /* 适配底部安全区域 */
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}
.charge-btn {
  width: 100%;
  background: #007AFF;
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
  padding: 20rpx;
  border-radius: 50%;
}

/* 停车费折叠组件样式 */
.collapse-wrapper {
  margin-top: 10rpx;
  display: flex;
  flex: 1;
  justify-content: space-between;
}
.collapse-title {
  margin-left: 5rpx;
  font-size: 24rpx;
  color: #999;
  /* 斜体 */
  font-style: italic;
  /* 下划线 */
  text-decoration: underline;
  z-index: 10;
}

.collapse-header {
  display: flex;
  flex: 1;
  align-items: center;
  cursor: pointer;
  z-index: 10;
  padding: 5rpx 0;
}

.collapse-arrow-icon {
  margin-left: 10rpx;
  transition: transform 300ms ease;
  transform: rotate(-90deg);
}

.collapse-arrow-icon.rotated {
  transform: rotate(0deg);
}

.collapse-arrow-icon text {
  font-size: 24rpx;
  color: #999;
}

.collapse-content {
  overflow: hidden;
  max-height: 0;
  transition: max-height 300ms ease;
}

.collapse-content.expanded {
  max-height: 200rpx; /* 足够的最大高度 */
}

.collapse-text {
  font-size: 24rpx;
  color: #999;
  padding: 10rpx 0 20rpx 0;
  display: block;
}
</style>
