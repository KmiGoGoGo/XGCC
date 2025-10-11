"use strict";
const common_vendor = require("../../common/vendor.js");
const api_vehicle = require("../../api/vehicle.js");
const VehiclePlateInput = () => "../../components/vehicle-plate-input/vehicle-plate-input.js";
const _sfc_main = {
  components: {
    VehiclePlateInput
  },
  data() {
    return {
      vehicleList: [],
      newVehiclePlate: "",
      isEditMode: false,
      // 是否为编辑模式
      currentEditVehicle: null
      // 当前编辑的车辆信息
    };
  },
  onLoad() {
    this.fetchVehicleList();
  },
  methods: {
    plateInput(plateNo) {
      this.newVehiclePlate = plateNo;
      common_vendor.index.__f__("log", "at pages/vehicle/list.vue:92", "车牌号输入:", this.newVehiclePlate);
    },
    async fetchVehicleList() {
      common_vendor.index.showLoading({ title: "加载中..." });
      try {
        const res = await api_vehicle.getVehicleList();
        if (res.code === 0) {
          this.vehicleList = res.data.map((vehicle) => ({
            ...vehicle,
            showActions: false
          }));
        } else {
          common_vendor.index.showToast({ title: "加载失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/vehicle/list.vue:108", "获取车辆列表失败:", error);
        common_vendor.index.showToast({ title: "网络错误", icon: "none" });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    /**
     * @description 设为默认车辆
     * @param {object} vehicle - 被点击的车辆对象
     */
    async setDefault(vehicle) {
      if (!vehicle.id) {
        common_vendor.index.showToast({
          title: "设置失败：车辆ID无效",
          icon: "none"
        });
        return;
      }
      if (vehicle.defaultVehicle === 0) {
        common_vendor.index.showToast({
          title: "该车辆已是默认车辆",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "设置中..." });
        const response = await api_vehicle.updateDefaultVehicle(vehicle.id);
        if (response.code === 0) {
          await this.fetchVehicleList();
          common_vendor.index.showToast({
            title: "设置默认车辆成功",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: response.msg || "设置失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/vehicle/list.vue:156", "设置默认车辆失败:", error);
        common_vendor.index.showToast({
          title: "网络错误，请稍后重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    /**
     * @description 切换更多操作面板的显示
     * @param {number} index - 车辆在列表中的索引
     */
    toggleActions(index) {
      this.vehicleList.forEach((v, i) => {
        if (i !== index) {
          v.showActions = false;
        }
      });
      this.vehicleList[index].showActions = !this.vehicleList[index].showActions;
    },
    /**
     * @description 显示添加车辆弹窗
     */
    showAddVehiclePopup() {
      this.isEditMode = false;
      this.currentEditVehicle = null;
      this.newVehiclePlate = "";
      this.$refs.addVehiclePopup.open("bottom");
    },
    /**
     * @description 编辑车辆
     * @param {object} vehicle - 要编辑的车辆信息
     */
    editVehicle(vehicle) {
      this.isEditMode = true;
      this.currentEditVehicle = vehicle;
      this.newVehiclePlate = vehicle.plateNo || "";
      vehicle.showActions = false;
      this.$refs.addVehiclePopup.open("bottom");
    },
    /**
     * @description 关闭添加车辆弹窗
     */
    closeAddVehiclePopup() {
      this.$refs.addVehiclePopup.close();
    },
    /**
     * @description 处理提交按钮点击
     */
    handleSubmit() {
      const plateNo = this.newVehiclePlate;
      if (this.isEditMode) {
        this.updateVehicle(plateNo);
      } else {
        this.submitVehicle(plateNo);
      }
    },
    /**
     * @description 提交车辆信息
     */
    async submitVehicle(plateNo) {
      if (!plateNo) {
        common_vendor.index.showToast({
          title: "请输入车牌号",
          icon: "none"
        });
        return;
      }
      if (plateNo.length < 2) {
        common_vendor.index.showToast({
          title: "请输入完整的车牌号",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "添加中..." });
        const requestData = {
          plateNo,
          carNatureId: 0,
          mileage: "",
          vehicleType: "DianDong",
          vin: ""
        };
        const response = await api_vehicle.addVehicle(requestData);
        if (response.code === 0) {
          await this.fetchVehicleList();
          common_vendor.index.showToast({
            title: "车辆添加成功",
            icon: "success"
          });
          this.closeAddVehiclePopup();
        } else {
          common_vendor.index.showToast({
            title: response.msg || "添加失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/vehicle/list.vue:273", "添加车辆失败:", error);
        common_vendor.index.showToast({
          title: "网络错误，请稍后重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    /**
     * @description 更新车辆信息
     */
    async updateVehicle(plateNo) {
      if (!plateNo) {
        common_vendor.index.showToast({
          title: "请输入车牌号",
          icon: "none"
        });
        return;
      }
      if (plateNo.length < 2) {
        common_vendor.index.showToast({
          title: "请输入完整的车牌号",
          icon: "none"
        });
        return;
      }
      if (!this.currentEditVehicle || !this.currentEditVehicle.id) {
        common_vendor.index.showToast({
          title: "编辑车辆信息错误",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "更新中..." });
        const requestData = {
          plateNo,
          brandId: this.currentEditVehicle.brandId || null,
          carTypeId: this.currentEditVehicle.carTypeId || null,
          carNatureId: this.currentEditVehicle.carNatureId || 0,
          mileage: this.currentEditVehicle.mileage || null,
          vehicleType: this.currentEditVehicle.vehicleType || "DianDong",
          vin: this.currentEditVehicle.vin || "",
          id: this.currentEditVehicle.id
        };
        const response = await api_vehicle.updateVehicleInfo(requestData);
        if (response.code === 0) {
          await this.fetchVehicleList();
          common_vendor.index.showToast({
            title: "车辆更新成功",
            icon: "success"
          });
          this.closeAddVehiclePopup();
        } else {
          common_vendor.index.showToast({
            title: response.msg || "更新失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/vehicle/list.vue:346", "更新车辆失败:", error);
        common_vendor.index.showToast({
          title: "网络错误，请稍后重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    /**
     * @description 删除车辆
     * @param {object} vehicle - 要删除的车辆信息
     */
    deleteVehicle(vehicle) {
      common_vendor.index.showModal({
        title: "确认删除",
        content: `确定要删除车牌号为"${vehicle.plateNo}"的车辆吗？`,
        confirmText: "删除",
        cancelText: "取消",
        confirmColor: "#ff4757",
        success: (res) => {
          if (res.confirm) {
            this.confirmDeleteVehicle(vehicle.id);
          }
        }
      });
      vehicle.showActions = false;
    },
    /**
     * @description 确认删除车辆
     * @param {number} vehicleId - 车辆ID
     */
    async confirmDeleteVehicle(vehicleId) {
      if (!vehicleId) {
        common_vendor.index.showToast({
          title: "删除失败：车辆ID无效",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "删除中..." });
        const response = await api_vehicle.delVehicleInfo(vehicleId);
        if (response.code === 0) {
          await this.fetchVehicleList();
          common_vendor.index.showToast({
            title: "车辆删除成功",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: response.msg || "删除失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/vehicle/list.vue:411", "删除车辆失败:", error);
        common_vendor.index.showToast({
          title: "网络错误，请稍后重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    }
  }
};
if (!Array) {
  const _easycom_uv_icon2 = common_vendor.resolveComponent("uv-icon");
  const _easycom_vehicle_plate_input2 = common_vendor.resolveComponent("vehicle-plate-input");
  const _easycom_uv_button2 = common_vendor.resolveComponent("uv-button");
  const _easycom_uv_popup2 = common_vendor.resolveComponent("uv-popup");
  (_easycom_uv_icon2 + _easycom_vehicle_plate_input2 + _easycom_uv_button2 + _easycom_uv_popup2)();
}
const _easycom_uv_icon = () => "../../uni_modules/uv-icon/components/uv-icon/uv-icon.js";
const _easycom_vehicle_plate_input = () => "../../components/vehicle-plate-input/vehicle-plate-input.js";
const _easycom_uv_button = () => "../../uni_modules/uv-button/components/uv-button/uv-button.js";
const _easycom_uv_popup = () => "../../uni_modules/uv-popup/components/uv-popup/uv-popup.js";
if (!Math) {
  (_easycom_uv_icon + _easycom_vehicle_plate_input + _easycom_uv_button + _easycom_uv_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.vehicleList, (vehicle, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(vehicle.vehicleType === "DianDong" ? "纯电动汽车" : "其他"),
        b: common_vendor.t(vehicle.plateNo),
        c: vehicle.defaultVehicle === 0
      }, vehicle.defaultVehicle === 0 ? {} : {}, {
        d: vehicle.defaultVehicle === 0 ? 1 : "",
        e: vehicle.defaultVehicle === 0 ? 1 : "",
        f: common_vendor.o(($event) => $options.setDefault(vehicle), vehicle.id),
        g: "6517cfe0-0-" + i0,
        h: common_vendor.o(($event) => $options.toggleActions(index), vehicle.id),
        i: vehicle.showActions
      }, vehicle.showActions ? {
        j: common_vendor.o(($event) => $options.deleteVehicle(vehicle), vehicle.id),
        k: common_vendor.o(($event) => $options.editVehicle(vehicle), vehicle.id)
      } : {}, {
        l: vehicle.id
      });
    }),
    b: common_vendor.p({
      name: "arrow-down",
      size: "20"
    }),
    c: common_vendor.o((...args) => $options.showAddVehiclePopup && $options.showAddVehiclePopup(...args)),
    d: common_vendor.t($data.isEditMode ? "编辑车辆" : "添加车辆"),
    e: common_vendor.o((...args) => $options.closeAddVehiclePopup && $options.closeAddVehiclePopup(...args)),
    f: common_vendor.sr("plateInput", "6517cfe0-2,6517cfe0-1"),
    g: common_vendor.o($options.plateInput),
    h: common_vendor.p({
      value: $data.newVehiclePlate
    }),
    i: common_vendor.o($options.closeAddVehiclePopup),
    j: common_vendor.p({
      text: "取消",
      type: "default",
      size: "large",
      plain: true
    }),
    k: common_vendor.o($options.handleSubmit),
    l: common_vendor.p({
      text: "提交",
      type: "primary",
      size: "large"
    }),
    m: common_vendor.sr("addVehiclePopup", "6517cfe0-1"),
    n: common_vendor.p({
      mode: "bottom",
      ["close-on-click-overlay"]: false,
      ["custom-style"]: "height: 500rpx;"
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6517cfe0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/vehicle/list.js.map
