//损益单列表回调
eShop.onPageInit('warehouse_profitLossOrder_list', function(page) {
    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                query: {
                    profitLossOrderNo: '',
                    createTimeFrom: '',
                    createTimeTo: '',
                    status: '',
                    creatorId: '',
                    sponsorId: '',
                    auditorId: '',
                    tenantId: xunSoft.user.tenantId(),
                    warehouseId: "",
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
                        total += (parseFloat(item.detailSummary.profitLossAmount) || 0);
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
                warehouseService.get.getProfitLossList(vm.request, {}, function(responseData) {
                    if (_.isArray(responseData.data) && responseData.data.length > 0) {
                        vm.response.total = responseData.total;
                        var tempResult = [];
                        //将数据存入本地
                        _.each(responseData.data, function(item) {
                            //是否存在下一页
                            if (vm.request.pageIndex) {
                                vm.request.pageIndex++;
                            }
                            //转换单据信息
                            var profitLossOrder = _.pick(item, 'warehouseId', 'profitLossOrderId', 'warehouseName', 'auditorId', 'creatorId',
                                'creatorName', 'createTime', 'profitLossOrderNo',
                                'sponsorId', 'detailSummary', 'profitLossDate');

                            profitLossOrder.flag = 'L';
                            if (item.submitTime) {
                                profitLossOrder.flag = 'T';
                            }
                            if (item.auditTime) {
                                profitLossOrder.flag = 'S';
                            }
                            if (!tempResult[profitLossOrder.profitLossDate]) { tempResult[profitLossOrder.profitLossDate] = [] }
                            tempResult[profitLossOrder.profitLossDate].push(profitLossOrder);
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
                        type: 0,
                        callback: vm.refresh
                    }
                });
            },
            back: function() {
                mainView.router.back();
                if (_.isFunction(page.query.callback)) {
                    page.query.callback();
                }
            },
            //删除益损单
            delete: function(profitLossOrder) {
                eShop.confirm('您确定要删除当前损益单吗?', function() {
                    warehouseService.delete.deleteProfitLossOrder({ id: profitLossOrder.profitLossOrderId }, {}, function(responseData) {
                        _.each(vm.response.data, function(value, key) {
                            if (value.time == profitLossOrder.profitLossDate) {
                                vm.response.data[key].value.$remove(profitLossOrder);
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
                        entityId: order.profitLossOrderId,
                        flag: flag
                    }
                };

                //修改单据的状态
                warehouseService.put.putProfitLossOrderState(request, {}, function(responseData) {
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
            update: function(profitLossOrder) {
                mainView.router.load({
                    url: 'warehouse/profitLossOrder/update.ios.html',
                    query: {
                        orderId: profitLossOrder.profitLossOrderId
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
                        mainView.router.load({ url: "warehouse/common/print.ios.html?orderType=profitLoss&orderId=" + item.profitLossOrderId });
                    }
                });
                buttons.push({
                    text: '取消',
                    color: 'red'
                });
                eShop.actions(pageDiv.container, buttons);
            }
        }
    });
    vm.init();
});

eShop.onPageInit('warehouse_profitLossOrder_detail', function(page) {
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
                warehouseService.get.getProfitLossOrderDetail(vm.request, vm.response);
            },
            edit: function(e) {
                e.preventDefault();
                e.stopPropagation()
                if (vm.response.data.submitTime || vm.response.data.auditTime) {
                    xunSoft.helper.showMessage("单据已提交审核，不能修改");
                    return;
                }
                mainView.router.load({
                    url: 'warehouse/profitLossOrder/update.ios.html',
                    query: {
                        orderId: vm.response.data.profitLossOrderId,
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
                        type: 'profitLessOrder'
                    }
                });
            }
        }
    });
    vm.init();
});

//损益单录入回调
eShop.onPageInit('warehouse_profitLossOrder_add', function(page) {
    var pageDiv = $$(page.container);
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                profitLossOrderNo: '',
                sourceOrderNo: '',
                profitLossDate: xunSoft.helper.formatDate(new Date()),
                SponsorOrganId: xunSoft.user.shopId(),
                sponsorId: '',
                warehouseId: "",
                creatorId: xunSoft.user.userId(),
                tenantId: xunSoft.user.tenantId(),
                description: '',
                detailList: []
            },
            response: {
                users: baseInfoService.users,
                transfers: baseInfoService.shop,

            }
        },
        watch: {
            "request.sponsorId": function(val, oldVal) {
                console.log(val);
                xunSoft.event.smartSelect("#sponsorId");
            },
            "request.warehouseId": function(val, oldVal) {
                console.log(val);
                xunSoft.event.smartSelect("#warehouseId");
            }
        },
        methods: {
            init: function() {
                //益损日期
                var profitLossDate = eShop.calendar({
                    input: pageDiv.find('#profitLossDate')[0],
                });
                this.loadProfitLoss();
                this.request.sponsorId = xunSoft.user.userId();
            },
            //选择货品的回调
            selectKind: function(responseData) {
                console.log(responseData);
                vm.request.detailList = [];
                _.each(responseData, function(item) {
                    item.profitLossAmount = item.Amount;
                    item = _.omit(item, "Amount", "Price", 'priceList');
                    vm.request.detailList.push(item);
                });
                console.log(vm.request.detailList);
            },
            //编辑货品
            editKind: function(kind) {
                mainView.router.load({
                    url: "warehouse/profitLossOrder/editKindPrice.ios.html",
                    query: {
                        kind: kind,
                        request: vm.request
                    }
                });
            },
            loadProfitLoss: function() {
                if (page.query.profitLossOrderId) {
                    var request = {
                        id: page.query.profitLossOrderId
                    };
                    //获取益损单详细信息
                    warehouseService.get.getProfitLossOrderDetail(request, {}, function(responseData) {
                        //订单基本信息
                        _.extend(vm.request, _.omit(responseData.data, 'deletedIDs', 'detailList'));

                        //获取货品信息
                        _.each(responseData.data.detailList, function(item) {
                            //过滤货品信息
                            var newKind = kindService.utility.parseOrderKind(item);
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
                warehouseService.post.postProfitLossOrder(postRequest, {}, function(responseData) {
                    xunSoft.helper.showMessage("损益单已经保存成功！");
                    vm.request.description = '';
                    vm.request.sourceOrderNo = '';
                    vm.request.detailList = [];
                });
            },


            //退出
            back: function() {
                var requestInfo = this.request;

                if (requestInfo.detailList.length > 0) {
                    eShop.confirm('您的损益单已经发生更改，是否取消?', function() {
                        mainView.router.back();
                    });
                } else {
                    mainView.router.back();
                }
            }

        }
    });
    vm.init();
});

//编辑益损单回调
eShop.onPageInit('warehouse_profitLossOrder_update', function(page) {
    var pageDiv = $$(page.container);
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                profitLossDate: '',
                sponsorId: '',
                sourceOrderNo: '',
                profitLossOrderNo: '',
                description: '',
                detailList: [],
                warehouseId: "",
                //删除货品列表
                deletedIDs: '0'
            },
            response: {
                users: baseInfoService.users,
                transfers: baseInfoService.shop,
            }
        },
        watch: {
            "request.sponsorId": function(val, oldVal) {
                console.log(val);
                xunSoft.event.smartSelect("#sponsorId");
            },
            "request.warehouseId": function(val, oldVal) {
                console.log(val);
                xunSoft.event.smartSelect("#warehouseId");
            }
        },
        computed: {
            //总金额
            totalprofitLossMoney: function() {
                var total = 0;
                _.each(this.request.detailList, function(item) {
                    total += parseFloat(item.profitLossMoney);
                });
                return total;
            },
            totalProfitLossAmount: function() {
                var total = 0;
                _.each(this.request.detailList, function(item) {
                    total += parseFloat(item.profitLossAmount);
                });
                return total;
            }
        },
        methods: {
            init: function() {
                //益损日期
                var profitLossDate = eShop.calendar({
                    input: pageDiv.find('#profitLossDate')[0],
                });
                if (page.query.orderId) {
                    warehouseService.get.getProfitLossOrderDetail({ id: page.query.orderId }, {}, function(responseData) {
                        //订单基本信息
                        _.extend(vm.request, _.omit(responseData.data, 'deletedIDs', 'detailList'));

                        //获取货品信息
                        _.each(responseData.data.detailList, function(item) {
                            //过滤货品信息
                            var newKind = kindService.utility.parseOrderKind(item);
                            newKind.profitLossDetailId = item.profitLossDetailId;

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
                    item.profitLossAmount = item.Amount;
                    item = _.omit(item, "Amount", "Price", 'priceList');
                    vm.request.detailList.push(item);
                });
                console.log(vm.request.detailList);
            },
            //编辑货品
            editKind: function(kind) {
                mainView.router.load({
                    url: "warehouse/profitLossOrder/editKindPrice.ios.html",
                    query: {
                        kind: kind,
                        request: vm.request
                    }
                });
            },
            //保存货品
            save: function() {
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
                warehouseService.put.putProfitLossOrder(requestData, {}, function() {
                    xunSoft.helper.showMessage('修改益损单信息成功！');
                    if (_.isFunction(page.query.callback)) {
                        page.query.callback();
                    }
                    mainView.router.back();
                });
            }
        }
    });
    vm.init();
})


//修改商品价格回调
eShop.onPageInit('warehouse_profitLossOrder_editKindPrice', function(page) {
    var pageDiv = $$(page.container);
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                profitLossAmount: 1,
                profitLossMoney: 0,
                retailPrice: 0,
                description: '',
                colorId: 0,
                colorList: [],
                sizeId: 0,
                sizeList: [],
            },
            kind: '',
            detailList: '',
        },
        //检测参数改变
        watch: {
            'request.profitLossAmount': function(val, oldval) {
                var newVal = parseInt(val) || 0;
                if (newVal <= 0 || newVal > 999999) {
                    return;
                }
                this.request.profitLossMoney = this.request.retailPrice * this.request.profitLossAmount;
            },
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
                    console.log(vm.request);
                });
            },
            delete: function(kind) {
                if (!kind.profitLossDetailId) {
                    mainView.router.back();
                    return;
                }
                if (_.isEmpty(page.query.request.deletedIDs)) {
                    page.query.request.deletedIDs += kind.profitLossDetailId;
                } else {
                    page.query.request.deletedIDs += (',' + kind.profitLossDetailId);
                }
                mainView.router.back();
            },
            //保存修改
            save: function() {
                if (vm.request.profitLossAmount <= 0 || vm.request.profitLossAmount > 999999) {
                    xunSoft.helper.showMessage("请输入合理的数量!");
                    return;
                }
                vm.request.sizeText = _.find(vm.request.sizeList, function(item) { return item.sizeId == vm.request.sizeId }).sizeText;
                vm.request.colorName = _.find(vm.request.colorList, function(item) { return item.colorId == vm.request.colorId }).colorName;
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
eShop.onPageInit('warehouse_profitLossOrder_editKind', function(page) {

    var pageDiv = $$(page.container);
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                kindId: '',
                colorId: '',
                sizeId: '',
                unitId: 0,
                profitLossAmount: 0,
                profitLossMoney: 0,
                description: '',
                kind: null,
                inventory: '',
                retailPrice: 0
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
            'request.profitLossAmount': function(val, oldval) {
                var newVal = parseInt(val) || 0;
                if (newVal <= 0 || newVal > 999999) {
                    return;
                }
                vm.calculate();
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
                    vm.request.inventory = responseDataqty.data;
                });
                if (_.isArray(page.query.detailList)) {
                    vm.response.selectedKind = [];
                    _.each(page.query.detailList, function(item) {
                        console.log(item);
                        if (item.kindId == vm.request.kindId && item.colorId == vm.request.colorId &&
                            item.sizeId == vm.request.sizeId) {
                            vm.request.profitLossAmount = item.profitLossAmount;
                            vm.request.description = item.description;
                            vm.request.retailPrice = item.retailPrice;
                            vm.request.profitLossMoney = item.profitLossMoney;
                        } else {
                            vm.request.profitLossAmount = 0;
                            vm.request.description = '';
                            vm.request.retailPrice = 0;
                            vm.request.profitLossMoney = 0;
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
                    var kindInfo = kindService.utility.parseKind(responseData.data);
                    vm.request.kind = _.pick(responseData.data, 'kindId', 'accountAmount', 'checkAmount', 'profitLossAmount', 'detailList',
                        'kindName', 'colorName', 'sizeText', 'kindClassName', 'kindNo', 'brandName', 'unitName');
                    vm.request.kindId = responseData.data.kindId;
                    vm.request.unitId = responseData.data.unitId;
                    //获取成本价
                    var costPrice = _.find(responseData.data.priceList, function(item) { return item.itemKey == "purchase-cost"; });
                    if (costPrice) {
                        vm.request.retailPrice = costPrice.value;
                    }
                });
            },
            //保存修改信息
            save: function() {

                if (vm.request.colorId == "") {
                    xunSoft.helper.showMessage("至少选择一种颜色");
                    return;
                }
                if (vm.request.sizeId == "") {
                    xunSoft.helper.showMessage("至少选择一种尺码");
                    return;
                }
                if (vm.request.profitLossAmount <= 0 || vm.request.profitLossAmount > 999999) {
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
                        kindInfo.profitLossAmount = newKind.profitLossAmount;
                        kindInfo.profitLossMoney = newKind.profitLossMoney;
                        kindInfo.description = newKind.description;
                    } else {
                        page.query.detailList.push(newKind);
                    }
                    vm.request.sizeId = '';
                    vm.request.colorId = '';
                    vm.request.profitLossAmount = 0;
                    vm.request.profitLossMoney = 0;
                    vm.request.description = '';
                    xunSoft.helper.showMessage("添加货品成功");

                }

            },
            calculate: function() {
                var requestInfo = this.request;
                requestInfo.profitLossMoney = requestInfo.retailPrice *
                    requestInfo.profitLossAmount;
            }
        }
    });
    vm.init();

})