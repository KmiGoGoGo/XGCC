<template>
  <view class="invoice-form-container">
    <uv-form ref="formRef" :model="formData" :rules="rules" labelPosition="top" labelWidth="auto">
      
      <!-- 发票信息填写 -->
      <view class="form-section">
        <view class="section-title">发票信息填写</view>
        
         <!-- 发票类型 -->
         <uv-form-item label="发票类型" prop="invoiceType" required>
           <uv-radio-group 
             v-model="formData.invoiceType" 
             placement="row"
             @change="onInvoiceTypeChange"
           >
             <uv-radio 
               name="1" 
               label="电子普票"
               activeColor="#007AFF"
             ></uv-radio>
             <uv-radio 
               name="2" 
               label="电子专票"
               activeColor="#007AFF"
             ></uv-radio>
           </uv-radio-group>
         </uv-form-item>
        
         <!-- 抬头类型 -->
         <uv-form-item label="抬头类型" prop="invoiceRiseTypeEnum" required>
           <uv-radio-group 
             v-model="formData.invoiceRiseTypeEnum" 
             placement="row"
             @change="onHeaderTypeChange"
           >
             <uv-radio 
               name="1" 
               label="企业单位"
               activeColor="#007AFF"
             ></uv-radio>
             <uv-radio 
               name="2" 
               label="个人或非企业单位"
               activeColor="#007AFF"
             ></uv-radio>
           </uv-radio-group>
         </uv-form-item>
        
         <!-- 发票抬头 -->
         <uv-form-item label="发票抬头" prop="invoiceRise" required>
           <uv-input 
             v-model="formData.invoiceRise"
             placeholder="请输入抬头"
             border="surround"
             customStyle="height: 80rpx;"
           ></uv-input>
         </uv-form-item>
         
         <!-- 税号 - 只有企业单位时才必填 -->
         <uv-form-item 
           label="税号" 
           prop="dutyParagraph" 
           :required="isCompanyType"
         >
           <uv-input 
             v-model="formData.dutyParagraph"
             placeholder="请输入税号"
             border="surround"
             customStyle="height: 80rpx;"
           ></uv-input>
         </uv-form-item>
        
         <!-- 电子专票额外字段 -->
         <template v-if="isElectronicSpecial">
           <!-- 注册地址 -->
           <uv-form-item label="注册地址" prop="address">
             <uv-input 
               v-model="formData.address"
               placeholder="请输入注册地址"
               border="surround"
               customStyle="height: 80rpx;"
             ></uv-input>
           </uv-form-item>
           
           <!-- 注册电话 -->
           <uv-form-item label="注册电话" prop="registerTel">
             <uv-input 
               v-model="formData.registerTel"
               placeholder="请输入注册电话"
               border="surround"
               customStyle="height: 80rpx;"
             ></uv-input>
           </uv-form-item>
           
           <!-- 开户银行 -->
           <uv-form-item label="开户银行" prop="openingBank">
             <uv-input 
               v-model="formData.openingBank"
               placeholder="请输入开户银行"
               border="surround"
               customStyle="height: 80rpx;"
             ></uv-input>
           </uv-form-item>
           
           <!-- 银行账户 -->
           <uv-form-item label="银行账户" prop="openingBankAccount">
             <uv-input 
               v-model="formData.openingBankAccount"
               placeholder="请输入银行账户"
               border="surround"
               customStyle="height: 80rpx;"
             ></uv-input>
           </uv-form-item>
         </template>
        
        <!-- 发票内容 -->
        <uv-form-item label="发票内容" prop="invoiceContent" required>
          <view class="content-display">充电服务及充电服务费</view>
        </uv-form-item>
        
         <!-- 发票金额 -->
         <uv-form-item label="发票金额" prop="totalBalance" required>
           <view class="amount-display">¥{{ formData.totalBalance }}</view>
         </uv-form-item>
         
         <!-- 备注信息 -->
         <uv-form-item label="备注信息" prop="invoiceApplyingNote">
           <uv-input 
             v-model="formData.invoiceApplyingNote"
             placeholder="请输入备注信息"
             border="surround"
             type="textarea"
             customStyle="height: 120rpx;"
           ></uv-input>
         </uv-form-item>
      </view>
      
      <!-- 接收方式 -->
      <view class="form-section">
        <view class="section-title">接收方式</view>
        
         <!-- 短信接收 -->
         <uv-form-item prop="acceptInvoiceType">
           <uv-radio-group 
             v-model="formData.acceptInvoiceType" 
             placement="column"
             @change="onDeliveryMethodChange"
           >
             <uv-radio 
               name="1" 
               activeColor="#007AFF"
               :customStyle="{ marginBottom: '20rpx' }"
             >
               <view class="delivery-option">
                 <view class="delivery-header">
                   <uv-icon name="checkmark-circle-fill" color="#22C55E" size="32rpx"></uv-icon>
                   <text class="delivery-label">短信接收</text>
                 </view>
                 <uv-input 
                   v-model="formData.phone"
                   placeholder="请输入手机号"
                   border="surround"
                   customStyle="height: 80rpx; margin-top: 20rpx;"
                   :disabled="formData.acceptInvoiceType !== '1'"
                 ></uv-input>
               </view>
             </uv-radio>
             
             <uv-radio 
               name="2" 
               activeColor="#007AFF"
             >
               <view class="delivery-option">
                 <view class="delivery-header">
                   <text class="delivery-label">电子邮箱</text>
                 </view>
                 <uv-input 
                   v-model="formData.email"
                   placeholder="请输入邮箱"
                   border="surround"
                   customStyle="height: 80rpx; margin-top: 20rpx;"
                   :disabled="formData.acceptInvoiceType !== '2'"
                 ></uv-input>
               </view>
             </uv-radio>
           </uv-radio-group>
         </uv-form-item>
        
        <!-- 提示信息 -->
        <view class="notice-text">
          备注：电子发票具有法律会计凭证效力，请注意验收(一般会在24小时内完成)
        </view>
      </view>
    </uv-form>
    
    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <uv-button 
        type="primary" 
        size="large"
        @click="submitForm"
        customStyle="height: 88rpx; border-radius: 44rpx;"
      >
        提交开票申请
      </uv-button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'InvoiceForm',
   data() {
     return {
       selectedItems: [],
       totalSelectedAmount: null,
       formData: {
         invoiceRiseTypeEnum: '1', // 抬头类型: 1-企业单位, 2-个人或非企业单位
         invoiceRise: '', // 发票抬头
         totalBalance: 0, // 发票金额(分)
         invoiceApplyingNote: '', // 备注信息
         dutyParagraph: '', // 税号
         email: '', // 邮箱
         invoiceItem1: '', // 发票内容1
         invoiceItem2: '', // 发票内容2
         billIds: [], // 订单ID列表
         billTotal: 0, // 订单总数
         invoiceType: '1', // 发票类型: 1-电子普票, 2-电子专票
         acceptInvoiceType: '1', // 接收方式: 1-短信, 2-邮箱
         address: '', // 注册地址 (专票时显示)
         phone: '15576753954', // 手机号
         openingBank: '', // 开户银行 (专票时显示)
         openingBankAccount: '', // 银行账户 (专票时显示)
         registerTel: '' // 注册电话 (专票时显示)
       },
       rules: {
         invoiceType: {
           required: true,
           message: '请选择发票类型',
           trigger: ['change']
         },
         invoiceRiseTypeEnum: {
           required: true,
           message: '请选择抬头类型',
           trigger: ['change']
         },
         invoiceRise: {
           required: true,
           message: '请输入发票抬头',
           trigger: ['blur']
         },
         dutyParagraph: {
           required: this.isCompanyType,
           message: '请输入税号',
           trigger: ['blur']
         },
         acceptInvoiceType: {
           required: true,
           message: '请选择接收方式',
           trigger: ['change']
         }
       }
    }
  },
  
   computed: {
     // 是否为企业单位
     isCompanyType() {
       return this.formData.invoiceRiseTypeEnum === '1'
     },
     
     // 是否为电子专票
     isElectronicSpecial() {
       return this.formData.invoiceType === '2'
     }
   },
  
  watch: {
    // 监听抬头类型变化，更新税号校验规则
    isCompanyType(newVal) {
      this.updateTaxNumberRule(newVal)
    }
  },

   onLoad(options) {
     console.log('options', options)
     if (options.selectedItems) {
       this.selectedItems = options.selectedItems.split(',')
       this.formData.billIds = this.selectedItems.map(id => parseInt(id))
       this.formData.billTotal = this.selectedItems.length
     }
     if (options.totalSelectedAmount) {
       this.formData.totalBalance = options.totalSelectedAmount // 转换为分
     }
   },
  
  methods: {
     // 发票类型变化
     onInvoiceTypeChange(value) {
       console.log('发票类型变化:', value)
       // 切换发票类型时，清空专票相关字段
       if (value !== '2') {
         this.formData.address = ''
         this.formData.registerTel = ''
         this.formData.openingBank = ''
         this.formData.openingBankAccount = ''
       }
     },
     
     // 抬头类型变化
     onHeaderTypeChange(value) {
       console.log('抬头类型变化:', value)
       // 如果不是企业单位，清空税号
       if (value !== '1') {
         this.formData.dutyParagraph = ''
       }
     },
     
     // 接收方式变化
     onDeliveryMethodChange(value) {
       console.log('接收方式变化:', value)
       // 切换接收方式时，清空对应字段
       if (value === '1') {
         this.formData.email = ''
       } else if (value === '2') {
         this.formData.phone = ''
       }
     },
    
     // 更新税号校验规则
     updateTaxNumberRule(isRequired) {
       this.rules.dutyParagraph.required = isRequired
       // 如果税号不再必填，清除可能的校验错误
       if (!isRequired) {
         this.$refs.formRef && this.$refs.formRef.clearValidate(['dutyParagraph'])
       }
     },
    
    // 提交表单
    async submitForm() {
      try {
        // 表单校验
        const isValid = await this.$refs.formRef.validate()
        if (!isValid) {
          return
        }
        
         // 检查接收方式对应的联系方式
         if (this.formData.acceptInvoiceType === '1' && !this.formData.phone) {
           uni.showToast({
             title: '请输入手机号',
             icon: 'none'
           })
           return
         }
         
         if (this.formData.acceptInvoiceType === '2' && !this.formData.email) {
           uni.showToast({
             title: '请输入邮箱',
             icon: 'none'
           })
           return
         }
        
        // 提交数据
        console.log('提交数据:', this.formData)
        
        uni.showToast({
          title: '开票申请提交成功',
          icon: 'success'
        })
        
        // 延迟返回上一页
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
        
      } catch (error) {
        console.error('表单校验失败:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.invoice-form-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.form-section {
  background: #fff;
  margin-bottom: 20rpx;
  padding: 30rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 30rpx;
    padding-bottom: 20rpx;
    border-bottom: 2rpx solid #f0f0f0;
  }
}

.content-display, .amount-display {
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #333;
}

.amount-display {
  color: #ff6b35;
  font-weight: 600;
  font-size: 32rpx;
}

.delivery-option {
  width: 100%;
  
  .delivery-header {
    display: flex;
    align-items: center;
    gap: 10rpx;
    
    .delivery-label {
      font-size: 28rpx;
      color: #333;
    }
  }
}

.notice-text {
  margin-top: 30rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 30rpx;
  border-top: 1rpx solid #eee;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

// 自定义样式覆盖
:deep(.uv-form-item__label) {
  font-weight: 600 !important;
  color: #333 !important;
}

:deep(.uv-radio-group) {
  .uv-radio {
    margin-right: 40rpx;
  }
}

:deep(.uv-checkbox-group) {
  .uv-checkbox {
    margin-right: 40rpx;
  }
}
</style>
