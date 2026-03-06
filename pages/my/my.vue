<template>
  <view class="my-container" v-if="initialized || !hasToken">
    <!-- 1. 顶部用户信息区域 -->
    <view class="user-info-card">
      <!-- <view class="avatar-placeholder" @click="login">[头像]</view> -->
      <view class="info">
        <view class="info-content">
          <text @click="login" class="phone">{{ maskedPhone || '注册/登录' }}</text>
          <view
              style="display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 5rpx; margin-left: 10rpx; margin-top: 10rpx;">
            <view style="display: flex; align-items: center;">
              <view
                  v-if="memberInfo.motorcadeName"
                  :style="{
									display: 'inline-flex',
									alignItems: 'center',
									justifyContent: 'center',
									backgroundColor: memberInfo.tokenMemberType === 2 ? '#E8F5E9' : '#FFF3E0',
									padding: '4rpx 12rpx',
									borderRadius: '8rpx'
								}"
              >
                <text :style="{
									color: memberInfo.tokenMemberType === 2 ? '#4CAF50' : '#FF9800',
									fontSize: '22rpx'
								}">
                  {{ memberInfo.tokenMemberType === 2 ? memberInfo.motorcadeName : '个人身份' }}
                </text>
              </view>
            </view>
            <view @click="changeUser" style="display: flex; align-items: center;">
              <view v-if="memberInfo.motorcadeName"
                    style="display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 4rpx;">
                <view class="change-user">切换身份</view>
                <view>
                  <uv-icon name="reload" color="#007AFF" size="14"></uv-icon>
                </view>
              </view>
            </view>
          </view>
        </view>
        <!-- <text class="change-user" @click="changeUser" v-if="memberInfo.groupName">切换身份</text> -->
      </view>
    </view>

    <!-- 2. 会员信息区域 -->
    <view class="card membership-card" v-if="memberInfo.tokenMemberType === 0 && false">
      <view class="membership-header">
        <view class="level">
          <text class="level-icon-placeholder">[V]</text>
          <text class="level-text">V{{ memberInfo.level }} ({{ memberInfo.servicePackage.name }})</text>
        </view>
        <text class="next-level-info">下一级: {{ memberInfo.nextLevelName }}</text>
      </view>
      <view class="progress-wrapper">
        <progress class="progress-bar" :percent="percentage" activeColor="#ffc107" backgroundColor="#f0f0f0"
                  stroke-width="6" border-radius="6"></progress>
        <text class="progress-label">距离下一级还差 {{ memberInfo.gap }} 积分</text>
      </view>
    </view>

    <!-- 3. 账户信息区域 -->
    <view class="account-info-card">
      <view class="account-item" @click="goToAssetsPage">
        <text class="value">{{ displayBalance }}</text>
        <text class="label">账户余额 (元)</text>
      </view>
      <view class="account-item" @click="goToCouponPage">
        <text class="value">{{ couponCount }}</text>
        <text class="label">卡券数量</text>
      </view>
      <view class="account-item" @click="goToIntegralPage" v-if="memberInfo.tokenMemberType === 0">
        <text class="value">{{ integral }}</text>
        <text class="label">积分</text>
      </view>
    </view>

    <!-- 4. 功能入口区域 -->
    <!-- <view class="grid-menu-card">
      <view class="grid-item" @click="goToVehiclePage">
        <view class="item-content">
          <text class="title">我的爱车</text>
          <text class="subtitle">车牌号: {{ plateNo || '绑定车辆' }}</text>
        </view>
      </view>
    </view> -->

    <view class="card vehicle-card">
      <view class="vehicle-header">
        <text class="vehicle-title">我的爱车</text>
      </view>
      <view class="vehicle-content" @click="goToVehiclePage">
        <view class="vehicle-icon">
          <uv-icon name="car" color="#ffffff" size="32"></uv-icon>
        </view>
        <view class="vehicle-info">
          <view style="display: flex; flex-direction: row; align-items: center; gap: 5rpx;">
            <text class="plate-number">{{ plateNo || '绑定车辆享受权益' }}</text>
            <view class="parking-discount-container" v-if="plateNo">
              <view style="margin-top: 5rpx;">
                <uv-icon name="checkmark-circle" color="#FF974F" size="12"></uv-icon>
              </view>
              <text class="parking-discount-text">停车优惠</text>
            </view>
          </view>
          <text class="vehicle-desc" v-if="plateNo">特定站点享受停车优惠</text>
        </view>
        <view class="vehicle-action">
          <uv-button shape="round" color="#000000" customTextStyle="font-size: 24rpx; color: #ffffff;"
                     text="管理"></uv-button>
        </view>
      </view>
    </view>

    <!-- 快速退款 -->
    <view class="refund-card" @click="goToPage('/pages/refund/applyRefund')">
      <image class="refund-card-icon" src="/static/X.svg" mode="aspectFit"></image>
      <view class="card-content">
        <text class="refund-title">快速退款</text>
        <text class="refund-desc">点击进入处理</text>
      </view>
    </view>

    <!-- 6. 功能菜单 -->
    <view class="card function-menu-card">
      <view class="menu-item" v-for="item in filteredMenuItems" :key="item.name" @click="goToPage(item.navigateTo)">
        <view class="menu-icon-placeholder">
          <uv-icon :name="item.iconName" size="28"></uv-icon>
        </view>
        <text class="menu-label">{{ item.name }}</text>
        <!-- 当是客服菜单项时，渲染完全透明的CustomerServiceButton覆盖层 -->
        <view v-if="item.navigateTo === '/pages/common/service'" class="customer-service-overlay">
          <CustomerServiceButton :sessionFrom="'my_page'" :customClass="'transparent-overlay'"/>
        </view>
      </view>
    </view>
    <!-- 固定底部导航 -->
    <Tabbar :activeId="2"></Tabbar>
  </view>
</template>

<script>
import globalData from '@/globalData.js';
import Tabbar from '@/components/tabbar/tabbar';
import CustomerServiceButton from '@/components/common/CustomerServiceButton.vue';
import {getStyleConfig} from '@/api/style.js';
import {
  getMemberInfo,
  listPopUp,
  getInvoiceBySellerId,
  queryDynamicsActivity,
  getOldAndNewBenifit,
  getMyNotPayBillNumber,
  getAccountInfo,
  changeUser
} from '@/api/member.js';

export default {
  components: {
    Tabbar,
    CustomerServiceButton
  },
  data() {
    return {
      // 授权码
      authCode: null,
      //  登录标识
      isLogin: false,
      // 标记数据是否初始化完成
      initialized: false,
      // 标记是否正在加载数据，避免重复加载
      isLoading: false,
      // token状态，用于响应式更新
      currentToken: null,
      // API原始数据
      memberInfo: {
        groupName: null,
        level: null,
        nextLevelName: null,
        gap: 0,
        servicePackage: {},
        tokenMemberType: 0,
        couponList: 0,
        isInvoice: 0,
      },
      accountInfo: null,
      // 页面渲染数据
      maskedPhone: '',
      balance: '0.00',
      couponCount: 0,
      integral: 0,
      percentage: 0,
      notCommentBillNumber: 0,
      plateNo: null,
      // 完整菜单项
      allMenuItems: [
        {
          name: '我的账单',
          navigateTo: '/pages/order/list',
          iconName: 'empty-order'
        },
        {
          name: '占位订单',
          navigateTo: '/pages/order/occupy',
          iconName: 'empty-order'
        },
        {
          name: '发票开具',
          navigateTo: '/pages/invoice/invoice',
          iconName: 'empty-history'
        },
        {
          name: '客服',
          navigateTo: '/pages/common/service',
          iconName: 'server-fill'
        },
        // {
        // 	name: '兑券',
        // 	iconName: 'coupon',
        // 	navigateTo: '/pages/coupon/myCoupon'
        // },
        {
          name: '设置',
          navigateTo: '/pages/common/version',
          iconName: 'setting'
        },
      ],
      // 未登录时显示的菜单项
      guestMenuItems: [
        {
          name: '客服',
          navigateTo: '/pages/common/service',
          iconName: 'server-fill'
        },
        {
          name: '设置',
          navigateTo: '/pages/common/version',
          iconName: 'setting'
        },
      ],
      groupMenuItems: [
        {
          name: '我的账单',
          iconName: 'empty-order',
          navigateTo: '/pages/order/list'
        },
        {
          name: '占位订单',
          iconName: 'empty-order',
          navigateTo: '/pages/order/occupy'
        },
        {
          name: '发票开具',
          iconName: 'empty-history',
          navigateTo: '/pages/invoice/invoice'
        },
        {
          name: '客服',
          iconName: 'server-fill',
          navigateTo: '/pages/common/service'
        },
        {
          name: '设置',
          iconName: 'setting',
          navigateTo: '/pages/common/version'
        },
      ],
    };
  },
  computed: {
    // 检查是否有token
    hasToken() {
      return !!this.currentToken;
    },
    // 根据token状态和isInvoice字段返回对应的菜单项
    filteredMenuItems() {
      console.log('filteredMenuItems 计算属性被触发, hasToken:', this.hasToken);

      if (!this.hasToken) {
        console.log('返回未登录菜单项数量:', this.guestMenuItems.length);
        return this.guestMenuItems;
      }

      // 根据isInvoice字段过滤菜单项
      let menuItems = [];
      if (this.memberInfo.deductMode == 'TeamAccount' && this.memberInfo.tokenMemberType === 2 && this.memberInfo.isInvoice === 0) {
        menuItems = this.groupMenuItems.filter(item => {
          // 如果是发票开具菜单项，需要检查isInvoice字段
          if (item.name === '发票开具') {
            return false;
          }
          return true;
        });
      } else if (this.memberInfo.deductMode == 'LeaguerAccount' && this.memberInfo.tokenMemberType === 2 && this.memberInfo.isInvoice === 0) {
        menuItems = this.allMenuItems.filter(item => {
          // 如果是发票开具菜单项，需要检查isInvoice字段
          if (item.name === '发票开具') {
            return false;
          }
          return true;
        });
      } else {
        menuItems = this.allMenuItems;
      }
      console.log('返回已登录菜单项数量:', menuItems.length);
      console.log('isInvoice值:', this.memberInfo.isInvoice);
      return menuItems;
    },
    // 计算显示的账户余额
    displayBalance() {
      console.log('this.memberInfo.11111', this.balance)
      // return (this.memberInfo.deductMode === 'TeamAccount' && this.memberInfo.tokenMemberType === 2) ? '****' : this.balance;
      return this.balance;
    }
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
  onLoad() {
    console.log('my页面 onLoad 被触发');
    // 如果是微信小程序
    // #ifdef MP-WEIXIN
    uni.hideTabBar();
    // #endif

    // 同步token状态
    this.syncTokenState();

    // 为了确保数据能够加载，在 onLoad 时也调用一次
    // 这样即使 onShow 有问题，页面也能正常显示数据
    this.loadPageData();
  },
  onShow() {
    console.log('my页面 onShow 被触发');

    // 先同步token状态
    this.syncTokenState();

    if (!this.currentToken) {
      console.log('token不存在，清空页面数据');
      this.clearPageData();
      return;
    }

    // onShow 时刷新数据，特别是从其他页面返回时
    // 但要避免和 onLoad 的重复加载
    if (this.initialized) {
      console.log('页面已初始化，刷新数据');
      this.isLoading = false; // 重置加载状态，允许刷新
      this.loadPageData();
    }
  },
  methods: {
    getWxAppName() {
      return globalData.wxAppName;
    },
    /**
     * @description 同步token状态到响应式数据
     */
    syncTokenState() {
      const token = uni.getStorageSync('token');
      console.log('同步token状态:', token ? '有token' : '无token');
      this.currentToken = token;
    },

    /**
     * @description 清空所有页面数据，用于登出或token失效时
     */
    clearPageData() {
      console.log('清空页面数据');
      // 清空用户信息
      this.memberInfo = {
        groupName: null,
        level: null,
        nextLevelName: null,
        gap: 0,
        servicePackage: {},
        tokenMemberType: 0,
        couponList: 0,
        isInvoice: 0,
      };
      this.accountInfo = null;

      // 清空页面渲染数据
      this.maskedPhone = '';
      this.balance = '0.00';
      this.couponCount = 0;
      this.integral = 0;
      this.percentage = 0;
      this.notCommentBillNumber = 0;
      this.plateNo = null;

      // 重置状态标记
      this.initialized = true; // 保持为true，让页面可以显示未登录状态
      this.isLoading = false;
      this.isLogin = false;
      this.currentToken = null; // 清空token状态
    },

    changeUser() {
      if (!this.memberInfo.motorcadeName) {
        return;
      }
      const deductMode = uni.getStorageSync('deductMode')
      let changeType = null;
      if (deductMode === 'LeaguerAccount' && this.memberInfo.tokenMemberType === 2) {
        changeType = 0;
      } else if (deductMode === 'TeamAccount' && this.memberInfo.tokenMemberType === 2) {
        changeType = 0;
      } else if (deductMode === 'TeamAccount' && this.memberInfo.tokenMemberType === 0) {
        changeType = 1;
      } else if (deductMode === 'LeaguerAccount' && this.memberInfo.tokenMemberType === 0) {
        changeType = 2;
      } else {
        uni.showToast({
          title: '无法切换身份请联系客服',
          icon: 'none'
        });
        return;
      }
      uni.showLoading({
        title: '加载中...'
      });
      changeUser(changeType).then(res => {
        if (res.code === 0) {
          uni.setStorageSync('token', res.data);
          // 同步新的token状态
          this.syncTokenState();
          this.loadPageData();
          uni.hideLoading();
        } else {
          uni.hideLoading();
          uni.showToast({
            title: res.msg || '切换身份失败',
            icon: 'none'
          });
        }
      });
    },
    updateMaskedPhone() {
      const phoneNo = uni.getStorageSync('phoneNo');
      this.maskedPhone = this.maskPhoneNumber(phoneNo);
      console.log('maskedPhone', this.maskedPhone)
    },

    /**
     * @description 跳转到登录页面
     */
    login() {
      if (!uni.getStorageSync('token')) {
        uni.navigateTo({
          url: '/pages/login/login'
        });
      }
    },
    /**
     * @description 加载页面所有数据
     * 负责登录、获取Token、并行请求所有业务接口，并处理返回数据
     */
    async loadPageData() {
      console.log('开始执行 loadPageData 方法');

      // 如果正在加载或已经初始化且有token，则不重复加载
      if (this.isLoading) {
        console.log('数据正在加载中，跳过重复请求');
        return;
      }

      this.isLoading = true;
      uni.showLoading({
        title: '加载中...'
      });
      try {
        // 同步token状态
        this.syncTokenState();

        if (!this.currentToken) {
          console.log('loadPageData: token不存在，清空数据');
          this.clearPageData();
          // uni.navigateTo({
          // 	url: '/pages/login/login'
          // });
          return;
        }

        this.updateMaskedPhone()

        // 步骤2: 并发请求所有其他接口
        const sellerId = globalData.sellerId; // 从API示例中获取的硬编码
        const requests = [
          getMemberInfo(),
          listPopUp(),
          getInvoiceBySellerId(sellerId),
          getOldAndNewBenifit(sellerId),
          getMyNotPayBillNumber({
            prePayVer: 1
          }),
        ];

        const [
          memberInfoRes
        ] = await Promise.all(requests);

        // 步骤3: 处理数据并更新UI
        this.processApiData({
          memberInfoRes
        });

      } catch (error) {
        console.error('加载页面数据时出错:', error);
        uni.showToast({
          title: '数据加载失败',
          icon: 'none'
        });
      } finally {
        this.initialized = true;
        this.isLoading = false;
        uni.hideLoading();
      }
    },

    /**
     * @description 统一处理API返回的数据，并更新到data中
     * @param {object} results - 包含所有API响应的对象
     */
    processApiData(results) {
      const {
        memberInfoRes
      } = results;

      // 处理会员信息
      if (memberInfoRes && memberInfoRes.code === 0) {
        const data = memberInfoRes.data;
        this.memberInfo = data;
        this.couponCount = data.couponList || 0;
        this.integral = data.consumeIntegral || 0;
        this.notCommentBillNumber = data.notCommentBillNumber || 0;
        this.plateNo = data.plateNo || '未绑定';
        this.percentage = parseFloat(data.percentage) || 0;
        this.deductMode = data.deductMode;
        uni.setStorageSync("deductMode", this.deductMode);
        if (this.deductMode === 'TeamAccount' && data.tokenMemberType === 2) {
          this.balance = (data.carAccountBalance / 100).toFixed(2);
        } else if (this.deductMode === 'LeaguerAccount') {
          if (data.tokenMemberType === 0) {
            this.balance = (data.accountBalance / 100).toFixed(2);
          } else {
            this.balance = (data.carAccountBalance / 100).toFixed(2);
          }
        } else if (this.deductMode === 'TeamAccount' && data.tokenMemberType === 0) {
          this.balance = (data.accountBalance / 100).toFixed(2);
        } else if (this.deductMode === null && data.tokenMemberType === 0) {
          this.balance = (data.accountBalance / 100).toFixed(2);
        }

        uni.setStorageSync("tokenMemberType", data.tokenMemberType);
        uni.setStorageSync("memberInfo", data);


        // getAccountInfo({
        // 		tab: data.tokenMemberType === 0 ? 1 : 2
        // 	}).then(res => {
        // 		if (res.code === 0) {
        // 			this.accountInfo = res.data;
        // 			// 金额从分转换为元
        // 			console.log('this.accountInfo',this.accountInfo)
        // 			this.balance = (this.accountInfo.totalAccountBalance / 100).toFixed(2);
        // 		}
        // 	});
      }
    },

    /**
     * @description 将手机号中间四位替换为*
     * @param {string} phone - 手机号
     * @returns {string} - 脱敏后的手机号
     */
    maskPhoneNumber(phone) {
      if (typeof phone === 'string' && phone.length === 11) {
        return phone.substring(0, 3) + '****' + phone.substring(7);
      }
      return phone;
    },

    /**
     * @description 跳转到个人资产页面
     */
    goToAssetsPage() {
      if (this.deductMode === 'TeamAccount' && this.memberInfo.tokenMemberType === 2) {
        uni.showToast({
          title: '车队账户无法查看资产',
          icon: 'none'
        });
        return;
      }
      uni.navigateTo({
        url: '/pages/account/assets'
      });
    },

    /**
     * @description 跳转到我的卡券页面
     */
    goToCouponPage() {
      uni.navigateTo({
        url: '/pages/coupon/myCoupon'
      });
    },

    /**
     * @description 跳转到我的积分页面
     */
    goToIntegralPage() {
      uni.navigateTo({
        url: '/pages/integral/index'
      });
    },

    /**
     * @description 跳转到我的订单页面
     */
    goToOrderPage() {
      uni.navigateTo({
        url: '/pages/order/list'
      });
    },

    /**
     * @description 跳转到我的车辆页面
     */
    goToVehiclePage() {
      uni.navigateTo({
        url: '/pages/vehicle/list'
      });
    },

    /**
     * @description 跳转到我的退款页面
     */
    goToRefundPage() {
      uni.navigateTo({
        url: '/pages/refund/apply'
      });
    },
    /**
     * @description 跳转到指定页面
     */
    async goToPage(navigateTo) {
      if (navigateTo === '/pages/common/service') {
        // const res = await getStyleConfig()
        // if (res.code !== 0) {
        // 	uni.showToast({
        // 		title: res.msg || '获取客服信息失败',
        // 		icon: 'none'
        // 	});
        // 	return;
        // }
        // uni.showModal({
        // 	title: '联系客服',
        // 	content: `客服电话：${res.data.telephone || ''}\n客服工作时间：${res.data.serviceTime || ''}`,
        // 	showCancel: true,
        // 	cancelText: '取消',
        // 	confirmText: '呼叫客服',
        // 	confirmColor: '#007AFF',
        // 	success: (res1) => {
        // 		if (res1.confirm) {
        // 			// 用户点击了呼叫客服按钮
        // 			uni.makePhoneCall({
        // 				phoneNumber: res.data.telephone,
        // 				success: () => {
        // 					console.log('呼叫成功');
        // 				},
        // 				fail: (err) => {
        // 					console.log('呼叫失败', err);
        // 					uni.showToast({
        // 						title: '呼叫失败',
        // 						icon: 'none'
        // 					});
        // 				}
        // 			});
        // 		}
        // 	}
        // });
        return;
      }
      if (navigateTo) {
        uni.navigateTo({
          url: navigateTo
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.my-container {
  background: linear-gradient(to bottom, #E5F6FF 30%, #F3F3F3 50%);
  min-height: 100vh;
  padding: 16rpx;
  box-sizing: border-box;
}

.parking-discount-container {
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 5rpx;
}

.parking-discount-text {
  font-size: 24rpx;
  color: #FF974F;
}

.card {
  background-color: #ffffff;
  border-radius: 16rpx;
  margin: 16rpx 0;
  padding: 32rpx;
  box-sizing: border-box;
}

// 1. 顶部用户信息
.user-info-card {
  display: flex;
  padding: 32rpx 0rpx 30rpx 0rpx;
  margin-top: 60rpx;
  flex-direction: column;
  margin-left: 24rpx;
}

.avatar-placeholder {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: #eee;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
  font-size: 24rpx;
}

.plate-no {
  font-size: 30rpx;
  font-weight: bold;
  color: #5e5e5e;
}

// 车辆卡片样式
.vehicle-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  margin: 16rpx 0;
  padding: 32rpx;
  box-sizing: border-box;
}

.vehicle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.vehicle-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.vehicle-manage {
  font-size: 28rpx;
  color: #333333;
}

.vehicle-content {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  padding: 24rpx;
  gap: 20rpx;
}

.vehicle-icon {
  width: 80rpx;
  height: 80rpx;
  background-color: #32d74b;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.vehicle-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.plate-number {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.vehicle-desc {
  font-size: 24rpx;
  color: #999999;
}

.vehicle-action {
  flex-shrink: 0;
}

.info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.phone {
  font-size: 36rpx;
  font-weight: bold;
}

// 2. 会员信息
.membership-card .membership-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.level {
  display: flex;
  align-items: center;
  font-size: 32rpx;
  font-weight: bold;
}

.level-icon-placeholder {
  margin-right: 12rpx;
  font-style: italic;
}

.next-level-info {
  font-size: 24rpx;
  color: #999;
}

.progress-wrapper {
  margin-top: 24rpx;
  display: flex;
  align-items: center;
  width: 100%;
}

.progress-bar {
  flex: 1;
}

.progress-label {
  font-size: 24rpx;
  color: #999;
  margin-left: 16rpx;
  white-space: nowrap;
}

// 3. 账户信息
.account-info-card {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 32rpx 0;
  margin: 16rpx 0;
  background-color: #ffffff;
  border-radius: 16rpx;
}

.account-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.value {
  font-size: 40rpx;
  font-weight: bold;
}

.label {
  font-size: 24rpx;
  color: #666;
  margin-top: 8rpx;
}

// 4. 功能入口
.grid-menu-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.grid-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
}

.item-content .title {
  font-size: 32rpx;
  font-weight: bold;
  display: block;
}

.item-content .subtitle {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

// 快速退款
.refund-card {
  width: 100%;
  height: 200rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0 32rpx;
  gap: 48rpx;
  background-color: #ffffff;
  border: 1rpx solid #f2f2f2;
  border-radius: 16rpx;
  position: relative;
  overflow: hidden;
  margin: 16rpx 0;
  user-select: none;
}

.refund-card-icon {
  width: 100rpx;
  height: 100rpx;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.refund-card::before {
  content: '';
  position: absolute;
  bottom: -40rpx;
  left: -40rpx;
  width: 180rpx;
  height: 180rpx;
  background-color: #E5F6FF;
  border-radius: 50%;
  filter: blur(30px);
  z-index: 1;
}

.refund-card::after {
  content: '';
  position: absolute;
  top: -20rpx;
  right: -20rpx;
  width: 160rpx;
  height: 160rpx;
  background-color: #E5F6FF;
  border-radius: 50%;
  filter: blur(20px);
  z-index: 1;
}

.refund-card:active {
  background-color: #fafafa;
}

.card-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.refund-title {
  // 斜体
  font-style: italic;
  font-size: 44rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12rpx;
  letter-spacing: 0.5rpx;
}

.refund-desc {
  // 斜体
  font-style: italic;
  font-size: 24rpx;
  color: #999999;
}

// 5. 广告横幅
.banner-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #D7E9FF;
}

.banner-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #007AFF;
}

.banner-button {
  font-size: 28rpx;
  background-color: #D7E9FF;
  color: #fff;
  border-radius: 30rpx;
  padding: 8rpx 24rpx;
  margin: 0;
}

// 6. 功能菜单
.function-menu-card {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32rpx;
  padding: 32rpx 16rpx;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.customer-service-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  pointer-events: auto;
}

.customer-service-overlay :deep(.customer-service-btn) {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.customer-service-overlay :deep(.customer-service-btn uv-icon) {
  opacity: 0;
}

.menu-icon-placeholder {
  width: 64rpx;
  height: 64rpx;
  border-radius: 8rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20rpx;
  color: #999;
}

.menu-label {
  font-size: 24rpx;
  color: #333;
  margin-top: 16rpx;
}

// 身份字体样式
.motorcade-name {
  font-size: 28rpx;
  color: #999;
}

// 切换字体样式
.change-user {
  font-size: 24rpx;
  color: #007AFF;
  font-weight: bold;
}
</style>
