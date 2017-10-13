//客户退货单列表回调
eShop.onPageInit('saleBatch_returnOrder_list', function(page) {
    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                query: {
                    returnOrderNo: '',
                    customerId: '',
                    status: '',
                    createTimeFrom: '',
                    createTimeTo: '',
                    creatorId: '',
                    sponsorId: '',
                    auditorId: '',
                    tenantId: xunSoft.user.tenantId(),
                    shopId: xunSoft.user.shopId(),
                    orderBy: 'returnOrderId desc',
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
                        total += (parseFloat(item.detailSummary.returnMoney) || 0);
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
            //获取数据
            load: function() {
                saleService.get.getReturnOrderList(vm.request, vm.response);
            },
            //重新加载
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
                    text: '打印',
                    color: 'green',
                    onClick: function() {
                        mainView.router.load({ url: "saleBatch/common/print.ios.html?orderType=returnOrder&orderId=" + item.returnOrderId });
                    }
                });
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
            update: function(returnOrder) {
                mainView.router.load({
                    url: 'saleBatch/returnOrder/update.ios.html',
                    query: {
                        returnOrderId: returnOrder.returnOrderId
                    }
                });
            },
            //更新状态
            updateState: function(flag, order) {
                var request = {
                    data: {
                        tenantId: xunSoft.user.tenantId(),
                        entityId: order.returnOrderId,
                        flag: flag
                    }
                };

                //修改单据的状态
                saleService.put.putReturnUpdateState(request, {}, function(responseData) {
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
            delete: function(returnOrder) {
                var request = {
                    id: returnOrder.returnOrderId
                };

                eShop.confirm('您确定要删除当前客户退货单吗？', function() {
                    saleService.delete.deleteReturnOrder(request, {}, function(responseData) {
                        _.each(vm.response.data, function(value, key) {
                            if (value.time == returnOrder.returnDate) {
                                vm.response.data[key].value.$remove(returnOrder);
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

//客户退货单录入回调
eShop.onPageInit('saleBatch_returnOrder_detail', function(page) {
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
                saleService.get.getReturnDetail(vm.request, vm.response);
            },
            edit: function(e) {
                e.preventDefault();
                e.stopPropagation()
                if (vm.response.data.submitTime || vm.response.data.auditTime) {
                    xunSoft.helper.showMessage("单据已提交审核，不能修改");
                    return;
                }
                mainView.router.load({
                    url: 'saleBatch/returnOrder/update.ios.html',
                    query: {
                        returnOrderId: vm.response.data.returnOrderId,
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
                    }
                });
            }
        }
    });

    vm.init();
});

//客户退货单录入回调
eShop.onPageInit('saleBatch_returnOrder_add', function(page) {
    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                userId: 0,
                customerId: 0,
                accountId: 0,
                advanceMoney: 0,
                sponsorId: 0,
                description: '',
                returnDate: xunSoft.helper.formatDate(new Date()),
                sponsorOrganId: xunSoft.user.shopId(),
                sponsorShopId: xunSoft.user.shopId(),
                returnWarehouseId: xunSoft.user.shopId(),
                tenantId: xunSoft.user.tenantId(),
                creatorId: xunSoft.user.userId(),
                updatorId: xunSoft.user.userId(),
                detailList: []
            },
            response: {
                customers: baseInfoService.customers,
                accounts: baseInfoService.accounts,
                users: baseInfoService.users
            }
        },
        watch: {
            "request.customerId": function(val, oldVal) {
                xunSoft.event.smartSelect("#customerId");
            },
            "request.accountId": function(val, oldVal) {
                xunSoft.event.smartSelect("#accountId");
            },
            "request.userId": function(val, oldVal) {
                xunSoft.event.smartSelect("#userId");
            }
        },
        methods: {
            init: function() {

                eShop.calendar({
                    input: pageDiv.find("#returnDate"),
                    minDate: new Date()
                });
                this.load();
            },
            load: function() {
                if (page.query.type && page.query.type === 'fromDeliverOrder') {
                    _.extend(vm.request, _.omit(page.query.data, "detailList", 'deliverOrderId', 'deliverOrderNo'));
                    _.each(page.query.data.detailList, function(value, key) {
                        var item = _.omit(value, 'deliverAmount', 'deliverPrice', 'deliverMoney', 'deliverDetailId', 'deliverOrderId');
                        item.returnAmount =value.deliverAmount;
                        item.returnPrice = value.deliverPrice;
                        item.returnMoney = value.deliverMoney;
                        item.transferLogData = {
                            fromDoctypeId: 5,
                            fromDocId: page.query.data.deliverOrderId,
                            fromDocDetailId: value.deliverDetailId
                        };

                        vm.request.detailList.push(item);
                    });

                } else {
                    this.request.sponsorId = xunSoft.user.userId();
                    this.request.accountId = vm.response.accounts[0].accountId;
                    this.request.customerId = vm.response.customers[0].companyId;
                    this.request.userId = vm.response.users[0].userId;
                }
            },
            //选择货品的回调
            selectKind: function(responseData) {
                var key= _.find(baseInfoService.customers, function(item) { 
                            return item.companyId == vm.request.customerId }).businessData.defaultBatchSaleGrade;
                vm.request.detailList = [];
                debugger;
                _.each(responseData, function(item) {
                    item.returnAmount = item.Amount;
                    if (item.priceList && !item.Price) {
                        if(key==-1){
                        item.salePrice = _.find(item.priceList, function(item) { return item.itemKey == 'sale-price'; }).value;
                        }else{
                            item.salePrice =item.priceList[key].value;
                        }
                    } else {
                        item.salePrice = item.Price;
                    }
                    item.returnMoney = item.returnAmount * item.salePrice;
                    item = _.omit(item, "Amount", "Price");
                    vm.request.detailList.push(item);
                });
            },
            //编辑货品
            editKind: function(kind) {
                mainView.router.load({
                    url: "saleBatch/returnOrder/editKindPrice.ios.html",
                    query: {
                        kind: kind,
                        request: vm.request.detailList
                    }
                });
            },
            back: function() {
                if (vm.request.detailList.length > 0) {
                    eShop.confirm('单据已经有货品信息了,您确认退出吗？', function() {
                        mainView.router.back();
                    });
                } else {
                    mainView.router.back();
                }
            },
            //保存
            save: function() {
                if (vm.request.customerId == 0) {
                    xunSoft.helper.showMessage('请选择客户信息');
                    return;
                }
                if (vm.request.advanceMoney > 0 && vm.request.accountId == 0) {
                    xunSoft.helper.showMessage('请选择退款账户');
                    return;
                }
                if (vm.request.detailList.length == 0) {
                    xunSoft.helper.showMessage('请至少选择一种退货货品');
                    return;
                }
                if (vm.request.sponsorId == "") {
                    xunSoft.helper.showMessage('经手人不能为空!');
                    return;
                }
                var request = {
                    data: _.omit(vm.request, 'detailList')
                };
                request.data.detailList = [];
                _.each(vm.request.detailList, function(item) {
                    request.data.detailList.push(_.omit(item, 'kind'));
                });

                saleService.post.postReturnOrder(request, null, function(responseData) {
                    xunSoft.helper.showMessage('退货单已经保存成功');
                    vm.request.detailList = [];
                });
            }
        }
    });
    vm.init();

});

//客户退货单录入回调
eShop.onPageInit('saleBatch_returnOrder_update', function(page) {
    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                userId: 0,
                customerId: 0,
                accountId: 0,
                advanceMoney: 0,
                sponsorId: 0,
                description: '',
                returnDate: xunSoft.helper.formatDate(new Date()),
                detailList: [],
                deletedIDs: ''
            },
            response: {
                customers: baseInfoService.customers,
                accounts: baseInfoService.accounts,
                users: baseInfoService.users
            }
        },
        watch: {
            "request.customerId": function(val, oldVal) {
                xunSoft.event.smartSelect("#customerId");
            },
            "request.accountId": function(val, oldVal) {
                xunSoft.event.smartSelect("#accountId");
            },
            "request.userId": function(val, oldVal) {
                xunSoft.event.smartSelect("#userId");
            }
        },
        methods: {
            init: function() {

                eShop.calendar({
                    input: pageDiv.find("#returnDate"),
                    minDate: new Date()
                });

                if (page.query.returnOrderId) {
                    saleService.get.getReturnDetail({ id: page.query.returnOrderId }, null, function(responseData) {
                        _.extend(vm.request, _.omit(responseData.data, 'detailList', 'deletedIDs'));

                        _.each(responseData.data.detailList, function(item) {
                            //过滤货品信息
                            var newKind = kindService.utility.parseOrderKind(item);
                            newKind.returnDetailId = item.returnDetailId;
                            vm.request.detailList.push(newKind);
                        });
                    });
                } else {
                    mainView.router.back();
                }
                this.request.sponsorId = xunSoft.user.userId();
                this.request.userId = xunSoft.user.userId();
                this.request.TenantId = xunSoft.user.tenantId();
            },
            //编辑货品
            editKind: function(kind) {
                mainView.router.load({
                    url: "saleBatch/returnOrder/editKindPrice.ios.html",
                    query: {
                        kind: kind,
                        request: vm.request,
                    }
                });
            },
            //删除货品
            delete: function(kind) {

                if (!kind.returnDetailId) {
                    return;
                }
                if (_.isEmpty(vm.request.deletedIDs)) {

                    vm.request.deletedIDs += kind.returnDetailId;
                } else {
                    vm.request.deletedIDs += (',' + kind.returnDetailId);
                }
            },
            //选择货品的回调
            selectKind: function(responseData) {
                vm.request.detailList = [];
                _.each(responseData, function(item) {
                    item.returnAmount = item.Amount;
                    if (item.priceList && !item.Price) {
                        item.salePrice = _.find(item.priceList, function(item) { return item.itemKey == 'sale-price'; }).value;
                    } else {
                        item.salePrice = item.Price;
                    }
                    item.returnMoney = item.returnAmount * item.salePrice;
                    item = _.omit(item, "Amount", "Price", "priceList");
                    vm.request.detailList.push(item);
                });
            },
            //保存
            save: function() {
                if (vm.request.customerId == 0) {
                    xunSoft.helper.showMessage('请选择客户信息');
                    return;
                }
                if (vm.request.advanceMoney > 0 && vm.request.accountId == 0) {
                    xunSoft.helper.showMessage('请选择退款账户');
                    return;
                }
                if (vm.request.detailList.length == 0) {
                    xunSoft.helper.showMessage('请至少选择一种退货货品');
                    return;
                }
                if (vm.request.sponsorId == "") {
                    xunSoft.helper.showMessage('经手人不能为空!');
                    return;
                }
                var request = {
                    data: _.omit(vm.request, 'detailList')
                };
                request.data.detailList = [];
                _.each(vm.request.detailList, function(item) {
                    request.data.detailList.push(_.omit(item, 'kind'));
                });

                saleService.put.putReturnOrder(request, null, function(responseData) {
                    xunSoft.helper.showMessage('退货单已经修改成功');
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

//客户退货单货品编辑
eShop.onPageInit('saleBatch_returnOrder_editKind', function(page) {
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
                returnAmount: 0,
                wholesalePrice: 0,
                discountRate: 100,
                returnMoney: 0,
                description: '',
                kind: null
            },
            response: {
                kindDetail: {},
                selectedKind: []
            }
        },
        methods: {
            init: function() {
                this.loadKind();
                this.calculateKind();
            },
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
                //检查基本信息
                var vs = vm.request.colorId.length;
                if (vm.request.colorId.length == 0) {
                    xunSoft.helper.showMessage('请至少选择一种颜色');
                    return;
                }
                if (vm.request.sizeId.length == 0) {
                    xunSoft.helper.showMessage('请至少选择一种尺码');
                    return;
                }
                if (vm.request.wholesalePrice <= 0 || vm.request.wholesalePrice > 999999) {
                    xunSoft.helper.showMessage('请输入合理的退货价！');
                    return;
                }
                if (vm.request.returnAmount <= 0 || vm.request.returnAmount > 999999) {
                    xunSoft.helper.showMessage("请输入合理的数量!");
                    return;
                }
                //检查基本信息
                if (!saleService.utility.returnCalculate(vm.request, true)) {
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
                saleService.utility.returnCalculate(requestInfo);
            },
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

//客户退货单货品编辑
eShop.onPageInit('saleBatch_returnOrder_editKindPrice', function(page) {
    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                salePrice: 0,
                returnAmount: 0,
                wholesalePrice: 0,
                discountRate: 100,
                returnMoney: 0,
                description: ''
            },
            kind: '',
            detailList: '',
        },
        methods: {
            init: function() {
                if (page.query.kind) {
                    page.query.kind.wholesalePrice = page.query.kind.wholesalePrice;
                    _.extend(vm.request, _.omit(page.query.kind, 'kind'))
                    vm.kind = page.query.kind;
                    vm.detailList = page.query.request.detailList;
                }
            },
            delete: function(kind) {
                if (!kind.returnDetailId) {
                    page.query.request.$remove(kind);
                    mainView.router.back();
                }
                if (_.isEmpty(page.query.request.deletedIDs)) {

                    page.query.request.deletedIDs += kind.returnDetailId;
                } else {
                    page.query.request.deletedIDs += (',' + kind.returnDetailId);
                }
                mainView.router.back();
            },
            //保存货品
            saveKind: function() {
                if (vm.request.wholesalePrice <= 0 || vm.request.wholesalePrice > 999999) {
                    xunSoft.helper.showMessage('请输入合理的单价！');
                    return;
                }
                if (vm.request.returnAmount <= 0 || vm.request.returnAmount > 999999) {
                    xunSoft.helper.showMessage("请输入合理的数量!");
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
                saleService.utility.returnCalculate(requestInfo, true);
            }
        }
    });

    vm.init();
});