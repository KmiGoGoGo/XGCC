<template>
  <view class="page-container">
    <uv-navbar bgColor="transparent" @leftClick="() => uni.navigateBack()" leftIconColor="#ffffff">
      <template v-slot:right>
        <view style="margin-right: 200rpx; margin-bottom: 5rpx;">
          <CustomerServiceButton
              session-from="station_details_page"
          />
        </view>
      </template>
    </uv-navbar>
    <view style="width:100%; z-index: 1;">
      <uv-swiper v-if="stationImages.length > 0" :list="stationImages" height="350rpx" radius="0rpx"></uv-swiper>
      <view v-else class="no-image-placeholder">
        <!-- Logo 区域 -->
        <view class="logo-animation-container">
          <view class="logo-wrapper">
            <image class="logo-svg" src="/static/X.svg" mode="aspectFit"></image>
          </view>
          <text class="brand-text">{{ getWxAppName() }}</text>
        </view>
      </view>
    </view>
    <!-- 主内容区域 -->
    <view class="main-content">
      <!-- 顶部站点信息卡片 -->
      <view class="station-card">
        <view class="station-info">
          <!-- 站点名称和导航按钮 -->
          <view class="station-header">
            <view class="station-title-section">
              <view class="station-name">{{ stationInfo.name }}</view>
            </view>
            <view
                class="station-distance-info"
                @click="goAddress"
                :data-latitude="stationInfo.latitude"
                :data-longitude="stationInfo.longitude"
                :data-name="stationInfo.name"
                :data-street="stationInfo.street"
                v-if="stationInfo.distance != null"
            >
              <view class="station-distance-info-content">
                <uv-icon name="map" size="16" color="#6AAAFB"></uv-icon>
                <text>
                  {{ stationInfo.distance }}km
                </text>
              </view>
            </view>
            <view class="station-distance-info" v-if="stationInfo.distance == null">未授权定位</view>
          </view>

          <view class="station-tags" v-if="tagList.length > 0">
            <view v-for="tag in tagList" :key="tag">
              <StatusTag :text="tag" padding="4rpx 4rpx" borderRadius="8rpx" backgroundColor="#F0FDF4"
                         textColor="#16A34A"/>
            </view>
          </view>

          <view class="station-street-info">
            {{ stationInfo.street }}
          </view>

          <!-- 公告区域 -->
          <view class="announcement-section">
            <text class="announcement-text">· {{ stationInfo.notice || '暂无公告' }}</text>
            <text class="announcement-text">· {{ stationInfo.subsidy || '暂无停车费说明' }}</text>
          </view>

          <!-- 充电类型状态网格 -->
          <view class="charging-status-grid">
            <!-- 快充状态 -->
            <view class="status-item" v-if="stationInfo.gunPriceInfo && stationInfo.gunPriceInfo.fastItem">
              <text class="status-label">快充</text>
              <view class="status-count">
                <text
                    :class="stationInfo.gunPriceInfo.fastItem.freeGunCount > 0 ? 'available-count' : 'unavailable-count'">
                  {{ stationInfo.gunPriceInfo.fastItem.freeGunCount || 0 }}
                </text>
                <text class="separator"> /</text>
                <text class="total-count">{{ stationInfo.gunPriceInfo.fastItem.gunCount || 0 }}</text>
              </view>
            </view>

            <!-- 慢充状态 -->
            <view class="status-item" v-if="stationInfo.gunPriceInfo && stationInfo.gunPriceInfo.slowItem">
              <text class="status-label">慢充</text>
              <view class="status-count">
                <text
                    :class="stationInfo.gunPriceInfo.slowItem.freeGunCount > 0 ? 'available-count' : 'unavailable-count'">
                  {{ stationInfo.gunPriceInfo.slowItem.freeGunCount || 0 }}
                </text>
                <text class="separator"> /</text>
                <text class="total-count">{{ stationInfo.gunPriceInfo.slowItem.gunCount || 0 }}</text>
              </view>
            </view>

            <!-- 超充状态 -->
            <view class="status-item" v-if="stationInfo.gunPriceInfo && stationInfo.gunPriceInfo.superItem">
              <text class="status-label">超充</text>
              <view class="status-count">
                <text
                    :class="stationInfo.gunPriceInfo.superItem.freeGunCount > 0 ? 'available-count' : 'unavailable-count'">
                  {{ stationInfo.gunPriceInfo.superItem.freeGunCount || 0 }}
                </text>
                <text class="separator"> /</text>
                <text class="total-count">{{ stationInfo.gunPriceInfo.superItem.gunCount || 0 }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 充电价格 -->
      <view class="price-section" @click="goToStationGunList">
        <view class="price-title">充电价格</view>
        <view class="price-cards">
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
        </view>
      </view>
      <!-- 占位费用说明 -->
      <view class="occupy-fee-section" v-if="stationInfo.occupyCostModel">
        <view class="occupy-fee-title">占位费用说明</view>
        <view class="occupy-fee-card">
          <view class="occupy-fee-content">
            <view class="occupy-fee-item">
              <text class="occupy-fee-label">超时占位费:</text>
              <text class="occupy-fee-value">{{
                  parseInt(stationInfo.occupyCostModel.occupyPhraseRules[0].price) / 100
                }}元/分钟
              </text>
            </view>
            <view class="occupy-fee-item">
              <text class="occupy-fee-label">当前收费时段:</text>
              <text class="occupy-fee-value">{{
                  stationInfo.occupyCostModel.occupyPhraseRules[0].stimeStr || '00:00'
                }}-{{ stationInfo.occupyCostModel.occupyPhraseRules[0].etimeStr || '23:59' }}
              </text>
            </view>
            <view class="occupy-fee-description">
              充电结束后请于{{
                stationInfo.occupyCostModel.freeDuration
              }}分钟内拔枪驶离充电车位，若车辆充电结束{{
                stationInfo.occupyCostModel.freeDuration
              }}分钟后仍继续占用充电车位或充电设备，将收取占位费用，单次封顶{{
                parseInt(stationInfo.occupyCostModel.limitAmount) / 100
              }}元
            </view>
          </view>
        </view>
      </view>
      <!-- 底部安全区域 -->
      <view class="bottom-safe-area"></view>
    </view>

    <!-- 固定底部扫码充电 -->
    <view class="bottom-bar">
      <button class="scan-button" @click="goToScan">
        <text class="scan-icon"></text>
        <text class="scan-text">扫码充电</text>
      </button>
    </view>
  </view>
</template>

<script>
import {getStationDetailByIdNotAuth, getStationDetailByIdNew} from '@/api/station.js';
import PriceInfo from '@/components/station/PriceInfo.vue';
import globalData from '@/globalData';
import StatusTag from '@/components/common/StatusTag.vue';
import CustomerServiceButton from '@/components/common/CustomerServiceButton.vue';
import {contactCustomerService as contactCustomerServiceFn} from '@/utils/utils';

export default {
  components: {
    PriceInfo,
    StatusTag,
    CustomerServiceButton
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
      parkingSvg: 'data:image/svg+xml;base64,PHN2ZyB0PSIxNzU3MTI4NTY3NjI1IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjI3ODMiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNODY0IDY0SDE2MEMxMDcgNjQgNjQgMTA3IDY0IDE2MHY3MDRjMCA1MyA0MyA5NiA5NiA5Nmg3MDRjNTMgMCA5Ni00MyA5Ni05NlYxNjBjMC01My00My05Ni05Ni05NnpNNTQ0IDY0MGgtOTZ2OTZjMCAxNy42LTE0LjQgMzItMzIgMzJoLTY0Yy0xNy42IDAtMzItMTQuNC0zMi0zMlYyODhjMC0xNy42IDE0LjQtMzIgMzItMzJoMTkyYzEwNS44IDAgMTkyIDg2LjIgMTkyIDE5MnMtODYuMiAxOTItMTkyIDE5MnogbTAtMjU2aC05NnYxMjhoOTZjMzUuMiAwIDY0LTI4LjggNjQtNjRzLTI4LjgtNjQtNjQtNjR6IiBmaWxsPSIjMTI5NmRiIiBwLWlkPSIyNzg0Ij48L3BhdGg+PC9zdmc+',
      // 二维码解析策略
      qrCodeStrategies: {
        // XG策略：支持三种格式
        xg: {
          validate: (url) => url.includes('cc.gy-ev.com') && !url.includes('/shicheng/'),
          parse: (url) => {
            console.log('使用XG策略解析:', url);

            // 提取路径部分
            const pathMatch = url.match(/cc\.gy-ev\.com(\/.*)$/);
            if (!pathMatch) {
              console.log('无法提取路径');
              return null;
            }
            const path = pathMatch[1];
            console.log('提取的路径:', path);

            let pileNum, gunNo;

            // 判断是否有下划线
            if (path.includes('_')) {
              // 有下划线的情况
              const parts = path.split('_');
              const pilePart = parts[0].substring(1); // 去掉开头的斜杠
              const gunPart = parts[1];

              console.log('桩号部分:', pilePart, '枪号部分:', gunPart);

              // 判断桩号长度
              if (pilePart.length === 8) {
                // 8位桩号
                pileNum = pilePart;
                gunNo = gunPart;
              } else if (pilePart.length === 14) {
                // 14位桩号
                pileNum = pilePart;
                gunNo = gunPart;
              }
            } else {
              // 没有下划线的情况，长度为16位
              const fullPath = path.substring(1); // 去掉开头的斜杠
              if (fullPath.length === 16) {
                pileNum = fullPath.substring(0, 14); // 前14位是桩号
                const gunNum = parseInt(fullPath.substring(14, 16)); // 后两位
                gunNo = (gunNum - 1).toString(); // gunNo = gunNum - 1
              }
            }

            console.log('XG策略解析结果 - 桩号:', pileNum, '枪号:', gunNo);

            if (pileNum && gunNo !== undefined) {
              return {
                pileNum: pileNum,
                gunNo: gunNo
              };
            }

            return null;
          }
        },

        // 石城策略：格式为 /shicheng/pileNum_gunNo
        shicheng: {
          validate: (url) => url.includes('cc.gy-ev.com/shicheng/'),
          parse: (url) => {
            console.log('使用石城策略解析:', url);

            // 提取shicheng路径部分
            const pathMatch = url.match(/cc\.gy-ev\.com\/shicheng\/(.*)$/);
            if (!pathMatch) {
              console.log('无法提取石城路径');
              return null;
            }
            const path = pathMatch[1];
            console.log('提取的石城路径:', path);

            // 解析桩号和枪号
            if (path.includes('_')) {
              const parts = path.split('_');
              const pileNum = parts[0];
              const gunNum = parseInt(parts[1]);
              const gunNo = (gunNum - 1).toString(); // gunNo = gunNum - 1

              console.log('石城策略解析结果 - 桩号:', pileNum, '枪号:', gunNo);

              return {
                pileNum: pileNum,
                gunNo: gunNo
              };
            }

            return null;
          }
        },
        // 松林策略：格式为 /songlin/pileNum_gunNo
        songlin: {
          validate: (url) => url.includes('cc.gy-ev.com/songlin/'),
          parse: (url) => {
            console.log('使用松林策略解析:', url);

            // 提取songlin路径部分
            const pathMatch = url.match(/cc\.gy-ev\.com\/songlin\/(.*)$/);
            if (!pathMatch) {
              console.log('无法提取松林路径');
              return null;
            }
            const path = pathMatch[1];
            console.log('提取的松林路径:', path);

            // 解析桩号和枪号
            if (path.includes('_')) {
              const parts = path.split('_');
              const pileNum = parts[0];
              const gunNum = parseInt(parts[1]);
              const gunNo = (gunNum - 1).toString(); // gunNo = gunNum - 1

              console.log('松林策略解析结果 - 桩号:', pileNum, '枪号:', gunNo);

              return {
                pileNum: pileNum,
                gunNo: gunNo
              };
            }

            return null;
          }
        }
      }
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
    getWxAppName() {
      return globalData.wxAppName;
    },
    async fetchAllData(stationId) {
      uni.showLoading({title: '加载中...'});
      try {
        // 构建充电站详情请求参数
        // 从本地存储中获取latitude和longitude
        const latitude = uni.getStorageSync('latitude');
        const longitude = uni.getStorageSync('longitude');
        const stationDetailPayload = {
          stationId: parseInt(stationId), // 确保ID为数字类型
          latitude: latitude,
          longitude: longitude
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
          if (stationRes.data.tag1) {
            this.tagList.push(stationRes.data.tag1)
          }
          if (stationRes.data.tag2) {
            this.tagList.push(stationRes.data.tag2)
          }
          console.log('充电站标签:', this.tagList);
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
    // 解析二维码链接，提取桩号和枪号
    parseQRCode(url) {
      console.log('解析二维码链接:', url);

      // 遍历所有策略，找到匹配的策略
      if (this.qrCodeStrategies[globalData.sellerNo].validate(url)) {
        console.log(`匹配到策略: ${globalData.sellerNo}`);
        return this.qrCodeStrategies[globalData.sellerNo].parse(url);
      }

      console.log('没有匹配的解析策略', globalData.sellerNo);
      return null;
    },

    // 处理扫码结果
    handleScanResult(result) {
      console.log('扫码结果:', result);

      const qrData = this.parseQRCode(result);
      if (qrData) {
        // 跳转到充电页面
        uni.navigateTo({
          url: `/pages/charge/gunStartingCharge?pileNum=${qrData.pileNum}&gunNo=${qrData.gunNo}`,
          success: () => {
            console.log('跳转成功');
          },
          fail: (err) => {
            console.error('跳转失败:', err);
          }
        });
      } else {
        uni.showToast({
          title: '二维码格式不正确',
          icon: 'none'
        });
      }
    },

    goToScan() {
      // 扫码功能
      // #ifdef MP-ALIPAY
      my.scan({
        type: 'qr',
        success: (res) => {
          console.log('支付宝扫码成功:', res);
          this.handleScanResult(res.code);
        },
        fail: (err) => {
          console.error('支付宝扫码失败:', err);
        }
      });
      // #endif

      // #ifdef MP-WEIXIN
      wx.scanCode({
        success: (res) => {
          console.log('微信扫码成功:', res);
          this.handleScanResult(res.result);
        },
        fail: (err) => {
          console.error('微信扫码失败:', err);
        }
      });
      // #endif
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
    },
    // 导航
    goAddress(e) {
      const latitude = parseFloat(e.currentTarget.dataset.latitude);
      const longitude = parseFloat(e.currentTarget.dataset.longitude);
      const name = e.currentTarget.dataset.name;
      const street = e.currentTarget.dataset.street;

      if (!latitude || !longitude) {
        uni.showToast({
          title: '位置信息不完整',
          icon: 'none'
        });
        return;
      }

      uni.openLocation({
        latitude: latitude,
        longitude: longitude,
        name: name,
        address: street
      });
    },
    // 联系客服
    contactCustomerService() {
      contactCustomerServiceFn();
    }
  }
};
</script>

<style scoped>
.page-container {
  background: linear-gradient(180deg, #E0F7FA 0%, #F0F3F8 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  /* width: 100%; */
  /* margin-top: 270rpx; */
}

.station-distance-info-content {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.station-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8rpx;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  z-index: 1;
  margin-top: -100rpx;
  background: linear-gradient(180deg, #E5F6FF 0%, #FFFFFF 100%);
  border-radius: 32rpx 32rpx 0 0;
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.1);
  /* 移除原来的底部padding，使用安全区域替代 */
}

/* 底部安全区域 */
.bottom-safe-area {
  height: calc(190rpx + env(safe-area-inset-bottom));
  background: transparent;
}

/* 顶部卡片 */
.station-card {
  background: #fff;
  border-radius: 24rpx;
  margin: 40rpx 32rpx 0 32rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.1);
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
  height: 400rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Logo 动画容器 */
.logo-animation-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
}

/* Logo 包装器 */
.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Logo SVG */
.logo-svg {
  width: 200rpx;
  height: 200rpx;
}

/* 品牌文字 */
.brand-text {
  font-size: 80rpx;
  color: #6AAAFB;
  font-weight: bold;
  margin-left: 20rpx;
}

.station-info {
  padding: 32rpx;
}

/* 站点头部区域 */
.station-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.station-title-section {
  flex: 1;
  display: flex;
  align-items: center;
}

.station-name {
  display: flex;
  align-items: center;
  font-size: 40rpx;
  font-weight: bold;
  color: #1A1A1A;
  line-height: 1.2;
  margin-bottom: 4rpx;
}

.station-street-info {
  font-size: 24rpx;
  color: #8A8A8E;
  font-weight: 400;
  padding: 8rpx 0;
}

.station-distance-info {
  font-size: 24rpx;
  color: #6AAAFB; /* 中灰色文字，提升可读性 */
  font-weight: 400;
  cursor: pointer;
  padding: 8rpx 16rpx;
  border-radius: 16rpx; /* 保留原有圆角，与背景搭配更和谐 */
  background-color: #E3F7FA; /* 浅灰色背景，柔和不突兀 */
}

.station-distance-info:active {
  background-color: rgba(0, 122, 255, 0.1);
}

.navigation-btn {
  width: 80rpx;
  height: 80rpx;
  background-color: #E5F6FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 16rpx;
}

.nav-icon {
  font-size: 32rpx;
  color: #00A9FF;
  font-family: 'Material Symbols Outlined';
}

/* 公告区域 */
.announcement-section {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  padding: 32rpx 0;
  border-top: 1rpx solid #F0F0F0;
  margin-bottom: 14rpx;
  margin-top: 14rpx;
}

.announcement-icon {
  font-size: 36rpx;
  color: #FF9500;
  font-family: 'Material Symbols Outlined';
  margin-right: 16rpx;
}

.announcement-text {
  font-size: 24rpx;
  color: #8A8A8E;
  flex: 1;
}

/* 充电状态网格 */
.charging-status-grid {
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.status-item {
  flex: 1;
}

.status-label {
  font-size: 24rpx;
  color: #8A8A8E;
  display: block;
  margin-bottom: 8rpx;
}

.status-count {
  display: flex;
  align-items: center;
  justify-content: center;
}

.available-count {
  font-size: 32rpx;
  font-weight: 600;
  color: #34C759;
}

.unavailable-count {
  font-size: 32rpx;
  font-weight: 600;
  color: #FF9500;
}

.separator {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0 4rpx;
}

.total-count {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
}

/* 价格区域 */
.price-section {
  margin: 48rpx 32rpx 0 32rpx;
}

.price-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #1A1A1A;
  margin-bottom: 24rpx;
}

.price-cards {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

/* 占位费用说明区域 */
.occupy-fee-section {
  margin: 48rpx 32rpx 0 32rpx;
}

.occupy-fee-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #1A1A1A;
  margin-bottom: 24rpx;
}

.occupy-fee-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.1);
}

.occupy-fee-content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.occupy-fee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.occupy-fee-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.occupy-fee-value {
  font-size: 28rpx;
  color: #1A1A1A;
}

.occupy-fee-description {
  font-size: 24rpx;
  color: #8A8A8E;
  line-height: 1.6;
  margin-top: 8rpx;
}

.station-name-distance {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  color: #5aaaff;
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

.parking-card-body-text {
  display: flex;
  align-items: center;
  gap: 10rpx;
  background-color: #F3F3F3;
  font-size: 22rpx;
}

.parking-card-body-text-icon {
  width: 10rpx;
  height: 20rpx;
  background-color: #1BA035;
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
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20rpx);
  padding: 32rpx;
  border-top: 1rpx solid #F0F0F0;
  z-index: 999;
  /* 适配底部安全区域 */
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
}

.scan-button {
  width: 100%;
  height: 112rpx;
  background: linear-gradient(135deg, #4DABF7 0%, #007AFF 100%);
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(0, 122, 255, 0.3);
  border: none;
}

.scan-icon {
  font-size: 36rpx;
  font-family: 'Material Symbols Outlined';
  margin-right: 16rpx;
}

.scan-text {
  font-size: 36rpx;
  font-weight: bold;
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
