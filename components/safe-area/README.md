# 安全区域组件 (SafeArea)

一个通用的安全区域组件，用于处理自定义导航栏、状态栏等固定元素遮挡主内容区域的问题。

## 功能特性

- ✅ 自动计算状态栏高度
- ✅ 自动计算导航栏高度
- ✅ 支持搜索栏高度计算
- ✅ 支持自定义偏移量
- ✅ 支持底部安全区域
- ✅ 响应式适配不同设备

## 使用方法

### 1. 基础用法

```vue
<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <custom-navigation :title="title" />
    
    <!-- 使用安全区域组件包装主内容 -->
    <safe-area>
      <view class="content">
        <!-- 页面内容 -->
      </view>
    </safe-area>
  </view>
</template>

<script>
import SafeArea from '@/components/safe-area/safe-area.vue'

export default {
  components: {
    SafeArea
  }
}
</script>
```

### 2. 高级用法

```vue
<template>
  <view class="page">
    <custom-navigation :title="title" :show-search="true" />
    
    <!-- 包含搜索栏的安全区域 -->
    <safe-area 
      :include-search-bar="true"
      :top-offset="10"
      :bottom-offset="20"
    >
      <view class="content">
        <!-- 页面内容 -->
      </view>
    </safe-area>
  </view>
</template>
```

### 3. 组件属性 (Props)

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| includeStatusBar | Boolean | true | 是否包含状态栏高度 |
| includeNavBar | Boolean | true | 是否包含导航栏高度 |
| includeSearchBar | Boolean | false | 是否包含搜索栏高度 |
| topOffset | Number | 0 | 自定义顶部偏移量(px) |
| bottomOffset | Number | 0 | 自定义底部偏移量(px) |

### 4. 方法

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| updateSearchBarHeight | height: Number | void | 更新搜索栏高度 |
| getSafeAreaHeight | - | Number | 获取当前安全区域高度 |

### 5. 使用场景

#### 场景1：普通页面
```vue
<safe-area>
  <view class="content">页面内容</view>
</safe-area>
```

#### 场景2：带搜索栏的页面
```vue
<safe-area :include-search-bar="true">
  <view class="content">页面内容</view>
</safe-area>
```

#### 场景3：自定义偏移
```vue
<safe-area :top-offset="20" :bottom-offset="10">
  <view class="content">页面内容</view>
</safe-area>
```

#### 场景4：只包含状态栏
```vue
<safe-area :include-nav-bar="false">
  <view class="content">页面内容</view>
</safe-area>
```

## 技术实现

### 高度计算逻辑

```javascript
// 顶部安全区域计算
let top = 0;

if (includeStatusBar) {
  top += statusBarHeight; // 状态栏高度
}

if (includeNavBar) {
  top += navBarHeight; // 导航栏高度 (44px)
}

if (includeSearchBar) {
  top += searchBarHeight; // 搜索栏高度 (70rpx)
}

top += topOffset; // 自定义偏移量

// 底部安全区域计算
let bottom = bottomOffset;
if (systemInfo.safeAreaInsets) {
  bottom += systemInfo.safeAreaInsets.bottom; // 底部安全区域
}
```

### 系统信息获取

组件会自动获取以下系统信息：
- `statusBarHeight`: 状态栏高度
- `safeAreaInsets`: 安全区域信息
- 设备类型和屏幕尺寸

## 注意事项

1. **导航栏高度**：默认设置为44px，这是iOS和Android的标准导航栏高度
2. **搜索栏高度**：默认设置为70rpx，可根据实际设计调整
3. **响应式适配**：组件会自动适配不同设备和屏幕尺寸
4. **性能优化**：系统信息只在组件初始化时获取一次

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基础安全区域计算
- 支持自定义偏移量
- 支持底部安全区域
