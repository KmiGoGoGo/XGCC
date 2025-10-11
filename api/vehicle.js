// 车辆相关API
import  request  from '../utils/request'

/**
 * 获取我的车辆列表
 * @returns {Promise}
 */
export const getVehicleList = () => {
  return request.post('/api-service/api/getVehicleList')
}

/**
 * 添加车辆
 * @param {object} data - 请求参数 {"plateNo":"鲁1111111","carNatureId":0,"mileage":"","vehicleType":"DianDong","vin":""}
 * @returns {Promise}
 */
export const addVehicle = (data) => {
  return request.post('/api-service/api/addVehicle', data)
}

/**
 * 更新车辆信息
 * @param {object} data - 请求参数 {"plateNo":"鲁1111112","brandId":null,"carTypeId":null,"carNatureId":0,"mileage":null,"vehicleType":"DianDong","vin":"","id":34007}
 * @returns {Promise}
 */
export const updateVehicleInfo = (data) => {
  return request.post('/api-service/api/updateVehicleInfo', data)
}

/**
 * 
 * @param {form-data} id - 车辆id
 * @returns 
 */
export const delVehicleInfo = (id) => {
  return request.post('/api-service/api/delVehicleInfo', { id })
}


/**
 * 
 * @param {form-data} id - 车辆id
 * @returns 
 */
export const updateDefaultVehicle = (id) => {
  return request.postForm('/api-service/api/updateDefaultVehicle', { vehicleId: id })
}
