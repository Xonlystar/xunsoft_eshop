//收款单列表回调
eShop.onPageInit('saleBatch_receiptOrder_list', function(page) {
    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                query: {
                    receiptOrderNo: '',
                    customerId: '',
                    status: '',
                    createTimeFrom: '',
                    createTimeTo: '',
                    creatorId: '',
                    sponsorId: '',
                    auditorId: '',
                    tenantId: xunSoft.user.tenantId(),
                    shopId: xunSoft.user.shopId(),
                    orderBy: 'receiptOrderId desc',
                },
                pageIndex: 1,
                pageSize: xunSoft.user.pageSize()
            },
            response: {
                total: 0,
                data: []
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
            //加载数据
            load: function() {
                saleService.get.getReceiptOrderList(vm.request, vm.response);

                console.log(vm.response);
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
                        mainView.router.load({ url: "saleBatch/common/print.ios.html?orderType=receiptOrder&orderId=" + item.receiptOrderId });
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
            //修改
            update: function(receiptOrder) {
                mainView.router.load({
                    url: 'saleBatch/receiptOrder/update.ios.html',
                    query: {
                        orderId: receiptOrder.receiptOrderId,
                        callback: vm.refresh
                    }
                });
            },
            //更新状态
            updateState: function(flag, order) {
                var request = {
                    data: {
                        tenantId: xunSoft.user.tenantId(),
                        entityId: order.receiptOrderId,
                        flag: flag
                    }
                };

                //修改单据的状态
                saleService.put.putReceiptUpdateState(request, {}, function(responseData) {
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
            delete: function(receiptOrder) {
                var request = {
                    id: receiptOrder.receiptOrderId
                };
                eShop.confirm('您确定要删除当前收款单吗？', function() {
                    saleService.delete.deleteReceiptOrder(request, {}, function(responseData) {
                        _.each(vm.response.data, function(value, key) {
                            if (value.time == receiptOrder.receiptDate) {
                                vm.response.data[key].value.$remove(receiptOrder);
                            }
                        });
                        vm.response.total--;
                        xunSoft.helper.showMessage('单据删除成功');
                    });
                });
            },

        },
        computed: {
            _totalPrice: function() {
                var total = 0;
                _.each(this.response.data, function(row) {
                    _.each(row.value, function(item) {
                        total += (parseFloat(item.detailSummary.receiptMoney) || 0);
                    });
                });
                return total;
            }
        }
    });

    vm.init();
});

//收款单详情回调
eShop.onPageInit('saleBatch_receiptOrder_detail', function(page) {
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
                saleService.get.getReceiptOrderDetail(vm.request, vm.response);
                console.log(vm.response);
            },
            //编辑
            edit: function(e) {
                e.preventDefault();
                e.stopPropagation()
                if (vm.response.data.submitTime || vm.response.data.auditTime) {
                    xunSoft.helper.showMessage("单据已提交审核，不能修改");
                    return;
                }
                mainView.router.load({
                    url: 'saleBatch/receiptOrder/update.ios.html',
                    query: {
                        orderId: vm.response.data.receiptOrderId,
                        callback: this.load
                    }
                });
            }
        }
    });

    vm.init();

});

//收款单录入回调
eShop.onPageInit('saleBatch_receiptOrder_add', function(page) {
    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                customerId: 0,
                receiptDate: xunSoft.helper.formatDate(new Date()),
                sponsorId: 0,
                sponsorOrganId: xunSoft.user.shopId(),
                sponsorShopId: xunSoft.user.shopId(),
                costTypeId: 0,
                creatorId: xunSoft.user.userId(),
                updatorId: xunSoft.user.userId(),
                description: '',
                tenantId: xunSoft.user.tenantId(),
                detailList: [],
                sourceDetailList: []
            },
            response: {
                customers: baseInfoService.customers,
                users: baseInfoService.users,
                revenueTypes: baseInfoService.revenueType
            }
        },
        computed: {
            //总需收款金额
            totalReceiptMoney: function() {
                var total = 0;
                _.each(this.request.sourceDetailList, function(item) {
                    total += (parseFloat(item.receiptMoney) || 0);
                });
                return total;
            },
            //总入账户金额
            totalAccountMoney: function() {
                var total = 0;
                _.each(this.request.detailList, function(item) {
                    total += (parseFloat(item.receiptMoney) || 0);
                });
                return total;
            }
        },
        watch: {
            "request.customerId": function(val, oldVal) {
                console.log(val);
                xunSoft.event.smartSelect("#customerId");
            },
            "request.costTypeId": function(val, oldVal) {
                console.log(val);
                xunSoft.event.smartSelect("#costTypeId");
            },
            "request.sponsorId": function(val, oldVal) {
                console.log(val);
                xunSoft.event.smartSelect("#sponsorId");
            }
        },
        methods: {
            init: function() {
                eShop.calendar({
                    input: pageDiv.find("#receiptDate"),
                    minDate: new Date()
                });
                this.request.sponsorId = xunSoft.user.userId();
                this.request.customerId = vm.response.customers[0].companyId;
                this.request.costTypeId = vm.response.revenueTypes[0].revenueItemId;
                console.log(vm.request.detailList);
            },
            //选择收款单据
            selectOrder: function() {
                if (vm.request.customerId == '') {
                    xunSoft.helper.showMessage('请先选择收款客户信息');
                    return;
                }
                mainView.router.load({
                    url: 'saleBatch/receiptOrder/selectOrder.ios.html',
                    query: {
                        customerId: vm.request.customerId,
                        sourceDetailList: vm.request.sourceDetailList
                    }
                });
            },
            //选择收款账户
            selectAccount: function() {
                mainView.router.load({
                    url: 'saleBatch/receiptOrder/selectAccount.ios.html',
                    query: {
                        detailList: vm.request.detailList
                    }
                });
            },
            //修改单据
            updateOrder: function(order) {
                eShop.modal({
                    title: '修改单据收款',
                    afterText: '<div class="input-field">金额:<input id="receiptMoney" type="number" value="' + order.receiptMoney + '" class="modal-text-input"></div>',
                    buttons: [{
                        text: '取消',
                        close: true,
                    }, {
                        text: '修改',
                        close: true,
                    }, {
                        text: '删除',
                        close: true,
                    }],
                    onClick: function(modal, index) {
                        if (index == 1) {
                            var inputVal = parseFloat($$(modal).find("#receiptMoney").val()) || 0;
                            if (inputVal <= order.unreceivedMoney) {
                                order.receiptMoney = inputVal;
                            } else {
                                xunSoft.helper.showMessage('您输入的收款金额多余还未收款的金额');
                            }
                        }
                        if (index == 2) {
                            vm.request.sourceDetailList.$remove(order);
                        }
                    }
                });
            },
            //修改账户
            updateAccount: function(account) {
                eShop.modal({
                    title: '修改收款账户',
                    afterText: '<div class="input-field">金额:<input id="receiptMoney" type="number" value="' + account.receiptMoney + '" class="modal-text-input"></div>' +
                        '<div class="input-field">手续费:<input id="feeMoney" type="number" value="' + account.feeMoney + '" class="modal-text-input"></div>' +
                        '<div class="input-field">备注:<input id="description" placeholder="备注" type="text" value="' + account.description + '" class="modal-text-input"></div>',
                    buttons: [{
                        text: '取消',
                        close: true,
                    }, {
                        text: '修改',
                        close: true,
                    }, {
                        text: '删除',
                        close: true,
                    }],
                    onClick: function(modal, index) {
                        console.log(index);
                        if (index == 1) {
                            console.log(modal);
                            account.receiptMoney = parseFloat($$(modal).find("#receiptMoney").val()) || 0;
                            account.description = $$(modal).find("#description").val()
                        }
                        if (index == 2) {
                            vm.request.detailList.$remove(account);
                        }
                    }
                });
            },
            //保存
            save: function() {

                if (vm.request.customerId == '') {
                    xunSoft.helper.showMessage('请选择收款客户');
                    return;
                }
                if (vm.request.costTypeId == '') {
                    xunSoft.helper.showMessage('请选择收款类型');
                    return;
                }
                if (vm.request.sourceDetailList.length == 0) {
                    xunSoft.helper.showMessage('请至少选择一个收款单据');
                    return;
                }
                if (vm.request.detailList.length == 0) {
                    xunSoft.helper.showMessage('请至少选择一个收款账户');
                    return;
                }

                if (vm.totalReceiptMoney > vm.totalAccountMoney) {
                    xunSoft.helper.showMessage('应收款金额大于总收款金额');
                    return;
                }
                if (vm.request.sponsorId == "") {
                    xunSoft.helper.showMessage('经手人不能为空!');
                    return;
                }

                var request = {
                    data: vm.request
                };

                saleService.post.postReceiptOrder(request, {}, function() {
                    xunSoft.helper.showMessage('收款单保存成功');

                    vm.request.detailList = [];
                    vm.request.sourceDetailList = [];

                });

            }
        }
    });
    vm.init();

});

//收款单修改回调
eShop.onPageInit('saleBatch_receiptOrder_update', function(page) {
    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                customerId: '',
                customerName: '',
                receiptDate: '',
                sponsorId: 0,
                costTypeId: 0,
                description: '',
                detailList: [],
                sourceDetailList: [],
                deletedIDs: '0',
                deletedSourceIDs: '0',
            },
            response: {
                customers: baseInfoService.customers,
                users: baseInfoService.users,
                revenueTypes: baseInfoService.revenueType
            },
            rawSourceDetailList: []
        },
        computed: {
            //总需收款金额
            totalReceiptMoney: function() {
                var total = 0;
                _.each(this.request.sourceDetailList, function(item) {
                    total += (parseFloat(item.receiptMoney) || 0);
                });
                return total;
            },
            //总入账户金额
            totalAccountMoney: function() {
                var total = 0;
                _.each(this.request.detailList, function(item) {
                    total += (parseFloat(item.receiptMoney) || 0);
                });
                return total;
            }
        },
        watch: {
            "request.costTypeId": function(val, oldVal) {
                console.log(val);
                xunSoft.event.smartSelect("#costTypeId");
            },
            "request.sponsorId": function(val, oldVal) {
                console.log(val);
                xunSoft.event.smartSelect("#sponsorId");
            }
        },
        methods: {
            init: function() {

                eShop.calendar({
                    input: pageDiv.find("#receiptDate"),
                    minDate: new Date()
                });

                if (page.query.orderId) {
                    saleService.get.getReceiptOrderDetail({ id: page.query.orderId }, {}, function(responseData) {
                        _.each(responseData.data.sourceDetailList, function(item) {
                            item.userLogo = xunSoft.ajax.serviceBase() + "Shop/User/OrderUser/" + item.sourceTypeId + "/" + xunSoft.user.tenantId() + "/" + item.sourceId;
                        });
                        _.extend(vm.request, _.omit(responseData.data, 'deletedIDs', 'deletedSourceIDs'));
                        _.each(vm.request.sourceDetailList, function(item) {
                            item.isCheck = true;
                            vm.rawSourceDetailList.push(item);
                        });
                        //vm.request.rawSourceDetailList = vm.request.sourceDetailList.length;
                    });

                } else {
                    this.request.sponsorId = xunSoft.user.userId();
                }
            },
            //选择收款单据
            selectOrder: function() {
                if (vm.request.customerId == '') {
                    xunSoft.helper.showMessage('请先选择收款客户信息');
                    return;
                }
                mainView.router.load({
                    url: 'saleBatch/receiptOrder/selectOrder.ios.html',
                    query: {
                        customerId: vm.request.customerId,
                        sourceDetailList: vm.request.sourceDetailList,
                        rawSourceDetailList: vm.rawSourceDetailList
                    }
                });
            },
            //选择收款账户
            selectAccount: function() {
                mainView.router.load({
                    url: 'saleBatch/receiptOrder/selectAccount.ios.html',
                    query: {
                        detailList: vm.request.detailList
                    }
                });
            },
            //修改单据
            updateOrder: function(order) {
                eShop.modal({
                    title: '修改单据收款',
                    //afterText: '<div class="input-field">金额:<input id="receiptMoney" type="number" value="' + order.receiptMoney + '" class="modal-text-input"></div>',
                    buttons: [{
                            text: '取消',
                            close: true,
                        }
                        /* , {
                                                text: '修改',
                                                close: true,
                                            } */
                        , {
                            text: '删除',
                            close: true,
                        }
                    ],
                    onClick: function(modal, index) {
                        if (index == 2) {
                            var inputVal = parseFloat($$(modal).find("#receiptMoney").val()) || 0;
                            if (inputVal <= order.unreceivedMoney) {
                                order.receiptMoney = inputVal;
                            } else {
                                xunSoft.helper.showMessage('您输入的收款金额多余还未收款的金额');
                            }
                        }
                        if (index == 1) {
                            vm.request.sourceDetailList.$remove(order);
                            if (order.receiptSourceDetailId) {
                                vm.request.deletedSourceIDs += ',' + order.receiptSourceDetailId;
                            }
                        }
                    }
                });
            },
            //修改账户
            updateAccount: function(account) {
                eShop.modal({
                    title: '修改收款账户',
                    afterText: '<div class="input-field">金额:<input id="receiptMoney" type="number" value="' + account.receiptMoney + '" class="modal-text-input"></div>' +
                        '<div class="input-field">备注:<input id="description" placeholder="备注" type="text" value="' + (account.description ? account.description : '') + '" class="modal-text-input"></div>',
                    buttons: [{
                        text: '取消',
                        close: true,
                    }, {
                        text: '修改',
                        close: true,
                    }, {
                        text: '删除',
                        close: true,
                    }],
                    onClick: function(modal, index) {
                        console.log(index);
                        if (index == 1) {
                            account.receiptMoney = parseFloat($$(modal).find("#receiptMoney").val()) || 0;
                            account.description = $$(modal).find("#description").val()
                        }
                        if (index == 2) {
                            vm.request.detailList.$remove(account);

                            if (account.receiptDetailId) {
                                vm.request.deletedIDs += ',' + account.receiptDetailId;
                            }
                        }
                    }
                });
            },
            //保存
            save: function() {

                if (vm.request.customerId == '') {
                    xunSoft.helper.showMessage('请选择收款客户');
                    return;
                }
                if (vm.request.costTypeId == '') {
                    xunSoft.helper.showMessage('请选择收款类型');
                    return;
                }
                if (vm.request.sourceDetailList.length == 0) {
                    xunSoft.helper.showMessage('请至少选择一个收款单据');
                    return;
                }
                if (vm.request.detailList.length == 0) {
                    xunSoft.helper.showMessage('请至少选择一个收款账户');
                    return;
                }

                if (vm.totalReceiptMoney > vm.totalAccountMoney) {
                    xunSoft.helper.showMessage('应收款金额大于总收款金额');
                    return;
                }
                if (vm.request.sponsorId == "") {
                    xunSoft.helper.showMessage('经手人不能为空!');
                    return;
                }

                _.each(vm.rawSourceDetailList, function(item) {
                    var sourceItem = _.find(vm.request.sourceDetailList, function(item1) {
                        return item.sourceNo == item1.sourceNo;
                    });
                    if (!sourceItem) {
                        vm.request.deletedSourceIDs += ',' + item.receiptSourceDetailId;
                    }
                });

                var request = {
                    data: vm.request
                };
                saleService.put.putReceiptOrder(request, {}, function() {
                    xunSoft.helper.showMessage('收款单修改成功');
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

//收款单 单据选择
eShop.onPageInit('saleBatch_receiptOrder_selectOrder', function(page) {
    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                query: {
                    sourceEId: '',
                    sourceTypeId: -1,
                    shopId: xunSoft.user.shopId(),
                    tenantId: xunSoft.user.tenantId()
                },
                pageIndex: 1,
                pageSize: xunSoft.user.pageSize()
            },
            response: {
                total: 0,
                data: []
            },
            rawSourceDetailListLength: 0
        },
        methods: {
            init: function() {
                vm.request.query.sourceEId = page.query.customerId;
                //下拉刷新
                pageDiv.find('.pull-to-refresh-content').on('refresh', function() {
                    eShop.pullToRefreshDone();
                    vm.load();
                });
                this.load();
            },
            load: function() {
                //获取待收款的单据信息
                saleService.get.getReceiptOrderOrderList(vm.request, {}, function(responseData) {
                    if (_.isArray(page.query.rawSourceDetailList) && page.query.rawSourceDetailList.length > 0) {
                        _.each(page.query.rawSourceDetailList, function(item) {
                            vm.response.data.unshift(item);
                        });
                        vm.rawSourceDetailListLength = page.query.rawSourceDetailList.length;
                    }
                    if (_.isArray(responseData.data) && responseData.data.length > 0) {
                        vm.response.total = responseData.total + vm.rawSourceDetailListLength;
                        vm.request.pageIndex++;
                        _.each(responseData.data, function(item) {
                            var sourceItem = _.find(page.query.sourceDetailList, function(item1) {
                                return item.sourceNo == item1.sourceNo;
                            });
                            if (sourceItem) {
                                item.isCheck = true;
                            } else {
                                item.isCheck = false;
                            }
                            item.userLogo = xunSoft.ajax.serviceBase() + "Shop/User/OrderUser/" + item.sourceTypeId + "/" + xunSoft.user.tenantId() + "/" + item.sourceId;
                            vm.response.data.push(item);
                        });
                    }
                    page.query.rawSourceDetailList = [];
                });
            },
            //保存
            save: function() {
                page.query.sourceDetailList.splice(0);
                _.each(vm.response.data, function(item) {
                    //是否已经选择
                    if (item.isCheck) {
                        if (page.query.sourceDetailList) {
                            item.receiptMoney = item.unreceivedMoney;
                            page.query.sourceDetailList.push(item);
                        }
                    }
                });
                mainView.router.back();
            }
        }
    });

    vm.init();
});

//选择收款账户
eShop.onPageInit('saleBatch_receiptOrder_selectAccount', function(page) {
    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                accountId: [],
                receiptMoney: 0,
                feeMoney: 0,
                description: ''
            },
            response: {
                accounts: baseInfoService.accounts,
                selectAccounts: []
            }
        },
        methods: {
            init: function() {
                if (page.query.detailList) {
                    this.response.selectAccounts = page.query.detailList;
                }
            },

            save: function() {

                // 账户有效性验证
                if (this.request.accountId.length == 0) {
                    xunSoft.helper.showMessage('您至少需要选择一个收款账户');
                    return;
                }

                // 付款金额有效性验证
                if (!xunSoft.valid.validDataRange(this.request.receiptMoney)) {
                    xunSoft.helper.showMessage("请输入正确的收款金额");
                    return;
                }

                // 手续费有效性验证
                if (!xunSoft.valid.validDataRange(this.request.feeMoney, -1)) {
                    xunSoft.helper.showMessage("请输入正确的手续费");
                    return;
                }

                if (page.query.detailList && _.isArray(page.query.detailList)) {
                    //遍历选择
                    _.each(this.request.accountId, function(item) {

                        //是否已经选择
                        var existAccount = _.find(page.query.detailList, function(account) {
                            return account.accountId == item;
                        });

                        if (existAccount) {
                            //修改已有的数据
                            existAccount.receiptMoney = vm.request.receiptMoney;
                            existAccount.feeMoney = vm.request.feeMoney;
                            existAccount.accountingMoney = vm.accountingMoney;
                            existAccount.description = vm.request.description;
                        } else {
                            //查找用户选择的账户信息
                            var accountInfo = _.find(vm.response.accounts, function(account) {
                                return account.accountId == item;
                            });

                            if (accountInfo) {
                                //复制一个新的账户信息
                                var newAccountInfo = _.clone(accountInfo);
                                //保存
                                newAccountInfo.receiptMoney = vm.request.receiptMoney;
                                newAccountInfo.feeMoney = vm.request.feeMoney;
                                newAccountInfo.accountingMoney = vm.accountingMoney;
                                newAccountInfo.description = vm.request.description;
                                page.query.detailList.push(newAccountInfo);
                            }
                        }

                    });
                    vm.request.accountId = [];
                    xunSoft.helper.showMessage('收款账户已经保存');
                }
            },
        },
        computed: {
            //收款金额
            accountingMoney: function() {
                var remainMoney = 0;
                //计算收款金额
                remainMoney = (parseFloat(this.request.receiptMoney) || 0) + (parseFloat(this.request.feeMoney) || 0);

                return remainMoney;
            }
        }
    });

    vm.init();
});