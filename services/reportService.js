var reportService = {
    get: {
        //手机端首页的云报表数据
        getCloudReport: function(request, response, success, fail) {
            xunSoft.ajax.get("Report/Default/GetMobileSaleReport", request, function(responseData) {
                if (_.isFunction(success)) {
                    success(responseData);
                }
            }, function() {
                if (_.isFunction(fail)) {
                    error();
                }
            });
        },

        //手机端销售排行
        getSaleRank: function(request, response, success, fail) {
            xunSoft.ajax.get("Report/Default/GetMobileSaleOrderBy", request, function(responseData) {
                if (_.isFunction(success)) {
                    success(responseData);
                }
            }, function() {
                if (_.isFunction(fail)) {
                    error();
                }
            });
        },
        //手机端资金报表
        getFundReport: function(request, response, success, fail) {
            xunSoft.ajax.get("Report/Default/GetMobileFinanceReport", request, function(responseData) {
                if (_.isFunction(success)) {
                    success(responseData);
                }
            }, function() {
                if (_.isFunction(fail)) {
                    error();
                }
            });
        },
        //起始页默认
        getDefaultReport: function(request, response, success, error) {
            xunSoft.ajax.get("Report/Default/GetDefaultReport", request, function(responseData) {
                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    _.each(responseData.data, function(item) {
                        response[item.name] = item.value;
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
        /**
         进货报表
         * */
        //获取采购汇总表
        getPurchaseDefaultReport: function(request, response, success, error) {
            xunSoft.ajax.get("Report/Purchase/Default", request, function(responseData) {
                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    _.each(responseData.data, function(item) {
                        response[item.name] = item.value;
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
        //获取入库汇总（按货品）
        getPurchaseReceiveOrderByKind: function(request, response, success, error) {
            xunSoft.ajax.get("Report/Purchase/GetReceiveOrderByKind", request, function(responseData) {
                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    _.each(responseData.data, function(item) {
                        response[item.name] = item.value;
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
        //获取入库汇总（按供应商）
        getPurchaseReceiveOrderBySupplier: function(request, response, success, error) {
            xunSoft.ajax.get("Report/Purchase/GetReceiveOrderBySupplier", request, function(responseData) {
                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    _.each(responseData.data, function(item) {
                        response[item.name] = item.value;
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
        //退货汇总（按货品）
        getPurchaseReturnOrderByKind: function(request, response, success, error) {
            xunSoft.ajax.get("Report/Purchase/GetReturnOrderByKind", request, function(responseData) {
                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    _.each(responseData.data, function(item) {
                        response[item.name] = item.value;
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
        //退货汇总（按供应商）
        getPurchaseReturnOrderBySupplier: function(request, response, success, error) {
            xunSoft.ajax.get("Report/Purchase/GetReturnOrderBySupplier", request, function(responseData) {
                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    _.each(responseData.data, function(item) {
                        response[item.name] = item.value;
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
        //付款汇总（按供应商）
        getPurchasePayMoneyBySupplier: function(request, response, success, error) {
            xunSoft.ajax.get("Report/Purchase/GetPayMoneyBySupplier", request, function(responseData) {
                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    _.each(responseData.data, function(item) {
                        response[item.name] = item.value;
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
        //付款汇总（按支付类型）
        getPurchasePayMoneyByCostType: function(request, response, success, error) {
            xunSoft.ajax.get("Report/Purchase/GetPayMoneyByCostType", request, function(responseData) {
                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    _.each(responseData.data, function(item) {
                        response[item.name] = item.value;
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

        /*
         销售报表
         * */
        //获取销售汇总表
        getSaleDefaultReport: function(request, response, success, error) {
            xunSoft.ajax.get("Report/SaleBatchReport/Default", request, function(responseData) {
                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    _.each(responseData.data, function(item) {
                        response[item.name] = item.value;
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
        //获取销售汇总（供应商）
        getSaleBatchBySupplier: function(request, response, success, error) {
            xunSoft.ajax.get("Report/SaleBatchReport/GetSaleBatchBySupplier", request, function(responseData) {
                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    _.each(responseData.data, function(item) {
                        response[item.name] = item.value;
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
        //获取销售 退货汇总（按货品）
        getSaleReturnOrderByKind: function(request, response, success, error) {
            xunSoft.ajax.get("Report/SaleBatchReport/GetSaleReturnOrderByKind", request, function(responseData) {
                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    _.each(responseData.data, function(item) {
                        response[item.name] = item.value;
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
        //获取销售 退货汇总（按供应商）
        getSaleReturnOrderBySupplier: function(request, response, success, error) {
            xunSoft.ajax.get("Report/SaleBatchReport/GetSaleReturnOrderBySupplier", request, function(responseData) {
                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    _.each(responseData.data, function(item) {
                        response[item.name] = item.value;
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
        //获取销售 收货汇总（按付款类型）
        getSaleReceiptByCostType: function(request, response, success, error) {
            xunSoft.ajax.get("Report/SaleBatchReport/SaleReceiptByCostType", request, function(responseData) {
                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    _.each(responseData.data, function(item) {
                        response[item.name] = item.value;
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
        //获取销售 收货汇总（按供应商）
        getSaleReceiptBySupplier: function(request, response, success, error) {
            xunSoft.ajax.get("Report/SaleBatchReport/SaleReceiptBySupplier", request, function(responseData) {
                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    _.each(responseData.data, function(item) {
                        response[item.name] = item.value;
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

        /**
         * 零售汇总
         */
        //零售汇总（按会员卡）
        getSaleByMemberCardId: function(request, response, success, error) {
            xunSoft.ajax.get("Report/SaleRetailReport/GetSaleByMemberCardId", request, function(responseData) {
                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    _.each(responseData.data, function(item) {
                        response[item.name] = item.value;
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
        //零售汇总（按货品）
        getSaleRetailhByKind: function(request, response, success, error) {
            xunSoft.ajax.get("Report/SaleRetailReport/GetSaleRetailhByKind", request, function(responseData) {
                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    _.each(responseData.data, function(item) {
                        response[item.name] = item.value;
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

        //库存汇总（按货品分类）
        getWarehouseByKindClassId: function(request, response, success, error) {
            xunSoft.ajax.get("Report/WarehouseReport/GetBarehouseByKindClassId", request, function(responseData) {
                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    _.each(responseData.data, function(item) {
                        response[item.name] = item.value;
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

        //库存汇总 （按品牌）
        getWarehouseByBrand: function(request, response, success, error) {
            xunSoft.ajax.get("Report/WarehouseReport/GetWarehouseByBrand", request, function(responseData) {
                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    _.each(responseData.data, function(item) {
                        response[item.name] = item.value;
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
    }
}