"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  props: {
    activeId: {
      // 改名为更语义化的activeId
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      tabList: [
        {
          id: 0,
          path: "/pages/index/index",
          icon: "https://oos-cn.ctyunapi.cn/front-end/static/static/home.png",
          selectIcon: "https://oos-cn.ctyunapi.cn/front-end/static/static/home_sel.png",
          text: "充电",
          centerItem: false
        },
        {
          id: 1,
          path: "",
          icon: "https://oos-cn.ctyunapi.cn/front-end/static/static/scan.png",
          selectIcon: "https://oos-cn.ctyunapi.cn/front-end/static/static/scan.png",
          text: "",
          centerItem: true
        },
        {
          id: 2,
          path: "/pages/my/my",
          icon: "https://oos-cn.ctyunapi.cn/front-end/static/static/mime.png",
          selectIcon: "https://oos-cn.ctyunapi.cn/front-end/static/static/mime_sel.png",
          text: "我的",
          centerItem: false
        }
      ]
    };
  },
  methods: {
    async changeItem(item) {
      common_vendor.index.__f__("log", "at components/tabbar/tabbar.vue:61", "changeItem", item);
      common_vendor.index.__f__("log", "at components/tabbar/tabbar.vue:62", "准备跳转到页面:", item.path);
      if (item.id === 1) {
        my.scan({ type: "qr" });
        return;
      }
      this.$emit("update:activeId", item.id);
      this.$emit("change", item.id);
      try {
        await new Promise((resolve) => {
          common_vendor.index.switchTab({
            url: item.path,
            success: (res) => {
              common_vendor.index.__f__("log", "at components/tabbar/tabbar.vue:79", "switchTab 成功:", res);
              resolve(res);
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at components/tabbar/tabbar.vue:83", "switchTab 失败:", err);
              resolve(err);
            },
            complete: resolve
          });
        });
      } catch (err) {
        common_vendor.index.__f__("error", "at components/tabbar/tabbar.vue:90", "切换失败:", err);
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.tabList, (item, k0, i0) => {
      return {
        a: $props.activeId === item.id ? item.selectIcon : item.icon,
        b: common_vendor.t(item.text),
        c: common_vendor.n({
          "item-active": $props.activeId === item.id
        }),
        d: item.id,
        e: common_vendor.n({
          "center-item": item.centerItem
        }),
        f: common_vendor.o(($event) => $options.changeItem(item), item.id)
      };
    })
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/tabbar/tabbar.js.map
