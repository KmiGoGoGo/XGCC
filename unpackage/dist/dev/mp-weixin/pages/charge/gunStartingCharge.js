"use strict";
const common_vendor = require("../../common/vendor.js");
const api_pile = require("../../api/pile.js");
const api_member = require("../../api/member.js");
const api_common = require("../../api/common.js");
const globalData = require("../../globalData.js");
const api_charge = require("../../api/charge.js");
const api_pay = require("../../api/pay.js");
const ChargeIdleView = () => "../../components/charge/ChargeIdleView.js";
const ChargeBusyView = () => "../../components/charge/ChargeBusyView.js";
const StagePriceInfo = () => "../../components/station/StagePriceInfo.js";
const _sfc_main = {
  components: {
    ChargeIdleView,
    ChargeBusyView,
    StagePriceInfo
  },
  data() {
    return {
      pileNo: null,
      pileInfo: null,
      memberInfo: null,
      paymentMethods: [],
      minimumStartBalance: 0,
      isGunPlugged: false,
      // 假设默认未插枪
      presetAmount: "",
      currentPaymentType: -1,
      showPriceDetails: false,
      priceDetailsData: [],
      // 存储价格详情数据
      mainGunState: null,
      // 当前选中的枪信息（通过接口获取）
      gunParams: {
        gunNo: null,
        gunId: null,
        gunName: "",
        gunType: "",
        pileName: "",
        pileNum: "",
        maxPower: "",
        current: "",
        valleyVol: "",
        peakVol: "",
        currentPrice: "",
        stationId: "",
        stationName: ""
      },
      // 双枪状态
      dualGunInfo: {
        mainGun: null,
        secondaryGun: null
      },
      startChargeButtonStyle: {
        width: "90%",
        backgroundColor: "#007aff",
        color: "#fff"
      },
      // 支付宝充完即退相关状态
      alipayOrderInfo: {
        orderNo: "",
        isProcessing: false,
        pollTimer: null,
        pollCount: 0
      },
      // 启动中状态
      isStarting: false
    };
  },
  computed: {
    chargeButtonText() {
      if (this.isStarting) {
        return "启动中...";
      }
      if (this.alipayOrderInfo.pollTimer) {
        return "支付确认中...";
      }
      if (this.alipayOrderInfo.isProcessing) {
        return "处理中...";
      }
      if (this.dualGunInfo.mainGun && this.dualGunInfo.secondaryGun) {
        return "双枪并充";
      }
      if ((this.presetAmount == 0 || this.presetAmount == "0") && this.currentPaymentType == 1) {
        return "余额不足";
      }
      if (this.currentPaymentType == -1 && this.presetAmount < 300) {
        return "预充金额小于三元";
      }
      return "开启充电";
    },
    // 控制充电按钮的禁用状态
    isChargeButtonDisabled() {
      if (this.isStarting) {
        return true;
      }
      if (!this.isGunPlugged) {
        return true;
      }
      if (this.alipayOrderInfo.isProcessing) {
        return true;
      }
      if (this.alipayOrderInfo.pollTimer) {
        return true;
      }
      if ((this.presetAmount == 0 || this.presetAmount == "0") && this.currentPaymentType == 1) {
        return true;
      }
      if (this.currentPaymentType == -1 && this.presetAmount < 300) {
        return true;
      }
      return false;
    }
  },
  onLoad(options) {
    common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:214", "gunStartingCharge onLoad", options);
    if (!options.pileNum || !options.gunNo) {
      common_vendor.index.showToast({
        title: "参数缺失：需要桩编号和枪编号",
        icon: "none"
      });
      return;
    }
    this.pileNo = options.pileNum;
    this.gunParams.gunNo = options.gunNo;
    common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:228", "接收到的参数:", { pileNo: this.pileNum, gunNo: options.gunNo });
    this.refreshData();
  },
  onUnload() {
    this.clearAllTimers();
  },
  onHide() {
    this.clearAllTimers();
  },
  methods: {
    handlePresetAmountChange(value) {
      common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:243", "handlePresetAmountChange", value);
      this.presetAmount = value;
    },
    async refreshData() {
      common_vendor.index.showLoading({ title: "正在刷新..." });
      try {
        const [pileRes, memberRes, paymentRes, balanceRes] = await Promise.all([
          api_pile.getPileDTOByNo({ pileNo: this.pileNo, sellerId: globalData.globalData.sellerId }),
          api_member.getMemberInfo(),
          api_common.queryPayAccountSetting({ disposablePayMode: true, pileNo: this.pileNo }),
          api_common.getMinimumStartBalance()
        ]);
        if (pileRes.code === 0) {
          common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:257", "获取桩详情数据成功:", pileRes.data);
          this.pileInfo = pileRes.data;
          if (this.pileInfo && this.pileInfo.gunDTOList) {
            common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:262", "枪列表数据:", this.pileInfo.gunDTOList);
            common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:263", "查找枪编号:", this.gunParams.gunNo);
            const targetGun = this.pileInfo.gunDTOList.find((gun) => gun.gunno === this.gunParams.gunNo);
            if (targetGun) {
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
                currentPrice: targetGun.nowPrice ? targetGun.nowPrice.currentPriceStr : "0.00",
                stationId: this.pileInfo.stationId,
                stationName: this.pileInfo.stationName
              };
              this.mainGunState = targetGun.gunState;
              common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:289", "找到目标枪信息:", this.gunParams);
              common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:290", `枪${this.gunParams.gunId}状态: ${this.mainGunState}`);
              if (this.mainGunState === 3) {
                common_vendor.index.showModal({
                  title: "提示",
                  content: "该充电枪正在充电中，请重新选择其他充电枪",
                  showCancel: false,
                  success: (res) => {
                    if (res.confirm) {
                      common_vendor.index.navigateBack();
                    }
                  }
                });
              } else if (this.mainGunState === 5) {
                common_vendor.index.showModal({
                  title: "提示",
                  content: "该充电枪离线，请重新选择其他充电枪",
                  showCancel: false,
                  success: (res) => {
                    if (res.confirm) {
                      common_vendor.index.navigateBack();
                    }
                  }
                });
              }
            } else {
              common_vendor.index.showToast({
                title: `未找到枪编号为 ${this.gunParams.gunNo} 的充电枪`,
                icon: "none"
              });
              return;
            }
          }
        }
        if (memberRes.code === 0) {
          this.memberInfo = memberRes.data;
          common_vendor.index.setStorageSync("tokenMemberType", this.memberInfo.tokenMemberType);
          common_vendor.index.setStorageSync("memberInfo", this.memberInfo);
        }
        if (paymentRes.code === 0) {
          this.paymentMethods = paymentRes.data.map((p) => {
            if (p.payType === 1)
              p.balance = this.memberInfo.accountBalance;
            if (p.payType === 6)
              p.balance = "N/A";
            p.showTopUp = p.payType === 1;
            return p;
          });
        }
        common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:343", "this.memberInfo", this.memberInfo);
        if (this.memberInfo && this.memberInfo.accountBalance) {
          const accountBalance = parseInt(this.memberInfo.accountBalance);
          if (this.memberInfo.deductMode === "LeaguerAccount" && this.memberInfo.tokenMemberType === 0 && accountBalance > 0) {
            this.currentPaymentType = 1;
            this.setPresetAmount("all");
          } else if (this.memberInfo.deductMode === "TeamAccount" && this.memberInfo.tokenMemberType === 2) {
            this.currentPaymentType = 2;
          } else if (this.memberInfo.deductMode === "LeaguerAccount" && this.memberInfo.tokenMemberType === 2) {
            this.currentPaymentType = 2;
          } else {
            this.currentPaymentType = -1;
            this.setPresetAmount("5000");
          }
        } else {
          this.currentPaymentType = -1;
        }
        if (balanceRes.code === 0) {
          this.minimumStartBalance = balanceRes.data.configurationValue;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/charge/gunStartingCharge.vue:365", "刷新数据失败", error);
        common_vendor.index.showToast({ title: "刷新失败", icon: "none" });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    // 处理双枪状态变化
    handleDualGunChange(gunInfo) {
      this.dualGunInfo = gunInfo;
      common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:374", "双枪状态变化:", gunInfo);
    },
    // 处理充电枪状态更新
    handleGunStatusUpdated(statusData) {
      common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:378", "充电枪状态更新:", statusData);
      if (this.pileInfo && this.pileInfo.gunDTOList) {
        const gunIndex = this.pileInfo.gunDTOList.findIndex(
          (gun) => gun.gunid === statusData.gunId || gun.gunno === statusData.gunNo
        );
        if (gunIndex !== -1) {
          this.$set(this.pileInfo.gunDTOList, gunIndex, {
            ...this.pileInfo.gunDTOList[gunIndex],
            gunState: statusData.newState
          });
          if (this.pileInfo.gunDTOList[gunIndex].gunno === this.gunParams.gunNo) {
            this.mainGunState = statusData.newState;
          }
          this.isGunPlugged = this.pileInfo.gunDTOList.some((gun) => gun.gunState === 2);
          common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:400", `枪${statusData.gunId || statusData.gunNo}状态已更新为: ${statusData.newState}`);
        }
      }
    },
    // 处理用户身份切换后的重新加载
    handleUserChanged() {
      common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:406", "用户身份已切换，重新加载页面数据");
      common_vendor.index.showToast({
        title: "身份切换成功",
        icon: "success"
      });
      this.refreshData();
    },
    // 处理显示价格详情
    handleShowPriceDetails(priceDetailsData) {
      common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:416", "收到价格详情数据:", priceDetailsData);
      this.priceDetailsData = priceDetailsData;
      this.$refs.priceDetailsPopup.open();
    },
    // 处理弹窗状态变化
    handlePopupChange(e) {
      common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:423", "弹窗状态变化:", e);
      this.showPriceDetails = e.show;
    },
    paymentMethodChange(newType) {
      this.currentPaymentType = newType;
      common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:428", "newType", newType);
      if (newType == -1) {
        this.setPresetAmount("5000");
      } else if (newType == 1) {
        this.setPresetAmount("all");
      }
    },
    setPresetAmount(value) {
      if (value === "all") {
        const personalAccount = this.paymentMethods.find((p) => p.payType === 1);
        this.presetAmount = personalAccount ? personalAccount.balance : "0";
      } else {
        this.presetAmount = value;
      }
    },
    async startCharging() {
      if (!this.gunParams.pileNum || !this.gunParams.gunId) {
        common_vendor.index.showToast({ title: "枪信息未加载完成无法启动充电", icon: "none" });
        return;
      }
      this.isStarting = true;
      common_vendor.index.showLoading({ title: "正在启动充电..." });
      try {
        const res = await api_charge.queryChargeRealy({
          pileNo: this.gunParams.pileNum,
          gunNo: this.gunParams.gunNo,
          platformNo: null,
          hulianinterfaceId: null
        });
        if (res && res.code === 0 && res.data.flag) {
          const memberRes = await api_member.queryMemberStatus();
          if (memberRes && memberRes.code === 0 && memberRes.data.chargeStatus === "Free") {
            if (memberRes.data.ifCharging === true) {
              common_vendor.index.showToast({ title: "当前正在充电无法启动", icon: "none" });
              return;
            }
            const balanceRes = await api_common.getMinimumStartBalance();
            common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:472", "当前账户余额:", this.memberInfo.accountBalance);
            common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:473", "当前支付方式:", this.currentPaymentType);
            if (this.currentPaymentType === 1) {
              await this.handleBalanceCharging(balanceRes);
            } else if (this.currentPaymentType === -1) {
              await this.handleAlipayDisposableCharging();
            } else if (this.currentPaymentType === 2) {
              await this.handleFleetAccountCharging();
            } else {
              common_vendor.index.showToast({ title: "不支持的支付方式", icon: "none" });
            }
          } else {
            if (memberRes && memberRes.code === 3) {
              common_vendor.index.showToast({ title: "存在未支付账单无法启动充电", icon: "none" });
            } else {
              common_vendor.index.showToast({ title: "会员状态异常无法启动充电", icon: "none" });
            }
          }
        } else {
          common_vendor.index.showToast({ title: "枪状态异常无法启动充电", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/charge/gunStartingCharge.vue:499", "启动充电过程中发生错误:", error);
        common_vendor.index.showToast({ title: "启动充电失败，请重试", icon: "none" });
      } finally {
        this.isStarting = false;
        setTimeout(() => {
          common_vendor.index.hideLoading();
        }, 1e3);
      }
    },
    // 处理个人余额充电
    async handleBalanceCharging(balanceRes) {
      try {
        common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:513", "this.presetAmount", this.presetAmount);
        const amountInYuan = this.presetAmount / 100;
        const decimalPart = amountInYuan.toString().split(".")[1];
        common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:518", "decimalPart", decimalPart);
        if (decimalPart && decimalPart.length > 2) {
          common_vendor.index.showToast({
            title: "充电金额最多支持2位小数，请重新输入",
            icon: "none"
          });
          return;
        }
        if (balanceRes && balanceRes.code === 0 && this.presetAmount / 100 < balanceRes.data.configurationValue) {
          common_vendor.index.showToast({
            title: `最低启动金额为${balanceRes.data.configurationValue}元，当前启动金额为${this.presetAmount / 100}元，无法启动充电`,
            icon: "none"
          });
          return;
        }
        if (this.memberInfo.accountBalance < this.presetAmount) {
          common_vendor.index.showToast({
            title: `当前账户余额为${this.memberInfo.accountBalance / 100}元，无法启动充电`,
            icon: "none"
          });
          return;
        }
        const startChargeRes = await api_charge.startCharge({
          carNum: this.memberInfo.plateNo,
          chargeMode: 0,
          gunNo: this.gunParams.gunNo,
          hulianinterfaceId: null,
          isParallelCharge: 0,
          payMode: parseInt(this.currentPaymentType),
          pileNo: this.gunParams.pileNum,
          platformNo: null,
          preChargeAmount: this.presetAmount / 100 > 200 ? 200 : (this.presetAmount / 100).toFixed(2),
          // 单位为分
          qrCode: "undefined",
          valtageType: 0
        });
        if (startChargeRes && startChargeRes.code === 0 && startChargeRes.data.busId) {
          common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:558", "启动充电参数", startChargeRes.data);
          common_vendor.index.navigateTo({
            url: `/pages/charge/charging?pileNo=${this.gunParams.pileNum}&gunNo=${this.gunParams.gunNo}&busId=${startChargeRes.data.busId}&gunId=${this.gunParams.gunId}&billId=${startChargeRes.data.orderId}&animationEnabled=true`
          });
        } else {
          common_vendor.index.showToast({ title: startChargeRes.msg || "启动充电失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/charge/gunStartingCharge.vue:566", "个人余额充电失败:", error);
        common_vendor.index.showToast({ title: "启动充电失败，请重试", icon: "none" });
      } finally {
        this.isStarting = false;
        setTimeout(() => {
          common_vendor.index.hideLoading();
        }, 1e3);
      }
    },
    // 车队账户充电
    async handleFleetAccountCharging() {
      try {
        const startChargeRes = await api_charge.startCharge({
          carNum: this.memberInfo.plateNo,
          chargeMode: 0,
          gunNo: this.gunParams.gunNo,
          hulianinterfaceId: null,
          isParallelCharge: 0,
          payMode: 2,
          pileNo: this.gunParams.pileNum,
          platformNo: null,
          qrCode: "undefined",
          valtageType: 0
        });
        if (startChargeRes && startChargeRes.code === 0 && startChargeRes.data.busId) {
          common_vendor.index.navigateTo({
            url: `/pages/charge/charging?pileNo=${this.gunParams.pileNum}&gunNo=${this.gunParams.gunNo}&busId=${startChargeRes.data.busId}&gunId=${this.gunParams.gunId}&billId=${startChargeRes.data.orderId}&animationEnabled=true`
          });
        } else if (startChargeRes && startChargeRes.code === 5) {
          common_vendor.index.showToast({ title: startChargeRes.msg || "启动充电失败请联系客服", icon: "none" });
        } else {
          common_vendor.index.showToast({ title: startChargeRes.msg || "启动充电失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/charge/gunStartingCharge.vue:604", "车队账户充电失败:", error);
        common_vendor.index.showToast({ title: "启动充电失败，请重试", icon: "none" });
      } finally {
        this.isStarting = false;
        setTimeout(() => {
          common_vendor.index.hideLoading();
        }, 1e3);
      }
    },
    // 处理支付宝充完即退充电
    async handleAlipayDisposableCharging() {
      try {
        if (this.alipayOrderInfo.isProcessing) {
          common_vendor.index.showToast({ title: "正在处理中，请稍候...", icon: "none" });
          return;
        }
        this.alipayOrderInfo.isProcessing = true;
        common_vendor.index.showLoading({ title: "正在创建订单..." });
        common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:627", "开始支付宝充完即退流程 - 充电前校验");
        const createOrderRes = await api_pay.disposableStartCharge({
          pileNo: this.gunParams.pileNum,
          gunNo: this.gunParams.gunNo,
          preChargeAmount: (parseFloat(this.presetAmount) / 100).toFixed(2),
          // 单位为元
          carNum: null,
          chargeMode: 0,
          valtageType: 0,
          payMode: 1
        });
        if (createOrderRes.code !== 0) {
          throw new Error(createOrderRes.msg || "充电前校验失败");
        }
        common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:642", "充电前校验成功", createOrderRes.data);
        common_vendor.index.showLoading({ title: "正在生成支付参数..." });
        const unifiedOrderRes = await api_pay.alipayDisposableUnifiedOrders({
          totalFee: parseFloat(this.presetAmount),
          openId: common_vendor.index.getStorageSync("openId")
        });
        if (unifiedOrderRes.code !== 0) {
          throw new Error(unifiedOrderRes.msg || "生成支付参数失败");
        }
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:656", "支付参数生成成功，准备调起支付宝支付", unifiedOrderRes.data);
        this.alipayOrderInfo.orderNo = unifiedOrderRes.data.outTradeNo;
        await this.invokeAlipayment(unifiedOrderRes.data.tradeNo);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/charge/gunStartingCharge.vue:663", "支付宝充完即退流程失败:", error);
        setTimeout(() => {
          common_vendor.index.hideLoading();
        }, 1e3);
        common_vendor.index.showToast({ title: error.message || "启动充电失败", icon: "none" });
        if (this.alipayOrderInfo.orderNo) {
          this.cancelAlipayOrder("启动流程异常");
        }
      } finally {
        this.alipayOrderInfo.isProcessing = false;
        this.isStarting = false;
        setTimeout(() => {
          common_vendor.index.hideLoading();
        }, 1e3);
      }
    },
    // 调起支付宝支付
    async invokeAlipayment(orderStr) {
      return new Promise((resolve, reject) => {
      });
    },
    // 开始轮询支付结果
    startPaymentResultPolling() {
      common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:725", "开始轮询支付结果...");
      this.alipayOrderInfo.pollCount = 0;
      const pollInterval = 3e3;
      const maxPollCount = 20;
      this.alipayOrderInfo.pollTimer = setInterval(async () => {
        this.alipayOrderInfo.pollCount++;
        common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:733", `第${this.alipayOrderInfo.pollCount}次查询支付结果`);
        try {
          common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:736", "this.alipayOrderInfo.orderNo", this.alipayOrderInfo.orderNo);
          const queryRes = await api_pay.alipayDisposableOrderResultQuery({
            orderNo: this.alipayOrderInfo.orderNo
          });
          if (queryRes.code === 0) {
            this.clearPaymentPolling();
            common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:744", "支付成功，准备启动充电");
            await this.startChargingAfterPayment();
          } else if (this.alipayOrderInfo.pollCount >= maxPollCount) {
            this.clearPaymentPolling();
            common_vendor.index.showToast({ title: "支付结果查询超时，订单已取消", icon: "none" });
            this.cancelAlipayOrder("支付结果查询超时");
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/charge/gunStartingCharge.vue:756", "查询支付结果失败:", error);
          if (this.alipayOrderInfo.pollCount >= maxPollCount) {
            this.clearPaymentPolling();
            this.cancelAlipayOrder("查询支付结果异常");
          }
        }
      }, pollInterval);
    },
    // 充完即退支付成功后启动充电
    async startChargingAfterPayment() {
      try {
        common_vendor.index.showLoading({ title: "正在启动充电..." });
        common_vendor.index.hideLoading();
        const startChargeRes = await api_pay.disposableStartCharge({
          pileNo: this.gunParams.pileNum,
          gunNo: this.gunParams.gunNo,
          preChargeAmount: parseFloat(this.presetAmount) / 100,
          // 单位为元
          carNum: this.memberInfo.plateNo,
          chargeMode: 0,
          valtageType: 0,
          payMode: 1,
          qrCode: "undefined",
          disposablePayMode: true,
          orderNumber: this.alipayOrderInfo.orderNo,
          isParallelCharge: 0
        });
        if (startChargeRes && startChargeRes.code === 0 && startChargeRes.data.busId) {
          common_vendor.index.showToast({ title: "充电启动成功", icon: "success" });
          common_vendor.index.navigateTo({
            url: `/pages/charge/charging?pileNo=${this.gunParams.pileNum}&gunNo=${this.gunParams.gunNo}&busId=${startChargeRes.data.busId}&gunId=${this.gunParams.gunId}&billId=${startChargeRes.data.orderId}&animationEnabled=true`
          });
          this.alipayOrderInfo.orderNo = "";
        } else {
          throw new Error(startChargeRes.msg || "启动充电失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/charge/gunStartingCharge.vue:801", "启动充电失败:", error);
        setTimeout(() => {
          common_vendor.index.hideLoading();
        }, 1e3);
        common_vendor.index.showToast({ title: error.message || "启动充电失败", icon: "none" });
        common_vendor.index.showModal({
          title: "提示",
          content: "充电启动失败，支付款项将在1-3个工作日内自动退回",
          showCancel: false
        });
      }
    },
    // 取消支付宝订单
    async cancelAlipayOrder(reason = "用户取消") {
      if (!this.alipayOrderInfo.orderNo)
        return;
      try {
        common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:821", `正在取消订单: ${this.alipayOrderInfo.orderNo}, 原因: ${reason}`);
        const cancelRes = await api_pay.alipayDisposableCancelRecharge({
          orderNo: this.alipayOrderInfo.orderNo,
          cancelReason: reason
        });
        if (cancelRes.code === 0) {
          common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:828", "订单取消成功");
          common_vendor.index.showToast({ title: "订单已取消，款项将原路退回", icon: "none" });
        } else {
          common_vendor.index.__f__("error", "at pages/charge/gunStartingCharge.vue:831", "订单取消失败:", cancelRes.msg);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/charge/gunStartingCharge.vue:834", "取消订单请求失败:", error);
      } finally {
        this.alipayOrderInfo.orderNo = "";
      }
    },
    // 清理支付结果轮询
    clearPaymentPolling() {
      if (this.alipayOrderInfo.pollTimer) {
        clearInterval(this.alipayOrderInfo.pollTimer);
        this.alipayOrderInfo.pollTimer = null;
        common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:846", "支付结果轮询已清理");
      }
    },
    contactSupport() {
      common_vendor.index.makePhoneCall({ phoneNumber: "400-011-0328" });
    },
    // 清理所有定时器
    clearAllTimers() {
      common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:854", "正在清理页面中的所有定时器...");
      if (this.$refs.chargeIdleView && this.$refs.chargeIdleView.clearTimers) {
        this.$refs.chargeIdleView.clearTimers();
        common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:859", "ChargeIdleView定时器已清理");
      }
      this.clearPaymentPolling();
      if (this.alipayOrderInfo.isProcessing && this.alipayOrderInfo.orderNo) {
        this.cancelAlipayOrder("页面离开，取消订单");
      }
      common_vendor.index.__f__("log", "at pages/charge/gunStartingCharge.vue:870", "所有定时器清理完成");
    }
  }
};
if (!Array) {
  const _component_charge_idle_view = common_vendor.resolveComponent("charge-idle-view");
  const _component_charge_busy_view = common_vendor.resolveComponent("charge-busy-view");
  const _easycom_uv_button2 = common_vendor.resolveComponent("uv-button");
  const _component_stage_price_info = common_vendor.resolveComponent("stage-price-info");
  const _easycom_uv_popup2 = common_vendor.resolveComponent("uv-popup");
  (_component_charge_idle_view + _component_charge_busy_view + _easycom_uv_button2 + _component_stage_price_info + _easycom_uv_popup2)();
}
const _easycom_uv_button = () => "../../uni_modules/uv-button/components/uv-button/uv-button.js";
const _easycom_uv_popup = () => "../../uni_modules/uv-popup/components/uv-popup/uv-popup.js";
if (!Math) {
  (_easycom_uv_button + _easycom_uv_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.pileInfo && $data.memberInfo
  }, $data.pileInfo && $data.memberInfo ? common_vendor.e({
    b: $data.mainGunState === 1 || $data.mainGunState === 2
  }, $data.mainGunState === 1 || $data.mainGunState === 2 ? {
    c: common_vendor.sr("chargeIdleView", "8414de57-0"),
    d: common_vendor.o($options.handleShowPriceDetails),
    e: common_vendor.o($options.paymentMethodChange),
    f: common_vendor.o($options.handlePresetAmountChange),
    g: common_vendor.o($options.setPresetAmount),
    h: common_vendor.o($options.handleDualGunChange),
    i: common_vendor.o($options.handleGunStatusUpdated),
    j: common_vendor.o($options.handleUserChanged),
    k: common_vendor.p({
      ["pile-info"]: $data.pileInfo,
      ["member-info"]: $data.memberInfo,
      ["payment-methods"]: $data.paymentMethods,
      ["preset-amount"]: $data.presetAmount,
      ["current-payment-type"]: $data.currentPaymentType,
      ["main-gun-params"]: $data.gunParams
    })
  } : {
    l: common_vendor.p({
      ["pile-info"]: $data.pileInfo,
      ["main-gun-state"]: $data.mainGunState
    })
  }) : {}, {
    m: common_vendor.o($options.refreshData),
    n: common_vendor.p({
      text: "刷新",
      type: "info",
      size: "large",
      shape: "circle"
    }),
    o: common_vendor.o($options.startCharging),
    p: common_vendor.p({
      text: $options.chargeButtonText,
      type: "primary",
      size: "large",
      disabled: $options.isChargeButtonDisabled,
      shape: "circle",
      ["custom-style"]: $data.startChargeButtonStyle
    }),
    q: common_vendor.f($data.priceDetailsData, (price, index, i0) => {
      return {
        a: index,
        b: "8414de57-5-" + i0 + ",8414de57-4",
        c: common_vendor.p({
          ["price-info"]: price
        })
      };
    }),
    r: common_vendor.sr("priceDetailsPopup", "8414de57-4"),
    s: common_vendor.o($options.handlePopupChange),
    t: common_vendor.p({
      mode: "bottom",
      round: 20,
      ["safe-area-inset-bottom"]: true,
      closeable: true,
      ["close-icon-pos"]: "top-right",
      ["bg-color"]: "#fff"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8414de57"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/charge/gunStartingCharge.js.map
