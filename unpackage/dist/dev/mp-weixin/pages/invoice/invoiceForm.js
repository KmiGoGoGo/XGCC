"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "InvoiceForm",
  data() {
    return {
      selectedItems: [],
      totalSelectedAmount: null,
      formData: {
        invoiceRiseTypeEnum: "1",
        // 抬头类型: 1-企业单位, 2-个人或非企业单位
        invoiceRise: "",
        // 发票抬头
        totalBalance: 0,
        // 发票金额(分)
        invoiceApplyingNote: "",
        // 备注信息
        dutyParagraph: "",
        // 税号
        email: "",
        // 邮箱
        invoiceItem1: "",
        // 发票内容1
        invoiceItem2: "",
        // 发票内容2
        billIds: [],
        // 订单ID列表
        billTotal: 0,
        // 订单总数
        invoiceType: "1",
        // 发票类型: 1-电子普票, 2-电子专票
        acceptInvoiceType: "1",
        // 接收方式: 1-短信, 2-邮箱
        address: "",
        // 注册地址 (专票时显示)
        phone: "15576753954",
        // 手机号
        openingBank: "",
        // 开户银行 (专票时显示)
        openingBankAccount: "",
        // 银行账户 (专票时显示)
        registerTel: ""
        // 注册电话 (专票时显示)
      },
      rules: {
        invoiceType: {
          required: true,
          message: "请选择发票类型",
          trigger: ["change"]
        },
        invoiceRiseTypeEnum: {
          required: true,
          message: "请选择抬头类型",
          trigger: ["change"]
        },
        invoiceRise: {
          required: true,
          message: "请输入发票抬头",
          trigger: ["blur"]
        },
        dutyParagraph: {
          required: this.isCompanyType,
          message: "请输入税号",
          trigger: ["blur"]
        },
        acceptInvoiceType: {
          required: true,
          message: "请选择接收方式",
          trigger: ["change"]
        }
      }
    };
  },
  computed: {
    // 是否为企业单位
    isCompanyType() {
      return this.formData.invoiceRiseTypeEnum === "1";
    },
    // 是否为电子专票
    isElectronicSpecial() {
      return this.formData.invoiceType === "2";
    }
  },
  watch: {
    // 监听抬头类型变化，更新税号校验规则
    isCompanyType(newVal) {
      this.updateTaxNumberRule(newVal);
    }
  },
  onLoad(options) {
    common_vendor.index.__f__("log", "at pages/invoice/invoiceForm.vue:286", "options", options);
    if (options.selectedItems) {
      this.selectedItems = options.selectedItems.split(",");
      this.formData.billIds = this.selectedItems.map((id) => parseInt(id));
      this.formData.billTotal = this.selectedItems.length;
    }
    if (options.totalSelectedAmount) {
      this.formData.totalBalance = options.totalSelectedAmount;
    }
  },
  methods: {
    // 发票类型变化
    onInvoiceTypeChange(value) {
      common_vendor.index.__f__("log", "at pages/invoice/invoiceForm.vue:300", "发票类型变化:", value);
      if (value !== "2") {
        this.formData.address = "";
        this.formData.registerTel = "";
        this.formData.openingBank = "";
        this.formData.openingBankAccount = "";
      }
    },
    // 抬头类型变化
    onHeaderTypeChange(value) {
      common_vendor.index.__f__("log", "at pages/invoice/invoiceForm.vue:312", "抬头类型变化:", value);
      if (value !== "1") {
        this.formData.dutyParagraph = "";
      }
    },
    // 接收方式变化
    onDeliveryMethodChange(value) {
      common_vendor.index.__f__("log", "at pages/invoice/invoiceForm.vue:321", "接收方式变化:", value);
      if (value === "1") {
        this.formData.email = "";
      } else if (value === "2") {
        this.formData.phone = "";
      }
    },
    // 更新税号校验规则
    updateTaxNumberRule(isRequired) {
      this.rules.dutyParagraph.required = isRequired;
      if (!isRequired) {
        this.$refs.formRef && this.$refs.formRef.clearValidate(["dutyParagraph"]);
      }
    },
    // 提交表单
    async submitForm() {
      try {
        const isValid = await this.$refs.formRef.validate();
        if (!isValid) {
          return;
        }
        if (this.formData.acceptInvoiceType === "1" && !this.formData.phone) {
          common_vendor.index.showToast({
            title: "请输入手机号",
            icon: "none"
          });
          return;
        }
        if (this.formData.acceptInvoiceType === "2" && !this.formData.email) {
          common_vendor.index.showToast({
            title: "请输入邮箱",
            icon: "none"
          });
          return;
        }
        common_vendor.index.__f__("log", "at pages/invoice/invoiceForm.vue:366", "提交数据:", this.formData);
        common_vendor.index.showToast({
          title: "开票申请提交成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/invoice/invoiceForm.vue:379", "表单校验失败:", error);
      }
    }
  }
};
if (!Array) {
  const _easycom_uv_radio2 = common_vendor.resolveComponent("uv-radio");
  const _easycom_uv_radio_group2 = common_vendor.resolveComponent("uv-radio-group");
  const _easycom_uv_form_item2 = common_vendor.resolveComponent("uv-form-item");
  const _easycom_uv_input2 = common_vendor.resolveComponent("uv-input");
  const _easycom_uv_icon2 = common_vendor.resolveComponent("uv-icon");
  const _easycom_uv_form2 = common_vendor.resolveComponent("uv-form");
  const _easycom_uv_button2 = common_vendor.resolveComponent("uv-button");
  (_easycom_uv_radio2 + _easycom_uv_radio_group2 + _easycom_uv_form_item2 + _easycom_uv_input2 + _easycom_uv_icon2 + _easycom_uv_form2 + _easycom_uv_button2)();
}
const _easycom_uv_radio = () => "../../uni_modules/uv-radio/components/uv-radio/uv-radio.js";
const _easycom_uv_radio_group = () => "../../uni_modules/uv-radio/components/uv-radio-group/uv-radio-group.js";
const _easycom_uv_form_item = () => "../../uni_modules/uv-form/components/uv-form-item/uv-form-item.js";
const _easycom_uv_input = () => "../../uni_modules/uv-input/components/uv-input/uv-input.js";
const _easycom_uv_icon = () => "../../uni_modules/uv-icon/components/uv-icon/uv-icon.js";
const _easycom_uv_form = () => "../../uni_modules/uv-form/components/uv-form/uv-form.js";
const _easycom_uv_button = () => "../../uni_modules/uv-button/components/uv-button/uv-button.js";
if (!Math) {
  (_easycom_uv_radio + _easycom_uv_radio_group + _easycom_uv_form_item + _easycom_uv_input + _easycom_uv_icon + _easycom_uv_form + _easycom_uv_button)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      name: "1",
      label: "电子普票",
      activeColor: "#007AFF"
    }),
    b: common_vendor.p({
      name: "2",
      label: "电子专票",
      activeColor: "#007AFF"
    }),
    c: common_vendor.o($options.onInvoiceTypeChange),
    d: common_vendor.o(($event) => $data.formData.invoiceType = $event),
    e: common_vendor.p({
      placement: "row",
      modelValue: $data.formData.invoiceType
    }),
    f: common_vendor.p({
      label: "发票类型",
      prop: "invoiceType",
      required: true
    }),
    g: common_vendor.p({
      name: "1",
      label: "企业单位",
      activeColor: "#007AFF"
    }),
    h: common_vendor.p({
      name: "2",
      label: "个人或非企业单位",
      activeColor: "#007AFF"
    }),
    i: common_vendor.o($options.onHeaderTypeChange),
    j: common_vendor.o(($event) => $data.formData.invoiceRiseTypeEnum = $event),
    k: common_vendor.p({
      placement: "row",
      modelValue: $data.formData.invoiceRiseTypeEnum
    }),
    l: common_vendor.p({
      label: "抬头类型",
      prop: "invoiceRiseTypeEnum",
      required: true
    }),
    m: common_vendor.o(($event) => $data.formData.invoiceRise = $event),
    n: common_vendor.p({
      placeholder: "请输入抬头",
      border: "surround",
      customStyle: "height: 80rpx;",
      modelValue: $data.formData.invoiceRise
    }),
    o: common_vendor.p({
      label: "发票抬头",
      prop: "invoiceRise",
      required: true
    }),
    p: common_vendor.o(($event) => $data.formData.dutyParagraph = $event),
    q: common_vendor.p({
      placeholder: "请输入税号",
      border: "surround",
      customStyle: "height: 80rpx;",
      modelValue: $data.formData.dutyParagraph
    }),
    r: common_vendor.p({
      label: "税号",
      prop: "dutyParagraph",
      required: $options.isCompanyType
    }),
    s: $options.isElectronicSpecial
  }, $options.isElectronicSpecial ? {
    t: common_vendor.o(($event) => $data.formData.address = $event),
    v: common_vendor.p({
      placeholder: "请输入注册地址",
      border: "surround",
      customStyle: "height: 80rpx;",
      modelValue: $data.formData.address
    }),
    w: common_vendor.p({
      label: "注册地址",
      prop: "address"
    }),
    x: common_vendor.o(($event) => $data.formData.registerTel = $event),
    y: common_vendor.p({
      placeholder: "请输入注册电话",
      border: "surround",
      customStyle: "height: 80rpx;",
      modelValue: $data.formData.registerTel
    }),
    z: common_vendor.p({
      label: "注册电话",
      prop: "registerTel"
    }),
    A: common_vendor.o(($event) => $data.formData.openingBank = $event),
    B: common_vendor.p({
      placeholder: "请输入开户银行",
      border: "surround",
      customStyle: "height: 80rpx;",
      modelValue: $data.formData.openingBank
    }),
    C: common_vendor.p({
      label: "开户银行",
      prop: "openingBank"
    }),
    D: common_vendor.o(($event) => $data.formData.openingBankAccount = $event),
    E: common_vendor.p({
      placeholder: "请输入银行账户",
      border: "surround",
      customStyle: "height: 80rpx;",
      modelValue: $data.formData.openingBankAccount
    }),
    F: common_vendor.p({
      label: "银行账户",
      prop: "openingBankAccount"
    })
  } : {}, {
    G: common_vendor.p({
      label: "发票内容",
      prop: "invoiceContent",
      required: true
    }),
    H: common_vendor.t($data.formData.totalBalance),
    I: common_vendor.p({
      label: "发票金额",
      prop: "totalBalance",
      required: true
    }),
    J: common_vendor.o(($event) => $data.formData.invoiceApplyingNote = $event),
    K: common_vendor.p({
      placeholder: "请输入备注信息",
      border: "surround",
      type: "textarea",
      customStyle: "height: 120rpx;",
      modelValue: $data.formData.invoiceApplyingNote
    }),
    L: common_vendor.p({
      label: "备注信息",
      prop: "invoiceApplyingNote"
    }),
    M: common_vendor.p({
      name: "checkmark-circle-fill",
      color: "#22C55E",
      size: "32rpx"
    }),
    N: common_vendor.o(($event) => $data.formData.phone = $event),
    O: common_vendor.p({
      placeholder: "请输入手机号",
      border: "surround",
      customStyle: "height: 80rpx; margin-top: 20rpx;",
      disabled: $data.formData.acceptInvoiceType !== "1",
      modelValue: $data.formData.phone
    }),
    P: common_vendor.p({
      name: "1",
      activeColor: "#007AFF",
      customStyle: {
        marginBottom: "20rpx"
      }
    }),
    Q: common_vendor.o(($event) => $data.formData.email = $event),
    R: common_vendor.p({
      placeholder: "请输入邮箱",
      border: "surround",
      customStyle: "height: 80rpx; margin-top: 20rpx;",
      disabled: $data.formData.acceptInvoiceType !== "2",
      modelValue: $data.formData.email
    }),
    S: common_vendor.p({
      name: "2",
      activeColor: "#007AFF"
    }),
    T: common_vendor.o($options.onDeliveryMethodChange),
    U: common_vendor.o(($event) => $data.formData.acceptInvoiceType = $event),
    V: common_vendor.p({
      placement: "column",
      modelValue: $data.formData.acceptInvoiceType
    }),
    W: common_vendor.p({
      prop: "acceptInvoiceType"
    }),
    X: common_vendor.sr("formRef", "6be5fac8-0"),
    Y: common_vendor.p({
      model: $data.formData,
      rules: $data.rules,
      labelPosition: "top",
      labelWidth: "auto"
    }),
    Z: common_vendor.o($options.submitForm),
    aa: common_vendor.p({
      type: "primary",
      size: "large",
      customStyle: "height: 88rpx; border-radius: 44rpx;"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6be5fac8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/invoice/invoiceForm.js.map
