import http from '../utils/request'

/**
 * @description 根据充电桩编号获取充电桩及其下所有枪的详细信息
 * @param {object} data - 表单数据
 * @param {string} data.pileNo - 充电桩编号
 * @returns {Promise<object>}
 *
 * @example
 * // 请求 (form-data)
 * pileNo=83001301
 *
 * // 响应体
 * {
 *   "code": 0,
 *   "msg": "成功",
 *   "data": {
 *     "pileId": 5905,
 *     "pileNo": "83001301",
 *     "gunDTOList": [ ... ]
 *   }
 * }
 */
export function getPileDTOByNo(data) {
    return http.postForm('/api-service/api/getPileDTOByNo', data)
}

/**
 * @description 查询充电状态
 * @param {object} data - 表单数据
 * @param {string} data.pileNo - 充电桩编号
 * @param {string} data.gunNo - 充电枪编号
 * @param {string} data.qrCode - 二维码
 * @returns {Promise<object>}
 *
 * @example
 * // 请求 (form-data)
 * pileNo=83001301&gunNo=0&qrCode=83001301
 *
 * // 响应体
 * {
 *   "code": 0,
 *   "msg": "成功",
 *   "data": {
 *     "flag": true, // 是否可以充电
 *     "gunNo": "0"
 *   }
 * }
 */
export function querChargeRealy(data) {
    return http.postForm('/api-service/api/querChargeRealy', data)
}
