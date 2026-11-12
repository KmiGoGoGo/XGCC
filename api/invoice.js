import http from '../utils/request'

export function getUnInvoiceBillList(data) {
    return http.post('/api-service/api/invoice/getUnInvoiceBillList', data)
}


/**
 * 
 * @param {page: number, pageSize: number} data 
 * @returns example {"code":0,"msg":"成功","data":{"total":0,"current":1,"pages":0,"size":10,"InvoiceRecordList":[]},"fail":false,"success":true}
 */
export function queryInvoiceRecordList(data) {
    return http.post('/api-service/api/invoice/queryInvoiceRecordList', data)
}

export function applyInvoice(data) {
    return http.post('/api-service/api/invoice/applyInvoice', data)
}

export function queryInvoiceDetailById(id) {
    return http.post(`/api-service/api/invoice/queryInvoiceDetailById/${id}`)
}

export function getInvoiceBillList(billIds) {
    return http.post('/api-service/api/invoice/getInvoiceBillList', billIds)
}

