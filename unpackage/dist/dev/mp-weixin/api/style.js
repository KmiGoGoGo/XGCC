"use strict";
const utils_request = require("../utils/request.js");
const globalData = require("../globalData.js");
function getStyleContent(sonEnum) {
  return utils_request.http.post(`/api-service/api/style/getContent?sonEnum=${sonEnum}`);
}
function getStyleConfig() {
  const sellerId = globalData.globalData.sellerId;
  return utils_request.http.get(`/api-service/api/getStyleConfig?sellerId=${sellerId}`);
}
exports.getStyleConfig = getStyleConfig;
exports.getStyleContent = getStyleContent;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/style.js.map
