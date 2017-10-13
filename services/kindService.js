var kindService = {

    get: {
        //获取货品详细信息
        getKindDetail: function(request, response, success, error) {
            xunSoft.ajax.get('Kind/Kind/Detail', request, function(responseData) {
                if (_.isObject(responseData.data) && _.isObject(response.data)) {
                    response.data = responseData.data;
                    response.data.entityList = _.groupBy(response.data.entityList, 'colorName');
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
        //获取货品列表
        getKindList: function(request, response, success, error) {
            xunSoft.ajax.get('Kind/Kind/List', request, function(responseData) {
                response.total = responseData.total;
                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    request.pageIndex++;
                    _.each(responseData.data, function(item) {
                        item.selectAmount = 0;
                        response.data.push(item);
                    });
                }
                if (_.isFunction(success)) {
                    success(responseData);
                }
            });
        },
        //获取货品下的资源ID
        getKindPictures: function(request, response, success, error) {
            xunSoft.ajax.get('Kind/Kind/Pictures', request, function(responseData) {
                if (_.isFunction(success)) {
                    success(responseData);
                }
            }, function() {
                if (_.isFunction(error)) {
                    error();
                }
            });
        },

        //获取货品类别
        getKindClass: function(request, response, success, error) {
            xunSoft.ajax.get('Kind/Brand/ListKindClass', request, success, error);

        },

        //获取颜色
        getKindColor: function(request, response, success, error) {
            xunSoft.ajax.get('Kind/Color/List', request, success, error);
        },

        //获取尺码
        getKindSize: function(request, response, success, error) {
            xunSoft.ajax.get('Kind/Size/List', request, success, error);
        },

        //根据条码获取货品
        getKindByBar: function(request, response, success, error) {
            xunSoft.ajax.get('Kind/Kind/Get', request, success, error);
        },

        //获取货品的账面数量
        getKindAccountAmount: function(request, response, success, error) {
            xunSoft.ajax.get('Kind/Kind/AccountAmount', request, success, error);
        },
        //POS开单选择货品
        getBarCodeList: function(request, response, success, error) {
            xunSoft.ajax.get('Kind/Kind/BarCodeList', request, function(responseData) {

                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    response.total = responseData.data.length;
                    request.pageIndex++;
                    _.each(responseData.data, function(item) {
                        item.saleAmount = 0;
                        item.saleMoney = 0;
                        //实收金额
                        item.actualMoney = 0;
                        var newKind = kindService.utility.parseOrderKind(item);
                        _.extend(newKind, item);
                        response.data.push(newKind);
                    });
                }
            });
        },
        //POS开单货品搜索
        getSelectBarCodeList: function(request, response, success, error) {
            xunSoft.ajax.get('Kind/Kind/SelectBarCodeList', request, function(responseData) {

                if (_.isArray(responseData.data) && responseData.data.length > 0) {

                    request.pageIndex++;
                    _.each(responseData.data, function(item) {
                        response.total++;
                        item.saleAmount = 0;
                        item.saleMoney = 0;
                        //实收金额
                        item.actualMoney = 0;
                        var newKind = kindService.utility.parseOrderKind(item);
                        _.extend(newKind, item);
                        response.data.push(newKind);
                    });
                }
            });
        },
    },

    post: {

        //保存品牌
        postBrand: function(request, response, success, error) {
            xunSoft.ajax.post('Kind/Brand/Add', request, success, error);
        },

        //保存分类
        postKindClass: function(request, response, success, error) {
            xunSoft.ajax.post('Kind/Brand/AddKindClass/' + request.data.brandId, request, success, error);
        },

        //保存计量单位
        postUnit: function(request, response, success, error) {
            xunSoft.ajax.post('Kind/Unit/Add', request, success, error);
        },

        //保存尺码组
        postSizeGroup: function(request, response, success, error) {
            xunSoft.ajax.post('Kind/Size/AddGroup', request, success, error);
        },

        //保存尺码
        postSize: function(request, response, success, error) {
            xunSoft.ajax.post('Kind/Size/Add', request, success, error);
        },

        //保存颜色
        postColor: function(request, response, success, error) {
            xunSoft.ajax.post('Kind/Color/Add', request, success, error);
        },

        //保存货品
        postKind: function(request, response, success, error) {
            xunSoft.ajax.post('Kind/Kind/Add', request, success, error);
        },
        //保存货品颜色
        postKindColor: function(request, response, success, error) {
            xunSoft.ajax.post('Kind/Color/AddKind', request, success, error);
        },
        //保存货品尺码
        postKindSize: function(request, response, success, error) {
            xunSoft.ajax.post('Kind/Size/AddKind', request, success, error);
        }
    },

    //工具函数
    utility: {
        //获取单据的货品信息
        parseOrderKind: function(orderDetail) {
            var newObj = {};

            if (orderDetail) {
                //货品Id
                if (orderDetail.kindId) {
                    newObj.kindId = orderDetail.kindId;
                }
                //颜色Id
                if (orderDetail.colorId) {
                    newObj.colorId = orderDetail.colorId;
                }
                if (orderDetail.colorName) {
                    newObj.colorName = orderDetail.colorName;
                }
                //尺码Id
                if (orderDetail.sizeId) {
                    newObj.sizeId = orderDetail.sizeId;
                }
                if (orderDetail.sizeText) {
                    newObj.sizeText = orderDetail.sizeText;
                }
                //计量单位Id
                if (orderDetail.unitId) {
                    newObj.unitId = orderDetail.unitId;
                }
                //描述信息
                if (orderDetail.description) {
                    newObj.description = orderDetail.description;
                }
                //租户Id
                if (orderDetail.tenantId) {
                    newObj.tenantId = orderDetail.tenantId;
                }
                //吊牌价
                if (orderDetail.salePrice) {
                    newObj.salePrice = orderDetail.salePrice;
                }
                //折扣
                if (orderDetail.discountRate >= 0) {
                    newObj.discountRate = orderDetail.discountRate;
                }
                //税率
                if (orderDetail.taxRate >= 0) {
                    newObj.taxRate = orderDetail.taxRate;
                }
                //税额
                if (orderDetail.taxMoney >= 0) {
                    newObj.taxMoney = orderDetail.taxMoney;
                }
                //交期
                if (orderDetail.deliverDate) {
                    newObj.deliverDate = orderDetail.deliverDate;
                }

                //采购数量
                if (orderDetail.purchaseAmount >= 0) {
                    newObj.purchaseAmount = orderDetail.purchaseAmount;
                }
                //采购单价
                if (orderDetail.purchasePrice >= 0) {
                    newObj.purchasePrice = orderDetail.purchasePrice;
                }
                //采购金额
                if (orderDetail.purchaseMoney >= 0) {
                    newObj.purchaseMoney = orderDetail.purchaseMoney;
                }

                //收货价
                if (orderDetail.receivePrice >= 0) {
                    newObj.receivePrice = orderDetail.receivePrice;
                }
                //收货数量
                if (orderDetail.receiveAmount >= 0) {
                    newObj.receiveAmount = orderDetail.receiveAmount;
                }
                //收货金额
                if (orderDetail.receiveMoney >= 0) {
                    newObj.receiveMoney = orderDetail.receiveMoney;
                }

                //退货单价
                if (orderDetail.returnPrice >= 0) {
                    newObj.returnPrice = orderDetail.returnPrice;
                }
                //退货数量
                if (orderDetail.returnAmount >= 0) {
                    newObj.returnAmount = orderDetail.returnAmount;
                }
                //退货金额
                if (orderDetail.returnMoney >= 0) {
                    newObj.returnMoney = orderDetail.returnMoney;
                }

                //批发价
                if (orderDetail.wholesalePrice >= 0) {
                    newObj.wholesalePrice = orderDetail.wholesalePrice;
                }
                //批发数量
                if (orderDetail.saleAmount >= 0) {
                    newObj.saleAmount = orderDetail.saleAmount;
                }
                //批发数量
                if (orderDetail.saleMoney >= 0) {
                    newObj.saleMoney = orderDetail.saleMoney;
                }

                //损益数量
                if (orderDetail.profitLossAmount >= 0) {
                    newObj.profitLossAmount = orderDetail.profitLossAmount;
                }
                //损益金额
                if (orderDetail.profitLossMoney >= 0) {
                    newObj.profitLossMoney = orderDetail.profitLossMoney;
                }
                //成本价
                if (orderDetail.retailPrice >= 0) {
                    newObj.retailPrice = orderDetail.retailPrice;
                }
                //成本价
                if (orderDetail.retailPrice >= 0) {
                    newObj.retailPrice = orderDetail.retailPrice;
                }


                //货品冗余信息
                newObj.kind = {};
                //货品Id
                if (orderDetail.kindId) {
                    newObj.kind.kindId = orderDetail.kindId;
                }
                //货品名称
                if (orderDetail.kindName) {
                    newObj.kind.kindName = orderDetail.kindName;
                }
                //货品分类
                if (orderDetail.kindClassName) {
                    newObj.kind.kindClassName = orderDetail.kindClassName;
                }
                //货品货号
                if (orderDetail.kindNo) {
                    newObj.kind.kindNo = orderDetail.kindNo;
                }
                //货品品牌
                if (orderDetail.brandName) {
                    newObj.kind.brandName = orderDetail.brandName;
                }
                //货品计量单位
                if (orderDetail.unitName) {
                    newObj.kind.unitName = orderDetail.unitName;
                }
                //货品颜色
                if (orderDetail.colorName) {
                    newObj.kind.colorName = orderDetail.colorName;
                }
                //货品尺码
                if (orderDetail.sizeText) {
                    newObj.kind.sizeText = orderDetail.sizeText;
                }
            }
            return newObj;

        },

        //获取货品概要信息
        parseKind: function(kindInfo) {
            var kind = {};

            if (kindInfo.kindId) {
                kind.kindId = kindInfo.kindId;
            }
            if (kindInfo.barNo) {
                kind.barNo = kindInfo.barNo;
            }
            if (kindInfo.sizeId) {
                kind.sizeId = kindInfo.sizeId;
            }
            if (kindInfo.colorId) {
                kind.colorId = kindInfo.colorId;
            }
            if (kindInfo.unitId) {
                kind.unitId = kindInfo.unitId;
            }

            //获取吊牌价
            var salePrice = _.find(kindInfo.priceList, function(item) { return item.itemKey == "sale-price"; });
            if (salePrice) {
                kind.salePrice = salePrice.value;
            }

            kind.kind = {
                kindId: kindInfo.kindId,
                kindName: kindInfo.kindName,
                kindClassName: kindInfo.kindClassName,
                kindNo: kindInfo.kindNo,
                brandName: kindInfo.brandName,
                unitName: kindInfo.unitName
            };
            if (kindInfo.colorName) {
                kind.kind.colorName = kindInfo.colorName;
            }
            if (kindInfo.sizeText) {
                kind.kind.sizeText = kindInfo.sizeText;
            }
            return kind;
        }

    }

};