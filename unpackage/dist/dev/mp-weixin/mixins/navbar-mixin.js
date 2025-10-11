"use strict";
const navbarMixin = {
  data() {
    return {
      // 导航栏配置
      navbarConfig: {
        title: "",
        bgColor: "#1890FF",
        leftIcon: "arrow-left",
        leftText: "",
        rightText: "",
        rightIcon: "",
        leftIconSize: 20,
        leftIconColor: "#ffffff",
        titleStyle: {
          color: "#ffffff",
          fontSize: "18px",
          fontWeight: "bold"
        },
        height: 44,
        autoBack: true,
        fixed: true,
        safeAreaInsetTop: true,
        placeholder: true,
        border: false
      }
    };
  },
  onLoad() {
    this.setupNavbar();
  },
  onShow() {
  },
  methods: {
    // 设置导航栏
    setupNavbar() {
    },
    // 设置导航栏标题
    setNavbarTitle(title) {
      this.navbarConfig.title = title;
    },
    // 设置导航栏背景色
    setNavbarBgColor(color) {
      this.navbarConfig.bgColor = color;
    },
    // 设置左侧图标
    setLeftIcon(icon) {
      this.navbarConfig.leftIcon = icon;
    },
    // 设置左侧文字
    setLeftText(text) {
      this.navbarConfig.leftText = text;
    },
    // 设置右侧文字
    setRightText(text) {
      this.navbarConfig.rightText = text;
    },
    // 设置右侧图标
    setRightIcon(icon) {
      this.navbarConfig.rightIcon = icon;
    },
    // 设置左侧图标颜色
    setLeftIconColor(color) {
      this.navbarConfig.leftIconColor = color;
    },
    // 设置标题样式
    setTitleStyle(style) {
      this.navbarConfig.titleStyle = style;
    },
    // 设置导航栏高度
    setNavbarHeight(height) {
      this.navbarConfig.height = height;
    },
    // 设置是否自动返回
    setAutoBack(autoBack) {
      this.navbarConfig.autoBack = autoBack;
    },
    // 设置是否固定在顶部
    setFixed(fixed) {
      this.navbarConfig.fixed = fixed;
    },
    // 设置是否显示边框
    setBorder(border) {
      this.navbarConfig.border = border;
    },
    // 处理导航栏左侧点击
    onNavbarLeftClick() {
    },
    // 处理导航栏右侧点击
    onNavbarRightClick() {
    }
  }
};
exports.navbarMixin = navbarMixin;
//# sourceMappingURL=../../.sourcemap/mp-weixin/mixins/navbar-mixin.js.map
