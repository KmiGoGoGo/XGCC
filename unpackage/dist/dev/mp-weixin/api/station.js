"use strict";
const utils_request = require("../utils/request.js");
const globalData = require("../globalData.js");
function getStationGunDetails(gunId) {
  return utils_request.http.post("/api-service/api/getStationGunDetails", {
    gunId
  });
}
function getIndexStationNoAuth(data) {
  return utils_request.http.post("/api-service/api/indexStationNoAuth", data);
}
function getStationDetailByIdNotAuth(data) {
  return utils_request.http.post("/api-service/api/getStationDetailByIdNotAuth", data);
}
function getIndexStationNew(data) {
  return utils_request.http.post("/api-service/api/indexStationNew", data);
}
function getStationArea() {
  const sellerId = globalData.globalData.sellerId;
  return utils_request.http.get(`/api-service/api/getStationArea?sellerId=${sellerId}`);
}
function getStationPage(data) {
  return utils_request.http.post(`/api-service/api/stationPage/getStationPage`, data);
}
function getStationDetailByIdNew(data) {
  return utils_request.http.post("/api-service/api/getStationDetailByIdNew", data);
}
exports.getIndexStationNew = getIndexStationNew;
exports.getIndexStationNoAuth = getIndexStationNoAuth;
exports.getStationArea = getStationArea;
exports.getStationDetailByIdNew = getStationDetailByIdNew;
exports.getStationDetailByIdNotAuth = getStationDetailByIdNotAuth;
exports.getStationGunDetails = getStationGunDetails;
exports.getStationPage = getStationPage;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/station.js.map
