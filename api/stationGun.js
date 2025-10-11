import http from '../utils/request'

/**
 * @description 获取充电站枪的状态信息
 * @param {object} data - 请求参数
 * @param {string} data.stationId - 充电站ID
 * @param {number} data.dataType - 数据类型 (0: 默认)
 * @returns {Promise<object>} - 包含枪状态信息的Promise对象
 *
 * @example
 * // 请求体
 * {
 *   "stationId": "1124",
 *   "dataType": 0
 * }
 *
 * // 响应体
 * {
 *   "code": 0,
 *   "msg": "成功",
 *   "data": {
 *     "sum": 22,
 *     "free": 18,
 *     "charging": 0,
 *     "aboutFinish": 0
 *   },
 *   "fail": false,
 *   "success": true
 * }
 */
export function getStationGunState(data) {
  return http.post('/api-service/api/getStationGunState', data)
}

/**
 * @description 获取充电站的枪列表
 * @param {object} data - 请求参数
 * @param {string} data.stationId - 充电站ID
 * @param {number} data.dataType - 数据类型 (0: 默认)
 * @returns {Promise<object>} - 包含枪列表的Promise对象
 *
 * @example
 * // 请求体
 * {
 *   "stationId": "1124",
 *   "dataType": 0
 * }
 *
 * // 响应体
 * {
 *   "code": 0,
 *   "msg": "成功",
 *   "data": [
 *     {
 *       "pileId": 6004,
 *       "gunId": 6260,
 *       "gunNumber": "10",
 *       "stage": 3,
 *       "currentPrice": 1.32,
 *       "gunType": 1,
 *       "gunState": 1,
 *       "gunName": "市民中心01K",
 *       "maxPower": 180.0,
 *       "currentSOC": 0
 *     }
 *   ],
 *   "fail": false,
 *   "success": true
 * }
 */
export function getStationGunList(data) {
  return http.post('/api-service/api/getStationGunList', data)
}

/**
 * @description 获取充电枪的详细信息
 * @param {object} data - 请求参数
 * @param {string} data.gunId - 充电枪ID
 * @returns {Promise<object>} - 包含枪详细信息的Promise对象
 *
 * @example
 * // 请求体
 * {
 *   "gunId": "6260"
 * }
 *
 * // 响应体
 * {
 *   "code": 0,
 *   "msg": "成功",
 *   "data": {
 *     "current": 160,
 *     "peakVol": 750,
 *     "valleyVol": 250,
 *     "maxPower": 180.0,
 *     "gunType": 1,
 *     "gunName": "市民中心01K",
 *     "pileName": "市民中心01",
 *     "pileNum": "83001401",
 *     "powerStageDetail": [
 *       {
 *         "now": false,
 *         "discount": true,
 *         "currentStartTime": "00:00",
 *         "currentEndTime": "08:00",
 *         "currentPrice": 0.59,
 *         "currentPowerPrice": 0.35,
 *         "currentServicePrice": 0.24
 *       }
 *     ],
 *     "gunState": 1,
 *     "gunId": 6260
 *   },
 *   "fail": false,
 *   "success": true
 * }
 */
export function getStationGunDetails(data) {
    return http.post('/api-service/api/getStationGunDetails', data)
}
