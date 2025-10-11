"use strict";
const common_vendor = require("../../common/vendor.js");
const api_bill = require("../../api/bill.js");
const _sfc_main = {
  name: "CommentPage",
  data() {
    return {
      loading: true,
      submitting: false,
      // 提交中状态
      billId: "",
      billDetail: {},
      rating: 5,
      commentText: "",
      fileList: [],
      uploadingImages: [],
      // 记录正在上传的图片
      ratingTexts: ["很差", "较差", "一般", "很好", "非常好"]
    };
  },
  computed: {
    ratingText() {
      return this.ratingTexts[this.rating - 1] || "";
    },
    // 用于显示的文件列表（包含上传状态）
    displayFileList() {
      return this.fileList;
    }
  },
  onLoad(options) {
    this.billId = options.billId || options.id;
    if (this.billId) {
      this.getBillDetail();
    } else {
      common_vendor.index.showToast({
        title: "缺少订单ID",
        icon: "error"
      });
    }
  },
  methods: {
    async getBillDetail() {
      try {
        this.loading = true;
        const res = await api_bill.getBillDetailById(this.billId);
        if (res.code === 0 && res.data) {
          this.billDetail = res.data;
        } else {
          common_vendor.index.showToast({
            title: res.message || "获取订单详情失败",
            icon: "error"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/bill/comment.vue:188", "获取订单详情失败:", error);
        common_vendor.index.showToast({
          title: "获取订单详情失败",
          icon: "error"
        });
      } finally {
        this.loading = false;
      }
    },
    handleRatingChange(value) {
      this.rating = value;
    },
    async afterRead(event) {
      const { file } = event;
      const files = Array.isArray(file) ? file : [file];
      for (let singleFile of files) {
        const tempIndex = this.fileList.length;
        this.fileList.push({
          url: singleFile.url,
          // 本地临时路径用于预览
          name: singleFile.name,
          uploading: true,
          // 标记为上传中
          failed: false,
          tempUrl: singleFile.url
          // 保存本地临时路径
        });
        this.uploadingImages.push(tempIndex);
        try {
          const uploadResult = await this.uploadImage(singleFile);
          if (uploadResult.code === 0 && uploadResult.data) {
            this.$set(this.fileList, tempIndex, {
              url: uploadResult.data,
              // 使用服务器返回的URL
              name: singleFile.name,
              uploading: false,
              failed: false,
              serverUrl: uploadResult.data
            });
            const uploadingIndex = this.uploadingImages.indexOf(tempIndex);
            if (uploadingIndex > -1) {
              this.uploadingImages.splice(uploadingIndex, 1);
            }
            common_vendor.index.showToast({
              title: "上传成功",
              icon: "success",
              duration: 1500
            });
          } else {
            throw new Error(uploadResult.msg || "上传失败");
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/bill/comment.vue:251", "图片上传失败:", error);
          this.$set(this.fileList, tempIndex, {
            ...this.fileList[tempIndex],
            uploading: false,
            failed: true
          });
          const uploadingIndex = this.uploadingImages.indexOf(tempIndex);
          if (uploadingIndex > -1) {
            this.uploadingImages.splice(uploadingIndex, 1);
          }
          common_vendor.index.showToast({
            title: error.message || "上传失败，请重试",
            icon: "error",
            duration: 2e3
          });
        }
      }
    },
    // 封装图片上传方法
    uploadImage(file) {
      return new Promise((resolve, reject) => {
        common_vendor.index.uploadFile({
          url: global.URL + "/api-service/common/upload",
          filePath: file.url,
          name: "file",
          header: {
            // 如果需要token验证，在这里添加
            // 'Authorization': 'Bearer ' + uni.getStorageSync('token')
          },
          success: (res) => {
            try {
              const result = JSON.parse(res.data);
              resolve(result);
            } catch (e) {
              reject(new Error("响应数据解析失败"));
            }
          },
          fail: (err) => {
            reject(err);
          }
        });
      });
    },
    deleteFile(event) {
      this.fileList.splice(event.index, 1);
    },
    async submitComment() {
      if (!this.commentText.trim()) {
        common_vendor.index.showToast({
          title: "请输入评论内容",
          icon: "none"
        });
        return;
      }
      if (this.uploadingImages.length > 0) {
        common_vendor.index.showToast({
          title: "图片上传中，请稍后",
          icon: "loading",
          duration: 2e3
        });
        return;
      }
      if (this.submitting) {
        return;
      }
      try {
        this.submitting = true;
        const uploadedImages = this.fileList.filter((item) => !item.uploading && !item.failed && item.serverUrl).map((item) => item.serverUrl);
        const requestData = {
          busId: this.billDetail.busId,
          // 使用订单编号作为busId
          commentCode: this.rating,
          taglibList: [],
          content: this.commentText,
          img: uploadedImages.length > 0 ? uploadedImages[0] : ""
          // 只取第一张图片
        };
        common_vendor.index.__f__("log", "at pages/bill/comment.vue:346", "提交评论请求数据:", requestData);
        const res = await api_bill.billComment(requestData);
        if (res.code === 0 && res.success) {
          common_vendor.index.showToast({
            title: "评论提交成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          throw new Error(res.msg || "评论提交失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/bill/comment.vue:364", "评论提交失败:", error);
        common_vendor.index.showToast({
          title: error.message || "评论提交失败，请重试",
          icon: "error",
          duration: 2e3
        });
      } finally {
        this.submitting = false;
      }
    }
  }
};
if (!Array) {
  const _easycom_uv_tooltip2 = common_vendor.resolveComponent("uv-tooltip");
  const _easycom_uv_rate2 = common_vendor.resolveComponent("uv-rate");
  const _easycom_uv_textarea2 = common_vendor.resolveComponent("uv-textarea");
  const _easycom_uv_upload2 = common_vendor.resolveComponent("uv-upload");
  const _easycom_uv_button2 = common_vendor.resolveComponent("uv-button");
  (_easycom_uv_tooltip2 + _easycom_uv_rate2 + _easycom_uv_textarea2 + _easycom_uv_upload2 + _easycom_uv_button2)();
}
const _easycom_uv_tooltip = () => "../../uni_modules/uv-tooltip/components/uv-tooltip/uv-tooltip.js";
const _easycom_uv_rate = () => "../../uni_modules/uv-rate/components/uv-rate/uv-rate.js";
const _easycom_uv_textarea = () => "../../uni_modules/uv-textarea/components/uv-textarea/uv-textarea.js";
const _easycom_uv_upload = () => "../../uni_modules/uv-upload/components/uv-upload/uv-upload.js";
const _easycom_uv_button = () => "../../uni_modules/uv-button/components/uv-button/uv-button.js";
if (!Math) {
  (_easycom_uv_tooltip + _easycom_uv_rate + _easycom_uv_textarea + _easycom_uv_upload + _easycom_uv_button)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$data.loading
  }, !$data.loading ? {
    b: common_vendor.t($data.billDetail.plateNo || "-"),
    c: common_vendor.t($data.billDetail.busShowNo || "-"),
    d: common_vendor.p({
      text: $data.billDetail.busShowNo || "",
      copyText: $data.billDetail.busShowNo || "",
      showCopy: true,
      showToast: true,
      overlay: true
    }),
    e: common_vendor.t($data.billDetail.stationName || "-"),
    f: common_vendor.t($data.billDetail.gunName || "-"),
    g: common_vendor.t(($data.billDetail.actualBalance / 100).toFixed(2) || "0.00")
  } : {}, {
    h: $data.loading
  }, $data.loading ? {} : {}, {
    i: common_vendor.o($options.handleRatingChange),
    j: common_vendor.o(($event) => $data.rating = $event),
    k: common_vendor.p({
      count: 5,
      ["active-color"]: "#F59E0B",
      ["inactive-color"]: "#E5E7EB",
      size: "24",
      modelValue: $data.rating
    }),
    l: common_vendor.t($options.ratingText),
    m: common_vendor.o(($event) => $data.commentText = $event),
    n: common_vendor.p({
      placeholder: "请输入内容",
      maxlength: 200,
      ["show-confirm-bar"]: false,
      height: "128",
      ["custom-style"]: "background-color: #F8F9FA; border-radius: 12rpx; border: 1px solid #E5E7EB;",
      modelValue: $data.commentText
    }),
    o: common_vendor.o($options.afterRead),
    p: common_vendor.o($options.deleteFile),
    q: common_vendor.p({
      ["file-list"]: $data.fileList,
      name: "1",
      multiple: true,
      ["max-count"]: 9,
      ["preview-full-image"]: true,
      width: "144",
      height: "144"
    }),
    r: $data.uploadingImages.length > 0
  }, $data.uploadingImages.length > 0 ? {
    s: common_vendor.t($data.uploadingImages.length)
  } : {}, {
    t: common_vendor.o($options.submitComment),
    v: common_vendor.p({
      type: "primary",
      shape: "circle",
      size: "large",
      text: $data.submitting ? "提交中..." : "评论",
      loading: $data.submitting,
      disabled: $data.submitting,
      ["custom-style"]: "background: #0052FF; height: 96rpx; border-radius: 48rpx;"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-82725371"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/bill/comment.js.map
