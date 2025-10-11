"use strict";
const utils_request = require("../utils/request.js");
function getStationGunState(data) {
  return utils_request.http.post("/api-service/api/getStationGunState", data);
}
function getStationGunList(data) {
  return utils_request.http.post("/api-service/api/getStationGunList", data);
}
function getStationGunDetails(data) {
  return utils_request.http.post("/api-service/api/getStationGunDetails", data);
}
exports.getStationGunDetails = getStationGunDetails;
exports.getStationGunList = getStationGunList;
exports.getStationGunState = getStationGunState;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/stationGun.js.map
