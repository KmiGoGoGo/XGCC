<template>
  <button
      open-type="contact"
      :session-from="sessionFrom"
      :class="['customer-service-btn', customClass]"
  >
    <uv-icon :name="iconName" :size="iconSize" :color="iconColor"></uv-icon>
  </button>
</template>

<script>
export default {
  name: 'CustomerServiceButton',
  props: {
    // 会话来源
    sessionFrom: {
      type: String,
      default: 'home_page'
    },
    // 图标名称
    iconName: {
      type: String,
      default: 'server-fill'
    },
    // 图标大小
    iconSize: {
      type: [String, Number],
      default: 24
    },
    // 图标颜色
    iconColor: {
      type: String,
      default: '#000'
    },
    // 自定义类名
    customClass: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.customer-service-btn {
  width: 55rpx;
  height: 55rpx;
  border-radius: 50%;
  background-color: #FEFFFF;
  opacity: 0.8;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 0;
  margin: 0;
  line-height: 1;
  /* 灰色外边框 */
  border: 1rpx solid #E5E7EB;
}
</style>

