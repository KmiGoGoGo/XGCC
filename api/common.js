import http from '../utils/request'
import globalData from '../globalData.js';

/**
 * @description 查询异常配置
 * @returns {Promise<object>}
 */
export function selectAbnormalConfig() {
  return http.post('/api-service/api/selectAbnormalConfig')
}

/**
 * @description 根据SellerID获取商家支付配置
 * @returns {Promise<object>}
 */
export function getSellerPayConfigBySellerId() {
  const sellerId = globalData.sellerId;
  return http.post(`/api-service/api/getSellerPayConfigBySellerId/${sellerId}`)
}

/**
 * @description 根据SellerID获取样式配置
 * @param {object} params - URL查询参数
 * @returns {Promise<object>}
 */
export function getStyleConfig(params) {
  return http.get('/api-service/api/getStyleConfig', params)
}

/**
 * @description 查询支付账户设置列表
 * @param {object} data - 请求体
 * @param {boolean} data.disposablePayMode - 是否为一次性支付模式
 * @param {string} data.pileNo - 充电桩编号
 * @returns {Promise<object>}
 */
export function queryPayAccountSetting(data) {
  return http.post('/api-service/api/payAccountSetting/queryList', data)
}

/**
 * @description 获取最低启动余额
 * @returns {Promise<object>}
 */
export function getMinimumStartBalance() {
  return http.post('/api-service/api/getMinimumStartBalance')
}

/**
 * @description 通用广告查询
 * @param {object} data - 表单数据，包含 location
 * @returns {Promise<object>}
 */
export function advertisingGeneralQuery(data) {
    return http.postForm('/api/api-service/api/advertisingGeneralQuery', data);
}
