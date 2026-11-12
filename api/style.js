import request from '../utils/request.js';
import globalData from '../globalData.js';

/**
 * @description 获取商家基础配置
 * @param {object} data - 请求数据
 * @param {number} data.sellerId - 商家ID
 * @returns {Promise<object>}
 */
export function getSellerBasicsConfig(data) {
  return request.post('/api-service/api/style/getSellerBasicsConfig', data);
}

/**
 * @description 获取指定模块的图标/配置
 * @param {object} params - 请求参数
 * @param {string} params.twoEnum - 图标模块枚举 (PERSONAL_CENTER, OTHER, MY_BILL, HUE, DISCOUNT_COUPON_MODULE, BASE_NAVIGATION_MODULE, BALANCE_RECHARGE)
 * @param {number} params.sellerId - 商家ID
 * @returns {Promise<object>}
 */
export function getIconTwo(params) {
  return request.get(`/api-service/api/style/getIconTwo?twoEnum=${params}&sellerId=${globalData.sellerId}`);
}

/**
 * @description 获取特定内容的样式/文本，如退款说明
 * @param {string} sonEnum - 内容枚举 (REFUND)
 * @returns {Promise<object>}
 */
export function getStyleContent(sonEnum) {
    return request.post(`/api-service/api/style/getContent?sonEnum=${sonEnum}`);
}

/**
 * @description 获取样式配置，如客服电话和时间
 * @returns {Promise<object>}
 */
export function getStyleConfig() {
  const sellerId = globalData.sellerId;
    return request.get(`/api-service/api/getStyleConfig?sellerId=${sellerId}`);
}
