import http from '../utils/request'
import globalData from '../globalData.js';

/**
 * @description 分页获取充电服务监控列表
 * @param {object} data - 请求体，包含 current, pageSize, memberNo
 * @returns {Promise<object>}
 */
export function pageChargeServiceMonitor(data) {
    return http.post('/api-service/api/pageChargeServiceMonitorNew', data);
}

/**
 * @description 开始充电
 * @param {object} data - 请求体
 * @returns {Promise<object>}
 */
export function startCharge(data) {
    return http.post('/api-service/api/charge/startCharge?miniProgramVersion=' + globalData.miniProgramVersion, data);
}

/**
 * @description 根据业务ID获取支付方式
 * @param {object} params - 查询参数，包含 busId
 * @returns {Promise<object>}
 */
export function getPayModeByBusId(params) {
    return http.get('/api-service/api/getPayModeByBusId', params);
}

/**
 * @description 根据业务ID获取预充值金额
 * @param {object} params - 查询参数，包含 busId
 * @returns {Promise<object>}
 */
export function getPreChargeAmountByBusId(busId) {
    return http.get(`/api-service/api/getPreChargeAmountByBusId?busId=${busId}`);
}

/**
 * @description 查询在线充电状态
 * @param {object} data - 表单数据，包含 busId, pileNo, gunNo
 * @returns {Promise<object>}
 */
export function querChargeOnline(data) {
    return http.postForm('/api-service/api/querChargeOnline', data);
}

/**
 * @description 获取充电监控详情功率
 * @param {object} data - 表单数据，包含 pileId, gunNo
 * @returns {Promise<object>}
 */
export function doGetMonitorDetailPower(data) {
    return http.postForm('/api-service/api/charge/doGetMonitorDetailPower', data);
}

/**
 * @description 停止充电
 * @param {object} data - 表单数据，包含 busId
 * @returns {Promise<object>}
 */
export function stopCharge(data) {
    return http.postForm('/api-service/api/stopCharge', data);
}

/**
 * @description 查询充电状态
 * @param {object} data - 表单数据
 * @param {string} data.gunNo - 充电枪编号
 * @param {string} data.platformNo - 平台编号
 * @param {string} data.hulianinterfaceId - 互联接口编号
 * @returns {Promise<object>}
 * @returns {Promise<object>}
 */
export function queryChargeRealy(data) {
    return http.postForm('/api-service/api/querChargeRealy', data);
}
