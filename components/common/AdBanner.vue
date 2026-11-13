<template>
  <view
      v-if="bannerList.length"
      class="ad-banner"
      :class="{ 'ad-banner--inset': inset }"
      :style="{ marginTop: marginTop, marginBottom: marginBottom }"
  >
    <swiper
        class="ad-banner__swiper"
        :style="{ height: height }"
        :indicator-dots="indicatorDots"
        :autoplay="autoplay"
        :circular="circular"
        :vertical="vertical"
        :interval="interval"
        :duration="duration"
        indicator-color="rgba(255, 255, 255, 0.4)"
        indicator-active-color="#fff"
    >
      <swiper-item
          v-for="(item, index) in bannerList"
          :key="item.id || index"
          @tap="handleTap(item)"
      >
        <view class="ad-banner__item">
          <image :src="item.image" mode="aspectFill" class="ad-banner__image"/>
          <!-- 客服类 banner：透明客服按钮铺满整张图，点击直接进入微信客服会话（open-type="contact"） -->
          <view v-if="isCustomerServiceBanner(item)" class="ad-banner__cs-overlay">
            <CustomerServiceButton :sessionFrom="sessionFrom" customClass="transparent-overlay"/>
          </view>
        </view>
      </swiper-item>
    </swiper>
  </view>
  <template v-else>
    <slot name="empty"></slot>
  </template>
</template>

<script>
import {queryDynamicsActivity} from '@/api/member.js';
import CustomerServiceButton from '@/components/common/CustomerServiceButton.vue';

/**
 * 点击后直接进入微信客服会话（而不是打开内部富文本详情页）的轮播图 id 列表。
 * 后端轮播图只提供 1外链/2详情页/4营销/5小程序路径 四类跳转，没有"客服"类型，
 * 因此需要在端上按 id 指定：新增此类 banner 时把它的 id 加进这个数组即可。
 *
 * 2026-11-13：按要求清空，所有 banner 统一按 connectionType 正常跳转（进详情页等）。
 * 机制保留，后续若要恢复"点击直接找客服"的 banner，把 id 填回数组即可。
 */
const CUSTOMER_SERVICE_BANNER_IDS = [];

export default {
  name: 'AdBanner',
  components: {
    CustomerServiceButton
  },
  props: {
    // 外部传入的广告列表；不传则由组件自行请求
    list: {
      type: Array,
      default: null
    },
    // 是否由组件自行请求广告数据
    autoFetch: {
      type: Boolean,
      default: true
    },
    // 轮播高度，默认与首页一致 300rpx
    height: {
      type: String,
      default: '300rpx'
    },
    // 外部上边距（首页由父级容器承担，传 0）
    marginTop: {
      type: String,
      default: '0'
    },
    // 外部下边距
    marginBottom: {
      type: String,
      default: '0'
    },
    // 是否为左右留白模式（详情页与卡片对齐时开启）
    inset: {
      type: Boolean,
      default: false
    },
    // 客服会话来源标识
    sessionFrom: {
      type: String,
      default: 'index_banner'
    }
  },
  data() {
    return {
      innerList: [],
      indicatorDots: true,
      autoplay: true,
      circular: true,
      vertical: false,
      interval: 3000,
      duration: 500
    };
  },
  computed: {
    bannerList() {
      return this.list && this.list.length ? this.list : this.innerList;
    }
  },
  watch: {
    list: {
      immediate: true,
      handler(val) {
        if (val && val.length) {
          this.innerList = val;
        }
      }
    }
  },
  mounted() {
    if (this.autoFetch && !(this.list && this.list.length)) {
      this.loadBanners();
    }
  },
  methods: {
    // 获取轮播图数据
    async loadBanners() {
      const cityName = uni.getStorageSync('cityName') || uni.getStorageSync('currentCityName') || '全国';
      try {
        const res = await queryDynamicsActivity(cityName);
        if (res && res.statusCode == 200) {
          this.innerList = (res.data && res.data.data && res.data.data.indexAdvertising) || [];
        } else {
          this.innerList = [];
        }
      } catch (error) {
        console.error('获取轮播图数据失败:', error);
        this.innerList = [];
      }
    },

    // 是否为"点击进客服"的轮播图
    isCustomerServiceBanner(item) {
      if (!item || item.id === null || item.id === undefined) {
        return false;
      }
      return CUSTOMER_SERVICE_BANNER_IDS.indexOf(Number(item.id)) > -1;
    },

    // 轮播点击
    handleTap(item) {
      if (!item) {
        return;
      }

      const connectionType = item.connectionType;
      const advertisingLink = item.advertisingLink;
      const path = item.mobilePath;
      const details = item.details;
      const title = item.title;
      const timeS = item.timeS;
      const status = item.status;
      const id = item.id;
      const marketingId = item.marketingId;
      const activityType = item.activityType || null;

      // 客服类 banner：点击由覆盖层上的 CustomerServiceButton(open-type="contact") 打开客服会话，
      // 这里直接终止，避免事件冒泡后又跳到内部富文本详情页
      if (this.isCustomerServiceBanner(item)) {
        return;
      }

      // 规则1: advertisingLink 不为 1，使用路由跳转到 advertisingLink
      if (advertisingLink && advertisingLink != '1' && advertisingLink != 1) {
        // 判断是否是外部链接
        if (/^https?:\/\//.test(advertisingLink)) {
          // #ifdef APP-PLUS
          plus.runtime.openURL(advertisingLink);
          // #endif

          // #ifdef H5
          window.open(advertisingLink);
          // #endif

          // #ifdef MP-WEIXIN
          uni.navigateTo({
            url: '/components/webView/webView?link=' + encodeURIComponent(advertisingLink)
          });
          // #endif
        } else {
          // 内部路由
          uni.navigateTo({
            url: advertisingLink
          });
        }
        return;
      }

      // 规则2: advertisingLink = 1 且 activityType = null 且 connectionType = 1，不执行任何动作
      if ((advertisingLink == '1' || advertisingLink == 1) &&
          !activityType &&
          (connectionType == 1 || connectionType == '1')) {
        return;
      }

      // 规则3: activityType = null 且 (advertisingLink = null 或 = 1) 且 connectionType = 2，跳转到 advertisDetail.vue
      if (!activityType &&
          (!advertisingLink || advertisingLink == '1' || advertisingLink == 1) &&
          (connectionType == 2 || connectionType == '2')) {
        this.navigateToDetail(item);
        return;
      }

      // 其他情况：按照原有的 connectionType 逻辑处理
      if (connectionType == 1) {
        // 外链跳转
        if (advertisingLink) {
          // #ifdef APP-PLUS
          plus.runtime.openURL(advertisingLink);
          // #endif

          // #ifdef H5
          window.open(advertisingLink);
          // #endif

          // #ifdef MP-WEIXIN
          uni.navigateTo({
            url: '/components/webView/webView?link=' + encodeURIComponent(advertisingLink)
          });
          // #endif
        }
      } else if (connectionType == 2) {
        // 跳转到详情页
        this.navigateToDetail(item);
      } else if (connectionType == 4) {
        // 处理营销获客逻辑
        if (activityType && marketingId) {
          this.disposeMarketingActivity(activityType, marketingId);
        } else {
          console.log('营销活动缺少必要参数:', {activityType, marketingId});
        }
      } else if (connectionType == 5) {
        // 小程序内路径跳转
        if (path) {
          uni.navigateTo({
            url: path
          });
        }
      } else {
        console.log('未知的跳转类型:', connectionType);
      }
    },

    // 跳转广告详情页
    navigateToDetail(item) {
      const params = {
        id: item.id || '',
        title: encodeURIComponent(item.title || '活动详情'),
        time: item.timeS || '',
        status: item.status || '',
        details: item.details ? encodeURIComponent(item.details) : '',
        image: item.image ? encodeURIComponent(item.image) : '',
        link: item.advertisingLink ? encodeURIComponent(item.advertisingLink) : ''
      };

      const queryString = Object.keys(params)
          .filter(key => params[key])
          .map(key => `${key}=${params[key]}`)
          .join('&');

      uni.navigateTo({
        url: `/pages/advertisDetail/advertisDetail?${queryString}`
      });
    },

    // 处理营销活动
    disposeMarketingActivity(activityType, marketingId) {
      switch (activityType) {
          // activityType:  1 => 充值奖励活动, 2 => 累计消费活动, 3 => 单笔折扣活动, 4 => 站点优惠活动,
          // 5 => 邀请奖励, 6 => 新客有礼, 7=> 多人拼团 8=>付费会员 9=>推广员
          // marketingId: 活动id
        case 1:
          uni.navigateTo({
            url: '/marketing_page/pages/pay/payAward/payAward?HD=' + marketingId
          });
          break;
        case 2:
          uni.navigateTo({
            url: '/homeSub/pages/discount/cumulativeMoney/cumulativeMoney?HD=' + marketingId
          });
          break;
        case 3:
          uni.navigateTo({
            url: '/homeSub/pages/discount/singleMoney/singleMoney?HD=' + marketingId
          });
          break;
        case 4:
          uni.navigateTo({
            url: '/homeSub/pages/discount/siteOffers/siteOffers?HD=' + marketingId
          });
          break;
        case 5:
          uni.navigateTo({
            url: '/marketing_page/pages/invite/invitation/invitation?HD=' + marketingId
          });
          break;
        case 6:
          uni.navigateTo({
            url: '/pages/index/index'
          });
          break;
        case 7:
          uni.navigateTo({
            url: '/marketing_page/pages/group/list/index'
          });
          break;
        case 8:
          uni.navigateTo({
            url: '/marketing_page/pages/member/index/index'
          });
          break;
        case 9:
          // 首页未定义 getPromoterDetailFun，spreadStatus 恒不等于 1，与原逻辑一致
          uni.navigateTo({
            url: '/marketing_page/pages/promotion/recruit_plan/recruit_plan'
          });
          break;
        default:
          console.log('未知的营销活动类型:', activityType);
          break;
      }
    }
  }
};
</script>

<style scoped>
.ad-banner {
  background-color: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
}

.ad-banner--inset {
  margin-left: 20rpx;
  margin-right: 20rpx;
}

.ad-banner__swiper {
  width: 100%;
  position: relative;
  border-radius: 20rpx;
  overflow: hidden;
}

.ad-banner__item {
  position: relative;
  width: 100%;
  height: 100%;
}

.ad-banner__image {
  width: 100%;
  height: 100%;
  border-radius: 20rpx;
  display: block;
}

/* 客服类 banner 的透明按钮覆盖层：视觉上不可见，点击直接进微信客服 */
.ad-banner__cs-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
}

.ad-banner__cs-overlay :deep(.customer-service-btn) {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  border-radius: 20rpx;
  padding: 0;
  margin: 0;
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
