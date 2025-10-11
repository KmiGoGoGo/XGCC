import request from '../utils/request.js';
import globalData from '../globalData.js';

/**
 * @description 获取充电桩详情
 * @param {string} gunId 充电桩ID
 */
export function getStationGunDetails(gunId) {
  return request.post('/api-service/api/getStationGunDetails', {
    gunId: gunId,
  });
}

/**
 * @description 获取首页充电站列表 (无需认证)
 * @param {object} data 请求体
 */
export function getIndexStationNoAuth(data) {
  return request.post('/api-service/api/indexStationNoAuth', data);
}

/**
 * @description 根据名称获取区域列表
 * @param {string} name - 地区名称，例如 "东莞市"
 * @returns {Promise<object>}
 * @example
 * // 响应示例:
 * {
 *   "code": 0,
 *   "msg": "成功",
 *   "data": {
 *     "id": 100278,
 *     "deleted": 0,
 *     "createTime": "2020-04-21 11:18:56",
 *     "updateTime": null,
 *     "name": "东莞市",
 *     "code": "441900",
 *     "parentId": 324,
 *     "level": "CITY",
 *     "longitude": "113.758184",
 *     "latitude": "23.027314"
 *   },
 *   "fail": false,
 *   "success": true
 * }
 */
export function getAreaListByName(name) {
  return request.get('/api-service/api/stationPage/areaListByName', { name });
}

/**
 * @description 获取充电站详情 (无需认证)
 * @param {object} data - 请求体
 * @param {string} data.stationId - 充电站ID
 * @param {number} data.latitude - 纬度
 * @param {number} data.longitude - 经度
 * @returns {Promise<object>}
 */
export function getStationDetailByIdNotAuth(data) {
  return request.post('/api-service/api/getStationDetailByIdNotAuth', data);
}

/**
 * @description 获取首页充电站列表新版本 (无需认证)
 * @param {object} data - 请求体
 * @param {number} data.areaId - 区域ID，例如 100278
 * @param {string} data.areaName - 区域名称，例如 "东莞市"
 * @param {number} data.latitude - 纬度
 * @param {number} data.longitude - 经度
 * @param {string} data.sellerNo - 销售商编号，例如 "cy"
 * @param {number} data.type - 类型，1-精选站点，2-全部站场，3-价格特惠
 * @param {object} data.memberQueryPreferenceDto - 查询偏好设置
 * @param {number} data.current - 当前页码
 * @param {number} data.pageSize - 每页数量
 * @returns {Promise<object>}
 * @example
 * // 请求示例:
 * {
 *   "areaId": 100278,
 *   "areaName": "东莞市",
 *   "latitude": 23.02066993713379,
 *   "longitude": 113.75179290771484,
 *   "sellerNo": "cy",
 *   "type": 1,
 *   "memberQueryPreferenceDto": {
 *     "distance": null,
 *     "fastSlow": null,
 *     "stationType": null,
 *     "construction": null,
 *     "discount": null
 *   },
 *   "current": 1,
 *   "pageSize": 10
 * }
 * 
 * // 响应示例:
 * {
 *   "code": 0,
 *   "msg": "成功",
 *   "data": {
 *     "pageNo": 1,
 *     "pageSize": 10,
 *     "totalCount": 101,
 *     "data": [
 *       {
 *         "id": 1124,
 *         "name": "超易充南城市民中心超充站",
 *         "img": null,
 *         "street": "广东省东莞市南城街道元美东路东莞市民服务中心",
 *         "area": "东莞市",
 *         "areaId": 100278,
 *         "areas": [1, 324, 100278],
 *         "distance": 0,
 *         "distanceDouble": 0.9175770795569843,
 *         "latitude": "23.014923",
 *         "longitude": "113.758227",
 *         "discountPrice": 1.98,
 *         "discountPriceStr": "1.98",
 *         "currentPrice": 2.02,
 *         "currentPriceStr": "2.02",
 *         "discount": true,
 *         "contractDiscount": false,
 *         "priceDiff": "0.04",
 *         "discountTime": null,
 *         "isUniformPrice": false,
 *         "isCollection": false,
 *         "businessTime": ["全天开放"],
 *         "superGunFastCount": 4,
 *         "superFastFreeGunCount": 4,
 *         "fastGunCount": 18,
 *         "fastFreeGunCount": 17,
 *         "slowGunCount": 0,
 *         "slowFreeGunCount": 0,
 *         "stationLabelList": null,
 *         "notice": "充电2小时免停",
 *         "parkingFeeDesc": null,
 *         "parkingSubsidy": "充电前绑定车牌号码，充电10分钟完成支付后可享受停车减免2小时，超时按场地实际收费为准，临牌不支持减免",
 *         "stationType": null,
 *         "fastSlow": "overTake",
 *         "discountType": null,
 *         "marketingMemberDiscount": null,
 *         "marketingDiscountPrice": null,
 *         "marketingOnePrice": null,
 *         "marketingFallPrice": null,
 *         "marketingFinaPrice": null,
 *         "discountStatus": null,
 *         "payleMemerLevel": null,
 *         "promoteTips": null,
 *         "applyModelStatus": null,
 *         "applyTerminalStatus": null,
 *         "marketing": null,
 *         "isRepair": 1,
 *         "status": null,
 *         "currentEletriPrice": 1.2,
 *         "currentEletriPriceStr": "1.20",
 *         "currentServicePrice": 0.78,
 *         "currentServicePriceStr": "0.78",
 *         "tagList": [...],
 *         "superStation": false,
 *         "closeTime": "[{\"startCloseTime1\":\"2024-07-15T15:07:35.382Z\",\"endCloseTime1\":\"2024-07-15T15:07:35.393Z\"}]",
 *         "closeTimeConfig": 1,
 *         "sumFreeCount": 0,
 *         "hulianinterfaceId": 13,
 *         "hulianId": null
 *       }
 *     ],
 *     "info": null,
 *     "pages": 11,
 *     "adminType": 0
 *   },
 *   "fail": false,
 *   "success": true
 * }
 */
export function getIndexStationNew(data) {
  return request.post('/api-service/api/indexStationNew', data);
}

/**
 * @description 获取充电站区域
 * @param {number} sellerId - 销售商ID
 * @returns {Promise<object>} example: {"code":0,"msg":"成功","data":[{"cityLlatitude":"39.914826","cityName":"北京市辖区","cityPinyin":"B","cityLongitude":"116.403829","id":100045,"cityId":100045},{"cityLlatitude":"23.027314","cityName":"东莞市","cityPinyin":"D","cityLongitude":"113.758184","id":100278,"cityId":100278},{"cityLlatitude":"30.251863","cityName":"杭州市","cityPinyin":"H","cityLongitude":"120.216481","id":100089,"cityId":100089}],"success":true,"fail":false}
 */
export function getStationArea() {
  const sellerId = globalData.sellerId;
  return request.get(`/api-service/api/getStationArea?sellerId=${sellerId}`);
}


/**
 * @description 根据名称获取充电站列表
 * @param {object} data - 请求体
 * @param {string} data.keyword - 搜索关键词
 * @param {string} data.areaName - 区域名称，例如 "东莞市"  
 * @param {number} data.latitude - 纬度
 * @param {number} data.longitude - 经度
 * @param {number} data.areaId - 区域ID
 * @param {number} data.current - 当前页码
 * @param {number} data.pageSize - 每页数量
 * @param {string} data.sellerNo - 销售商编号
 * @param {number} data.sortMode - 排序模式
 * @param {boolean} data.appointment - 是否可预约
 * @param {boolean} data.freeParking - 是否免费停车
 * @param {boolean} data.idle - 是否空闲
 * @param {object} data.memberQueryPreferenceDto - 查询偏好设置
 * @returns {Promise<object>}
 * @example
 * // 请求示例:
 * {
 *   "appointment": false,
 *   "freeParking": false,
 *   "idle": false,
 *   "memberQueryPreferenceDto": {},
 *   "keyword": "测试站",
 *   "areaName": "东莞市",
 *   "latitude": 23.02067,
 *   "longitude": 113.75179,
 *   "areaId": 100278,
 *   "current": 1,
 *   "pageSize": 5,
 *   "sellerNo": "cy",
 *   "sortMode": 0
 * }
 */
export function getStationPage(data) {
  return request.post(`/api-service/api/stationPage/getStationPage`, data);
}


/**
 * @description 获取充电站详情 (无需认证)
 * @param {object} data - 请求体
 * @param {string} data.stationId - 充电站ID
 * @param {number} data.latitude - 纬度
 * @param {number} data.longitude - 经度
 * @returns {Promise<object>}
 */
export function getStationDetailByIdNew(data) {
  return request.post('/api-service/api/getStationDetailByIdNew', data);
}