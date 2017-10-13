var purchaseService = {

    get: {
        //采购模块首页统计信息
        getMobilePurchase: function(request, response, success, error) {
            xunSoft.ajax.get('Report/Purchase/GetMobilePurchase', request, function(responseData) {
                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    response.mobilePurchase = responseData.data;
                }
                if (_.isFunction(success)) {
                    success(responseData);
                }
            }, function() {
                if (_.isFunction(error)) {
                    error();
                }
            });
        },

        //获取采购订单列表
        getPurchaseOrderList: function(request, response, success, error) {
            xunSoft.ajax.get('Purchase/PurchaseOrder/List', request, function(responseData) {
                //检查数据
                if (_.isArray(responseData.data) && responseData.data.length > 0 && _.isArray(response.data)) {
                    //是否存在下一页
                    if (request.pageIndex) {
                        request.pageIndex++;
                    }
                    //总数量
                    response.total = responseData.total;
                    //将数据存入本地
                    _.each(responseData.data, function(item) {

                        //转换单据信息
                        var purchaseOrder = _.pick(item, 'purchaseOrderId', 'purchaseOrderNo', 'supplierName', 'placeDate', 'deliverDate',
                            'detailSummary', 'creatorName', 'createTime');

                        purchaseOrder.flag = 'L';
                        if (item.submitTime) {
                            purchaseOrder.flag = 'T';
                        }
                        if (item.auditTime) {
                            purchaseOrder.flag = 'S';
                        }
                        response.data.push(purchaseOrder);
                    });
                }
                if (_.isFunction(success)) {
                    success(responseData);
                }
            }, function() {
                if (_.isFunction(error)) {
                    error();
                }
            });
        },

        //获取采购订单明细
        getPurchaseOrderDetail: function(request, response, success, error) {
            xunSoft.ajax.get('Purchase/PurchaseOrder/Detail', request, function(responseData) {
                if (_.isObject(responseData.data) && _.isObject(response.data)) {
                    response.data = responseData.data;
                }
                if (_.isFunction(success)) {
                    success(responseData);
                }
            }, function() {
                if (_.isFunction(error)) {
                    error();
                }
            });
        },

        //获取收货单列表
        getReceiveOrderList: function(request, response, success, error) {
            xunSoft.ajax.get('Purchase/Receive/List', request, function(responseData) {
                //检查数据
                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    //是否存在下一页
                    if (request.pageIndex) {
                        request.pageIndex++;
                    }
                    //总数量
                    response.total = responseData.total;
                    var tempResult = [];
                    //将数据存入本地
                    _.each(responseData.data, function(item) {

                        //转换单据信息

                        var receiveOrder = _.pick(item, "receiveOrderId", 'receiveOrderNo', 'supplierName', 'creatorName', 'createTime',
                            'receiveDate', 'detailSummary');

                        receiveOrder.flag = 'L';
                        if (item.submitTime) {
                            receiveOrder.flag = 'T';
                        }
                        if (item.auditTime) {
                            receiveOrder.flag = 'S';
                        }
                        if (!tempResult[receiveOrder.receiveDate]) { tempResult[receiveOrder.receiveDate] = [] }
                        tempResult[receiveOrder.receiveDate].push(receiveOrder);
                    });
                    for (var o in tempResult) {
                        response.data.push({ time: o, value: tempResult[o] })
                    }
                }
                if (_.isFunction(success)) {
                    success(responseData);
                }
            }, function() {
                if (_.isFunction(error)) {
                    error();
                }
            });
        },

        //获取收货订单明细
        getReceiveOrderDetail: function(request, response, success, error) {
            xunSoft.ajax.get('Purchase/Receive/Detail', request, function(responseData) {
                if (_.isObject(responseData.data) && response) {
                    response.data = responseData.data;
                }
                if (_.isFunction(success)) {
                    success(responseData);
                }
            }, function() {
                if (_.isFunction(error)) {
                    error();
                }
            });
        },

        //获取退货单列表
        getReturnOrderList: function(request, response, success, error) {
            xunSoft.ajax.get('Purchase/Return/List', request, function(responseData) {
                //检查数据
                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    //是否存在下一页
                    if (request.pageIndex) {
                        request.pageIndex++;
                    }
                    //总数量
                    response.total = responseData.total;
                    var tempResult = [];
                    //将数据存入本地
                    _.each(responseData.data, function(item) {

                        //转换单据信息
                        var returnOrder = _.pick(item, 'returnOrderId', 'returnOrderNo', 'supplierName', 'creatorName', 'returnStorehouseName',
                            'returnDate', 'detailSummary');

                        returnOrder.flag = 'L';
                        if (item.submitTime) {
                            returnOrder.flag = 'T';
                        }
                        if (item.auditTime) {
                            returnOrder.flag = 'S';
                        }
                        if (!tempResult[returnOrder.returnDate]) { tempResult[returnOrder.returnDate] = [] }
                        tempResult[returnOrder.returnDate].push(returnOrder);
                    });
                    for (var o in tempResult) {
                        response.data.push({ time: o, value: tempResult[o] })
                    }
                }
                if (_.isFunction(success)) {
                    success(responseData);
                }
            }, function() {
                if (_.isFunction(error)) {
                    error();
                }
            });
        },

        //获取退货单明细
        getReturnOrderDetail: function(request, response, success, error) {
            xunSoft.ajax.get('Purchase/Return/Detail', request, function(responseData) {
                if (_.isObject(responseData.data)) {
                    response.data = responseData.data;
                }
                if (_.isFunction(success)) {
                    success(responseData);
                }
            }, function() {
                if (_.isFunction(error)) {
                    error();
                }
            });
        },

        //获取付款单列表
        getPayOrderList: function(request, response, success, error) {
            xunSoft.ajax.get('Purchase/PayOrder/List', request, function(responseData) {
                //检查数据
                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    //是否存在下一页
                    if (request.pageIndex) {
                        request.pageIndex++;
                    }
                    //总数量
                    response.total = responseData.total;
                    var tempResult = [];
                    //将数据存入本地
                    _.each(responseData.data, function(item) {

                        //转换单据信息
                        var payOrder = _.pick(item, 'payOrderId', 'payOrderNo', 'supplierName', 'costTypeName', 'payDate', 'detailSummary');

                        payOrder.flag = 'L';
                        if (item.submitTime) {
                            payOrder.flag = 'T';
                        }
                        if (item.auditTime) {
                            payOrder.flag = 'S';
                        }
                        if (!tempResult[payOrder.payDate]) { tempResult[payOrder.payDate] = [] }
                        tempResult[payOrder.payDate].push(payOrder);
                    });
                    for (var o in tempResult) {
                        response.data.push({ time: o, value: tempResult[o] })
                    }
                }
                if (_.isFunction(success)) {
                    success(responseData);
                }
            }, function() {
                if (_.isFunction(error)) {
                    error();
                }
            });
        },


        // 获取付款单明细
        getPayOrderDetail: function(request, response, success, error) {
            xunSoft.ajax.get('Purchase/PayOrder/Detail', request, function(responseData) {
                if (_.isObject(responseData.data) && response) {
                    response.data = responseData.data;
                }
                if (_.isFunction(success)) {
                    success(responseData);
                }
            }, function() {
                if (_.isFunction(error)) {
                    error();
                }
            });
        },

        // 获取付款单单据列表
        getPayOrderSourceList: function(request, response, success, error) {
            xunSoft.ajax.get('Purchase/PayOrder/PayOrderList', request, success, error);
        },
        //获取供应商列表
        getSupplierList: function(request, response, success, error) {
            xunSoft.ajax.get('Purchase/Supplier/List', request, function(responseData) {
                if (response) {
                    response.data = responseData.data;
                }
                if (_.isFunction(success)) {
                    success(responseData);
                }
            }, function() {
                if (_.isFunction(error)) {
                    error(error);
                }
            });
        },
        //获取供应商详情
        getSupplierDetail: function(request, response, success, error) {
            xunSoft.ajax.get('Purchase/Supplier/Detail', request, function(responseData) {
                if (_.isObject(responseData.data) && response) {
                    response.data = responseData.data;
                }
                if (_.isFunction(success)) {
                    success(responseData);
                }
            }, function() {
                if (_.isFunction(error)) {
                    error();
                }
            });
        }
    },
    post: {
        //保存采购订单
        postPurchaseOrder: function(request, response, success, error) {
            xunSoft.ajax.post('Purchase/PurchaseOrder/Add', request, success, error);

        },
        //添加收货单
        postReceiveOrder: function(request, response, success, error) {
            xunSoft.ajax.post('Purchase/Receive/Add', request, success, error);
        },
        //添加退货单
        postReturnOrder: function(request, response, success, error) {
            xunSoft.ajax.post('Purchase/Return/Add', request, success, error);
        },
        //添加供应商
        postSupplier: function(request, response, success, error) {
            xunSoft.ajax.post('Purchase/Supplier/Add', request, success, error);
        },

        //添加付款单
        postPayOrder: function(request, response, success, error) {
            xunSoft.ajax.post('Purchase/PayOrder/Add', request, success, error);
        },

        //添加供应商

        postSupplier: function(request, response, success, error) {
            xunSoft.ajax.post('Purchase/Supplier/Add', request, success, error);
        },


    },
    put: {

        //提交修改采购订单
        putPurchaseOrder: function(request, response, success, error) {
            xunSoft.ajax.put('Purchase/PurchaseOrder/Update', request, success, error);
        },
        //修改采购订单状态
        putPurchaseOrderState: function(request, response, success, error) {
            xunSoft.ajax.put('Purchase/PurchaseOrder/UpdateState', request, success, error);
        },

        //修改收货订单
        putReceiveOrder: function(request, response, success, error) {
            xunSoft.ajax.put('Purchase/Receive/Update', request, success, error);
        },
        //修改收货订单状态
        putReceiveOrderState: function(request, response, success, error) {
            xunSoft.ajax.put('Purchase/Receive/UpdateState', request, success, error);
        },

        //修改退货订单
        putReturnOrder: function(request, response, success, error) {
            xunSoft.ajax.put('Purchase/Return/Update', request, success, error);
        },
        //修改退货订单状态
        putReturnOrderState: function(request, response, success, error) {
            xunSoft.ajax.put('Purchase/Return/UpdateState', request, success, error);
        },

        //修改付款单
        putPayOrder: function(request, response, success, error) {
            xunSoft.ajax.put('Purchase/PayOrder/Update', request, success, error);
        },
        //修改单据状态
        putPayOrderState: function(request, response, success, error) {
            xunSoft.ajax.put('Purchase/PayOrder/UpdateState', request, success, error);
        },
        //修改供应商
        putSupplier: function(request, response, success, error) {
            xunSoft.ajax.put('Purchase/Supplier/Update', request, success, error);
        },
    },
    delete: {
        //删除采购订单
        deletePurchaseOrder: function(request, response, success, error) {
            xunSoft.ajax.delete('Purchase/PurchaseOrder/Delete', request, success, error);
        },
        //删除收货单
        deleteReceiveOrder: function(request, response, success, error) {
            xunSoft.ajax.delete('Purchase/Receive/Delete', request, function(responseData) {
                if (_.isObject(responseData.data)) {

                }
                if (_.isFunction(success)) {
                    success(responseData);
                }
            }, function() {
                if (_.isFunction(error)) {
                    error();
                }
            });
        },
        //删除退货单
        deleteReturnOrder: function(request, response, success, error) {
            xunSoft.ajax.delete('Purchase/Return/Delete', request, function(responseData) {
                if (_.isObject(responseData.data)) {

                }
                if (_.isFunction(success)) {
                    success(responseData);
                }
            }, function() {
                if (_.isFunction(error)) {
                    error();
                }
            });
        },

        //删除付款单
        deletePayOrder: function(request, response, success, error) {
            xunSoft.ajax.delete('Purchase/PayOrder/Delete?id=' + request.id, request, success, error);
        },

        //删除供应商
        delelteSupplier: function(request, response, success, error) {
            xunSoft.ajax.delete('Purchase/Supplier/Delete?id=' + request.id, request, success, error);
        }
    },
    //工具函数
    utility: {
        //获取单据的货品信息
        parsePurchaseDetailKind: function(orderDetail) {
            var newObj = kindService.utility.parseOrderKind(orderDetail);

            if (orderDetail.purchasePrice) {
                newObj.purchasePrice = orderDetail.purchasePrice;
            }
            if (orderDetail.purchaseAmount) {
                newObj.purchaseAmount = orderDetail.purchaseAmount;
            }
            if (orderDetail.purchaseMoney) {
                newObj.purchaseMoney = orderDetail.purchaseMoney;
            }
            if (orderDetail.discountRate) {
                newObj.discountRate = orderDetail.discountRate;
            }
            if (orderDetail.taxRate) {
                newObj.taxRate = orderDetail.taxRate;
            }
            if (orderDetail.taxMoney) {
                newObj.taxMoney = orderDetail.taxMoney;
            }
            if (orderDetail.deliverDate) {
                newObj.deliverDate = orderDetail.deliverDate;
            }

            return newObj;
        },
        //验证数据
        purchaseValid: function(requestInfo) {
            if (!xunSoft.valid.validDataRange(requestInfo.purchasePrice, -1)) {
                return '请输入合理的采购单价';
            }
            if (!xunSoft.valid.validDataRange(requestInfo.purchaseAmount, -1, 2147483647)) {
                return '请输入合理的采购数量';
            }
            if (!xunSoft.valid.validDataRange(requestInfo.taxRate, -1, 101)) {
                return '请输入合理的采购税率';
            }
            return '';
        },
        //计算金额
        purchaseCalculate: function(requestInfo, isShowInfo) {
            var e = e || window.event;
            var result = purchaseService.utility.purchaseValid(requestInfo);
            if (result) {
                if (isShowInfo) {
                    xunSoft.helper.showMessage(result);
                }
                return false;
            }
            var keyword = $$(e.target).parent().prev().text();
            if (keyword === '单价') { //修改采购价-->计算折扣率
                if(requestInfo.purchasePrice * 100 % requestInfo.salePrice==0)
                {
                   requestInfo.discountRate = (requestInfo.purchasePrice / requestInfo.salePrice * 100);
                }
                else
                {
                   requestInfo.discountRate = (requestInfo.purchasePrice / requestInfo.salePrice * 100).toFixed(2);
                }
               
            }
            if (keyword === '折扣率%') { //修改折扣率-->计算采购价
                requestInfo.purchasePrice = (requestInfo.salePrice * requestInfo.discountRate / 100).toFixed(2);
            }
            //计算金额
            var tempPurchaseMoney = requestInfo.purchasePrice * requestInfo.purchaseAmount;
            //计算税额
            requestInfo.taxMoney = tempPurchaseMoney * (requestInfo.taxRate / 100);
            //最后的金额
            requestInfo.purchaseMoney = tempPurchaseMoney;
            return true;
        },
        //验证数据
        receiptValid: function(requestInfo) {
            if (!xunSoft.valid.validDataRange(requestInfo.receivePrice, -1)) {
                return '请输入合理的收货单价';
            }
            if (!xunSoft.valid.validDataRange(requestInfo.receiveAmount, -1, 2147483647)) {
                return '请输入合理的收货数量';
            }
            if (!xunSoft.valid.validDataRange(requestInfo.taxRate, -1, 101)) {
                return '请输入合理的收货税率';
            }
            return '';
        },
        //计算金额
        receiptCalculate: function(requestInfo, isShowInfo) {
            var e = e || window.event;
            var result = purchaseService.utility.receiptValid(requestInfo);
            if (result) {
                if (isShowInfo) {
                    xunSoft.helper.showMessage(result);
                }
                return false;
            }
            var keyword = $$(e.target).parent().prev().text();
            if (keyword === '单价') { //修改单价-->计算折扣率
                if(requestInfo.receivePrice * 100 % requestInfo.salePrice==0)
                {
                   requestInfo.discountRate = (requestInfo.receivePrice / requestInfo.salePrice * 100);
                }
                else
                {
                     requestInfo.discountRate = (requestInfo.receivePrice / requestInfo.salePrice * 100).toFixed(2);
                }
            }
            
            if (keyword === '折扣率%') { //修改折扣率-->计算采购价
                requestInfo.receivePrice = (requestInfo.salePrice * requestInfo.discountRate / 100).toFixed(2);
            }
            //计算折扣
            var tempReceiveMoney = requestInfo.receivePrice * requestInfo.receiveAmount;
            //计算税额
            requestInfo.taxMoney = tempReceiveMoney * (requestInfo.taxRate / 100);
            //最后的金额
            requestInfo.receiveMoney = tempReceiveMoney;
            return true;
        },
        //验证数据
        returnValid: function(requestInfo) {
            if (!xunSoft.valid.validDataRange(requestInfo.returnPrice, -1)) {
                return '请输入合理的退货单价';
            }
            if (!xunSoft.valid.validDataRange(requestInfo.returnAmount, -1, 2147483647)) {
                return '请输入合理的退货数量';
            }
            if (!xunSoft.valid.validDataRange(requestInfo.taxRate, -1, 101)) {
                return '请输入合理的退货税率';
            }
            return '';
        },
        //计算金额
        returnCalculate: function(requestInfo, isShowInfo) {
            var e = e || window.event;
            var result = purchaseService.utility.returnValid(requestInfo);
            if (result) {
                if (isShowInfo) {
                    xunSoft.helper.showMessage(result);
                }
                return false;
            }
            var keyword = $$(e.target).parent().prev().text();
            if (keyword === '单价') { //修改单价-->计算折扣率
                 if(requestInfo.returnPrice * 100 % requestInfo.salePrice==0)
                {
                   requestInfo.discountRate = (requestInfo.returnPrice / requestInfo.salePrice * 100);
                }
                else
                {
                     requestInfo.discountRate = (requestInfo.returnPrice / requestInfo.salePrice * 100).toFixed(2);
                }
            }
            if (keyword === '折扣率%') { //修改折扣率-->计算采购价
                requestInfo.returnPrice = (requestInfo.salePrice * requestInfo.discountRate / 100).toFixed(2);
            }
            //计算折扣
            var tempReturnMoney = (requestInfo.returnPrice * requestInfo.returnAmount) * (requestInfo.discountRate / 100);
            //计算税额
            requestInfo.taxMoney = tempReturnMoney * (requestInfo.taxRate / 100);
            //最后的金额
            requestInfo.returnMoney =requestInfo.returnPrice * requestInfo.returnAmount;// tempReturnMoney;
            return true;
        }
        
    }
};