<template>
  <view class="container">
    <uv-navbar :border="false" title="我的卡券" :autoBack="false" placeholder safeAreaInsetTop @leftClick="handleNavBack"></uv-navbar>

    <!-- 顶部标签切换 -->
    <view class="tab-switch-wrapper">
      <view class="tab-switch-container">
        <view
            :class="['tab-switch-item', activeTab === 'my' ? 'active' : '']"
            @click="switchTab('my')"
        >
          <text class="tab-switch-text">我的卡券</text>
        </view>
        <view
            :class="['tab-switch-item', activeTab === 'history' ? 'active' : '']"
            @click="switchTab('history')"
        >
          <text class="tab-switch-text">历史卡券</text>
        </view>
      </view>
    </view>

    <!-- 优惠券列表 -->
    <scroll-view
      class="coupon-scroll"
      scroll-y
      :show-scrollbar="false"
      @scrolltolower="onLoadMore"
    >
      <view class="coupon-list">
        <!-- 优惠券列表 -->
        <template v-if="coupons.length > 0">
          <CouponCard
              v-for="coupon in coupons"
              :key="coupon.id"
              :coupon="coupon"
              @use="handleUseCoupon"
              @show-site-info="handleShowSiteInfo"
          />
          <uv-load-more
            :status="loadStatus"
            @loadmore="onLoadMore"
            loadmore-text="上拉或点击加载更多"
            loading-text="正在加载..."
            nomore-text="没有更多了"
          />
        </template>

        <!-- 空状态 -->
        <view v-else-if="!loading" class="empty-state">
          <uv-icon name="empty-favor" size="200" color="#cbd5e1"></uv-icon>
          <text class="empty-text">{{ activeTab === 'my' ? '暂无可用卡券' : '暂无历史卡券' }}</text>
        </view>

        <!-- 加载中 -->
        <view v-else class="empty-state">
          <uv-loading-icon text="加载中..." textSize="28rpx"></uv-loading-icon>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import {myCouponPage} from '@/api/coupon.js';
import CouponCard from '@/components/coupon/CouponCard.vue';
import { handleNavBack } from '@/utils/utils';

export default {
  components: {
    CouponCard
  },
  data() {
    return {
      coupons: [],
      activeTab: 'my',
      loading: false,
      loadStatus: 'loadmore', // loadmore, loading, nomore
      pagination: {
        current: 1,
        size: 10,
        total: 0,
        pages: 0
      }
    };
  },
  onLoad() {
    this.fetchCoupons();
  },
  onShareAppMessage() {
    return {
      title: this.getWxAppName(),
      path: '/pages/index/index'
    }
  },
  onShareTimeline() {
    return {
      title: this.getWxAppName(),
      path: '/pages/index/index'
    }
  },
  methods: {
    handleNavBack,
    getWxAppName() {
      return globalData.wxAppName;
    },
    async fetchCoupons(isLoadMore = false) {
      if (this.loading) return;
      this.loading = true;
      if (!isLoadMore) {
        this.loadStatus = 'loading';
      }
      try {
        const page = isLoadMore ? this.pagination.current + 1 : 1;
        const res = await myCouponPage({
          tab: this.activeTab === 'my' ? 1 : 2,
          current: page,
          size: this.pagination.size
        });
        if (res.code === 0) {
          const { records = [], total = 0, current = 1, pages = 0 } = res.data || {};
          if (isLoadMore) {
            this.coupons = [...this.coupons, ...records];
          } else {
            this.coupons = records;
          }
          this.pagination = {
            current,
            size: this.pagination.size,
            total,
            pages
          };
          this.loadStatus = current >= pages ? 'nomore' : 'loadmore';
        } else if (res.code === 4) {
          // 未登录等
        } else {
          uni.showToast({
            title: res.msg || '加载失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取优惠券失败:', error);
        if (error.code === 2) {
          uni.showToast({title: '请先登录', icon: 'none'});
        } else {
          uni.showToast({title: '网络错误', icon: 'none'});
        }
      } finally {
        this.loading = false;
      }
    },
    onLoadMore() {
      if (this.loadStatus === 'loadmore') {
        this.fetchCoupons(true);
      }
    },
    /**
     * @description 切换标签页
     * @param {string} tab 标签页类型
     */
    switchTab(tab) {
      this.activeTab = tab;
      this.coupons = [];
      this.pagination = { current: 1, size: 10, total: 0, pages: 0 };
      this.loadStatus = 'loadmore';
      this.fetchCoupons();
    },
    /**
     * @description 处理使用优惠券
     * @param {Object} coupon 优惠券对象
     */
    handleUseCoupon(coupon) {
      if (coupon.couponTypeStr.includes('服务') || coupon.couponTypeStr.includes('现金')) {
        uni.navigateTo({
          url: `/pages/index/index`
        });
      } else {
        uni.showModal({
          title: '提示',
          content: '请在对应微信小程序端进行使用',
          showCancel: false,
          confirmText: '我知道了'
        });
      }
    },
    /**
     * @description 处理显示适用站点信息
     * @param {Object} coupon 优惠券对象
     */
    handleShowSiteInfo(coupon) {
      if (coupon.availableSiteName && coupon.availableSiteName.length > 0) {
        const siteList = coupon.availableSiteName;
        uni.showModal({
          title: '适用站点',
          content: siteList,
          showCancel: false,
          confirmText: '我知道了'
        });
      } else {
        uni.showModal({
          title: '适用站点',
          content: '暂无适用站点信息',
          showCancel: false,
          confirmText: '我知道了'
        });
      }
    }
  }
};
</script>

<style scoped>
/* 页面容器 */
.container {
  background: linear-gradient(180deg, #f0f8ff 0%, #ffffff 100%);
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.coupon-scroll {
  flex: 1;
  height: 0;
  width: 100%;
}

/* 顶部标签切换 */
.tab-switch-wrapper {
  padding: 32rpx;
  padding-bottom: 16rpx;
}

.tab-switch-container {
  display: flex;
  height: 72rpx;
  background-color: rgba(203, 213, 225, 0.5);
  border-radius: 16rpx;
  padding: 6rpx;
  position: relative;
}

.tab-switch-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.tab-switch-item.active {
  background-color: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.tab-switch-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #94a3b8;
  transition: all 0.3s ease;
}

.tab-switch-item.active .tab-switch-text {
  color: #0f172a;
  font-weight: 600;
}

/* 优惠券列表 */
.coupon-list {
  padding: 16rpx 32rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 32rpx;
  min-height: 60vh;
}

.empty-text {
  margin-top: 32rpx;
  font-size: 28rpx;
  color: #94a3b8;
  font-weight: 400;
}
</style>
