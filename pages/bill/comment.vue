<template>
  <view class="comment-page">
    <!-- 订单信息卡片 -->
    <view class="order-info-card">
      <view class="card-title">订单信息</view>
       <view class="order-details" v-if="!loading">
         <view class="detail-row">
           <text class="detail-label">充电车辆:</text>
           <text class="detail-value">{{ billDetail.plateNo || '-' }}</text>
         </view>
         <view class="detail-row">
           <text class="detail-label">订单编号:</text>
           <view class="detail-with-action">
             <uv-tooltip 
               :text="billDetail.busShowNo || ''" 
               :copyText="billDetail.busShowNo || ''"
               :showCopy="true"
               :showToast="true"
               overlay
             >
               <text class="detail-value order-number">{{ billDetail.busShowNo || '-' }}</text>
             </uv-tooltip>
           </view>
         </view>
        <view class="detail-row">
          <text class="detail-label">充电电站:</text>
          <text class="detail-value">{{ billDetail.stationName || '-' }}</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">充电桩枪:</text>
          <text class="detail-value">{{ billDetail.gunName || '-' }}</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">实付金额:</text>
          <text class="price-value">¥ {{ (billDetail.actualBalance / 100).toFixed(2) || '0.00' }}</text>
        </view>
       </view>
       
       <!-- 加载状态 -->
       <view class="loading-container" v-if="loading">
         <view class="loading-item">
           <view class="skeleton-line short"></view>
           <view class="skeleton-line"></view>
         </view>
         <view class="loading-item">
           <view class="skeleton-line short"></view>
           <view class="skeleton-line"></view>
         </view>
         <view class="loading-item">
           <view class="skeleton-line short"></view>
           <view class="skeleton-line"></view>
         </view>
         <view class="loading-item">
           <view class="skeleton-line short"></view>
           <view class="skeleton-line"></view>
         </view>
         <view class="loading-item">
           <view class="skeleton-line short"></view>
           <view class="skeleton-line"></view>
         </view>
       </view>
    </view>

    <!-- 评价卡片 -->
    <view class="review-card">
      <view class="card-title">评价</view>
      
      <!-- 评分区域 -->
      <view class="rating-section">
        <text class="rating-label">评分</text>
        <view class="rating-container">
          <uv-rate 
            v-model="rating" 
            :count="5" 
            active-color="#F59E0B" 
            inactive-color="#E5E7EB"
            size="24"
            @change="handleRatingChange"
          />
          <text class="rating-text">{{ ratingText }}</text>
        </view>
      </view>

      <!-- 评论输入区域 -->
      <view class="comment-section">
        <uv-textarea 
          v-model="commentText"
          placeholder="请输入内容"
          :maxlength="200"
          :show-confirm-bar="false"
          height="128"
          custom-style="background-color: #F8F9FA; border-radius: 12rpx; border: 1px solid #E5E7EB;"
        />
      </view>

      <!-- 图片上传区域 -->
      <view class="upload-section">
        <uv-upload
          :file-list="fileList"
          @afterRead="afterRead"
          @delete="deleteFile"
          name="1"
          multiple
          :max-count="9"
          :preview-full-image="true"
          width="144"
          height="144"
        />
        
        <!-- 上传状态提示 -->
        <view v-if="uploadingImages.length > 0" class="upload-status">
          <text class="upload-status-text">正在上传 {{ uploadingImages.length }} 张图片...</text>
        </view>
      </view>
    </view>

    <!-- 底部提交按钮 -->
    <view class="submit-section">
      <uv-button 
        type="primary" 
        shape="circle"
        size="large"
        :text="submitting ? '提交中...' : '评论'"
        :loading="submitting"
        :disabled="submitting"
        custom-style="background: #0052FF; height: 96rpx; border-radius: 48rpx;"
        @click="submitComment"
      />
    </view>
  </view>
</template>

<script>
import { getBillDetailById, billComment } from '@/api/bill.js'
import { upload } from '@/api/member.js'
import globalData from '../../globalData'

export default {
  name: 'CommentPage',
  data() {
    return {
      loading: true,
      submitting: false, // 提交中状态
      billId: '',
      billDetail: {},
      rating: 5,
      commentText: '',
      fileList: [],
      uploadingImages: [], // 记录正在上传的图片
      ratingTexts: ['很差', '较差', '一般', '很好', '非常好']
    }
  },
  computed: {
    ratingText() {
      return this.ratingTexts[this.rating - 1] || ''
    },
    // 用于显示的文件列表（包含上传状态）
    displayFileList() {
      return this.fileList
    }
  },
  onLoad(options) {
    this.billId = options.billId || options.id
    if (this.billId) {
      this.getBillDetail()
    } else {
      uni.showToast({
        title: '缺少订单ID',
        icon: 'error'
      })
    }
  },
  methods: {
    async getBillDetail() {
      try {
        this.loading = true
        const res = await getBillDetailById(this.billId)
        
        if (res.code === 0 && res.data) {
          this.billDetail = res.data
        } else {
          uni.showToast({
            title: res.message || '获取订单详情失败',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('获取订单详情失败:', error)
        uni.showToast({
          title: '获取订单详情失败',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },
    
    handleRatingChange(value) {
      this.rating = value
    },
    
    async afterRead(event) {
      // 当选择图片后触发
      const { file } = event
      const files = Array.isArray(file) ? file : [file]
      
      for (let singleFile of files) {
        const tempIndex = this.fileList.length
        
        // 先添加一个临时的图片项，显示上传中状态
        this.fileList.push({
          url: singleFile.url, // 本地临时路径用于预览
          name: singleFile.name,
          uploading: true, // 标记为上传中
          failed: false,
          tempUrl: singleFile.url // 保存本地临时路径
        })
        
        // 记录正在上传的图片索引
        this.uploadingImages.push(tempIndex)
        
        try {
          // 对于uni-app，需要使用uni.uploadFile
          const uploadResult = await this.uploadImage(singleFile)
          
          if (uploadResult.code === 0 && uploadResult.data) {
            // 上传成功，更新图片URL
            this.$set(this.fileList, tempIndex, {
              url: uploadResult.data, // 使用服务器返回的URL
              name: singleFile.name,
              uploading: false,
              failed: false,
              serverUrl: uploadResult.data
            })
            
            // 移除上传中标记
            const uploadingIndex = this.uploadingImages.indexOf(tempIndex)
            if (uploadingIndex > -1) {
              this.uploadingImages.splice(uploadingIndex, 1)
            }
            
            uni.showToast({
              title: '上传成功',
              icon: 'success',
              duration: 1500
            })
          } else {
            throw new Error(uploadResult.msg || '上传失败')
          }
        } catch (error) {
          console.error('图片上传失败:', error)
          
          // 上传失败，标记为失败状态而不是删除
          this.$set(this.fileList, tempIndex, {
            ...this.fileList[tempIndex],
            uploading: false,
            failed: true
          })
          
          // 移除上传中标记
          const uploadingIndex = this.uploadingImages.indexOf(tempIndex)
          if (uploadingIndex > -1) {
            this.uploadingImages.splice(uploadingIndex, 1)
          }
          
          uni.showToast({
            title: error.message || '上传失败，请重试',
            icon: 'error',
            duration: 2000
          })
        }
      }
    },
    
    // 封装图片上传方法
    uploadImage(file) {
      return new Promise((resolve, reject) => {
        uni.uploadFile({
          url: global.URL + '/api-service/common/upload',
          filePath: file.url,
          name: 'file',
          header: {
            // 如果需要token验证，在这里添加
            // 'Authorization': 'Bearer ' + uni.getStorageSync('token')
          },
          success: (res) => {
            try {
              const result = JSON.parse(res.data)
              resolve(result)
            } catch (e) {
              reject(new Error('响应数据解析失败'))
            }
          },
          fail: (err) => {
            reject(err)
          }
        })
      })
    },
    
    deleteFile(event) {
      // 删除图片
      this.fileList.splice(event.index, 1)
    },
    
     async submitComment() {
       if (!this.commentText.trim()) {
         uni.showToast({
           title: '请输入评论内容',
           icon: 'none'
         })
         return
       }
       
       // 检查是否有图片正在上传
       if (this.uploadingImages.length > 0) {
         uni.showToast({
           title: '图片上传中，请稍后',
           icon: 'loading',
           duration: 2000
         })
         return
       }
       
       if (this.submitting) {
         return
       }
       
       try {
         this.submitting = true
         
         // 只提交已成功上传的图片URL，取第一张图片
         const uploadedImages = this.fileList
           .filter(item => !item.uploading && !item.failed && item.serverUrl)
           .map(item => item.serverUrl)
         
         // 按照接口要求的格式组装请求数据
         const requestData = {
           busId: this.billDetail.busId, // 使用订单编号作为busId
           commentCode: this.rating,
           taglibList: [],
           content: this.commentText,
           img: uploadedImages.length > 0 ? uploadedImages[0] : '' // 只取第一张图片
         }
         
         console.log('提交评论请求数据:', requestData)
         
         const res = await billComment(requestData)
         
         if (res.code === 0 && res.success) {
           uni.showToast({
             title: '评论提交成功',
             icon: 'success'
           })
           
           // 延迟返回上一页
           setTimeout(() => {
             uni.navigateBack()
           }, 1500)
         } else {
           throw new Error(res.msg || '评论提交失败')
         }
       } catch (error) {
         console.error('评论提交失败:', error)
         uni.showToast({
           title: error.message || '评论提交失败，请重试',
           icon: 'error',
           duration: 2000
         })
       } finally {
         this.submitting = false
       }
     }
  }
}
</script>

<style lang="scss" scoped>
.comment-page {
  min-height: 100vh;
  background-color: #F0F8FF;
  padding: 32rpx;
  padding-bottom: 180rpx;
}

.order-info-card,
.review-card {
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 48rpx;
  margin-bottom: 48rpx;
//   box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.card-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 32rpx;
}

.order-details {
  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    font-size: 28rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .detail-label {
    color: #6B7280;
  }
  
  .detail-value {
    color: #1F2937;
    font-weight: 500;
  }
  
  .detail-with-action {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }
  
   .order-number {
     color: #1F2937;
     font-weight: 500;
     position: relative;
     
     &::after {
       content: '';
       position: absolute;
       bottom: -2rpx;
       left: 0;
       right: 0;
       height: 1rpx;
       background-color: #D1D5DB;
       border-style: dashed;
     }
   }
  
  .price-value {
    color: #EF4444;
    font-weight: 700;
    font-size: 32rpx;
  }
}

.rating-section {
  margin-bottom: 32rpx;
  
  .rating-label {
    font-size: 28rpx;
    color: #6B7280;
    margin-bottom: 16rpx;
    display: block;
  }
  
  .rating-container {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }
  
  .rating-text {
    color: #F59E0B;
    font-weight: 500;
    font-size: 28rpx;
  }
}

.comment-section {
  margin-bottom: 32rpx;
}

.upload-section {
  margin-top: 32rpx;
  
  .upload-status {
    margin-top: 16rpx;
    padding: 16rpx;
    background-color: rgba(0, 82, 255, 0.1);
    border-radius: 12rpx;
    text-align: center;
  }
  
  .upload-status-text {
    color: #0052FF;
    font-size: 28rpx;
  }
}

.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32rpx;
  background-color: #F0F8FF;
  border-top: 1rpx solid rgba(229, 231, 235, 0.5);
}

/* 骨架屏样式 */
.loading-container {
  .loading-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .skeleton-line {
    height: 32rpx;
    background-color: #F3F4F6;
    border-radius: 4rpx;
    flex: 1;
    animation: skeleton-loading 1.2s ease-in-out infinite;
    
    &.short {
      width: 120rpx;
      flex: none;
      margin-right: 32rpx;
    }
  }
}

@keyframes skeleton-loading {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}
</style>
