//调拨单列表
eShop.onPageInit('warehouse_shopTransfer_list', function(page) {
    var pageDiv = $$(page.container);
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                query: {
                    transferOrderNo: '',
                    supplierId: '0',
                    status: '',
                    createTimeFrom: '',
                    createTimeTo: '',
                    creatorId: '',
                    sponsorId: '',
                    auditorId: '',
                    fromWarehouseId: '',
                    toWarehouseId: '',
                    kindText: '',
                    tenantId: xunSoft.user.tenantId(),
                    shopId: xunSoft.user.shopId(),
                    orderBy: 'a.createTime desc',
                },
                pageIndex: 1,
                pageSize: xunSoft.user.pageSize()
            },
            response: {
                total: 0,
                data: []
            }
        },
        computed: {
            _totalAmount: function() {
                var total = 0;
                _.each(this.response.data, function(row) {
                    _.each(row.value, function(item) {
                        total += (parseFloat(item.detailSummary.transferAmount) || 0);
                    });
                });
                return total;
            }
        },
        methods: {
            init: function() {
                this.load();
                //下拉刷新
                pageDiv.find('.pull-to-refresh-content').on('refresh', function() {
                    eShop.pullToRefreshDone();
                    vm.refresh();
                })
            },
            //重新加载
            refresh: function() {
                this.response.data = [];
                this.response.total = 0;
                this.request.pageIndex = 1;
                this.load();
            },
            //查询
            query: function() {
                mainView.router.load({
                    url: 'warehouse/common/filter.ios.html',
                    query: {
                        para: vm.request.query,
                        type: 1,
                        callback: vm.refresh
                    }
                });
            },
            //加载列表数据
            load: function() {
                warehouseService.get.getTransferOrderList(vm.request, {}, function(responseData) {
                    var tempResult = [];
                    if (_.isArray(responseData.data) && responseData.data.length > 0) {
                        if (vm.request.pageIndex) {
                            vm.request.pageIndex++;
                        }
                        vm.response.total = responseData.total;
                        _.each(responseData.data, function(item) {
                            //转换单据信息
                            var transferOrder = _.pick(item, 'transferOrderId', 'transferOrderNo', 'transferDate',
                                'sponsorId', 'sponsorOrganName', 'submitTime', 'auditTime',
                                'detailSummary', 'creatorName', 'createTime', 'fromWarehouseId', 'fromWarehouseName',
                                'toWarehouseId', 'toWarehouseName');
                            transferOrder.flag = 'L';
                            if (item.submitTime) {
                                transferOrder.flag = 'T';
                            }
                            if (item.auditTime) {
                                transferOrder.flag = 'S';
                            }
                            if (!tempResult[transferOrder.transferDate]) {
                                tempResult[transferOrder.transferDate] = []
                            }
                            tempResult[transferOrder.transferDate].push(transferOrder);
                        });
                        for (var o in tempResult) {
                            vm.response.data.push({
                                time: o,
                                value: tempResult[o]
                            })
                        }
                    }
                });
            },
            //弹出框
            showMenu: function(item) {
                var buttons = [];
                if (item.flag == 'L') {
                    buttons.push({
                        text: '提交',
                        onClick: function() {
                            vm.updateState('1', item);
                        }
                    });
                }
                if (item.flag == 'T') {
                    buttons.push({
                        text: '取消提交',
                        onClick: function() {
                            vm.updateState('2', item)
                        }
                    });
                }
                if (item.flag == 'T') {
                    buttons.push({
                        text: '审核',
                        onClick: function() {
                            vm.updateState('3', item)
                        }
                    });
                }
                if (item.flag == 'S') {
                    buttons.push({
                        text: '取消审核',
                        onClick: function() {
                            vm.updateState('4', item)
                        }
                    });
                }
                if (item.flag == 'L') {
                    buttons.push({
                        text: '编辑',
                        onClick: function() {
                            vm.update(item)
                        }
                    });
                }
                if (item.flag == 'L') {
                    buttons.push({
                        text: '删除',
                        onClick: function() {
                            vm.delete(item)
                        }
                    });
                }
                buttons.push({
                    text: '取消',
                    color: 'red'
                });
                eShop.actions(pageDiv.container, buttons);
            },
            //修改单据状态
            updateState: function(flag, order) {
                var request = {
                    data: {
                        tenantId: xunSoft.user.tenantId(),
                        entityId: order.transferOrderId,
                        flag: flag
                    }
                };
                //提交修改
                warehouseService.put.putShopTransferState(request, {}, function(responseData) {
                    xunSoft.helper.showMessage('单据操作成功');
                    if (responseData.data.submitTime) {
                        order.flag = 'T';
                    }
                    if (responseData.data.auditTime) {
                        order.flag = 'S';
                    }
                    if (flag == '2') {
                        order.flag = 'L';
                    }
                    if (flag == '4') {
                        order.flag = 'T';
                    }
                });
            },
            back: function() {
                mainView.router.back();
                if (_.isFunction(page.query.callback)) {
                    page.query.callback();
                }
            },
            //删除单据
            delete: function(transferOrder) {
                eShop.confirm('您确定要删除当前调拨单吗？', function() {
                    warehouseService.delete.deleteShopTransfer({ id: transferOrder.transferOrderId }, {}, function(responseData) {
                        _.each(vm.response.data, function(value, key) {
                            if (value.time == transferOrder.transferDate) {
                                vm.response.data[key].value.$remove(transferOrder);
                            }
                        });
                        vm.response.total--;
                        xunSoft.helper.showMessage('单据删除成功');
                    });
                });
            },
            //订单编辑
            update: function(transferOrder) {
                mainView.router.load({
                    url: 'warehouse/shopTransfer/update.ios.html',
                    query: {
                        orderId: transferOrder.transferOrderId
                    }
                });
            },
        }
    });
    vm.init();
});

//调拨单详情
eShop.onPageInit('warehouse_shopTransfer_detail', function(page) {
    var pageDiv = $$(page.container);
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                id: 0
            },
            response: {
                data: []
            }
        },
        methods: {
            init: function() {
                //获取明细Id
                vm.request.id = page.query.orderId;
                this.load();
                //下拉刷新
                pageDiv.find('.pull-to-refresh-content').on('refresh', function() {
                    eShop.pullToRefreshDone();
                    vm.load();
                });
            },
            load: function() {
                warehouseService.get.getShopTransferDetail(vm.request, vm.response, function(responseData) {
                    console.log(vm.response.data);
                });

            },
            edit: function(e) {
                e.preventDefault();
                e.stopPropagation()
                if (vm.response.data.submitTime || vm.response.data.auditTime) {
                    xunSoft.helper.showMessage("单据已提交审核，不能修改");
                    return;
                }
                mainView.router.load({
                    url: 'warehouse/shopTransfer/update.ios.html',
                    query: {
                        orderId: vm.response.data.transferOrderId,
                        callback: this.load
                    }
                });
            },
            detail: function(e, item) {
                e.preventDefault();
                e.stopPropagation()
                mainView.router.load({
                    url: 'kind/kindDetail.ios.html',
                    query: {
                        item: item,
                        type: 'shopTransfer'
                    }
                });
            }
        }
    });
    vm.init();
});
//调拨单录入
eShop.onPageInit('warehouse_shopTransfer_add', function(page) {
    var pageDiv = $$(page.container);
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                fromWarehouseId: '',
                toWarehouseId: '',
                transferOrderId: '',
                transferDate: xunSoft.helper.formatDate(new Date()),
                sponsorId: '',
                creatorId: xunSoft.user.userId(),
                tenantId: xunSoft.user.tenantId(),
                warehouseId: xunSoft.user.shopId(),
                description: '',
                detailList: []
            },
            response: {
                users: baseInfoService.users,
                transfers: baseInfoService.shop
            }
        },
        watch: {
            "request.sponsorId": function(val, oldVal) {
                xunSoft.event.smartSelect("#sponsorId");
            },
            "request.fromWarehouseId": function(val, oldVal) {
                xunSoft.event.smartSelect("#fromWarehouseId");
            },
            "request.toWarehouseId": function(val, oldVal) {
                xunSoft.event.smartSelect("#toWarehouseId");
            }
        },
        methods: {
            init: function() {
                //调拨日期
                var checkStockDate = eShop.calendar({
                    input: pageDiv.find('#transferDate')[0],
                });
                this.request.sponsorId = xunSoft.user.userId();
            },
            //选择货品的回调
            selectKind: function(responseData) {
                console.log(responseData);
                vm.request.detailList = [];
                _.each(responseData, function(item) {
                    item.transferAmount = item.Amount;
                    item = _.omit(item, "Amount", "Price", 'priceList');
                    vm.request.detailList.push(item);
                });
                console.log(vm.request.detailList);
            },
            //编辑货品
            editKind: function(kind) {
                mainView.router.load({
                    url: "warehouse/shopTransfer/editKindPrice.ios.html",
                    query: {
                        kind: kind,
                        request: vm.request.detailList
                    }
                });
            },
            //保存
            save: function() {
                if (vm.request.fromWarehouseId == '') {
                    xunSoft.helper.showMessage("请选择调出仓库");
                    return;
                }
                if (vm.request.toWarehouseId == '') {
                    xunSoft.helper.showMessage("请选择调入仓库");
                    return;
                }
                if (vm.request.toWarehouseId == vm.request.fromWarehouseId) {
                    xunSoft.helper.showMessage("出入仓库重复");
                    vm.request.toWarehouseId = "";
                    return;
                }
                if (vm.request.sponsorId == "") {
                    xunSoft.helper.showMessage('经手人不能为空!');
                    return;
                }
                if (vm.request.detailList.length == 0) {
                    xunSoft.helper.showMessage("请至少选择一件货品");
                    return;
                }
                //构造数据请求
                var postRequest = {
                    data: _.omit(vm.request, 'detailList'),
                };
                //重新过滤货品基本信息
                postRequest.data.detailList = _.map(vm.request.detailList, function(item) {
                    return _.omit(item, 'kind');
                });

                //保存当前单据信息
                warehouseService.post.postShopTransfer(postRequest, {}, function(responseData) {
                    xunSoft.helper.showMessage("调拨单已经保存成功！");
                    vm.request.toWarehouseId = '';
                    vm.request.fromWarehouseId = '';
                    vm.request.description = '';
                    vm.request.sourceOrderNo = '';
                    vm.request.detailList = [];
                });
                console.log(vm.request);
            },
            //退出
            back: function() {
                var requestInfo = this.request;
                if (requestInfo.detailList.length > 0) {
                    eShop.confirm('您的调拨订单已经发生更改，是否取消?', function() {
                        mainView.router.back();
                    });
                } else {
                    mainView.router.back();
                }
            },

        }
    });
    vm.init();
});
//编辑调拨单回调
eShop.onPageInit('warehouse_shopTransfer_update', function(page) {
        var pageDiv = $$(page.container);
        var vm = new Vue({
            el: page.container,
            data: {
                request: {
                    fromWarehouseId: '',
                    toWarehouseId: '',
                    transferOrderId: '',
                    transferDate: xunSoft.helper.formatDate(new Date()),
                    sponsorId: '',
                    creatorId: xunSoft.user.userId(),
                    tenantId: xunSoft.user.tenantId(),
                    warehouseId: xunSoft.user.shopId(),
                    description: '',
                    detailList: [],
                    //删除货品列表
                    deletedIDs: '',
                },
                response: {
                    users: baseInfoService.users,
                    transfers: baseInfoService.shop
                }
            },
            watch: {
                "request.sponsorId": function(val, oldVal) {
                    xunSoft.event.smartSelect("#sponsorId");
                },
                "request.fromWarehouseId": function(val, oldVal) {
                    xunSoft.event.smartSelect("#fromWarehouseId");
                },
                "request.toWarehouseId": function(val, oldVal) {
                    xunSoft.event.smartSelect("#toWarehouseId");
                }
            },
            methods: {
                init: function() {
                    //调拨日期
                    var transferDate = eShop.calendar({
                        input: pageDiv.find('#transferDate')[0],
                    });
                    if (page.query.orderId) {
                        warehouseService.get.getShopTransferDetail({ id: page.query.orderId }, {}, function(responseData) {
                            //订单基本信息
                            _.extend(vm.request, _.omit(responseData.data, 'detailList', 'deletedIDs'));

                            //获取货品信息
                            _.each(responseData.data.detailList, function(item) {
                                //过滤货品信息
                                var newKind = kindService.utility.parseOrderKind(item);
                                newKind.transferDetailId = item.transferDetailId;
                                newKind.transferAmount = item.transferAmount;
                                vm.request.detailList.push(newKind);
                            });
                        });
                        console.log(vm.request);
                    } else {
                        vm.request.sponsorId = xunSoft.user.userId();
                    }
                },
                //选择货品的回调
                selectKind: function(responseData) {
                    console.log(responseData);
                    vm.request.detailList = [];
                    _.each(responseData, function(item) {
                        item.transferAmount = item.Amount;
                        item = _.omit(item, "Amount", "Price", 'priceList');
                        vm.request.detailList.push(item);
                    });
                    console.log(vm.request.detailList);
                },
                //编辑货品
                editKind: function(kind) {
                    mainView.router.load({
                        url: "warehouse/shopTransfer/editKindPrice.ios.html",
                        query: {
                            kind: kind,
                            request: vm.request
                        }
                    });
                },
                //保存
                save: function() {
                    if (vm.request.fromWarehouseId == '') {
                        xunSoft.helper.showMessage("请选择调出仓库");
                        return;
                    }
                    if (vm.request.toWarehouseId == '') {
                        xunSoft.helper.showMessage("请选择调入仓库");
                        return;
                    }
                    if (vm.request.toWarehouseId == vm.request.fromWarehouseId) {
                        xunSoft.helper.showMessage("出入仓库重复");
                        vm.request.toWarehouseId = "";
                        return;
                    }
                    if (vm.request.sponsorId == "") {
                        xunSoft.helper.showMessage('经手人不能为空!');
                        return;
                    }
                    if (vm.request.detailList.length == 0) {
                        xunSoft.helper.showMessage("请至少选择一件货品");
                        return;
                    }
                    //构造数据请求
                    var postRequest = {
                        data: _.omit(vm.request, 'detailList'),
                    };
                    //重新过滤货品基本信息
                    postRequest.data.detailList = _.map(vm.request.detailList, function(item) {
                        return _.omit(item, 'kind');
                    });

                    //保存当前单据信息
                    warehouseService.put.putShopTransfer(postRequest, {}, function(responseData) {
                        xunSoft.helper.showMessage("调拨单已经修改成功！");
                        if (_.isFunction(page.query.callback)) {
                            page.query.callback();
                        }
                        mainView.router.back();

                    });

                    console.log(vm.request);
                },
                //退出
                back: function() {
                    var requestInfo = this.request;
                    if (requestInfo.detailList.length > 0) {
                        eShop.confirm('您的调拨订单已经发生更改，是否取消?', function() {
                            mainView.router.back();
                        });
                    } else {
                        mainView.router.back();
                    }
                },

            }
        });
        vm.init();
    })
    //修改商品价格信息
eShop.onPageInit('warehouse_shopTransfer_editKindPrice', function(page) {
    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                transferAmount: 0,
                deliverDate: '',
                description: '',
                colorId: 0,
                colorList: [],
                sizeId: 0,
                sizeList: [],
            },
            kind: '',
            detailList: '',
        },
        watch: {
            "request.colorId": function(val, oldVal) {
                console.log(val);
                xunSoft.event.smartSelect("#colorId");
            },
            "request.sizeId": function(val, oldVal) {
                console.log(val);
                xunSoft.event.smartSelect("#sizeId");
            }
        },
        methods: {
            init: function() {
                console.log(page.query);
                kindService.get.getKindDetail({ id: page.query.kind.kindId }, {}, function(responseData) {
                    vm.request.sizeId = responseData.data.sizeId;
                    vm.request.sizeList = responseData.data.sizeList;
                    vm.request.colorId = responseData.data.colorId;
                    vm.request.colorList = responseData.data.colorList;
                    if (page.query.kind) {
                        _.extend(vm.request, page.query.kind);
                        vm.kind = page.query.kind;
                        vm.detailList = page.query.request.detailList;
                    }
                });


                eShop.calendar({
                    input: pageDiv.find("#deliverDate"),
                    minDate: new Date()
                });

            },
            delete: function(kind) {
                if (!kind.transferDetailId) {
                    mainView.router.back();
                    return;
                }
                if (_.isEmpty(page.query.request.deletedIDs)) {
                    page.query.request.deletedIDs += kind.transferDetailId;
                } else {
                    page.query.request.deletedIDs += (',' + kind.transferDetailId);
                }
                mainView.router.back();
            },

            //保存修改
            save: function() {
                if (vm.request.transferAmount <= 0 || vm.request.transferAmount > 999999) {
                    xunSoft.helper.showMessage("请输入合理的数量!");
                    return;
                }
                vm.request.sizeText = _.find(vm.request.sizeList, function(item) { return item.sizeId == vm.request.sizeId }).sizeText;
                vm.request.colorName = _.find(vm.request.colorList, function(item) { return item.colorId == vm.request.colorId }).colorName;
                if (page.query.kind) {
                    _.extend(page.query.kind, vm.request);
                }
                if (page.query.request.detailList) {
                    _.extend(page.query.request.detailList, vm.detailList);
                }
                mainView.router.back();
            },
        }
    });

    vm.init();
});
//编辑货品回调
eShop.onPageInit('warehouse_shopTransfer_editKind', function(page) {

    var pageDiv = $$(page.container);
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                kindId: '',
                colorId: '',
                sizeId: '',
                unitId: 0,
                transferAmount: 0,
                description: '',
                kind: null,
                inventory: '',
            },
            response: {
                kindDetail: {
                    kindId: 0
                },
                selectedKind: []
            }
        },
        //检测参数变化
        watch: {
            'request.transferAmount': function(val, oldval) {
                var newVal = parseInt(val) || 0;
                if (newVal <= 0 || newVal > 999999) {
                    return;
                }
                this.request.transferAmount = this.request.transferAmount -
                    this.request.transferAmount;
            },
            'request.colorId': function(val, oldval) {
                if (this.request.sizeId != '') {
                    this.loadWarehouseCount();
                }
            },
            'request.sizeId': function(val, oldval) {
                if (this.request.colorId != '') {
                    this.loadWarehouseCount();
                }
            },
        },
        methods: {
            init: function() {

                this.loadKind();
            },
            //获取货品颜色，尺码的库存数量
            loadWarehouseCount: function() {
                var requestqty = {
                    kindId: page.query.kindId,
                    colorId: vm.request.colorId,
                    sizeId: vm.request.sizeId
                };
                //获取商品库存信息
                warehouseService.get.getShopWarehouseSum(requestqty, {}, function(responseDataqty) {
                    vm.request.transferAmount = responseDataqty.data;
                });
                if (_.isArray(page.query.detailList)) {
                    vm.response.selectedKind = [];
                    _.each(page.query.detailList, function(item) {
                        console.log(item);
                        if ((item.kindId == vm.request.kindId) && (item.colorId == vm.request.colorId) && (item.sizeId ==
                                vm.request.sizeId)) {

                            vm.request.description = item.description;
                            vm.request.transferAmount = item.transferAmount;
                        } else {
                            vm.request.transferAmount = 0;
                        }

                    });
                }
            },
            //加载货品信息
            loadKind: function() {
                var request = {
                    id: page.query.kindId
                };

                //获取商品信息
                kindService.get.getKindDetail(request, {}, function(responseData) {
                    //设置货品信息    
                    vm.response.kindDetail = responseData.data;
                    vm.request.kind = _.pick(responseData.data, 'kindId', 'transferAmount', 'detailList',
                        'kindName', 'colorName', 'sizeText', 'kindClassName', 'kindNo', 'brandName', 'unitName');

                    vm.request.kindId = responseData.data.kindId;
                    vm.request.unitId = responseData.data.unitId;
                });
            },
            //保存修改信息
            save: function() {

                if (vm.request.colorId == '') {
                    xunSoft.helper.showMessage("至少选择一种颜色");
                    return;
                }
                if (vm.request.sizeId == '') {
                    xunSoft.helper.showMessage("至少选择一种尺码");
                    return;
                }
                if (vm.request.transferAmount <= 0 || vm.request.transferAmount > 999999) {
                    xunSoft.helper.showMessage("请输入合理的数量!");
                    return;
                }


                //复制货品信息
                var newKind = _.clone(vm.request);

                //获取颜色尺码
                var sizeInfo = _.find(this.response.kindDetail.sizeList, function(item) {
                    return item.sizeId == newKind.sizeId;
                });
                if (sizeInfo) {
                    newKind.kind.sizeText = sizeInfo.sizeText;
                }
                var colorInfo = _.find(this.response.kindDetail.colorList, function(item) {
                    return item.colorId == newKind.colorId;
                });
                if (colorInfo) {
                    newKind.kind.colorName = colorInfo.colorName;
                }

                //如果货品列表不为空
                if (page.query.detailList) {
                    //遍历货品列表根据sizeId、colorId、kindId 查找是否有相同货品
                    var kindInfo = _.find(page.query.detailList, function(item) {
                        return (item.kindId == newKind.kindId) && (item.sizeId == newKind.sizeId) && (item.colorId ==
                            newKind.colorId);
                    });
                    //找到相同货品用新的货品替换原有值。
                    if (kindInfo) {
                        kindInfo.checkAmount = newKind.checkAmount;
                        kindInfo.profitLossAmount = newKind.profitLossAmount;
                        kindInfo.description = newKind.description;
                    } else {
                        page.query.detailList.push(newKind);
                    }
                    vm.request.sizeId = '';
                    vm.request.colorId = '';
                    vm.request.transferAmount = 0;
                    vm.request.description = '';
                    xunSoft.helper.showMessage("添加货品成功");
                } else {
                    xunSoft.helper.showMessage("无法添加货品信息", '警告');
                    mainView.router.back();
                }

            }
        }
    });
    vm.init();

})