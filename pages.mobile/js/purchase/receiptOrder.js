//收货单列表回调
eShop.onPageInit('purchase_receiveOrder_list', function(page) {

    var pageDiv = $$(page.container);

    //Vue 视图模型
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                query: {
                    status: '',
                    createTimeFrom: '',
                    createTimeTo: '',
                    tenantId: xunSoft.user.tenantId(),
                    shopId: xunSoft.user.shopId(),
                    receiveOrderNo: '',
                    supplierId: '',
                    sponsorId: '',
                    auditorId: '',
                    orderBy: 'receiveOrderId desc',
                },
                pageIndex: 1,
                pageSize: xunSoft.user.pageSize()
            },
            response: {
                total: 0,
                data: []
            }
        },
        //总金额
        computed: {
            _totalPrice: function() {
                var total = 0;
                _.each(this.response.data, function(row) {
                    _.each(row.value, function(item) {
                        total += (parseFloat(item.detailSummary.sumMoney) || 0);
                    });
                });
                return total;
            }
        },

        methods: {
            init: function() {
                //加载数据
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
                //获取数据.
                purchaseService.get.getReceiveOrderList(vm.request, vm.response);

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
                    url: 'purchase/common/filter.ios.html',
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
            //收货单编辑
            update: function(receiveOrder) {
                mainView.router.load({
                    url: 'purchase/receiveOrder/update.ios.html',
                    query: {
                        receiveOrderId: receiveOrder.receiveOrderId
                    }
                });
            },
            //修改单据状态
            updateState: function(flag, order) {
                var request = {
                    data: {
                        tenantId: xunSoft.user.tenantId(),
                        entityId: order.receiveOrderId,
                        flag: flag
                    }
                };

                //修改单据的状态
                purchaseService.put.putReceiveOrderState(request, {}, function(responseData) {
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

            //删除单据
            delete: function(receiveOrder) {
                eShop.confirm('您确定要删除当前收货单吗？', function() {
                    purchaseService.delete.deleteReceiveOrder({ id: receiveOrder.receiveOrderId }, {}, function(responseData) {

                        _.each(vm.response.data, function(value, key) {
                            if (value.time == receiveOrder.receiveDate) {
                                vm.response.data[key].value.$remove(receiveOrder);
                            }
                        });
                        vm.response.total--;
                        vm.response.data.$remove(receiveOrder);
                        xunSoft.helper.showMessage('单据删除成功');
                    });
                });
            }


        }
    });

    vm.init();
});

//查看明细
eShop.onPageInit('purchase_receiveOrder_detail', function(page) {
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

                vm.request.id = page.query.receiveOrderId;
                this.load();
                pageDiv.find('.pull-to-refresh-content').on('refresh', function() {
                    eShop.pullToRefreshDone();
                    vm.load();
                });
            },
            load: function() {
                purchaseService.get.getReceiveOrderDetail(vm.request, vm.response);
            },
            edit: function(e) {
                e.preventDefault();
                e.stopPropagation()
                if (vm.response.data.submitTime || vm.response.data.auditTime) {
                    xunSoft.helper.showMessage("单据已提交审核，不能修改");
                    return;
                }
                mainView.router.load({
                    url: 'purchase/receiveOrder/update.ios.html',
                    query: {
                        receiveOrderId: vm.response.data.receiveOrderId,
                        callback: this.load
                    }
                });
            },
            toReturnOrder: function() { //退货出库
                mainView.router.load({
                    url: 'purchase/returnOrder/add.ios.html',
                    query: {
                        data: vm.response.data,
                        type: 'fromReceiveOrder',
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

//收货单录入回调
eShop.onPageInit('purchase_receiveOrder_add', function(page) {

    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                supplierId: '',
                receiveDate: xunSoft.helper.formatDate(new Date()),
                accountId: '',
                userId: '',
                employeeId: '',
                advanceMoney: 0,
                receiveStorehouseId: xunSoft.user.shopId(),
                sponsorId: '',
                updatorId: xunSoft.user.userId(),
                sponsorOrganId: xunSoft.user.shopId(),
                creatorId: xunSoft.user.userId(),
                tenantId: xunSoft.user.tenantId(),
                description: '',
                detailList: []
            },
            response: {
                suppliers: baseInfoService.suppliers,
                users: baseInfoService.users,
                accounts: baseInfoService.accounts
            }
        },
        computed: {
            //总金额
            totalReceiveMoney: function() {
                var total = 0;
                _.each(this.request.detailList, function(item) {
                    total += (parseFloat(item.receiveMoney) || 0) - (parseFloat(item.taxMoney) || 0);
                });
                return total;
            }
        },
        watch: {
            "request.supplierId": function(val, oldVal) {
                xunSoft.event.smartSelect("#supplierId");
            },
            "request.accountId": function(val, oldVal) {
                xunSoft.event.smartSelect("#accountId");
            },
            "request.employeeId": function(val, oldVal) {
                xunSoft.event.smartSelect("#employeeId");
            }
        },
        methods: {
            init: function() {
                //收货日期
                var calendarStart = eShop.calendar({
                    input: pageDiv.find('#receiveDate')[0],
                });
                if (page.query.type && page.query.type === 'fromPurchaseOrder') {
                    _.extend(vm.request, _.omit(page.query.data, "detailList", 'purchaseOrderId', 'purchaseOrderNo'));
                    _.each(page.query.data.detailList, function(value, key) {
                        var item = _.omit(value, 'purchaseAmount', 'purchasePrice', 'purchaseMoney', 'purchaseDetailId', 'purchaseOrderId');
                        item.receiveAmount = value.purchaseAmount;
                        item.receivePrice = value.purchasePrice;
                        item.receiveMoney = value.purchaseMoney;
                        item.transferLogData = {
                            fromDoctypeId: 0,
                            fromDocId: page.query.data.purchaseOrderId,
                            fromDocDetailId: value.purchaseDetailId
                        };
                        vm.request.detailList.push(item);
                    });
                } else {
                    this.request.supplierId = vm.response.suppliers[0].companyId;
                    this.request.accountId = vm.response.accounts[0].accountId;
                    this.request.userId = vm.response.users[0].userId;
                    vm.request.sponsorId = xunSoft.user.userId();
                }
            },
            //选择货品的回调
            selectKind: function(responseData) {
                vm.request.detailList = [];
                _.each(responseData, function(item) {
                    item.receiveAmount = item.Amount;
                    if (item.priceList && !item.Price) {
                        item.receivePrice = item.priceList && _.find(item.priceList, function(item) { return item.itemKey == 'purchase-price'; }).value;
                    } else {
                        item.receivePrice = item.Price;
                    }
                    item.salePrice = item.priceList && _.find(item.priceList, function(item) { return item.itemKey == 'sale-price'; }).value;
                    item.receiveMoney = item.receiveAmount * item.receivePrice;

                    item = _.omit(item, "Amount", "Price", 'priceList');
                    vm.request.detailList.push(item);
                });
                console.log(vm.request.detailList);
            },
            //采购导入
            import: function() {
                mainView.router.load({
                    url: 'purchase/receiveOrder/purchaseList.ios.html',
                    query: {
                        detailList: vm.request.detailList,
                        editPage: 'purchase/receiveOrder/add.ios.html'
                    }
                })

            },

            //保存
            save: function() {

                if (vm.request.supplierId == '') {
                    xunSoft.helper.showMessage("请选择供应商");
                    return;
                }
                if (vm.request.advanceMoney > 0 && vm.request.accountId == 0) {
                    xunSoft.helper.showMessage('请选择本次收款的结算账户');
                    return;
                }
                if (vm.request.detailList.length == 0) {
                    xunSoft.helper.showMessage("请至少选择一件货品");
                    return;
                }
                if (vm.request.employeeId == '') {
                    xunSoft.helper.showMessage('收货人不能为空!');
                    return;
                }

                //构造数据请求
                var postRequest = {
                    data: _.omit(vm.request, 'detailList'),
                };
                postRequest.data.sponsorId = vm.request.employeeId;
                //重新过滤货品基本信息
                postRequest.data.detailList = _.map(vm.request.detailList, function(item) { return _.omit(item, 'kind'); });

                //保存当前单据信息
                purchaseService.post.postReceiveOrder(postRequest, {}, function(responseData) {
                    xunSoft.helper.showMessage("收货订单已经保存成功！");
                    vm.request.description = '';
                    vm.request.advanceMoney = 0;
                    vm.request.detailList = [];
                });
            },

            //退出
            back: function() {
                //购货入库
                var requestInfo = this.request;
                if (requestInfo.detailList.length > 0) {
                    eShop.confirm('您的收货订单已经发生更改，是否取消?', function() {
                        mainView.router.back();
                    });
                } else {
                    mainView.router.back();
                }
                if (page.query.type && page.query.type === 'fromPurchaseOrder' && _.isFunction(page.query.callback)) {
                    page.query.callback();
                }
            }
        }
    });

    vm.init();

});

//编辑收货单回调
eShop.onPageInit('purchase_receiveOrder_update', function(page) {
    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                supplierId: '',
                receiveDate: xunSoft.helper.formatDate(new Date()),
                accountId: 0,
                userId: '',
                employeeId: '',
                advanceMoney: 0,
                receiveStorehouseId: xunSoft.user.shopId(),
                sponsorId: '',
                updatorId: xunSoft.user.userId(),
                sponsorOrganId: xunSoft.user.shopId(),
                creatorId: xunSoft.user.userId(),
                tenantId: xunSoft.user.tenantId(),
                description: '',
                detailList: [],

                //删除货品列表
                deletedIDs: '',

                //    receiveOrderNo:'',
                // receiveOrderId:page.query.receiveOrderId,

            },
            response: {
                suppliers: baseInfoService.suppliers,
                users: baseInfoService.users,
                accounts: baseInfoService.accounts
            }
        },
        computed: {
            //总金额
            totalReceiveMoney: function() {
                var total = 0;
                _.each(this.request.detailList, function(item) {
                    total += (parseFloat(item.receiveMoney) || 0) - (parseFloat(item.taxMoney) || 0);
                });
                return total;
            }
        },
        watch: {
            "request.supplierId": function(val, oldVal) {
                xunSoft.event.smartSelect("#supplierId");
            },
            "request.accountId": function(val, oldVal) {
                xunSoft.event.smartSelect("#accountId");
            },
            "request.sponsorId": function(val, oldVal) {
                xunSoft.event.smartSelect("#sponsorId");
            }
        },
        methods: {
            init: function() {

                //收货日期
                var calendarStart = eShop.calendar({
                    input: pageDiv.find('#receiveDate')[0],
                });
                this.request.supplierId = vm.response.suppliers[0].companyId;
                this.request.accountId = vm.response.accounts[0].accountId;
                this.request.userId = vm.response.users[0].userId;


                if (page.query.receiveOrderId) {
                    purchaseService.get.getReceiveOrderDetail({ id: page.query.receiveOrderId }, {}, function(responseData) {
                        //订单基本信息
                        var data = _.omit(responseData.data, 'detailList', 'deletedIDs');

                        _.extend(vm.request, data);

                        //获取货品信息
                        _.each(responseData.data.detailList, function(item) {
                            //过滤货品信息
                            var newKind = kindService.utility.parseOrderKind(item);
                            newKind.receiveDetailId = item.receiveDetailId;
                            vm.request.detailList.push(newKind);
                        });
                    });
                } else {
                    vm.request.sponsorId = xunSoft.user.userId();

                }


            },


            //选择货品的回调
            selectKind: function(responseData) {
                vm.request.detailList = [];
                _.each(responseData, function(item) {
                    item.receiveAmount = item.Amount;
                    if (item.priceList && !item.Price) {
                        item.receivePrice = _.find(item.priceList, function(item) { return item.itemKey == 'purchase-price'; }).value;
                        item.salePrice = _.find(item.priceList, function(item) { return item.itemKey == 'sale-price'; }).value;
                    } else {
                        item.receivePrice = item.Price;
                        item.salePrice = 0;
                    }

                    item.receiveMoney = item.receiveAmount * item.receivePrice;
                    item = _.omit(item, "Amount", "Price", 'priceList');
                    vm.request.detailList.push(item);
                });
                console.log(vm.request.detailList);
            },

            //采购导入
            import: function() {
                mainView.router.load({
                    url: 'purchase/receiveOrder/purchaseList.ios.html',
                    query: {
                        detailList: vm.request.detailList,
                        editPage: 'purchase/receiveOrder/add.ios.html'
                    }
                })

            },
            //金额排序
            sortMoneyKind: function(event) {
                if (vm.request.detailList.length > 1) {
                    var order = $$(event.currentTarget).attr('data-order');
                    //检查排序方式
                    if (order == "asc") {
                        //asc 从小到大
                        vm.request.detailList = _.sortBy(vm.request.detailList,
                            function(item) { return (item.receiveMoney - item.taxMoney); });
                        $$(event.currentTarget).attr('data-order', "desc");
                    } else {
                        //desc 从大到小
                        var orderBy = _.sortBy(vm.request.detailList, function(item) { return (item.receiveMoney - item.taxMoney); });
                        vm.request.detailList = orderBy.reverse();
                        $$(event.currentTarget).attr('data-order', "asc");
                    }
                }
            },

            //保存
            save: function() {

                if (vm.request.supplierId == '') {
                    xunSoft.helper.showMessage("请选择供应商");
                    return;
                }
                if (vm.request.advanceMoney > 0 && vm.request.accountId == 0) {
                    xunSoft.helper.showMessage('请选择本次收款的结算账户');
                    return;
                }
                if (vm.request.detailList.length == 0) {
                    xunSoft.helper.showMessage("请至少选择一件货品");
                    return;
                }
                if (vm.request.sponsorId == '') {
                    xunSoft.helper.showMessage('经手人不能为空!');
                    return;
                }


                //请求数据
                var requestData = {
                    data: _.omit(vm.request, 'detailList'),
                };
                requestData.data.detailList = _.map(vm.request.detailList, function(item) { return _.omit(item, 'kind'); });

                purchaseService.put.putReceiveOrder(requestData, {}, function() {
                    xunSoft.helper.showMessage('修改收货订单信息成功！');
                    mainView.router.back();
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
            }
        }
    });

    vm.init();
})


//修改商品价格回调
eShop.onPageInit('purchase_receiveOrder_editKindPrice', function(page) {

    var pageDiv = $$(page.container);
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                salePrice: 0,
                receivePrice: 0,
                receiveAmount: 0,
                receiveMoney: 0,
                discountRate: 0,
                taxRate: 0,
                taxMoney: 0,
                deliverDate: '',
                description: '',
            },
            kind: '',
            detailList: '',
        },
        methods: {
            init: function() {
                if (page.query.kind) {
                    _.extend(vm.request, page.query.kind);
                    vm.kind = page.query.kind;
                    vm.detailList = page.query.request.detailList;
                }
                eShop.calendar({
                    input: pageDiv.find("#deliverDate"),
                    minDate: new Date()
                });

            },

            //删除
            delete: function(kind) {
                if (!kind.receiveDetailId) {
                    mainView.router.back();
                    return;
                }
                if (_.isEmpty(page.query.request.deletedIDs)) {

                    page.query.request.deletedIDs += kind.receiveDetailId;
                } else {
                    page.query.request.deletedIDs += (',' + kind.receiveDetailId);
                }
                mainView.router.back();
            },


            //保存修改
            save: function() {
                if (vm.request.receivePrice <= 0 || vm.request.receivePrice > 999999) {
                    xunSoft.helper.showMessage('请输入合理的单价！');
                    return;
                }
                if (vm.request.receiveAmount <= 0 || vm.request.receiveAmount > 999999) {
                    xunSoft.helper.showMessage("请输入合理的数量!");
                    return;
                }
                if (!purchaseService.utility.receiptCalculate(vm.request, true)) {
                    return;
                }

                if (page.query.kind) {
                    _.extend(page.query.kind, vm.request);
                }
                mainView.router.back();
            },

            //计算价格信息
            calculate: function() {
                var requestInfo = this.request;
                purchaseService.utility.receiptCalculate(requestInfo, true)
            }
        }
    });

    vm.init();

})

//编辑货品回调
eShop.onPageInit('purchase_receiveOrder_editKind', function(page) {

    var pageDiv = $$(page.container);
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                kindId: '',
                colorId: [],
                sizeId: [],
                unitId: 0,
                salePrice: 0,
                receivePrice: 0,
                receiveAmount: 0,
                receiveMoney: 0,
                discountRate: 100,
                taxRate: 0,
                taxMoney: 0,
                description: '',
                kind: null
            },
            response: {
                kindDetail: {
                    kindId: 0
                },
                selectedKind: []
            }
        },
        methods: {
            init: function() {

                this.loadKind();
                this.calculateKind();

            },
            //加载货品信息
            loadKind: function() {
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
            //保存修改信息
            save: function() {

                if (vm.request.colorId.length == 0) {
                    xunSoft.helper.showMessage("至少选择一种颜色");
                    return;
                }
                if (vm.request.sizeId.length == 0) {
                    xunSoft.helper.showMessage("至少选择一种尺码");
                    return;
                }
                if (vm.request.receivePrice <= 0 || vm.request.receivePrice > 999999) {
                    xunSoft.helper.showMessage('请输入合理的单价！');
                    return;
                }
                if (vm.request.receiveAmount <= 0 || vm.request.receiveAmount > 999999) {
                    xunSoft.helper.showMessage("请输入合理的数量!");
                    return;
                }
                if (!purchaseService.utility.receiptCalculate(vm.request, true)) {
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
                    this.calculateKind();
                } else {
                    xunSoft.helper.showMessage("无法添加货品信息", '警告');
                    mainView.router.back();
                }

            },
            calculate: function() {
                var requestInfo = this.request;
                purchaseService.utility.receiptCalculate(requestInfo);
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

})

//从采购订单录入收货单
eShop.onPageInit('purchase_receiveOrder_purchaselist', function(page) {
    var pageDiv = $$(page.container);
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                orderNo: '',
                orderId: '',
                orderTypeId: 0
            },
            response: {
                data: [],
                kinds: []
            }
        },
        methods: {
            init: function() {
                //加载数据
                this.loadOrderList();
            },
            //选择采购订单号
            slectOrder: function(item) {
                if (vm.request.orderId != item.orderId) {
                    var selectedItem = _.find(vm.response.data, function(orderData) { return orderData.isActive; });
                    if (selectedItem) {
                        selectedItem.isActive = false;
                    }
                    item.isActive = true;
                    vm.request.orderId = item.orderId;
                    this.loadOrderDetail();
                }
            },
            //获取单号列表
            loadOrderList: function() {
                vm.response.data = [];
                var request = {
                    query: vm.request
                };
                //获取数据	
                transferService.get.getTransferOrderList(request, {}, function(responseData) {
                    if (_.isArray(responseData.data)) {
                        _.each(responseData.data, function(item) {
                            var newOrderData = _.pick(item, 'orderId', 'orderNo', 'purchaseAmount');
                            newOrderData.isActive = false;
                            newOrderData.userLogo = xunSoft.ajax.serviceBase() +
                                "Shop/User/OrderUser/0/" + xunSoft.user.userId() + "/" + item.orderId;
                            vm.response.data.push(newOrderData);

                        });
                    }
                });
            },
            //加载采购订单
            loadOrderDetail: function() {
                vm.response.kinds = [];
                var request = {
                    query: vm.request
                };
                //获取单据信息
                transferService.get.getTransferOrderDetail(request, {}, function(responseData) {
                    if (_.isArray(responseData.data.detailList)) {
                        _.each(responseData.data.detailList, function(item) {
                            var newKind = _.pick(item, 'kindId', 'colorId', 'sizeId', 'unitId', 'transferId', 'originQty', 'transferQty1');
                            newKind.receiveAmount = parseInt(item.transferQty2) || 0;
                            newKind.receiveMoney = 0;
                            newKind.discountRate = 100;
                            newKind.taxRate = 0;
                            newKind.taxMoney = 0;
                            newKind.description = "";
                            newKind.isChecked = true;

                            //查找货品信息
                            var kindInfo = _.find(responseData.data.kindList, function(kind) { return kind.kindId == newKind.kindId; });
                            if (kindInfo) {
                                newKind.salePrice = _.find(kindInfo.priceList, function(item) { return item.itemKey == "sale-price"; }).value
                                if (kindInfo.priceList)
                                    newKind.receivePrice = _.find(kindInfo.priceList, function(item) { return item.itemKey == "purchase-price"; }).value;
                                newKind.receiveMoney = newKind.receiveAmount * newKind.receivePrice;
                            }

                            newKind.kind = _.pick(item, 'kindId', 'brandName', 'kindName', 'kindNo', 'colorName', 'sizeText', 'unitName');
                            vm.response.kinds.push(newKind);

                        });
                    }

                });
            },
            //保存选择信息
            save: function() {
                if (_.isArray(page.query.detailList)) {
                    _.each(vm.response.kinds, function(kind) {
                        if (kind.isChecked) {
                            page.query.detailList.push(_.omit(kind, 'isChecked'));
                        }
                    });
                }
                mainView.router.back();
            },
            //检查输入
            checkInput: function() {

                var requestInfo = this.request;

                if (requestInfo.receivePrice > 999999 || requestInfo.receivePrice < 0) {
                    xunSoft.helper.showMessage('请输入合理的收货单价');
                    return false;
                }
                if (requestInfo.receiveAmount > 999999 || requestInfo.receiveAmount < 0) {
                    xunSoft.helper.showMessage('请输入合理的收货数量');
                    return false;
                }
                if (requestInfo.taxRate > 100 || requestInfo.taxRate < 0) {
                    xunSoft.helper.showMessage('请输入合理的收货税率');
                    return false;
                }

                return true;
            }
        }
    });
    vm.init();
})