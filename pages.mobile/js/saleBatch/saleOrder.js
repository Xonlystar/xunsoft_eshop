//销售订单列表回调
eShop.onPageInit('saleBatch_saleOrder_list', function(page) {
    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                query: {
                    saleOrderNo: '',
                    customerId: '',
                    status: '',
                    createTimeFrom: '',
                    createTimeTo: '',
                    creatorId: '',
                    sponsorId: '',
                    auditorId: '',
                    tenantId: xunSoft.user.tenantId(),
                    shopId: xunSoft.user.shopId(),
                    orderBy: 'saleOrderId desc',
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
            _totalPrice: function() {
                var total = 0;
                _.each(this.response.data, function(row) {
                    _.each(row.value, function(item) {
                        total += (parseFloat(item.detailSummary.saleMoney) || 0);
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
                });

            },
            load: function() {
                saleService.get.getSaleOrderList(vm.request, {}, function(responseData) {
                    var tempResult = [];
                    vm.request.pageIndex++;
                    vm.response.total = responseData.total;
                    //过滤返回的结果
                    _.each(responseData.data, function(item) {
                        var newSaleOrder = _.pick(item, 'saleOrderId', 'saleOrderNo', 'customerName',
                            'deliverDate', 'placeDate', 'detailSummary', 'creatorId', 'createTime', 'creatorName', 'sponsorName');

                        newSaleOrder.flag = 'L';
                        if (item.submitTime) {
                            newSaleOrder.flag = "T"
                        }
                        if (item.auditTime) {
                            newSaleOrder.flag = "S";
                        }

                        if (!tempResult[newSaleOrder.placeDate]) { tempResult[newSaleOrder.placeDate] = [] }
                        tempResult[newSaleOrder.placeDate].push(newSaleOrder);
                    });
                    for (var o in tempResult) {
                        vm.response.data.push({ time: o, value: tempResult[o] })
                    }
                });
            },
            refresh: function() {
                this.request.pageIndex = 1;
                this.response.total = 0;
                this.response.data = [];
                this.load();
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
            //查询
            query: function() {
                mainView.router.load({
                    url: 'saleBatch/common/filter.ios.html',
                    query: {
                        para: vm.request.query,
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
            //更新
            update: function(saleOrder) {
                mainView.router.load({
                    url: 'saleBatch/saleOrder/update.ios.html',
                    query: {
                        saleOrderId: saleOrder.saleOrderId
                    }
                });
            },
            //修改单据状态
            updateState: function(flag, order) {
                var request = {
                    data: {
                        tenantId: xunSoft.user.tenantId(),
                        entityId: order.saleOrderId,
                        flag: flag
                    }
                };

                //修改单据的状态
                saleService.put.putSaleUpdateState(request, {}, function(responseData) {
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
            //删除
            delete: function(saleOrder) {
                var request = {
                    id: saleOrder.saleOrderId
                };
                eShop.confirm('您确定要删除当前销售订单吗？', function() {
                    saleService.delete.deleteSaleOrder(request, {}, function(responseData) {
                        _.each(vm.response.data, function(value, key) {
                            if (value.time == saleOrder.placeDate) {
                                vm.response.data[key].value.$remove(saleOrder);
                            }
                        });
                        vm.response.total--;
                        xunSoft.helper.showMessage('单据删除成功');
                    });
                });
            }
        }
    });

    vm.init();
});


//销售订单明细
eShop.onPageInit('saleBatch_saleOrder_detail', function(page) {
    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                id: 0
            },
            response: {
                data: {}
            }
        },
        methods: {
            init: function() {
                vm.request.id = page.query.orderId;
                pageDiv.find('.pull-to-refresh-content').on('refresh', function() {
                    eShop.pullToRefreshDone();
                    vm.load();
                });
                this.load();
            },
            load: function() {
                saleService.get.getSaleOrderDetail(vm.request, vm.response);
            },
            edit: function(e) {
                e.preventDefault();
                e.stopPropagation()
                if (vm.response.data.submitTime || vm.response.data.auditTime) {
                    xunSoft.helper.showMessage("单据已提交审核，不能修改");
                    return;
                }
                mainView.router.load({
                    url: 'saleBatch/saleOrder/update.ios.html',
                    query: {
                        saleOrderId: vm.response.data.saleOrderId,
                        callback: this.load
                    }
                });
            },
            toDeliverOrder: function() { //销售出货
                mainView.router.load({
                    url: 'saleBatch/deliverOrder/add.ios.html',
                    query: {
                        data: vm.response.data,
                        type: 'fromSaleOrder',
                        callback: vm.load
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
                    }
                });
            }
        }
    });
    vm.init();
});


//销售订单录入
eShop.onPageInit('saleBatch_saleOrder_add', function(page) {

    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                userId: 0,
                customerId: 0,
                companyName: '',
                placeDate: xunSoft.helper.formatDate(new Date()),
                deliverDate: xunSoft.helper.formatDate(new Date()),
                sponsorId: 0,
                employeeName: '',
                sponsorOrganId: xunSoft.user.shopId(),
                sponsorShopId: xunSoft.user.shopId(),
                deliverWarehouseId: xunSoft.user.shopId(),
                advanceMoney: 0,
                creatorId: xunSoft.user.userId(),
                updatorId: xunSoft.user.userId(),
                description: '',
                tenantId: xunSoft.user.tenantId(),
                detailList: []
            },
            response: {
                customers: baseInfoService.customers,
                users: baseInfoService.users,
            }
        },
        computed: {
            //总金额
            totalSaleMoney: function() {
                var total = 0;
                _.each(this.request.detailList, function(item) {

                    total += (parseFloat(item.saleAmount * item.wholesalePrice) || 0) - (parseFloat(item.taxMoney) || 0);

                });
                return total;
            }
        },
        watch: {
            "request.customerId": function(val, oldVal) {
                xunSoft.event.smartSelect("#customerId");
            },
            "request.userId": function(val, oldVal) {
                xunSoft.event.smartSelect("#userId");
            }
        },
        methods: {
            init: function() {
                eShop.calendar({
                    input: pageDiv.find("#placeDate"),
                    maxDate: new Date()
                });
                eShop.calendar({
                    input: pageDiv.find("#deliverDate"),
                    minDate: new Date()
                });
                this.loadSaleOrder();
                if (vm.response.customers.length > 0) {
                    this.request.customerId = vm.response.customers[0].companyId;
                }
                if (true) {
                    this.request.sponsorId = xunSoft.user.userId();
                }

                this.request.userId = xunSoft.user.userId();

            },
            loadSaleOrder: function() {
                if (page.query.saleOrderId) {
                    var request = { id: page.query.saleOrderId };

                    saleService.get.getSaleOrderDetail(request, {}, function(responseData) {
                        //订单基本信息
                        _.extend(vm.request, _.pick(responseData.data, 'customerId', 'placeDate', 'deliverDate', 'sponsorId', 'advanceMoney', 'description'));

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
            //回退
            back: function() {
                if (vm.request.detailList.length > 0) {
                    eShop.confirm('单据已经有货品信息了,您确认退出吗？', function() {
                        mainView.router.back();
                    });
                } else {
                    mainView.router.back();
                }
            },
            //选择货品的回调
            selectKind: function(responseData) {
                vm.request.detailList = [];
                _.each(responseData, function(item) {
                    item.saleAmount = item.Amount;
                    if (item.priceList && !item.Price) {
                        item.salePrice = _.find(item.priceList, function(item) { return item.itemKey == 'sale-price'; }).value;
                    } else {
                        item.salePrice = item.Price;
                    }
                    item.saleMoney = item.saleAmount * item.wholesalePrice;
                    item = _.omit(item, "Amount", "Price");
                    vm.request.detailList.push(item);
                    console.log(vm.request.detailList);
                });
            },
            //编辑货品
            editKind: function(kind) {
                mainView.router.load({
                    url: "saleBatch/saleOrder/editKindPrice.ios.html",
                    query: {
                        kind: kind,
                        request: vm.request.detailList
                    }
                });
            },
            //保存
            save: function() {

                if (vm.request.customerId == 0) {
                    xunSoft.helper.showMessage('请选择客户信息');
                    return;
                }

                if (vm.request.detailList.length == 0) {
                    xunSoft.helper.showMessage('请至少选择一件货品');
                    return;
                }
                if (vm.request.sponsorId == "") {
                    xunSoft.helper.showMessage('经手人不能为空!');
                    return;
                }

                //处理数据获取请求信息
                var request = {
                    data: _.omit(vm.request, 'detailList')
                };
                request.data.detailList = [];
                _.each(vm.request.detailList, function(item) {
                    var newKind = _.omit(item, 'kind');
                    request.data.detailList.push(newKind);
                });

                //保存
                saleService.post.postSaleOrder(request, {}, function() {
                    vm.request.detailList = [];
                    xunSoft.helper.showMessage('销售订单保存成功！');
                });
            }
        }
    });

    vm.init();
});

//销售订单修改
eShop.onPageInit('saleBatch_saleOrder_update', function(page) {
    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                saleOrderNo: '',
                customerId: '',
                placeDate: '',
                deliverDate: '',
                sponsorId: '',
                advanceMoney: 0,
                description: '',
                detailList: [],
                userId: '',
                taxRate: 0,
                //删除货品列表
                deletedIDs: ''
            },
            response: {
                customers: baseInfoService.customers,
                users: baseInfoService.users,
            }
        },
        watch: {
            "request.customerId": function(val, oldVal) {
                xunSoft.event.smartSelect("#customerId");
            },
            "request.userId": function(val, oldVal) {
                xunSoft.event.smartSelect("#userId");
            }
        },
        methods: {
            init: function() {
                eShop.calendar({
                    input: pageDiv.find("#placeDate"),
                    maxDate: new Date()
                });
                eShop.calendar({
                    input: pageDiv.find("#deliverDate"),
                    minDate: new Date()
                });
                this.loadSaleOrder();
                this.request.sponsorId = xunSoft.user.userId();
                this.request.userId = xunSoft.user.userId();
                this.request.TenantId = xunSoft.user.tenantId();
            },
            loadSaleOrder: function() {
                if (page.query.saleOrderId) {
                    var request = { id: page.query.saleOrderId };

                    saleService.get.getSaleOrderDetail(request, {}, function(responseData) {
                        //订单基本信息
                        _.extend(vm.request, _.omit(responseData.data, 'detailList', 'deletedIDs'));

                        //获取货品信息
                        _.each(responseData.data.detailList, function(item) {
                            //过滤货品信息
                            var newKind = kindService.utility.parseOrderKind(item);
                            newKind.saleDetailId = item.saleDetailId;
                            vm.request.detailList.push(newKind);
                        });
                    });

                } else {
                    vm.request.sponsorId = xunSoft.user.userId();
                }
            },

            //编辑货品
            editKind: function(kind) {
                mainView.router.load({
                    url: "saleBatch/saleOrder/editKindPrice.ios.html",
                    query: {
                        kind: kind,
                        request: vm.request,
                    }
                });
            },
            //删除货品
            delete: function(kind) {

                if (!kind.saleDetailId) {
                    return;
                }
                if (_.isEmpty(vm.request.deletedIDs)) {

                    vm.request.deletedIDs += kind.saleDetailId;
                } else {
                    vm.request.deletedIDs += (',' + kind.saleDetailId);
                }
            },
            //选择货品的回调
            selectKind: function(responseData) {
                vm.request.detailList = [];
                _.each(responseData, function(item) {
                    item.saleAmount = item.Amount;
                    if (item.priceList && !item.Price) {
                        item.salePrice = _.find(item.priceList, function(item) { return item.itemKey == 'sale-price'; }).value;
                        item.wholesalePrice = _.find(item.priceList, function(item) { return item.itemKey == 'sale-price'; }).value;
                    } else {
                        item.salePrice = item.Price;
                        item.wholesalePrice = item.Price;
                    }

                    item.saleMoney = item.saleAmount * item.salePrice;
                    item = _.omit(item, "Amount", "Price", 'priceList');
                    vm.request.detailList.push(item);
                });
                console.log(vm.request.detailList);

            },
            //保存
            save: function() {

                if (vm.request.customerId == 0) {
                    xunSoft.helper.showMessage('请选择客户信息');
                    return;
                }

                if (vm.request.detailList.length == 0) {
                    xunSoft.helper.showMessage('请至少选择一件货品');
                    return;
                }
                if (vm.request.sponsorId == "") {
                    xunSoft.helper.showMessage('经手人不能为空!');
                    return;
                }


                //处理数据获取请求信息
                var request = {
                    data: _.omit(vm.request, 'detailList')
                };
                request.data.detailList = [];
                _.each(vm.request.detailList, function(item) {
                    var newKind = _.omit(item, 'kind');
                    request.data.detailList.push(newKind);
                });

                //保存
                saleService.put.putSaleOrder(request, {}, function() {
                    xunSoft.helper.showMessage('修改销售订单成功！');
                    mainView.router.back();
                    if (_.isFunction(page.query.callback)) {
                        page.query.callback();
                    }
                });
            }
        }
    });

    vm.init();
});

//销售订单货品修改
eShop.onPageInit('saleBatch_saleOrder_editKind', function(page) {
    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                kindId: '',
                colorId: [],
                sizeId: [],
                salePrice: 0,
                unitId: 0,
                wholesalePrice: 0,
                saleAmount: 1,
                saleMoney: 0,
                discountRate: 100,
                deliverDate: '',
                description: '',
                kind: null
            },
            response: {
                selectedKind: [],
                kindDetail: {}
            }
        },
        methods: {
            init: function() {
                this.loadKind();

                eShop.calendar({
                    input: pageDiv.find("#deliverDate"),
                    minDate: new Date()
                });

                this.calculateKind();
            },
            //加载
            loadKind: function() {
                //请求数据
                var request = {
                        id: page.query.kindId
                    }
                    //获取商品信息
                kindService.get.getKindDetail(request, {}, function(responseData) {
                    //设置货品信息
                    vm.response.kindDetail = responseData.data;
                    var kindInfo = kindService.utility.parseKind(responseData.data);
                    _.extend(vm.request, kindInfo);
                });
            },
            //保存货品
            saveKind: function() {
                if (vm.request.colorId == 0) {
                    xunSoft.helper.showMessage('请至少选择一种颜色');
                    return;
                }
                if (vm.request.sizeId.length == 0) {
                    xunSoft.helper.showMessage('请至少选择一种尺码');
                    return;
                }
                if (vm.request.wholesalePrice <= 0 || vm.request.wholesalePrice > 999999) {
                    xunSoft.helper.showMessage('请输入合理的单价！');
                    return;
                }
                if (vm.request.saleAmount <= 0 || vm.request.saleAmount > 999999) {
                    xunSoft.helper.showMessage("请输入合理的数量!");
                    return;
                }
                //检查基本信息
                if (!saleService.utility.saleCalculate(vm.request, true)) {
                    return;
                }

                //用户选择的颜色尺码组合
                var newKinds = [];
                //遍历颜色
                _.each(vm.request.colorId, function(colorId) {

                    var colorInfo = _.find(vm.response.kindDetail.colorList, function(item) { return item.colorId == colorId; });

                    //遍历尺码
                    _.each(vm.request.sizeId, function(sizeId) {

                        var sizeInfo = _.find(vm.response.kindDetail.sizeList, function(item) { return item.sizeId == sizeId; });

                        //获取新的货品信息
                        var newKind = _.omit(vm.request, 'colorId', 'sizeId', 'kind');
                        newKind.sizeId = sizeId;
                        newKind.colorId = colorId;
                        newKind.kind = _.clone(vm.request.kind);
                        newKind.kind.colorName = colorInfo.colorName;
                        newKind.kind.sizeText = sizeInfo.sizeText;
                        newKinds.push(newKind);
                    })

                });

                if (page.query.detailList) {
                    //添加新的货品信息
                    _.each(newKinds, function(newKind) {
                        //检查货品是否已经存在
                        var kindInfo = _.find(page.query.detailList, function(item) {
                            return item.kindId == newKind.kindId &&
                                item.sizeId == newKind.sizeId &&
                                item.colorId == newKind.colorId;
                        });
                        if (!kindInfo) {
                            //追加货品信息
                            page.query.detailList.push(newKind);
                        } else {
                            //更新已有的货品信息
                            _.extend(kindInfo, newKind);
                        }
                    });
                    vm.request.sizeId = [];
                    vm.request.colorId = [];
                    xunSoft.helper.showMessage("货品信息处理成功!");
                    vm.calculateKind();
                } else {
                    xunSoft.helper.showMessage("无法添加货品信息", '警告');
                    mainView.router.back();
                }
            },
            //计算价格信息
            calculate: function() {
                var requestInfo = this.request;
                saleService.utility.saleCalculate(requestInfo);
            },
            //计算已经选择的货品信息
            calculateKind: function() {
                if (_.isArray(page.query.detailList)) {
                    vm.response.selectedKind = [];
                    _.each(page.query.detailList, function(item) {
                        console.log(item);
                        if (item.kindId == page.query.kindId) {
                            vm.response.selectedKind.push(item);
                        }
                    });
                }
            }
        }
    });

    vm.init();
});

//销售订单货品修改
eShop.onPageInit('saleBatch_saleOrder_editKindPrice', function(page) {
    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                salePrice: 0,
                wholesalePrice: 0,
                saleAmount: 0,
                saleMoney: 0,
                discountRate: 100,
                deliverDate: '',
                description: '',
            },
            kind: '',
            detailList: '',
        },
        methods: {
            init: function() {

                this.loadKind();

                eShop.calendar({
                    input: pageDiv.find("#deliverDate"),
                    minDate: new Date()
                });
            },
            //加载
            loadKind: function() {
                if (page.query.kind) {
                    page.query.kind.wholesalePrice = page.query.kind.wholesalePrice;
                    _.extend(vm.request, _.omit(page.query.kind, 'kind'))
                    vm.kind = page.query.kind;
                    vm.detailList = page.query.request.detailList;
                }
            },
            delete: function(kind) {
                if (!kind.saleDetailId) {
                    page.query.request.$remove(kind);
                    mainView.router.back();
                }
                if (_.isEmpty(page.query.request.deletedIDs)) {

                    page.query.request.deletedIDs += kind.saleDetailId;
                } else {
                    page.query.request.deletedIDs += (',' + kind.saleDetailId);
                }
                mainView.router.back();
            },
            //保存货品
            saveKind: function() {
                if (vm.request.wholesalePrice <= 0 || vm.request.wholesalePrice > 999999) {
                    xunSoft.helper.showMessage('请输入合理的单价！');
                    return;
                }
                if (vm.request.purchaseAmount <= 0 || vm.request.purchaseAmount > 999999) {
                    xunSoft.helper.showMessage("请输入合理的数量!");
                    return;
                }
                if (!saleService.utility.saleCalculate(vm.request, true)) {
                    return;
                }

                if (page.query.kind) {
                    _.extend(page.query.kind, vm.request)
                }
                if (page.query.detailList) {
                    _.extend(page.query.request.detailList, vm.detailList);

                }
                mainView.router.back();
            },
            //计算价格信息
            calculate: function() {
                var requestInfo = this.request;
                saleService.utility.saleCalculate(requestInfo, true);
            }
        }
    });

    vm.init();
});