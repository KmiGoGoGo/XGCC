"use strict";
const utils_request = require("../utils/request.js");
const getVehicleList = () => {
  return utils_request.http.post("/api-service/api/getVehicleList");
};
const addVehicle = (data) => {
  return utils_request.http.post("/api-service/api/addVehicle", data);
};
const updateVehicleInfo = (data) => {
  return utils_request.http.post("/api-service/api/updateVehicleInfo", data);
};
const delVehicleInfo = (id) => {
  return utils_request.http.post("/api-service/api/delVehicleInfo", { id });
};
const updateDefaultVehicle = (id) => {
  return utils_request.http.postForm("/api-service/api/updateDefaultVehicle", { vehicleId: id });
};
exports.addVehicle = addVehicle;
exports.delVehicleInfo = delVehicleInfo;
exports.getVehicleList = getVehicleList;
exports.updateDefaultVehicle = updateDefaultVehicle;
exports.updateVehicleInfo = updateVehicleInfo;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/vehicle.js.map
