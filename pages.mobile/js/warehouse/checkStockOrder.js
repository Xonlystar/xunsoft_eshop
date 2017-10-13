//盘点单列表回调
eShop.onPageInit('warehouse_checkStockOrder_list', function(page) {
    var pageDiv = $$(page.container);
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                query: {
                    checkStockOrderNo: '',
                    checkStockOrderId: '',
                    createTimeFrom: '',
                    createTimeTo: '',
                    status: '',
                    creatorId: '',
                    sponsorId: '',
                    auditorId: '',
                    checkStockLevelId: '-1',
                    tenantId: xunSoft.user.tenantId(),
                    // warehouseId:xunSoft.user.shopId(),
                    orderBy: 'checkStockOrderId desc',
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
                        total += (parseFloat(item.detailSummary.checkAmount) || 0);
                    });
                });
                return total;
            }
        },
        methods: {
            init: function() {

                this.load();
                pageDiv.find('.pull-to-refresh-content').on('refresh', function() {
                    //下拉刷新
                    eShop.pullToRefreshDone();
                    vm.refresh();
                })
            },
            //刷新
            refresh: function() {
                this.response.data = [];
                this.response.total = 0;
                this.request.pageIndex = 1;
                this.load();
            },
            load: function() {
                warehouseService.get.getCheckStockOrderList(vm.request, {}, function(responseData) {
                    if (_.isArray(responseData.data) && responseData.data.length > 0) {
                        if (vm.request.pageIndex) {
                            vm.request.pageIndex++;
                        }
                        vm.response.total = responseData.total;
                        var tempResult = [];
                        //将数据存入本地
                        _.each(responseData.data, function(item) {
                            //是否存在下一页
                            if (vm.request.pageIndex) {
                                vm.request.pageIndex++;
                            }
                            //转换单据信息
                            var checkStockOrder = _.pick(item, 'checkStockOrderId', 'checkStockLevelId', 'detailSummary', 'sponsorId',
                                'sponsorName', 'createTime', 'creatorName', 'creatorId', 'warehouseName', 'warehouseId', 'checkStockDate', 'checkStockOrderNo');

                            checkStockOrder.flag = 'L';
                            if (item.submitTime) {
                                checkStockOrder.flag = 'T';
                            }
                            if (item.auditTime) {
                                checkStockOrder.flag = 'S';
                            }
                            if (!tempResult[checkStockOrder.checkStockDate]) { tempResult[checkStockOrder.checkStockDate] = [] }
                            tempResult[checkStockOrder.checkStockDate].push(checkStockOrder);
                        });
                        for (var o in tempResult) {
                            vm.response.data.push({ time: o, value: tempResult[o] })
                        }
                    }
                });
            },
            //查询
            query: function() {
                mainView.router.load({
                    url: 'warehouse/common/filter.ios.html',
                    query: {
                        para: vm.request.query,
                        callback: vm.refresh
                    }
                });
            },
            //删除盘点单
            delete: function(checkStockOrder) {
                eShop.confirm('您确定要删除当前库存盘点单吗?', function() {
                    warehouseService.delete.deleteCheckStockOrder({ id: checkStockOrder.checkStockOrderId }, {}, function(responseData) {
                        _.each(vm.response.data, function(value, key) {
                            if (value.time == checkStockOrder.checkStockDate) {
                                vm.response.data[key].value.$remove(checkStockOrder);
                            }
                        });
                        vm.response.total--;
                        xunSoft.helper.showMessage("单据删除成功！");
                    });
                });
            },
            //修改单据状态
            updateState: function(flag, order) {
                var request = {
                    data: {
                        tenantId: xunSoft.user.tenantId(),
                        entityId: order.checkStockOrderId,
                        flag: flag
                    }
                };

                //修改单据的状态
                warehouseService.put.putCheckStockOrderState(request, {}, function(responseData) {
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
            //收货单编辑
            update: function(checkStockOrder) {
                mainView.router.load({
                    url: 'warehouse/checkStockOrder/update.ios.html',
                    query: {
                        orderId: checkStockOrder.checkStockOrderId
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
                    text: '打印',
                    color: 'green',
                    onClick: function() {
                        mainView.router.load({ url: "warehouse/common/print.ios.html?orderType=checkStock&orderId=" + item.checkStockOrderId });
                    }
                });
                buttons.push({
                    text: '取消',
                    color: 'red'
                });
                eShop.actions(pageDiv.container, buttons);
            },
            back: function() {
                mainView.router.back();
                if (_.isFunction(page.query.callback)) {
                    page.query.callback();
                }
            },
            //更新
            update: function(checkStockOrder) {
                mainView.router.load({
                    url: 'warehouse/checkStockOrder/update.ios.html',
                    query: {
                        orderId: checkStockOrder.checkStockOrderId
                    }
                });
            },

        }
    });
    vm.init();
});

//库存盘点详情
eShop.onPageInit('warehouse_checkStockOrder_detail', function(page) {
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
                vm.request.id = page.query.checkStockOrderId;

                this.load();
                //下拉刷新
                pageDiv.find('.pull-to-refresh-content').on('refresh', function() {
                    eShop.pullToRefreshDone();
                    vm.load();
                });
            },
            load: function() {
                warehouseService.get.getCheckStockOrderDetail(vm.request, vm.response);
            },
            edit: function(e) {
                e.preventDefault();
                e.stopPropagation()
                if (vm.response.data.submitTime || vm.response.data.auditTime) {
                    xunSoft.helper.showMessage("单据已提交审核，不能修改");
                    return;
                }
                mainView.router.load({
                    url: 'warehouse/checkStockOrder/update.ios.html',
                    query: {
                        orderId: vm.response.data.checkStockOrderId,
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
                        type: 'checkStockOrder'
                    }
                });
            }
        }
    });
    vm.init();
});

//盘点单录入回调
eShop.onPageInit('warehouse_checkStockOrder_add', function(page) {
    var pageDiv = $$(page.container);
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                checkStockLevelId: '',
                checkStockDate: xunSoft.helper.formatDate(new Date()),
                sponsorId: '',
                creatorId: xunSoft.user.userId(),
                tenantId: xunSoft.user.tenantId(),
                warehouseId: "",
                description: '',
                detailList: []
            },
            response: {
                users: baseInfoService.users,
                transfers: baseInfoService.shop,
                checkLevels: []
            }
        },
        computed: {
            //总数量
            _totalAmount: function() {
                var total = 0;
                _.each(this.response.data, function(row) {
                    _.each(row.value, function(item) {
                        total += (parseFloat(item.detailSummary.checkAmount) || 0);
                    });
                });
                return total;
            }
        },
        watch: {
            "request.sponsorId": function(val, oldVal) {
                xunSoft.event.smartSelect("#sponsorId");
            },
            "request.warehouseId": function(val, oldVal) {
                xunSoft.event.smartSelect("#warehouseId");
            },
            "request.checkStockLevelId": function(val, oldVal) {
                xunSoft.event.smartSelect("#checkStockLevelId");
            }

        },
        methods: {
            init: function() {
                //益损日期
                var checkStockDate = eShop.calendar({
                    input: pageDiv.find('#checkStockDate')[0],
                });
                this.response.checkLevels.push({ levelId: 0, levelName: "全部" });
                this.response.checkLevels.push({ levelId: 1, levelName: "SKU" })
                this.response.checkLevels.push({ levelId: 2, levelName: "货号盘点" })
                this.loadCheckStock();
                this.request.sponsorId = xunSoft.user.userId();
            },
            //选择货品的回调
            selectKind: function(responseData) {
                console.log(responseData);
                vm.request.detailList = [];
                _.each(responseData, function(item) {
                    item.checkAmount = item.Amount;
                    item.profitLossAmount = parseInt(item.checkAmount) - item.accountAmount;
                    item = _.omit(item, "Amount", "Price", 'priceList');
                    vm.request.detailList.push(item);
                });
                console.log(vm.request.detailList);
            },
            editKind: function(kind) {
                eShop.prompt('请输入盘点数量', kind.kindName + "--" + kind.kindNo, function(value) {
                    kind.checkAmount = value;
                    kind.profitLossAmount = parseInt(kind.checkAmount) - kind.accountAmount;
                });
            },
            loadCheckStock: function() {
                if (page.query.checkStockOrderId) {
                    var request = {
                        id: page.query.checkStockOrderId
                    };
                    //获取益损单详细信息
                    warehouseService.get.getCheckStockOrderDetail(request, {}, function(responseData) {
                        //订单基本信息
                        _.extend(vm.request, _.omit(responseData.data, 'deletedIDs', 'detailList'));

                        //获取货品信息
                        _.each(responseData.data.detailList, function(item) {
                            //过滤货品信息
                            var newKind = _.pick(item, 'kindId', 'unitId', 'colorId', 'sizeId', 'accountAmount', 'checkAmount', 'profitLossAmount', 'description');
                            newKind.kind = _.pick(item, 'kindId', 'kindName', 'kindClassName', 'kindNo', 'brandName', 'unitName', 'colorName', 'sizeText');
                            vm.request.detailList.push(newKind);
                        });
                    });
                } else {
                    vm.request.sponsorId = xunSoft.user.userId();
                }
            },
            //保存
            save: function() {
                if (vm.request.warehouseId == '') {
                    xunSoft.helper.showMessage("请选择仓库");
                    return;
                }
                if (vm.request.checkStockLevelId == '') {
                    xunSoft.helper.showMessage("请选择盘点级别");
                    return;
                }
                if (vm.request.detailList.length == 0) {
                    xunSoft.helper.showMessage("请至少选择一件货品");
                    return;
                }
                if (vm.request.sponsorId == "") {
                    xunSoft.helper.showMessage('经手人不能为空!');
                    return;
                }

                //构造数据请求
                var postRequest = {
                    data: _.omit(vm.request, 'detailList'),
                };
                //重新过滤货品基本信息
                postRequest.data.detailList = _.map(vm.request.detailList, function(item) { return _.omit(item, 'kind'); });

                //保存当前单据信息
                warehouseService.post.postCheckStockOrder(postRequest, {}, function(responseData) {
                    xunSoft.helper.showMessage("盘点订单已经保存成功！");
                    vm.request.description = '';
                    vm.request.warehouseId = ''
                    vm.request.checkStockLevelId = "";
                    vm.request.detailList = [];
                });
            },
            //退出
            back: function() {
                var requestInfo = this.request;

                if (requestInfo.detailList.length > 0) {
                    eShop.confirm('您的收货订单已经发生更改，是否取消?', function() {
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

//编辑盘点单回调
eShop.onPageInit('warehouse_checkStockOrder_update', function(page) {
    var pageDiv = $$(page.container);
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                checkStockDate: '',
                sponsorId: '',
                checkStockOrderNo: '',
                checkStockLevelId: '',
                description: '',
                detailList: [],
                warehouseId: xunSoft.user.shopId(),
                //删除货品列表
                deletedIDs: ''
            },
            response: {
                users: baseInfoService.users,
                transfers: baseInfoService.shop,
                checkLevels: []
            }
        },
        computed: {
            //总金额
            totalCheckStockAmount: function() {
                var total = 0;
                _.each(this.request.detailList, function(item) {
                    total += (parseFloat(item.checkAmount) || 0);
                });
                return total;
            },

        },
        watch: {
            "request.sponsorId": function(val, oldVal) {
                xunSoft.event.smartSelect("#sponsorId");
            },
            "request.warehouseId": function(val, oldVal) {
                xunSoft.event.smartSelect("#warehouseId");
            },
            "request.checkStockLevelId": function(val, oldVal) {
                xunSoft.event.smartSelect("#checkStockLevelId");
            }

        },
        methods: {
            init: function() {
                //益损日期
                var checkStockDate = eShop.calendar({
                    input: pageDiv.find('#checkStockDate')[0],
                });
                this.response.checkLevels.push({ levelId: 0, levelName: "全部" });
                this.response.checkLevels.push({ levelId: 1, levelName: "SKU" })
                this.response.checkLevels.push({ levelId: 2, levelName: "货号盘点" })
                if (page.query.orderId) {
                    warehouseService.get.getCheckStockOrderDetail({ id: page.query.orderId }, {}, function(responseData) {
                        //订单基本信息
                        _.extend(vm.request, _.omit(responseData.data, 'deletedIDs', 'detailList'));

                        //获取货品信息
                        _.each(responseData.data.detailList, function(item) {
                            //过滤货品信息
                            var newKind = _.pick(item, 'checkStockDetailId', 'kindId', 'unitId', 'colorId', 'sizeId', 'checkAmount', 'accountAmount', 'profitLossAmount', 'checkStockLevelId', 'description');

                            newKind.kind = _.pick(item, 'kindId', 'kindName', 'kindClassName', 'kindNo', 'brandName', 'unitName', 'colorName', 'sizeText');
                            vm.request.detailList.push(newKind);
                        });
                    });
                }
            },
            //选择货品的回调
            selectKind: function(responseData) {
                console.log(responseData);
                vm.request.detailList = [];
                _.each(responseData, function(item) {
                    item.checkAmount = item.Amount;
                    item.profitLossAmount = parseInt(item.checkAmount) - item.accountAmount;
                    item = _.omit(item, "Amount", "Price", 'priceList');
                    vm.request.detailList.push(item);
                });
                console.log(vm.request.detailList);
            },
            //编辑货品
            editKind: function(kind) {
                mainView.router.load({
                    url: 'warehouse/checkStockOrder/editKindPrice.ios.html',
                    query: {
                        kind: kind
                    }
                });
            },
            //删除货品
            delete: function(kind) {
                if (!kind.checkStockDetailId) {
                    return;
                }
                if (_.isEmpty(vm.request.deletedIDs)) {
                    vm.request.deletedIDs += kind.checkStockDetailId;
                } else {
                    vm.request.deletedIDs += (',' + kind.checkStockDetailId);
                }
            },
            //保存货品
            save: function() {

                if (vm.request.checkStockLevelId == '' && vm.request.checkStockLevelId != 0) {
                    xunSoft.helper.showMessage("请输入盘点级别");
                    return;
                }
                if (vm.request.detailList.length == 0) {
                    xunSoft.helper.showMessage("请至少选择一件货品");
                    return;
                }
                if (vm.request.sponsorId == "") {
                    xunSoft.helper.showMessage('经手人不能为空!');
                    return;
                }
                //请求数据
                var requestData = {
                    data: _.omit(vm.request, 'detailList'),
                };

                requestData.data.detailList = _.map(vm.request.detailList, function(item) { return _.omit(item, 'kind'); });
                console.log(requestData.data.detailList);
                warehouseService.put.putCheckStockOrder(requestData, {}, function() {
                    xunSoft.helper.showMessage('修改盘点单信息成功！');
                    if (_.isFunction(page.query.callback)) {
                        page.query.callback();
                    }
                    mainView.router.back();
                });
                console.log(vm.request);
            }
        }
    });
    vm.init();
})


//修改商品价格回调
eShop.onPageInit('warehouse_checkStockOrder_editKindPrice', function(page) {
    var pageDiv = $$(page.container);
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                checkAmount: 1,
                profitLossAmount: '',
                accountAmount: '',
                retailPrice: 0,
                description: '',
            }
        },
        //检测参数改变
        watch: {
            'request.checkAmount': function(val, oldval) {
                var newVal = parseInt(val) || 0;
                if (newVal <= 0 || newVal > 999999) {
                    return;
                }
                this.request.profitLossAmount = this.request.checkAmount -
                    this.request.accountAmount;
            }
        },
        methods: {
            init: function() {
                if (page.query.kind) {

                    _.extend(vm.request, page.query.kind);
                }
            },

            //保存修改
            save: function() {
                if (vm.request.checkAmount <= 0 || vm.request.checkAmount > 999999) {
                    xunSoft.helper.showMessage("请输入合理的数量!");
                    return;
                }
                if (page.query.kind) {
                    _.extend(page.query.kind, vm.request);
                }
                mainView.router.back();
            },
        }
    });

    vm.init();

})

//编辑货品回调
eShop.onPageInit('warehouse_checkStockOrder_editKind', function(page) {

    var pageDiv = $$(page.container);
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                kindId: '',
                colorId: '',
                sizeId: '',
                unitId: 0,
                accountAmount: 0,
                checkAmount: 0,
                profitLossAmount: 0,
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
            'request.checkAmount': function(val, oldval) {
                var newVal = parseInt(val) || 0;
                if (newVal <= 0 || newVal > 999999) {
                    return;
                }
                this.request.profitLossAmount = this.request.checkAmount -
                    this.request.accountAmount;
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
                    vm.request.accountAmount = responseDataqty.data;
                });
                if (_.isArray(page.query.detailList)) {
                    vm.response.selectedKind = [];
                    _.each(page.query.detailList, function(item) {
                        console.log(item);
                        if ((item.kindId == vm.request.kindId) && (item.colorId == vm.request.colorId) &&
                            (item.sizeId == vm.request.sizeId)) {

                            vm.request.description = item.description;
                            vm.request.checkAmount = item.checkAmount;
                            vm.request.accountAmount = item.accountAmount;
                        } else {
                            vm.request.checkAmount = 0;
                            vm.request.profitLossAmount = 0;
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
                    vm.request.kind = _.pick(responseData.data, 'kindId', 'accountAmount', 'checkAmount', 'profitLossAmount', 'detailList',
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
                if (vm.request.checkAmount <= 0 || vm.request.checkAmount > 999999) {
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
                    //遍历货品列表根据sizeId、colorId、kindId	查找是否有相同货品
                    var kindInfo = _.find(page.query.detailList, function(item) {
                        return (item.kindId == newKind.kindId) && (item.sizeId == newKind.sizeId) && (item.colorId == newKind.colorId);
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
                    vm.request.checkAmount = 0;
                    vm.request.profitLossAmount = 0;
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