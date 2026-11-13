<template>
  <view class="container">
    <uv-navbar :border="false" :autoBack="false" placeholder safeAreaInsetTop @leftClick="handleNavBack"></uv-navbar>

    <view class="content">
      <!-- 头部信息 -->
      <view class="header">
        <view class="title">{{ advertisData.title }}</view>
        <view class="info-row">
          <text class="time">{{ advertisData.setupTime || advertisData.timeS }}</text>
          <text class="status" v-if="advertisData.status == 1">发布中</text>
          <text class="status" v-else-if="advertisData.status == 2">已结束</text>
        </view>
      </view>

      <!-- 详情内容 -->
      <view class="detail-content">
        <!-- 富文本内容 -->
        <view v-if="advertisData.details || advertisData.content">
          <rich-text :nodes="advertisData.details || advertisData.content"></rich-text>
        </view>

        <!-- 如果没有详情内容，显示提示 -->
        <view v-if="!advertisData.details && !advertisData.content && !advertisData.image" class="empty-tip">
          <text>暂无详细内容</text>
        </view>
      </view>

    </view>

    <!-- 底部浮动客服条：左侧拨打电话，右侧进入微信客服会话 -->
    <view class="service-bar">
      <view class="service-bar-item phone-item" hover-class="service-bar-hover" @click="handleCallService">
        <uv-icon name="phone-fill" size="18" color="#1D6FE8"></uv-icon>
        <text class="service-bar-text">客服电话</text>
      </view>
      <button
          class="service-bar-item online-item"
          open-type="contact"
          session-from="advert_detail"
          hover-class="service-bar-hover"
      >
        <uv-icon name="chat-fill" size="18" color="#FFFFFF"></uv-icon>
        <text class="service-bar-text">在线客服</text>
      </button>
    </view>
  </view>
</template>

<script>
import { handleNavBack, contactCustomerService } from '@/utils/utils';
import globalData from '@/globalData';

export default {
  data() {
    return {
      pageTitle: '活动详情',
      advertisData: {
        id: '',
        title: '',
        setupTime: '',
        timeS: '',
        status: '',
        details: '',
        content: '',
        image: '',
        advertisingLink: '',
        linkUrl: '',
        connectionType: '',
        linkType: ''
      }
    };
  },
  onShareAppMessage() {
    // 构建分享路径，包含所有必要的参数
    const params = [];

    // 优先传递 id，如果有 id 则可以通过接口获取完整信息
    if (this.advertisData.id) {
      params.push(`id=${encodeURIComponent(this.advertisData.id)}`);
    }

    // 添加其他关键参数
    if (this.advertisData.title) {
      params.push(`title=${encodeURIComponent(this.advertisData.title)}`);
    }
    if (this.advertisData.setupTime) {
      params.push(`time=${encodeURIComponent(this.advertisData.setupTime)}`);
    } else if (this.advertisData.timeS) {
      params.push(`timeS=${encodeURIComponent(this.advertisData.timeS)}`);
    }
    if (this.advertisData.status) {
      params.push(`status=${encodeURIComponent(this.advertisData.status)}`);
    }
    if (this.advertisData.image) {
      params.push(`image=${encodeURIComponent(this.advertisData.image)}`);
    }
    if (this.advertisData.advertisingLink) {
      params.push(`link=${encodeURIComponent(this.advertisData.advertisingLink)}`);
    }
    if (this.advertisData.linkUrl) {
      params.push(`linkUrl=${encodeURIComponent(this.advertisData.linkUrl)}`);
    }
    if (this.advertisData.connectionType) {
      params.push(`type=${encodeURIComponent(this.advertisData.connectionType)}`);
    }
    if (this.advertisData.linkType) {
      params.push(`linkType=${encodeURIComponent(this.advertisData.linkType)}`);
    }

    // 如果没有 id，才传递富文本内容（避免 URL 过长）
    // 注意：details 和 content 可能包含很长的 HTML，如果 URL 过长可能导致分享失败
    // 建议优先使用 id 通过接口获取详情
    // 只传递较短的富文本内容（限制长度避免 URL 过长）
    if (this.advertisData.details) {
      const detailsStr = String(this.advertisData.details);
      // 如果内容过长，截取前 500 个字符
      const truncatedDetails = detailsStr;
      params.push(`details=${encodeURIComponent(truncatedDetails)}`);
    }
    if (this.advertisData.content) {
      const contentStr = String(this.advertisData.content);
      const truncatedContent = contentStr;
      params.push(`content=${encodeURIComponent(truncatedContent)}`);
    }

    // 构建完整的分享路径
    let sharePath = '/pages/advertisDetail/advertisDetail';
    if (params.length > 0) {
      sharePath += '?' + params.join('&');
    }

    // 使用广告标题作为分享标题，如果没有则使用小程序名称
    const shareTitle = this.advertisData.title || this.getWxAppName();

    // 构建分享对象
    const shareConfig = {
      title: shareTitle,
      path: sharePath
    };

    // 如果有图片，添加分享图片
    if (this.advertisData.image) {
      shareConfig.imageUrl = this.advertisData.image;
    }

    return shareConfig;
  },
  onShareTimeline() {
    return {
      title: this.getWxAppName(),
      path: '/pages/advertisDetail/advertisDetail?id=' + this.advertisData.id
    }
  },
  onLoad(options) {
    console.log('接收到的参数:', options);

    // 从URL参数中获取数据
    if (options.id) {
      this.advertisData.id = options.id;
    }
    if (options.title) {
      this.advertisData.title = decodeURIComponent(options.title);
      this.pageTitle = this.advertisData.title;
    }
    if (options.time || options.timeS) {
      this.advertisData.setupTime = options.time || options.timeS;
    }
    if (options.status) {
      this.advertisData.status = options.status;
    }
    if (options.details) {
      this.advertisData.details = this.formatRichText(decodeURIComponent(options.details));
    }
    if (options.content) {
      this.advertisData.content = this.formatRichText(decodeURIComponent(options.content));
    }
    if (options.image) {
      this.advertisData.image = decodeURIComponent(options.image);
    }
    if (options.link) {
      this.advertisData.advertisingLink = decodeURIComponent(options.link);
    }
    if (options.linkUrl) {
      this.advertisData.linkUrl = decodeURIComponent(options.linkUrl);
    }
    if (options.type) {
      this.advertisData.connectionType = options.type;
    }
    if (options.linkType) {
      this.advertisData.linkType = options.linkType;
    }

    // 如果有id，可以调用接口获取详细信息
    if (this.advertisData.id) {
      this.getAdvertisDetail();
    }
  },
  methods: {
    handleNavBack,

    // 拨打客服电话：复用全局客服信息弹窗（含工作时间与拨号）
    handleCallService() {
      contactCustomerService();
    },

    // 获取小程序名称
    getWxAppName() {
      return globalData.wxAppName;
    },

    // 格式化富文本内容，给图片添加样式
    formatRichText(html) {
      if (!html) return '';

      // 给 img 标签添加样式，使其自适应屏幕宽度
      let formattedHtml = html.replace(
          /<img([^>]*?)>/gi,
          (match, attrs) => {
            // 检查是否已经有 style 属性
            if (attrs.indexOf('style=') > -1) {
              // 如果已有 style，追加样式
              return match.replace(
                  /style=["']([^"']*?)["']/gi,
                  'style="$1; max-width: 100% !important; height: auto !important; display: block; margin: 10px 0;"'
              );
            } else {
              // 如果没有 style，添加 style 属性
              return `<img${attrs} style="max-width: 100% !important; width: 100% !important; height: auto !important; display: block; margin: 10px 0;">`;
            }
          }
      );

      // 处理 p 标签，确保没有固定宽度
      formattedHtml = formattedHtml.replace(
          /<p([^>]*?)>/gi,
          '<p style="max-width: 100%; word-wrap: break-word;">'
      );

      console.log('格式化后的 HTML:', formattedHtml);
      return formattedHtml;
    },

    // 获取广告详情（如果后端有接口的话）
    async getAdvertisDetail() {
      // 这里可以调用接口获取详情
      // 示例代码（需要根据实际接口调整）
      // try {
      // 	const res = await getAdvertisingDetail({ id: this.advertisData.id });
      // 	if (res.code === 0) {
      // 		this.advertisData = { ...this.advertisData, ...res.data };
      // 		// 格式化富文本内容
      // 		if (this.advertisData.details) {
      // 			this.advertisData.details = this.formatRichText(this.advertisData.details);
      // 		}
      // 		if (this.advertisData.content) {
      // 			this.advertisData.content = this.formatRichText(this.advertisData.content);
      // 		}
      // 	}
      // } catch (error) {
      // 	console.error('获取广告详情失败:', error);
      // }
    },

    // 跳转到外链
    goToLink() {
      const link = this.advertisData.advertisingLink || this.advertisData.linkUrl;
      if (!link) {
        uni.showToast({
          title: '链接地址为空',
          icon: 'none'
        });
        return;
      }

      // #ifdef APP-PLUS
      plus.runtime.openURL(link);
      // #endif

      // #ifdef H5
      window.open(link);
      // #endif

      // #ifdef MP-WEIXIN
      // 小程序环境：使用 webView 组件打开外链
      uni.navigateTo({
        url: '/components/webView/webView?link=' + encodeURIComponent(link)
      });
      // #endif
    }
  }
};
</script>

<style lang="less" scoped>
.container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  /* 给底部浮动客服条留出空间，避免遮挡内容 */
  padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
}

/* 底部浮动客服条：左「客服电话」右「在线客服」 */
.service-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  display: flex;
  gap: 20rpx;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background-color: #fff;
  box-shadow: 0 -2rpx 16rpx rgba(15, 23, 42, 0.08);
}

.service-bar-item {
  flex: 1;
  height: 84rpx;
  margin: 0;
  padding: 0;
  border-radius: 42rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  line-height: 1;
  overflow: hidden;

  /* 小程序 button 默认带 ::after 边框，统一清掉 */
  &::after {
    border: none;
  }
}

.service-bar-text {
  font-size: 30rpx;
  font-weight: bold;
  letter-spacing: 1rpx;
}

/* 左侧：客服电话，浅蓝底描边 */
.phone-item {
  color: #1D6FE8;
  background-color: #EAF3FF;
  border: 2rpx solid #BBD8FF;
}

/* 右侧：在线客服，主色渐变 */
.online-item {
  color: #FFFFFF;
  background: linear-gradient(135deg, #4E9BFF 0%, #1D6FE8 62%, #1A5FD0 100%);
  border: none;
  box-shadow: 0 6rpx 16rpx rgba(29, 111, 232, 0.28);
}

.service-bar-hover {
  transform: scale(0.97);
  opacity: 0.92;
}

.content {
  padding: 20rpx;
}

.header {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;

  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    line-height: 1.5;
    margin-bottom: 20rpx;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .time {
      font-size: 24rpx;
      color: #999;
    }

    .status {
      font-size: 24rpx;
      color: #fff;
      background-color: #07c160;
      padding: 4rpx 16rpx;
      border-radius: 8rpx;
    }
  }
}

.detail-content {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 16rpx;
  min-height: 400rpx;

  .image-container {
    margin-top: 20rpx;
  }

  .empty-tip {
    text-align: center;
    padding: 100rpx 0;
    color: #999;
    font-size: 28rpx;
  }
}

.bottom-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

  .link-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 32rpx;
    border-radius: 44rpx;
    border: none;
  }
}

// 富文本样式 - 使用多种兼容方式
.detail-content {
  // 方式1: 使用 /deep/
  /deep/ rich-text {
    img {
      max-width: 100% !important;
      width: 100% !important;
      height: auto !important;
      display: block !important;
      margin: 10rpx 0 !important;
    }

    p {
      max-width: 100% !important;
      line-height: 1.8;
      margin-bottom: 20rpx;
      color: #333;
      font-size: 28rpx;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
  }

  // 方式2: 使用 ::v-deep
  ::v-deep rich-text {
    img {
      max-width: 100% !important;
      width: 100% !important;
      height: auto !important;
      display: block !important;
      margin: 10rpx 0 !important;
    }

    p {
      max-width: 100% !important;
      line-height: 1.8;
      margin-bottom: 20rpx;
      color: #333;
      font-size: 28rpx;
    }
  }

  // 方式3: 直接针对 rich-text（Vue3 新语法）
  :deep(rich-text) {
    img {
      max-width: 100% !important;
      width: 100% !important;
      height: auto !important;
      display: block !important;
      margin: 10rpx 0 !important;
    }

    p {
      max-width: 100% !important;
      line-height: 1.8;
      margin-bottom: 20rpx;
      color: #333;
      font-size: 28rpx;
    }
  }
}
</style>

