<template>
  <view class="invoice-form-container">
    <uv-navbar :border="false" :autoBack="false" placeholder safeAreaInsetTop @leftClick="handleNavBack">
      <template v-slot:right>
        <view style="margin-right: 200rpx; margin-bottom: 5rpx;">
          <CustomerServiceButton
              session-from="invoice_form_page"
              custom-class="server-icon-wrapper"
          />
        </view>
      </template>
    </uv-navbar>

    <view class="form-content">
      <uv-form ref="formRef" :model="formData" :rules="rules" labelPosition="top" labelWidth="auto">

        <!-- 发票类型 -->
        <view class="form-card">
          <view class="card-title">发票类型</view>
          <uv-form-item prop="invoiceType" required>
            <view class="radio-group-container">
              <uv-radio-group
                  v-model="formData.invoiceType"
                  placement="row"
                  @change="onInvoiceTypeChange"
              >
                <uv-radio
                    name="1"
                    label="电子普票"
                    activeColor="#13a4ec"
                ></uv-radio>
                <uv-radio
                    name="2"
                    label="电子专票"
                    activeColor="#13a4ec"
                ></uv-radio>
              </uv-radio-group>
            </view>
          </uv-form-item>
        </view>

        <!-- 抬头类型 -->
        <view class="form-card">
          <view class="card-title">抬头类型</view>
          <uv-form-item prop="invoiceRiseTypeEnum" required>
            <view class="radio-group-container">
              <uv-radio-group
                  v-model="formData.invoiceRiseTypeEnum"
                  placement="row"
                  @change="onHeaderTypeChange"
              >
                <uv-radio
                    name="1"
                    label="企业单位"
                    activeColor="#13a4ec"
                ></uv-radio>
                <uv-radio
                    name="2"
                    label="个人或非企业单位"
                    activeColor="#13a4ec"
                ></uv-radio>
              </uv-radio-group>
            </view>
          </uv-form-item>
        </view>

        <!-- 发票信息 -->
        <view class="form-card">
          <view class="form-row">
            <view class="form-label">发票抬头</view>
            <uv-input
                v-model="formData.invoiceRise"
                placeholder="请填写抬头名称"
                border="none"
                customStyle="flex: 1; background: transparent;"
            ></uv-input>
          </view>

          <view class="form-row">
            <view class="form-label">税号</view>
            <uv-input
                v-model="formData.dutyParagraph"
                placeholder="请填写纳税人识别号"
                border="none"
                customStyle="flex: 1; background: transparent;"
            ></uv-input>
          </view>

          <!-- 电子专票额外字段 -->
          <template v-if="isElectronicSpecial">
            <view class="form-row">
              <view class="form-label">注册地址</view>
              <uv-input
                  v-model="formData.address"
                  placeholder="请填写公司注册地址"
                  border="none"
                  customStyle="flex: 1; background: transparent;"
              ></uv-input>
            </view>

            <view class="form-row">
              <view class="form-label">注册电话</view>
              <uv-input
                  v-model="formData.registerTel"
                  placeholder="请填写公司注册电话"
                  border="none"
                  customStyle="flex: 1; background: transparent;"
              ></uv-input>
            </view>

            <view class="form-row">
              <view class="form-label">开户银行</view>
              <uv-input
                  v-model="formData.openingBank"
                  placeholder="请填写开户银行名称"
                  border="none"
                  customStyle="flex: 1; background: transparent;"
              ></uv-input>
            </view>

            <view class="form-row">
              <view class="form-label">银行账号</view>
              <uv-input
                  v-model="formData.openingBankAccount"
                  placeholder="请填写银行账号"
                  border="none"
                  customStyle="flex: 1; background: transparent;"
              ></uv-input>
            </view>
          </template>
        </view>

        <!-- 发票详情 -->
        <view class="form-card">
          <view class="form-row">
            <view class="form-label">发票内容</view>
            <view class="form-value">充电电费&充电服务费</view>
          </view>

          <view class="form-row">
            <view class="form-label">发票金额</view>
            <view class="amount-value">¥{{ formData.totalBalance }}</view>
          </view>
        </view>

        <!-- 备注信息 -->
        <view class="form-card">
          <view class="form-label">备注信息</view>
          <uv-input
              v-model="formData.invoiceApplyingNote"
              placeholder="选填"
              border="none"
              type="textarea"
              customStyle="width: 100%; background: transparent; margin-top: 16rpx; z-index: 0;"
          ></uv-input>
        </view>

        <!-- 接收方式 -->
        <view class="form-card">
          <view class="card-title">接收方式</view>
          <uv-form-item prop="acceptInvoiceType">
            <view class="delivery-options">
              <view
                  class="delivery-option"
                  :class="{ active: formData.acceptInvoiceType === '1' }"
                  @click="selectDeliveryMethod('1')"
              >
                <view class="delivery-info">
                  <view class="delivery-title">电子邮箱接收</view>
                  <view class="delivery-subtitle">通过邮箱接收电子发票</view>
                </view>
                <view class="radio-indicator"></view>
              </view>

              <view
                  class="delivery-option"
                  :class="{ active: formData.acceptInvoiceType === '2' }"
                  @click="selectDeliveryMethod('2')"
              >
                <view class="delivery-info">
                  <view class="delivery-title">短信接收</view>
                  <view class="delivery-subtitle">通过短信接收电子发票</view>
                </view>
                <view class="radio-indicator"></view>
              </view>
            </view>
          </uv-form-item>

          <!-- 邮箱输入框 -->
          <view v-if="formData.acceptInvoiceType === '1'" class="input-section">
            <view class="input-label">邮箱地址</view>
            <uv-input
                v-model="formData.email"
                placeholder="请输入邮箱地址"
                border="surround"
                customStyle="height: 88rpx; border-radius: 12rpx;"
                type="text"
            ></uv-input>
          </view>

          <!-- 手机号输入框 -->
          <view v-if="formData.acceptInvoiceType === '2'" class="input-section">
            <view class="input-label">手机号码</view>
            <uv-input
                v-model="formData.phone"
                placeholder="请输入手机号码"
                border="surround"
                customStyle="height: 88rpx; border-radius: 12rpx;"
                type="number"
                maxlength="11"
            ></uv-input>
          </view>
        </view>
      </uv-form>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <uv-button
          type="primary"
          size="large"
          @click="submitForm"
          customStyle="height: 88rpx; border-radius: 44rpx; background: linear-gradient(135deg, #13a4ec 0%, #3b82f6 100%); border: none; box-shadow: 0 8rpx 24rpx rgba(19, 164, 236, 0.3);"
      >
        确认提交
      </uv-button>
      <view class="submit-tip">
        电子发票开具后会发送至您选择的短信或邮箱，预计3-7个工作日内完成。
      </view>
    </view>
  </view>
</template>

<script>
import {applyInvoice} from '@/api/invoice'
import {contactCustomerService as contactCustomerServiceFn, handleNavBack} from '@/utils/utils'
import CustomerServiceButton from '@/components/common/CustomerServiceButton.vue';
import globalData from '@/globalData';

export default {
  components: {
    CustomerServiceButton
  },
  name: 'InvoiceForm',
  data() {
    return {
      selectedItems: [],
      totalSelectedAmount: null,
      formData: {
        invoiceRiseTypeEnum: '1', // 抬头类型: 1-企业单位, 2-个人或非企业单位
        invoiceRise: '', // 发票抬头
        invoiceBillType: "1", // 订单类型: 1-充电订单, 2-停车订单
        totalBalance: 0, // 发票金额(分)
        invoiceApplyingNote: '', // 备注信息
        dutyParagraph: '', // 税号
        email: '', // 邮箱
        invoiceItem1: '', // 发票内容1
        invoiceItem2: '', // 发票内容2
        billIds: [], // 订单ID列表
        billTotal: 0, // 订单总数
        invoiceType: '1', // 发票类型: 1-电子普票, 2-电子专票
        acceptInvoiceType: '1', // 接收方式: 1-邮箱, 2-手机号
        address: '', // 注册地址 (专票时显示)
        phone: '', // 手机号
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
          validator: (rule, value, callback) => {
            if (!value || value.trim() === '') {
              callback(new Error('发票抬头不能为空'))
            } else {
              callback()
            }
          },
          trigger: ['blur', 'change']
        },
        dutyParagraph: {
          required: this.isCompanyType,
          validator: (rule, value, callback) => {
            // 如果是企业单位，税号必填且最少6位
            if (this.isCompanyType) {
              if (!value || value.trim() === '') {
                callback(new Error('请输入税号'))
              } else if (value.trim().length < 6) {
                callback(new Error('税号最少6位'))
              } else {
                callback()
              }
            } else {
              callback()
            }
          },
          trigger: ['blur', 'change']
        },
        acceptInvoiceType: {
          required: true,
          message: '请选择接收方式',
          trigger: ['change']
        },
        phone: {
          required: this.isSmsDelivery,
          validator: (rule, value, callback) => {
            // 如果是短信接收，手机号必填且格式正确
            if (this.isSmsDelivery) {
              if (!value || value.trim() === '') {
                callback(new Error('请输入手机号码'))
              } else {
                // 手机号格式验证：11位数字，以1开头
                const phoneRegex = /^1[3-9]\d{9}$/
                if (!phoneRegex.test(value.trim())) {
                  callback(new Error('请输入正确的手机号格式'))
                } else {
                  callback()
                }
              }
            } else {
              callback()
            }
          },
          trigger: ['blur', 'change']
        },
        email: {
          required: this.isEmailDelivery,
          validator: (rule, value, callback) => {
            // 如果是邮箱接收，邮箱必填且格式正确
            if (this.isEmailDelivery) {
              if (!value || value.trim() === '') {
                callback(new Error('请输入邮箱地址'))
              } else {
                // 邮箱格式验证
                const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
                if (!emailRegex.test(value.trim())) {
                  callback(new Error('请输入正确的邮箱格式'))
                } else {
                  callback()
                }
              }
            } else {
              callback()
            }
          },
          trigger: ['blur', 'change']
        },
        // 电子专票字段验证
        address: {
          validator: (rule, value, callback) => {
            // 如果是电子专票，注册地址必填
            if (this.isElectronicSpecial) {
              if (!value || value.trim() === '') {
                callback(new Error('请输入注册地址'))
              } else {
                callback()
              }
            } else {
              callback()
            }
          },
          trigger: ['blur', 'change']
        },
        registerTel: {
          validator: (rule, value, callback) => {
            // 如果是电子专票，注册电话必填
            if (this.isElectronicSpecial) {
              if (!value || value.trim() === '') {
                callback(new Error('请输入注册电话'))
              } else {
                callback()
              }
            } else {
              callback()
            }
          },
          trigger: ['blur', 'change']
        },
        openingBank: {
          validator: (rule, value, callback) => {
            // 如果是电子专票，开户银行必填
            if (this.isElectronicSpecial) {
              if (!value || value.trim() === '') {
                callback(new Error('请输入开户银行'))
              } else {
                callback()
              }
            } else {
              callback()
            }
          },
          trigger: ['blur', 'change']
        },
        openingBankAccount: {
          validator: (rule, value, callback) => {
            // 如果是电子专票，银行账号必填
            if (this.isElectronicSpecial) {
              if (!value || value.trim() === '') {
                callback(new Error('请输入银行账号'))
              } else {
                callback()
              }
            } else {
              callback()
            }
          },
          trigger: ['blur', 'change']
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
    },

    // 是否为邮箱接收
    isEmailDelivery() {
      return this.formData.acceptInvoiceType === '1'
    },

    // 是否为短信接收
    isSmsDelivery() {
      return this.formData.acceptInvoiceType === '2'
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
      try {
        // 解析 JSON 字符串，selectedItems 现在是对象数组 [{id, unitId}]
        this.selectedItems = JSON.parse(decodeURIComponent(options.selectedItems))
        // 提取 id 数组用于 billIds
        this.formData.billIds = this.selectedItems.map(item => parseInt(item.id))
        this.formData.billTotal = this.selectedItems.length
      } catch (e) {
        console.error('解析 selectedItems 失败:', e)
        // 兼容旧格式（逗号分隔的 id 字符串）
        const ids = options.selectedItems.split(',')
        this.selectedItems = ids.map(id => ({id: parseInt(id), unitId: null}))
        this.formData.billIds = ids.map(id => parseInt(id))
        this.formData.billTotal = ids.length
      }
    }
    if (options.totalSelectedAmount) {
      this.formData.totalBalance = options.totalSelectedAmount // 转换为分
    }
  },
  onShareAppMessage() {
    return {
      title: this.getWxAppName(),
      path: '/pages/index/index'
    }
  },
  onShareTimeline() {
    return {
      title: this.getWxAppName(),
      path: '/pages/index/index'
    }
  },
  methods: {
    handleNavBack,
    getWxAppName() {
      return globalData.wxAppName;
    },
    contactCustomerService() {
      contactCustomerServiceFn()
    },
    // 发票类型变化
    onInvoiceTypeChange(value) {
      console.log('发票类型变化:', value)
      // 切换发票类型时，清空专票相关字段并清除验证错误
      if (value !== '2') {
        this.formData.address = ''
        this.formData.registerTel = ''
        this.formData.openingBank = ''
        this.formData.openingBankAccount = ''
        // 清除专票字段的验证错误
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate(['address', 'registerTel', 'openingBank', 'openingBankAccount'])
        }
      }
    },

    // 抬头类型变化
    onHeaderTypeChange(value) {
      console.log('抬头类型变化:', value)
      // 如果不是企业单位，清空税号并清除验证错误
      if (value !== '1') {
        this.formData.dutyParagraph = ''
        // 清除税号的验证错误
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate(['dutyParagraph'])
        }
      }
    },

    // 接收方式变化
    onDeliveryMethodChange(value) {
      console.log('接收方式变化:', value)
      // 切换接收方式时，清空对应字段并清除验证错误
      // 1-邮箱接收，2-手机号接收
      if (value === '1') {
        this.formData.phone = '' // 切换到邮箱时，清空手机号
        // 清除手机号的验证错误
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate(['phone'])
        }
      } else if (value === '2') {
        this.formData.email = '' // 切换到手机号时，清空邮箱
        // 清除邮箱的验证错误
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate(['email'])
        }
      }
    },

    // 选择接收方式
    selectDeliveryMethod(value) {
      this.formData.acceptInvoiceType = value
      this.onDeliveryMethodChange(value)
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
        // 验证发票抬头不能为空
        if (!this.formData.invoiceRise || this.formData.invoiceRise.trim() === '') {
          uni.showToast({
            title: '发票抬头不能为空',
            icon: 'none'
          })
          return
        }

        // 验证税号（企业单位时必填且最少6位）
        if (this.isCompanyType) {
          if (!this.formData.dutyParagraph || this.formData.dutyParagraph.trim() === '') {
            uni.showToast({
              title: '请输入税号',
              icon: 'none'
            })
            return
          }
          if (this.formData.dutyParagraph.trim().length < 6) {
            uni.showToast({
              title: '税号最少6位',
              icon: 'none'
            })
            return
          }
        }

        // 验证电子专票字段（除了备注其他都不能为空）
        if (this.isElectronicSpecial) {
          if (!this.formData.address || this.formData.address.trim() === '') {
            uni.showToast({
              title: '请输入注册地址',
              icon: 'none'
            })
            return
          }
          if (!this.formData.registerTel || this.formData.registerTel.trim() === '') {
            uni.showToast({
              title: '请输入注册电话',
              icon: 'none'
            })
            return
          }
          if (!this.formData.openingBank || this.formData.openingBank.trim() === '') {
            uni.showToast({
              title: '请输入开户银行',
              icon: 'none'
            })
            return
          }
          if (!this.formData.openingBankAccount || this.formData.openingBankAccount.trim() === '') {
            uni.showToast({
              title: '请输入银行账号',
              icon: 'none'
            })
            return
          }
        }

        // 验证接收方式对应的联系方式
        if (this.formData.acceptInvoiceType === '1') {
          // 邮箱接收
          if (!this.formData.email || this.formData.email.trim() === '') {
            uni.showToast({
              title: '请输入邮箱地址',
              icon: 'none'
            })
            return
          }
          // 验证邮箱格式
          const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          if (!emailRegex.test(this.formData.email.trim())) {
            uni.showToast({
              title: '请输入正确的邮箱格式',
              icon: 'none'
            })
            return
          }
        } else if (this.formData.acceptInvoiceType === '2') {
          // 短信接收
          if (!this.formData.phone || this.formData.phone.trim() === '') {
            uni.showToast({
              title: '请输入手机号码',
              icon: 'none'
            })
            return
          }
          // 验证手机号格式
          const phoneRegex = /^1[3-9]\d{9}$/
          if (!phoneRegex.test(this.formData.phone.trim())) {
            uni.showToast({
              title: '请输入正确的手机号格式',
              icon: 'none'
            })
            return
          }
        }

        // 表单校验
        const isValid = await this.$refs.formRef.validate()
        if (!isValid) {
          return
        }

        // 构建请求数据
        // 前端和API映射一致：1-邮箱接收, 2-手机号接收
        const requestData = {
          invoiceBillType: this.formData.invoiceBillType, // 订单类型: 1-充电订单, 2-停车订单
          invoiceRiseTypeEnum: this.formData.invoiceRiseTypeEnum, // 抬头类型：1：企业 2：个人
          invoiceRise: this.formData.invoiceRise, // 发票抬头
          totalBalance: String(Math.round(Number(this.formData.totalBalance) * 100)), // 发票金额（转为字符串，避免精度丢失）
          invoiceApplyingNote: this.formData.invoiceApplyingNote || '', // 备注信息
          dutyParagraph: this.formData.dutyParagraph || '', // 税号
          email: this.formData.email || '', // 邮箱
          invoiceItem1: this.formData.invoiceItem1 || '', // 发票内容1
          invoiceItem2: this.formData.invoiceItem2 || '', // 发票内容2
          billIds: this.formData.billIds, // 订单ID列表
          billTotal: this.formData.billTotal, // 订单总数
          invoiceType: this.formData.invoiceType, // 发票类型：1-电子普票, 2-电子专票
          acceptInvoiceType: this.formData.acceptInvoiceType, // 接收方式：1-邮箱接收, 2-手机号接收
          address: this.formData.address || '', // 注册地址
          phone: this.formData.phone || '', // 手机号
          openingBank: this.formData.openingBank || '', // 开户银行
          openingBankAccount: this.formData.openingBankAccount || '', // 银行账号
          registerTel: this.formData.registerTel || '' // 注册电话
        }

        console.log('提交数据:', requestData)

        // 显示加载提示
        uni.showLoading({
          title: '提交中...',
          mask: true
        })

        // 调用API提交数据
        const res = await applyInvoice(requestData)

        // 隐藏加载提示
        uni.hideLoading()

        // 判断请求是否成功
        if (res && (res.success || res.code === 0)) {
          uni.showToast({
            title: '开票申请提交成功',
            icon: 'success'
          })

          // 延迟返回上一页
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          // 请求失败
          uni.showToast({
            title: res?.msg || '提交失败，请稍后重试',
            icon: 'none',
            duration: 2000
          })
        }

      } catch (error) {
        // 隐藏加载提示
        uni.hideLoading()

        console.error('提交表单失败:', error)

        // 显示错误提示
        uni.showToast({
          title: error?.message || '提交失败，请稍后重试',
          icon: 'none',
          duration: 2000
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.invoice-form-container {
  min-height: 100vh;
  background-color: #f6f7f8;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.form-content {
  padding: 32rpx;
  padding-bottom: 200rpx;
}

.form-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid rgba(0, 0, 0, 0.06);
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 24rpx;
  line-height: 1.2;
}

.radio-group-container {
  background: #f6f7f8;
  border-radius: 16rpx;
  padding: 8rpx;
  display: flex;
  height: 80rpx;
  align-items: center;
}

.form-row {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }
}

.form-label {
  width: 192rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #1f2937;
  flex-shrink: 0;
}

.form-value {
  flex: 1;
  font-size: 28rpx;
  color: #6b7280;
}

.amount-value {
  flex: 1;
  font-size: 32rpx;
  font-weight: 700;
  color: #f59e0b;
  text-align: right;
}

.delivery-options {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.delivery-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 24rpx;
  border-radius: 16rpx;
  background: #f9fafb;
  border: 2rpx solid transparent;
  transition: all 0.2s ease;
  min-height: 120rpx;

  &.active {
    background: #eff6ff;
    border-color: #13a4ec;
    box-shadow: 0 0 0 4rpx rgba(19, 164, 236, 0.1);
  }
}

.delivery-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.delivery-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #1f2937;
  line-height: 1.4;
  margin-bottom: 8rpx;
}

.delivery-subtitle {
  font-size: 26rpx;
  color: #6b7280;
  line-height: 1.3;
}

.radio-indicator {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  border: 3rpx solid #d1d5db;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &::after {
    content: '';
    width: 20rpx;
    height: 20rpx;
    border-radius: 50%;
    background: #13a4ec;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
}

.delivery-option.active .radio-indicator {
  border-color: #13a4ec;

  &::after {
    opacity: 1;
  }
}

.input-section {
  margin-top: 32rpx;
  padding-top: 32rpx;
  border-top: 1rpx solid #e5e7eb;
}

.input-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 16rpx;
}

.submit-tip {
  font-size: 24rpx;
  color: #6b7280;
  text-align: center;
  margin-top: 24rpx;
  line-height: 1.5;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #f6f7f8;
  padding: 32rpx;
  border-top: 1rpx solid #e5e7eb;
  backdrop-filter: blur(10rpx);
  z-index: 1000;
}

// 自定义样式覆盖
:deep(.uv-form-item) {
  margin-bottom: 0;
}

:deep(.uv-form-item__label) {
  display: none !important;
}

:deep(.uv-radio-group) {
  width: 100%;

  // 水平布局的radio组（发票类型、抬头类型）
  &.uv-radio-group--row {
    .uv-radio {
      flex: 1;
      margin-right: 0;

      .uv-radio__label {
        font-size: 28rpx;
        font-weight: 500;
        color: #6b7280;
      }

      &.uv-radio--checked {
        .uv-radio__label {
          color: #ffffff;
          font-weight: 600;
        }
      }
    }
  }

  // 垂直布局的radio组（接收方式）
  &.uv-radio-group--column {
    .uv-radio {
      width: 100%;
      margin-bottom: 0;

      .uv-radio__label {
        display: none; // 隐藏默认标签，使用自定义样式
      }
    }
  }
}

:deep(.uv-input) {
  .uv-input__content {
    background: transparent;
    border: none;
    font-size: 28rpx;
    color: #1f2937;

    &::placeholder {
      color: #9ca3af;
    }
  }
}

:deep(.uv-textarea) {
  .uv-textarea__content {
    background: transparent;
    border: none;
    font-size: 28rpx;
    color: #1f2937;
    padding: 0;

    &::placeholder {
      color: #9ca3af;
    }
  }
}

:deep(.uv-button) {
  font-weight: 600;
  font-size: 32rpx;
  letter-spacing: 0.5rpx;
}
</style>
