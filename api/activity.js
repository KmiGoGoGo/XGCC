import http from '../utils/request'

/**
 * @description 获取第三方活动信息
 * @param {object} params - URL查询参数
 * @param {string} params.pileNo - 充电桩编号
 * @returns {Promise<object>}
 *
 * @example
 * // 请求
 * GET /api/api-service/api/getThirdActivity?pileNo=83001301
 *
 * // 响应体
 * {
 *   "code": 0,
 *   "msg": "成功",
 *   "data": { ... } // 活动详情
 * }
 */
export function getThirdActivity(params) {
    // 虽然用户描述为POST，但参数在URL中，更符合GET请求的规范
    return http.get('/api-service/api/getThirdActivity', params)
}
