<template>
  <view class="page-container">

    <uv-navbar :border="false" :autoBack="false" title="充电枪详情" placeholder safeAreaInsetTop @leftClick="handleNavBack">
      <template v-slot:right>
        <view style="margin-right: 200rpx; margin-bottom: 5rpx;">
          <CustomerServiceButton
              session-from="gun_starting_charge_page"
              custom-class="server-icon-wrapper"
          />
        </view>
      </template>
    </uv-navbar>
    <!-- 条件渲染视图 -->
    <template v-if="pileInfo && memberInfo">
      <charge-idle-view
          ref="chargeIdleView"
          v-if="mainGunState === 1 || mainGunState === 2"
          :pile-info="pileInfo"
          :member-info="memberInfo"
          :payment-methods="paymentMethods"
          :preset-amount="presetAmount"
          :current-payment-type="currentPaymentType"
          :main-gun-params="gunParams"
          @show-price-details="handleShowPriceDetails"
          @payment-change="paymentMethodChange"
          @preset-amount-change="handlePresetAmountChange"
          @set-preset-amount="setPresetAmount"
          @dual-gun-change="handleDualGunChange"
          @gun-status-updated="handleGunStatusUpdated"
          @user-changed="handleUserChanged"
      />
      <charge-busy-view
          v-else
          :pile-info="pileInfo"
          :main-gun-state="mainGunState"
          :gun-no="gunParams.gunNo"
      />
    </template>

    <!-- 加载状态 -->
    <view v-else class="loading-container">
      <text>加载中...</text>
    </view>

    <!-- 底部操作栏 -->
    <view v-if="mainGunState === 1 || mainGunState === 2" class="bottom-bar">
      <uv-button
          :text="chargeButtonText"
          type="primary"
          size="large"
          :disabled="isChargeButtonDisabled"
          shape="circle"
          :custom-style="startChargeButtonStyle"
          @click="startCharging">
      </uv-button>
    </view>

    <!-- 价格详情弹窗 -->
    <uv-popup
        ref="priceDetailsPopup"
        mode="bottom"
        :round="20"
        :safe-area-inset-bottom="true"
        :closeable="true"
        close-icon-pos="top-right"
        bg-color="#fff"
        @change="handlePopupChange"
    >
      <view class="price-details-content">
        <view class="popup-header">
          <text class="popup-title">电价收费详情</text>
        </view>
        <view class="price-header">
          <text>收费时段</text>
          <text>费用(元/度) = 电费 + 服务费</text>
        </view>
        <view class="price-list">
          <stage-price-info v-for="(price, index) in priceDetailsData" :key="index" :price-info="price" :index="index"
                            :price-list="priceDetailsData"/>
        </view>
      </view>
    </uv-popup>

  </view>
</template>

<script>
import {getPileDTOByNo} from '@/api/pile.js';
import {getMemberInfo} from '@/api/member.js';
import {queryPayAccountSetting, getMinimumStartBalance} from '@/api/common.js';
import ChargeIdleView from '@/components/charge/ChargeIdleView.vue';
import ChargeBusyView from '@/components/charge/ChargeBusyView.vue';
import StagePriceInfo from '@/components/station/StagePriceInfo.vue';
import globalData from '@/globalData.js';
import {queryMemberStatus, getMyOccupyBillPage} from '@/api/member.js';
import {queryChargeRealy} from '@/api/charge.js';
import {startCharge} from '@/api/charge.js';
// 导入充完即退相关API（同时支持微信和支付宝）
import {
  disposableStartCharge,
  disposableUnifiedOrders,
  disposableOrderResultQuery,
  disposableCancelRecharge,
  alipayDisposableUnifiedOrders,
  alipayDisposableOrderResultQuery,
  alipayDisposableCancelRecharge
} from '@/api/pay.js';
import {contactCustomerService as contactCustomerServiceFn, handleNavBack} from '@/utils/utils';
import CustomerServiceButton from '@/components/common/CustomerServiceButton.vue';

/** 个人余额启动、充完即退预充金额上限（元） */
const MAX_PRE_CHARGE_YUAN = 1000;

export default {
  components: {
    ChargeIdleView,
    ChargeBusyView,
    StagePriceInfo,
    CustomerServiceButton
  },
  data() {
    return {
      pileNo: null,
      pileInfo: null,
      memberInfo: null,
      paymentMethods: [],
      minimumStartBalance: 0,
      isGunPlugged: false, // 假设默认未插枪
      presetAmount: '',
      currentPaymentType: -1,
      showPriceDetails: false,
      priceDetailsData: [], // 存储价格详情数据
      mainGunState: null,
      platformNo: null,
      // 当前选中的枪信息（通过接口获取）
      gunParams: {
        gunNo: null,
        gunId: null,
        gunName: '',
        gunType: '',
        pileName: '',
        pileNum: '',
        maxPower: '',
        current: '',
        valleyVol: '',
        peakVol: '',
        currentPrice: '',
        stationId: '',
        stationName: ''
      },
      // 双枪状态
      dualGunInfo: {
        mainGun: null,
        secondaryGun: null
      },
      startChargeButtonStyle: {
        width: '100%',
        backgroundColor: '#007AFF',
        color: '#fff',
        radius: '40rpx',
      },
      // 充完即退相关状态（兼容微信和支付宝）
      disposableOrderInfo: {
        orderNo: '',
        isProcessing: false,
        pollTimer: null,
        pollCount: 0
      },
      // 启动中状态
      isStarting: false,
    };
  },
  computed: {
    chargeButtonText() {
      // 启动中时显示启动状态
      if (this.isStarting) {
        return '启动中...';
      }
      // 正在轮询支付结果时显示等待状态
      if (this.disposableOrderInfo.pollTimer) {
        return '支付确认中...请勿离开页面';
      }
      // 订单处理中时显示处理状态
      if (this.disposableOrderInfo.isProcessing) {
        return '处理中...';
      }
      // 未插枪时显示提示
      if (!this.isGunPlugged) {
        return '请插枪后点击启动';
      }
      // 当主枪和从枪都有时显示双枪并充
      if (this.dualGunInfo.mainGun && this.dualGunInfo.secondaryGun) {
        return '双枪并充';
      }

      if ((this.presetAmount == 0 || this.presetAmount == '0') && this.currentPaymentType == 1) {
        return '余额不足';
      }

      if ((this.currentPaymentType == -1 || this.currentPaymentType == 1) && this.presetAmount < 300) {
        return '预充金额小于3元';
      }

      return '开启充电';
    },
    // 控制充电按钮的禁用状态
    isChargeButtonDisabled() {
      // 启动中时禁用
      if (this.isStarting) {
        return true;
      }
      // 未插枪时禁用
      if (!this.isGunPlugged) {
        return true;
      }
      // 订单处理中时禁用
      if (this.disposableOrderInfo.isProcessing) {
        return true;
      }
      // 正在轮询支付结果时禁用
      if (this.disposableOrderInfo.pollTimer) {
        return true;
      }
      if ((this.presetAmount == 0 || this.presetAmount == '0') && this.currentPaymentType == 1) {
        return true;
      }
      if ((this.currentPaymentType == -1 || this.currentPaymentType == 1) && this.presetAmount < 300) {
        return true;
      }
      return false;
    }
  },
  onShareAppMessage() {
    // 构建分享路径，包含必要的参数
    const params = [];

    // 添加桩编号参数（必需）
    if (this.pileNo) {
      params.push(`pileNum=${encodeURIComponent(this.pileNo)}`);
    }

    // 添加枪编号参数（必需）
    if (this.gunParams.gunNo) {
      params.push(`gunNo=${encodeURIComponent(this.gunParams.gunNo)}`);
    }

    // 如果有平台编号，也添加到分享路径中
    if (this.platformNo) {
      params.push(`platformNo=${encodeURIComponent(this.platformNo)}`);
    }

    // 构建完整的分享路径
    let sharePath = '/pages/charge/gunStartingCharge';
    if (params.length > 0) {
      sharePath += '?' + params.join('&');
    }

    // 使用小程序名称作为分享标题
    const shareTitle = this.getWxAppName();

    return {
      title: shareTitle,
      path: sharePath
    };
  },
  onShareTimeline() {
    // 构建分享路径，包含必要的参数
    const params = [];

    // 添加桩编号参数（必需）
    if (this.pileNo) {
      params.push(`pileNum=${encodeURIComponent(this.pileNo)}`);
    }

    // 添加枪编号参数（必需）
    if (this.gunParams.gunNo) {
      params.push(`gunNo=${encodeURIComponent(this.gunParams.gunNo)}`);
    }

    // 如果有平台编号，也添加到分享路径中
    if (this.platformNo) {
      params.push(`platformNo=${encodeURIComponent(this.platformNo)}`);
    }

    // 构建完整的分享路径
    let sharePath = '/pages/charge/gunStartingCharge';
    if (params.length > 0) {
      sharePath += '?' + params.join('&');
    }

    // 使用小程序名称作为分享标题
    const shareTitle = this.getWxAppName();

    return {
      title: shareTitle,
      path: sharePath
    };
  },
  onLoad(options) {
    console.log('gunStartingCharge onLoad', options)
    // 只接收 pileNo 和 gunNo 参数，其他数据通过 getPileDTOByNo 接口获取
    if (!options.pileNum || !options.gunNo) {
      uni.showToast({
        title: '参数缺失：需要桩编号和枪编号',
        icon: 'none'
      });
      return;
    }

    this.pileNo = options.pileNum;
    // 只保存必要的参数用于后续查找
    this.gunParams.gunNo = options.gunNo;

    console.log('接收到的参数:', {pileNo: options.pileNum, gunNo: options.gunNo});

    // 页面打开时立即调用获取桩详情数据
    // this.refreshData();
  },
  onShow() {
    // 页面显示时（包括从其他页面返回），重新获取用户信息以更新车辆信息
    // 只有当页面已经初始化（有pileNo）时才刷新，避免首次加载时重复请求
    if (this.pileNo) {
      // this.refreshMemberInfo();
      this.refreshData();
    }
  },
  onUnload() {
    // 页面卸载时清理定时器
    this.clearAllTimers();
  },
  onHide() {
    // 页面隐藏时清理定时器（例如切换到其他应用）
    this.clearAllTimers();
  },
  methods: {
    handleNavBack,
    // 获取小程序名称
    getWxAppName() {
      return globalData.wxAppName;
    },

    handlePresetAmountChange(value) {
      console.log('handlePresetAmountChange', value)
      this.presetAmount = value;
    },
    // 仅刷新用户信息（用于页面显示时更新车辆信息）
    async refreshMemberInfo() {
      try {
        const memberRes = await getMemberInfo();
        if (memberRes.code === 0) {
          this.memberInfo = memberRes.data;
          uni.setStorageSync('tokenMemberType', this.memberInfo.tokenMemberType);
          uni.setStorageSync('memberInfo', this.memberInfo);
        }
      } catch (error) {
        console.error('刷新用户信息失败:', error);
        // 刷新失败时不显示错误，避免影响用户体验
      }
    },
    async refreshData() {
      let title = '正在刷新...';
      if (this.disposableOrderInfo.pollTimer) {
        title = '支付确认中，请勿离开页面...即将启动充电';
      }
      uni.showLoading({title: title});
      try {
        const [pileRes, memberRes, paymentRes, balanceRes] = await Promise.all([
          getPileDTOByNo({pileNo: this.pileNo, sellerId: globalData.sellerId}),
          getMemberInfo(),
          queryPayAccountSetting({disposablePayMode: true, pileNo: this.pileNo}),
          getMinimumStartBalance()
        ]);

        if (pileRes.code === 0) {
          console.log('获取桩详情数据成功:', pileRes.data);
          this.pileInfo = pileRes.data;

          // 从接口返回数据中查找指定的枪
          if (this.pileInfo && this.pileInfo.gunDTOList) {
            console.log('枪列表数据:', this.pileInfo.gunDTOList);
            console.log('查找枪编号:', this.gunParams.gunNo);

            // 根据枪编号查找对应的枪
            const targetGun = this.pileInfo.gunDTOList.find(gun => gun.gunno === this.gunParams.gunNo);

            if (targetGun) {
              // 更新gunParams，补充从接口获取的枪详细信息
              this.gunParams = {
                ...this.gunParams,
                gunId: targetGun.gunid,
                gunName: targetGun.gunName,
                gunType: targetGun.currentMode,
                pileName: targetGun.pilename,
                pileNum: targetGun.pileno,
                maxPower: targetGun.ratedPower,
                current: targetGun.ratedCurrent,
                valleyVol: targetGun.ratedMinVoltage,
                peakVol: targetGun.ratedMaxVoltage,
                currentPrice: targetGun.nowPrice ? targetGun.nowPrice.currentPriceStr : '0.00',
                stationId: this.pileInfo.stationId,
                stationName: this.pileInfo.stationName
              };

              // 更新主枪状态
              this.mainGunState = targetGun.gunState;

              console.log('找到目标枪信息:', this.gunParams);
              console.log(`枪${this.gunParams.gunId}状态: ${this.mainGunState}`);

              // 检查枪状态并给出相应提示
              if (this.mainGunState === 3) {
                // 枪正在充电
                // uni.showModal({
                //   title: '提示',
                //   content: '该充电枪正在充电中，请重新选择其他充电枪',
                //   showCancel: false,
                //   success: (res) => {
                //     if (res.confirm) {
                //       uni.navigateBack();
                //     }
                //   }
                // });
              } else if (this.mainGunState === 5) {
                // 枪离线
                // uni.showModal({
                //   title: '提示',
                //   content: '该充电枪离线，请重新选择其他充电枪',
                //   showCancel: false,
                //   success: (res) => {
                //     if (res.confirm) {
                //       uni.navigateBack();
                //     }
                //   }
                // });
              }
            } else {
              // 未找到指定的枪
              uni.showModal({
                title: '提示',
                content: `未找到枪编号为 ${this.gunParams.gunNo} 的充电枪`,
                showCancel: false,
                success: (res) => {
                  if (res.confirm) {
                    uni.navigateBack();
                  }
                }
              });
              return;
            }
          }
        } else if (pileRes.code === 4) {
          uni.showModal({
            title: '提示',
            content: pileRes.msg || '桩未上线投运，请选择其他充电桩',
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                uni.navigateBack();
              }
            }
          });
        }
        if (memberRes.code === 0) {
          this.memberInfo = memberRes.data;
          uni.setStorageSync('tokenMemberType', this.memberInfo.tokenMemberType);
          uni.setStorageSync('memberInfo', this.memberInfo);
        }
        if (paymentRes.code === 0) {
          this.paymentMethods = paymentRes.data.map(p => {
            if (p.payType === 1) p.balance = this.memberInfo.accountBalance;
            if (p.payType === 6) p.balance = 'N/A';
            p.showTopUp = p.payType === 1;
            return p;
          });
          // 临时增加微信信用分支付方式
          // this.paymentMethods.push({
          //   payType: -2,
          //   accountName: '微信支付分 | 先充后付',
          //   balance: "(550分及以上优享)",
          //   showTopUp: false
          // });
        }

        // 根据账户余额设置默认支付方式
        console.log('this.memberInfo', this.memberInfo)
        if (this.memberInfo && this.memberInfo.accountBalance) {
          const accountBalance = parseInt(this.memberInfo.accountBalance);
          if ((this.memberInfo.deductMode === 'LeaguerAccount' || this.memberInfo.deductMode == null) && this.memberInfo.tokenMemberType === 0 && accountBalance > 0) {
            this.currentPaymentType = 1; // 个人账户
            this.setPresetAmount('all');
          } else if (this.memberInfo.deductMode === 'TeamAccount' && this.memberInfo.tokenMemberType === 2) {
            this.currentPaymentType = 2; // 车队账户
          } else if (this.memberInfo.deductMode === 'LeaguerAccount' && this.memberInfo.tokenMemberType === 2) {
            this.currentPaymentType = 2; // 车队账户
          } else {
            this.currentPaymentType = -1; // 无支付方式
            this.setPresetAmount('5000');
          }
        } else {
          this.currentPaymentType = -1; // 没有账户信息时默认为-1
        }
        if (balanceRes.code === 0) {
          this.minimumStartBalance = balanceRes.data.configurationValue;
        }

      } catch (error) {
        if (error.code === 2) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          return;
        }
        uni.showModal({
          title: '提示',
          content: error.msg || '刷新数据失败',
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
              uni.navigateBack();
            }
          }
        });
      } finally {
        if (this.disposableOrderInfo.pollTimer) {
          setTimeout(() => {
            uni.hideLoading();
          }, 5000);
        } else {
          uni.hideLoading();
        }
      }
    },
    // 处理双枪状态变化
    handleDualGunChange(gunInfo) {
      this.dualGunInfo = gunInfo;
      console.log('双枪状态变化:', gunInfo);
    },
    // 处理充电枪状态更新
    handleGunStatusUpdated(statusData) {
      console.log('充电枪状态更新:', statusData);

      if (this.pileInfo && this.pileInfo.gunDTOList) {
        // 根据枪ID或枪编号找到对应的枪并更新状态
        const gunIndex = this.pileInfo.gunDTOList.findIndex(gun =>
            gun.gunid === statusData.gunId || gun.gunno === statusData.gunNo
        );
        if (gunIndex !== -1) {
          // 使用Vue.set或直接赋值来确保响应式更新
          this.$set(this.pileInfo.gunDTOList, gunIndex, {
            ...this.pileInfo.gunDTOList[gunIndex],
            gunState: statusData.newState
          });

          // 如果更新的是当前选中的枪，同时更新主枪状态
          if (this.pileInfo.gunDTOList[gunIndex].gunno === this.gunParams.gunNo) {
            this.mainGunState = statusData.newState;
          }

          // 更新插枪状态
          this.isGunPlugged = this.pileInfo.gunDTOList.some(gun => gun.gunState === 2);

          console.log(`枪${statusData.gunId || statusData.gunNo}状态已更新为: ${statusData.newState}`);
        }
      }
    },
    // 处理用户身份切换后的重新加载
    handleUserChanged() {
      console.log('用户身份已切换，重新加载页面数据');
      uni.showToast({
        title: '身份切换成功',
        icon: 'success'
      });
      // 重新加载页面数据
      this.refreshData();
    },
    // 处理显示价格详情
    handleShowPriceDetails(priceDetailsData) {
      console.log('收到价格详情数据:', priceDetailsData);
      this.priceDetailsData = priceDetailsData;
      // 使用 uv-popup 的 open 方法打开弹窗
      this.$refs.priceDetailsPopup.open();
    },
    // 处理弹窗状态变化
    handlePopupChange(e) {
      console.log('弹窗状态变化:', e);
      this.showPriceDetails = e.show;
    },
    paymentMethodChange(newType) {
      this.currentPaymentType = newType;
      console.log('newType', newType)
      if (newType == -1) {
        this.setPresetAmount('5000');
      } else if (newType == 1) {
        this.setPresetAmount('all');
      }
    },
    setPresetAmount(value) {
      if (value === 'all') {
        const personalAccount = this.paymentMethods.find(p => p.payType === 1);
        this.presetAmount = personalAccount ? personalAccount.balance : '0';
      } else {
        this.presetAmount = value;
      }
    },
    async startCharging() {
      if (!this.gunParams.pileNum || !this.gunParams.gunId) {
        uni.showToast({title: '枪信息未加载完成无法启动充电', icon: 'none'});
        return;
      }

      //查询占位订单
      // 加载中
      uni.showLoading({title: '状态检查中...'});
      const res1 = await getMyOccupyBillPage({
        billStatus: 11,
        current: 1,
        pageSize: 10
      });
      uni.hideLoading();
      if (res1.code === 0 && res1.data.records.length > 0) {
        uni.showModal({
          title: '提示',
          content: `存在${res1.data.records.length}笔占位订单无法启动充电，请先支付`,
          showCancel: true,
          cancelText: '稍后再说',
          confirmText: '立即支付',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: '/pages/order/occupy'
              });
            }
          }
        });
        return;
      }

      // 检查用户是否有车辆信息
      const hasVehicle = this.memberInfo && this.memberInfo.plateNo && this.memberInfo.plateNo.trim() !== '';
      if (!hasVehicle) {
        // 如果没有车辆信息，显示提示
        const shouldContinue = await new Promise((resolve) => {
          uni.showModal({
            title: '提示',
            content: '如果不绑定车牌号将无法享受停车减免',
            cancelText: '暂不绑定',
            confirmText: '去绑定',
            success: (res) => {
              if (res.confirm) {
                // 点击"去绑定"，跳转到车辆管理页面
                uni.navigateTo({
                  url: '/pages/vehicle/list'
                });
                // 跳转到车辆管理页面后，不继续启动充电流程
                console.log('跳转到车辆管理页面后，不继续启动充电流程')
                resolve(false);
              } else if (res.cancel) {
                // 点击"暂时不绑定"，继续启动充电流程
                console.log('点击"暂时不绑定"，继续启动充电流程')
                resolve(true);
              }
            },
            fail: (err) => {
              // 提示框显示失败，不继续启动充电流程
              console.log('提示框显示失败，继续启动充电流程', err)
              resolve(true);
            }
          });
        });
        if (!shouldContinue) {
          return;
        }
      }

      // 设置启动中状态
      this.isStarting = true;
      uni.showLoading({title: '正在启动充电...'});

      try {
        // 检查充电枪状态
        const res = await queryChargeRealy({
          pileNo: this.gunParams.pileNum,
          gunNo: this.gunParams.gunNo,
          platformNo: this.platformNo,
          hulianinterfaceId: null
        });

        if (res && res.code === 0 && res.data.flag) {
          const memberRes = await queryMemberStatus();
          if (memberRes && memberRes.code === 0 && memberRes.data.chargeStatus === 'Free') {
            // 校验是否正在充电
            if (memberRes.data.ifCharging === true) {
              uni.showToast({title: '当前正在充电无法启动', icon: 'none'});
              return;
            }

            const balanceRes = await getMinimumStartBalance();
            console.log('当前账户余额:', this.memberInfo.accountBalance);
            console.log('当前支付方式:', this.currentPaymentType);

            // 判断支付方式：个人余额充电 vs 充完即退
            if (this.currentPaymentType === 1 || this.currentPaymentType === -2) {
              // 个人余额充电逻辑
              await this.handleBalanceCharging(balanceRes);
            } else if (this.currentPaymentType === -1) {
              // 充完即退逻辑（支持微信和支付宝）
              await this.handleDisposableCharging();
            } else if (this.currentPaymentType === 2) {
              // 车队账户充电逻辑
              await this.handleFleetAccountCharging();
            } else {
              uni.showToast({title: '不支持的支付方式', icon: 'none'});
            }
          } else {
            if (memberRes && memberRes.code === 3) {
              uni.showToast({title: '存在未支付账单无法启动充电', icon: 'none'});
            } else if (memberRes && memberRes.code === 0 && memberRes.data.ifCharging) {
              uni.showToast({title: '当前正在充电无法启动', icon: 'none'});
            } else {
              uni.showToast({title: '会员状态异常无法启动充电', icon: 'none'});
            }
          }
        } else {
          uni.showToast({title: '枪状态异常无法启动充电', icon: 'none'});
        }
      } catch (error) {
        console.error('启动充电过程中发生错误:', error);
        uni.showToast({title: '启动充电失败，请重试', icon: 'none'});
      } finally {
        // 无论成功还是失败，都要重置启动中状态
        this.isStarting = false;
        setTimeout(() => {
          uni.hideLoading();
        }, 1000);
      }
    },

    // 处理个人余额充电
    async handleBalanceCharging(balanceRes) {
      try {
        console.log('this.presetAmount', this.presetAmount)

        // 判断presetAmount是否是NaN
        if (isNaN(this.presetAmount)) {
          uni.showToast({
            title: '预充金额非法',
            icon: 'none'
          });
          return;
        }

        // 校验金额小数位数是否超过2位
        const amountInYuan = this.presetAmount / 100;
        const decimalPart = amountInYuan.toString().split('.')[1];
        console.log('decimalPart', decimalPart)
        if ((decimalPart && decimalPart.length > 2)) {
          uni.showToast({
            title: '充电金额最多支持2位小数，请重新输入',
            icon: 'none'
          });
          return;
        }

        if (balanceRes && balanceRes.code === 0 && (this.presetAmount / 100) < balanceRes.data.configurationValue / 100) {
          uni.showToast({
            title: `最低启动金额为${balanceRes.data.configurationValue / 100}元，当前启动金额为${this.presetAmount / 100}元，无法启动充电`,
            icon: 'none'
          });
          return;
        }

        if (this.memberInfo.accountBalance < this.presetAmount) {
          uni.showToast({
            title: `当前账户余额为${this.memberInfo.accountBalance / 100}元，无法启动充电`,
            icon: 'none'
          });
          return;
        }

        const startChargeRes = await startCharge({
          carNum: this.memberInfo.plateNo,
          chargeMode: 0,
          gunNo: this.gunParams.gunNo,
          hulianinterfaceId: null,
          isParallelCharge: 0,
          payMode: 1,
          pileNo: this.gunParams.pileNum,
          platformNo: this.platformNo,
          preChargeAmount: this.presetAmount / 100 > MAX_PRE_CHARGE_YUAN
            ? MAX_PRE_CHARGE_YUAN
            : (this.presetAmount / 100).toFixed(2), // 单位为元
          qrCode: "undefined",
          valtageType: 0
        });

        if (startChargeRes && startChargeRes.code === 0 && startChargeRes.data.busId) {
          console.log('启动充电参数', startChargeRes.data);
          uni.navigateTo({
            url: `/pages/charge/charging?pileNo=${this.gunParams.pileNum}&gunNo=${this.gunParams.gunNo}&busId=${startChargeRes.data.busId}&gunId=${this.gunParams.gunId}&billId=${startChargeRes.data.orderId}&animationEnabled=true`
          });
        } else if (startChargeRes && startChargeRes.code === 3) {
          uni.showToast({title: "充电桩刚刚结束充电，请稍后再试", icon: 'none'});
        } else {
          uni.showToast({title: startChargeRes.msg || '启动充电失败', icon: 'none'});
        }
      } catch (error) {
        console.error('个人余额充电失败:', error);
        uni.showToast({title: '启动充电失败，请重试', icon: 'none'});
      } finally {
        // 无论成功还是失败，都要重置启动中状态
        this.isStarting = false;
        setTimeout(() => {
          uni.hideLoading();
        }, 1000);
      }
    },
    // 车队账户充电
    async handleFleetAccountCharging() {
      try {
        // 车队账户充电逻辑
        const startChargeRes = await startCharge({
          carNum: this.memberInfo.plateNo,
          chargeMode: 0,
          gunNo: this.gunParams.gunNo,
          hulianinterfaceId: null,
          isParallelCharge: 0,
          payMode: 2,
          pileNo: this.gunParams.pileNum,
          platformNo: this.platformNo,
          qrCode: "undefined",
          valtageType: 0
        });

        if (startChargeRes && startChargeRes.code === 0 && startChargeRes.data.busId) {
          uni.navigateTo({
            url: `/pages/charge/charging?pileNo=${this.gunParams.pileNum}&gunNo=${this.gunParams.gunNo}&busId=${startChargeRes.data.busId}&gunId=${this.gunParams.gunId}&billId=${startChargeRes.data.orderId}&animationEnabled=true`
          });
        } else if (startChargeRes && startChargeRes.code === 5) {
          uni.showToast({title: startChargeRes.msg || '启动充电失败请联系客服', icon: 'none'});
        } else if (startChargeRes && startChargeRes.code === 3) {
          uni.showToast({title: "充电桩刚刚结束充电，请稍后再试", icon: 'none'});
        } else {
          uni.showToast({title: startChargeRes.msg || '启动充电失败', icon: 'none'});
        }
      } catch (error) {
        console.error('车队账户充电失败:', error);
        uni.showToast({title: '启动充电失败，请重试', icon: 'none'});
      } finally {
        // 无论成功还是失败，都要重置启动中状态
        this.isStarting = false;
        setTimeout(() => {
          uni.hideLoading();
        }, 1000);
      }
    },
    // 处理充完即退充电（支持微信和支付宝）
    async handleDisposableCharging() {
      try {
        // 判断presetAmount是否是NaN
        if (isNaN(this.presetAmount)) {
          uni.showToast({
            title: '预充金额非法',
            icon: 'none'
          });
          this.disposableOrderInfo.isProcessing = false;
          return;
        }
        // 防止重复提交
        if (this.disposableOrderInfo.isProcessing) {
          uni.showToast({title: '正在处理中，请稍候...', icon: 'none'});
          return;
        }

        this.disposableOrderInfo.isProcessing = true;
        uni.showLoading({title: '正在创建订单...'});

        // 第1步：充电前校验（微信和支付宝共用）
        console.log('开始充完即退流程 - 充电前校验');
        const createOrderRes = await disposableStartCharge({
          pileNo: this.gunParams.pileNum,
          gunNo: this.gunParams.gunNo,
          preChargeAmount: Math.min(parseFloat(this.presetAmount) / 100, MAX_PRE_CHARGE_YUAN).toFixed(2), // 单位为元
          carNum: null,
          chargeMode: 0,
          valtageType: 0,
          payMode: 1
        });

        if (createOrderRes && createOrderRes.code === 3) {
          uni.showToast({title: "充电桩刚刚结束充电，请稍后再试", icon: 'none'});
          return;
        }
        if (createOrderRes.code !== 0) {
          throw new Error(createOrderRes.msg || '充电前校验失败');
        }

        console.log('充电前校验成功', createOrderRes.data);

        // 第2步：根据平台调用不同的统一下单接口
        uni.showLoading({title: '正在生成支付参数...'});

        // #ifdef MP-WEIXIN
        // 微信统一下单
        let unifiedOrderRes = await disposableUnifiedOrders({
          totalFee: Math.min(parseFloat(this.presetAmount), MAX_PRE_CHARGE_YUAN * 100),
          openId: uni.getStorageSync('openId'),
          gunId: this.gunParams.gunId,
          tradeType: 'JSAPI'
        });

        if (unifiedOrderRes.code !== 0) {
          throw new Error(unifiedOrderRes.msg || '生成支付参数失败');
        }

        uni.hideLoading();
        console.log('支付参数生成成功，准备调起微信支付', unifiedOrderRes.data);
        this.disposableOrderInfo.orderNo = unifiedOrderRes.data.orderNo;

        // 第3步：调起微信支付
        await this.invokeWechatPay(unifiedOrderRes.data);
        // #endif

        // #ifdef MP-ALIPAY
        // 支付宝统一下单
        let unifiedOrderRes = await alipayDisposableUnifiedOrders({
          totalFee: Math.min(parseFloat(this.presetAmount), MAX_PRE_CHARGE_YUAN * 100),
          openId: uni.getStorageSync('openId'),
        });

        if (unifiedOrderRes.code !== 0) {
          throw new Error(unifiedOrderRes.msg || '生成支付参数失败');
        }

        uni.hideLoading();
        console.log('支付参数生成成功，准备调起支付宝支付', unifiedOrderRes.data);
        this.disposableOrderInfo.orderNo = unifiedOrderRes.data.outTradeNo;

        // 第3步：调起支付宝支付
        await this.invokeAlipayment(unifiedOrderRes.data.tradeNo);
        // #endif

      } catch (error) {
        console.error('充完即退流程失败:', error);
        setTimeout(() => {
          uni.hideLoading();
        }, 1000);
        uni.showToast({title: error.message || '启动充电失败', icon: 'none'});

      } finally {
        this.disposableOrderInfo.isProcessing = false;
        // 无论成功还是失败，都要重置启动中状态
        this.isStarting = false;
        // setTimeout(() => {
        //   uni.hideLoading();
        // }, 3000);
      }
    },

    // 调起微信支付
    async invokeWechatPay(payData) {
      return new Promise((resolve, reject) => {
        // #ifdef MP-WEIXIN
        console.log('调起微信支付', payData);
        uni.requestPayment({
          provider: 'wxpay',
          timeStamp: payData.timeStamp + '',
          nonceStr: payData.nonceStr,
          package: payData.package || payData.packageStr,
          signType: payData.signType || 'MD5',
          paySign: payData.sign || payData.paySign,
          success: (res) => {
            console.log('微信支付调用成功：', res);
            this.startPaymentResultPolling();
            uni.showToast({
              title: '支付成功，请勿离开页面，等待充电启动',
              icon: 'none'
            });
            resolve(res);
          },
          fail: (err) => {
            console.error('微信支付调用失败：', err);
            uni.showToast({
              title: '支付取消或失败',
              icon: 'none'
            });
            reject(err);
          }
        });
        // #endif
      });
    },

    // 调起支付宝支付
    async invokeAlipayment(orderStr) {
      return new Promise((resolve, reject) => {
        // 根据平台选择不同的支付方式
        // #ifdef MP-ALIPAY
        // 支付宝小程序使用 my.tradePay
        my.tradePay({
          tradeNO: orderStr, // 后端返回的支付参数字符串
          success: (res) => {
            console.log('支付宝支付调用成功：', res);
            // 注意：这里的success只是表示调起支付成功，不是支付成功
            // 真正的支付结果需要通过轮询查询接口获取
            if (res.resultCode === '6001') {
              uni.showToast({
                title: '支付已取消',
                icon: 'none'
              });
              reject(res);
            } else if (res.resultCode === '9000') {
              this.startPaymentResultPolling();
              uni.showToast({
                title: '支付成功，请勿离开页面，等待充电启动',
                icon: 'success'
              });
              resolve(res);
            }
          },
          fail: (err) => {
            console.error('支付宝支付调用失败：', err);
            uni.showToast({
              title: '支付调用失败',
              icon: 'none'
            });
            reject(err);
          }
        });
        // #endif
      });
    },

    // 开始轮询支付结果
    startPaymentResultPolling() {
      console.log('开始轮询支付结果...');
      this.disposableOrderInfo.pollCount = 0;

      const pollInterval = 3000; // 3秒轮询一次
      const maxPollCount = 20; // 最多轮询10次（30秒）

      this.disposableOrderInfo.pollTimer = setInterval(async () => {
        this.disposableOrderInfo.pollCount++;
        console.log(`第${this.disposableOrderInfo.pollCount}次查询支付结果`);

        try {
          console.log('this.disposableOrderInfo.orderNo', this.disposableOrderInfo.orderNo);

          // #ifdef MP-WEIXIN
          // 微信支付结果查询
          let queryRes = await disposableOrderResultQuery({
            orderNo: this.disposableOrderInfo.orderNo
          });
          // #endif

          // #ifdef MP-ALIPAY
          // 支付宝支付结果查询
          let queryRes = await alipayDisposableOrderResultQuery({
            orderNo: this.disposableOrderInfo.orderNo
          });
          // #endif


          if (queryRes.code === 204) {
            this.clearPaymentPolling();
            uni.showToast({title: '支付确认超时，金额已退回', icon: 'none'});
            console.log('支付确认超时，金额已退回', queryRes);
          }
          if (queryRes.code === 0) {
            // 支付成功，清除轮询并启动充电
            this.clearPaymentPolling();
            console.log('支付成功，准备启动充电');
            await this.startChargingAfterPayment();

          } else if (this.disposableOrderInfo.pollCount >= maxPollCount) {
            // 轮询超时，取消订单
            this.clearPaymentPolling();
            uni.showToast({title: '支付结果查询超时，订单已取消', icon: 'none'});
            this.cancelDisposableOrder('支付结果查询超时');
          }
          // 其他情况继续轮询

        } catch (error) {
          if (error.code === 204) {
            uni.showToast({title: '支付确认超时，金额已退回', icon: 'none'});
          }
          if (this.disposableOrderInfo.pollCount >= maxPollCount) {
            this.clearPaymentPolling();
            this.cancelDisposableOrder('查询支付结果异常');
          }
        }
      }, pollInterval);
    },

    // 充完即退支付成功后启动充电
    async startChargingAfterPayment() {
      try {
        uni.showLoading({title: '正在启动充电...'});

        const startChargeRes = await disposableStartCharge({
          pileNo: this.gunParams.pileNum,
          gunNo: this.gunParams.gunNo,
          preChargeAmount: Math.min(parseFloat(this.presetAmount) / 100, MAX_PRE_CHARGE_YUAN), // 单位为元
          carNum: this.memberInfo.plateNo,
          chargeMode: 0,
          valtageType: 0,
          payMode: 1,
          qrCode: "undefined",
          disposablePayMode: true,
          orderNumber: this.disposableOrderInfo.orderNo,
          isParallelCharge: 0
        })

        if (startChargeRes && startChargeRes.code === 0 && startChargeRes.data.busId) {
          // 成功启动充电，跳转到充电页面
          uni.showToast({title: '充电启动成功', icon: 'success'});
          uni.navigateTo({
            url: `/pages/charge/charging?pileNo=${this.gunParams.pileNum}&gunNo=${this.gunParams.gunNo}&busId=${startChargeRes.data.busId}&gunId=${this.gunParams.gunId}&billId=${startChargeRes.data.orderId}&animationEnabled=true`
          });

          // 清理订单信息
          this.disposableOrderInfo.orderNo = '';
        } else {
          throw new Error(startChargeRes.msg || '启动充电失败');
        }

      } catch (error) {
        console.error('启动充电失败:', error);
        setTimeout(() => {
          uni.hideLoading();
        }, 1000);
        uni.showToast({title: error.message || '启动充电失败', icon: 'none'});

        // 启动失败，退款处理由后端自动处理
        uni.showModal({
          title: '提示',
          content: '充电启动失败，支付款项将在1-3个工作日内自动退回',
          showCancel: false
        });
      } finally {
        setTimeout(() => {
          uni.hideLoading();
        }, 1000);
      }
    },

    // 取消订单（支持微信和支付宝）
    async cancelDisposableOrder(reason = '用户取消') {
      if (!this.disposableOrderInfo.orderNo) return;

      try {
        console.log(`正在取消订单: ${this.disposableOrderInfo.orderNo}, 原因: ${reason}`);

        // #ifdef MP-WEIXIN
        // 微信取消订单
        let cancelRes = await disposableCancelRecharge({
          orderNo: this.disposableOrderInfo.orderNo,
          cancelReason: reason
        });
        // #endif

        // #ifdef MP-ALIPAY
        // 支付宝取消订单
        let cancelRes = await alipayDisposableCancelRecharge({
          orderNo: this.disposableOrderInfo.orderNo,
          cancelReason: reason
        });
        // #endif

        if (cancelRes.code === 0) {
          console.log('订单取消成功');
          uni.showToast({title: '订单已取消，款项将原路退回', icon: 'none'});
        } else {
          console.error('订单取消失败:', cancelRes.msg);
        }
      } catch (error) {
        console.error('取消订单请求失败:', error);
      } finally {
        // 清理订单信息
        this.disposableOrderInfo.orderNo = '';
      }
    },

    // 清理支付结果轮询
    clearPaymentPolling() {
      if (this.disposableOrderInfo.pollTimer) {
        clearInterval(this.disposableOrderInfo.pollTimer);
        this.disposableOrderInfo.pollTimer = null;
        console.log('支付结果轮询已清理');
      }
    },
    contactSupport() {
      uni.makePhoneCall({phoneNumber: '400-011-0328'});
    },
    // 清理所有定时器
    clearAllTimers() {
      console.log('正在清理页面中的所有定时器...');

      // 清理ChargeIdleView中的定时器
      if (this.$refs.chargeIdleView && this.$refs.chargeIdleView.clearTimers) {
        this.$refs.chargeIdleView.clearTimers();
        console.log('ChargeIdleView定时器已清理');
      }

      // 清理支付宝支付结果轮询定时器
      this.clearPaymentPolling();

      // 如果正在处理支付宝订单，取消订单
      // if (this.disposableOrderInfo.isProcessing && this.disposableOrderInfo.orderNo) {
      //   this.cancelDisposableOrder('页面离开，取消订单');
      // }

      console.log('所有定时器清理完成');
    },
    // 联系客服
    contactCustomerService() {
      contactCustomerServiceFn();
    }
  },
  mounted() {
    console.log('gunStartingCharge mounted', this.memberInfo);
  }
};
</script>

<style scoped>
.page-container {
  background-color: #f5f5f5;
  padding-bottom: 180rpx; /* 为底部栏预留安全区域 */
  min-height: 80vh;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 160rpx;
  background-color: #fff;
  border-top: 1rpx solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  gap: 15rpx;
  padding-left: 30rpx;
  padding-right: 30rpx;
  padding-top: 10rpx;
  padding-bottom: 10rpx;
  z-index: 1000;
}

.refresh-button {
  background-color: #f0f0f0;
}

.start-charge-button {
  flex-grow: 1;
  margin-left: 20rpx;
  background-color: #007aff;
  color: #fff;
}

.start-charge-button.disabled {
  background-color: #a0cfff;
}

.fab-button {
  position: fixed;
  right: 30rpx;
  bottom: 200rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #007aff;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.2);
}

/* 价格详情弹窗样式 */
.price-details-content {
  padding: 30rpx;
  min-height: 400rpx;
}

.popup-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #e0e0e0;
}

.popup-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.price-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
  font-weight: bold;
  color: #666;
  font-size: 28rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.price-list {
  max-height: 60vh;
  overflow-y: auto;
}

.server-icon-wrapper {
  width: 55rpx;
  height: 55rpx;
  border-radius: 50%;
  background-color: #FEFFFF;
  opacity: 0.8;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
