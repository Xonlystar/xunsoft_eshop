//付款单列表回调
eShop.onPageInit('purchase_payOrder_list', function(page) {

    var pageDiv = $$(page.container);

    // Vue视图模型
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                query: {},
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
                        total += (parseFloat(item.detailSummary.payMoney) || 0);
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
                });

            },
            refresh: function() {
                this.response.data = [];
                this.response.total = 0;
                this.request.pageIndex = 1;
                this.load();
            },
            load: function() {
                purchaseService.get.getPayOrderList(vm.request, vm.response);
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
            //修改单据状态
            updateState: function(flag, order) {
                var request = {
                    data: {
                        tenantId: xunSoft.user.tenantId(),
                        entityId: order.payOrderId,
                        flag: flag
                    }
                };

                //修改单据状态
                purchaseService.put.putPayOrderState(request, {}, function(responseData) {
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

            update: function(payOrder) {
                mainView.router.load({
                    url: 'purchase/payOrder/update.ios.html',
                    query: {
                        payOrderId: payOrder.payOrderId,
                        callback: vm.refresh

                    }
                });
            },

            delete: function(payOrder) {
                eShop.confirm('您确定要删除当前付款单吗？', function() {
                    purchaseService.delete.deletePayOrder({ id: payOrder.payOrderId }, {}, function(responseData) {
                        _.each(vm.response.data, function(value, key) {
                            if (value.time == payOrder.payDate) {
                                vm.response.data[key].value.$remove(payOrder);
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

//付款单明细回调
eShop.onPageInit('purchase_payOrder_detail', function(page) {
    var pageDiv = $$(page.container);
    // Vue视图模型
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
        computed: {
            //付款单据总额
            totalSumMoney: function() {
                var total = 0;
                _.each(this.response.data.sourceDetailList, function(item) {
                    total += (parseFloat(item.sumMoney) || 0);
                });
                return total;
            },
            //付款总额
            totalPayMoney: function() {
                var total = 0;
                _.each(this.response.data.sourceDetailList, function(item) {
                    total += (parseFloat(item.payMoney) || 0);
                });
                return total;
            },
            //账户付款总额
            totalAccountPayMoney: function() {
                var total = 0;
                _.each(this.response.data.detailList, function(item) {
                    total += (parseFloat(item.payMoney) || 0);
                });
                return total;
            },
            //账户总手续费
            totalAccountFeeMoney: function() {
                var total = 0;
                _.each(this.response.data.detailList, function(item) {
                    total += (parseFloat(item.feeMoney) || 0);
                });
                return total;
            },
            //账户支出总额
            totalAccountingMoney: function() {
                var total = 0;
                _.each(this.response.data.detailList, function(item) {
                    total += (parseFloat(item.accountingMoney) || 0);
                });
                return total;
            }
        },
        methods: {
            init: function() {
                vm.request.id = page.query.id;
                this.load();
                pageDiv.find('.pull-to-refresh-content').on('refresh', function() {
                    //下拉刷新
                    eShop.pullToRefreshDone();
                    vm.load();
                });
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
                    url: 'purchase/payOrder/update.ios.html',
                    query: {
                        payOrderId: vm.response.data.payOrderId,
                        callback: this.load
                    }
                });
            },

            load: function() {
                purchaseService.get.getPayOrderDetail(vm.request, vm.response);
            }
        }
    });

    vm.init();

});

// 付款单录入回调
eShop.onPageInit('purchase_payOrder_add', function(page) {
    var pageDiv = $$(page.container);

    // Vue视图模型
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                supplierId: '',
                payDate: xunSoft.helper.formatDate(new Date()),
                accountId: 0,
                costTypeId: '',
                sumMoney: 0,
                receiveStorehouseId: xunSoft.user.shopId(),
                sponsorId: 0,
                updatorId: xunSoft.user.userId(),
                sponsorOrganId: xunSoft.user.shopId(),
                creatorId: xunSoft.user.userId(),
                tenantId: xunSoft.user.tenantId(),
                description: '',
                detailList: [],
                sourceDetailList: []
            },
            response: {
                suppliers: baseInfoService.suppliers,
                expendType: baseInfoService.expendType,
                users: baseInfoService.users,
                accounts: baseInfoService.accounts
            }
        },
        computed: {
            //总需付款金额
            totalPayMoney: function() {
                var total = 0;
                _.each(this.request.sourceDetailList, function(item) {
                    total += (parseFloat(item.payMoney) || 0);
                });
                return total;
            },
            //付款账户金额
            totalAccountMoney: function() {
                var total = 0;
                _.each(this.request.detailList, function(item) {
                    total += (parseFloat(item.accountingMoney) || 0);
                });
                return total;
            }
        },
        watch: {
            "request.supplierId": function(val, oldVal) {
                console.log(val);
                xunSoft.event.smartSelect("#supplierId");
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
                    input: pageDiv.find("#payDate"),
                    maxDate: new Date()
                });
                this.request.sponsorId = xunSoft.user.userId();
                this.request.supplierId = vm.response.suppliers[0].companyId;
                this.request.costTypeId = vm.response.expendType[0].costTypeId;
            },

            // 选择付款单
            selectAccount: function() {
                mainView.router.load({
                    url: 'purchase/payOrder/editAccount.ios.html',
                    query: {
                        detailList: vm.request.detailList
                    },

                });
            },

            // 选择单据
            selectSources: function() {
                if (vm.request.supplierId == '') {
                    xunSoft.helper.showMessage("请选择供应商");
                } else {
                    mainView.router.load({
                        url: 'purchase/payOrder/selectSources.ios.html',
                        query: {
                            sourceEId: vm.request.supplierId,
                            sourceDetailList: vm.request.sourceDetailList,
                        }
                    });
                }

            },
            //更新单据
            updateSources: function(sourceItem) {
                eShop.modal({
                    title: '修改付款单据',
                    afterText: '<div class="input-field">金额:<input id="payMoney" type="number" value="' + sourceItem.payMoney + '" class="modal-text-input"></div>',
                    buttons: [{
                            text: '取消',
                            close: true,
                        },
                        {
                            text: '修改',
                            close: true,
                        },
                        {
                            text: '删除',
                            close: true,
                        }
                    ],
                    onClick: function(modal, index) {
                        //修改单据
                        if (index == 1) {
                            var inputVal = parseFloat($$(modal).find("#payMoney").val()) || 0;
                            if (inputVal <= sourceItem.unpaidMoney) {
                                sourceItem.payMoney = inputVal;
                            } else {
                                xunSoft.helper.showMessage('您输入的付款金额多余还未付款的金额');
                            }
                        }
                        if (index == 2) {
                            vm.request.sourceDetailList.$remove(sourceItem);
                        }
                    }
                });
            },

            // 更新付款单账户
            updateAccount: function(accountItem) {
                eShop.modal({
                    title: '修改付款账户',
                    afterText: '<div class="input-field">付款金额:<input id="payMoney" type="number" value="' + accountItem.payMoney + '" class="modal-text-input"></div>' +
                        '<div class="input-field">手续费:<input id="feeMoney" type="number" value="' + accountItem.feeMoney + '" class="modal-text-input"></div>' +
                        '<div class="input-field">备注:<input maxlength="100" id="description" placeholder="备注" type="text" value="' + accountItem.description + '" class="modal-text-input"></div>',
                    buttons: [{
                            text: '取消',
                            close: true,
                        },
                        {
                            text: '修改',
                            close: true,
                        },
                        {
                            text: '删除',
                            close: true,
                        }
                    ],
                    onClick: function(modal, index) {
                        if (index == 1) {
                            var modelDiv = $$(modal);
                            accountItem.payMoney = parseFloat(modelDiv.find("#payMoney").val()) || 0;
                            accountItem.feeMoney = parseFloat(modelDiv.find("#feeMoney").val()) || 0;
                            accountItem.accountingMoney = accountItem.payMoney + accountItem.feeMoney;
                            accountItem.description = modelDiv.find("#description").val();
                        }
                        if (index == 2) {
                            vm.request.detailList.$remove(accountItem);
                        }
                    }
                });
            },

            back: function() {
                if (page.query.action !== 'update' && this.request.detailList && this.request.detailList.length > 0) {
                    eShop.confirm('您的付款单已经发生更改，是否取消?', function() {
                        mainView.router.back();
                    });
                } else {
                    mainView.router.back();
                }
            },

            // 保存付款单
            save: function() {
                if (vm.request.supplierId == '') {
                    xunSoft.helper.showMessage("请选择供应商");
                    return;
                }
                if (!vm.request.costTypeId || vm.request.costTypeId == '') {
                    xunSoft.helper.showMessage('请选择支出类型');
                    return;
                }
                if (vm.request.sourceDetailList.length == 0) {
                    xunSoft.helper.showMessage('请至少选择一个付款单据');
                    return;
                }
                if (vm.request.detailList.length == 0) {
                    xunSoft.helper.showMessage('请至少选择一个付款账户');
                    return;
                }
                if (vm.totalPayMoney > vm.totalAccountMoney) {
                    xunSoft.helper.showMessage('应付款金额大于账户总额');
                    return;
                }

                var request = {
                    data: vm.request
                };

                purchaseService.post.postPayOrder(request, {}, function(responseData) {
                    xunSoft.helper.showMessage("付款订单已经保存成功");
                    //清空基本信息
                    vm.request.description = '';
                    vm.request.advanceMoney = 0;
                    vm.request.detailList = [];
                    vm.request.sourceDetailList = [];
                });
            }
        }
    });

    vm.init();
});

// 付款单编辑回调
eShop.onPageInit('purchase_payOrder_update', function(page) {
    var pageDiv = $$(page.container);
    // Vue视图模型
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                supplierId: '',
                supplierName: '',
                payDate: '',
                accountId: 0,
                costTypeId: 0,
                sumMoney: 0,
                sponsorId: 0,
                description: '',
                deletedIDs: '0',
                deletedSourceIDs: "0",
                detailList: [],
                sourceDetailList: []
            },
            response: {
                suppliers: baseInfoService.suppliers,
                expendType: baseInfoService.expendType,
                users: baseInfoService.users,
                accounts: baseInfoService.accounts
            }
        },
        computed: {
            //总需付款金额
            totalPayMoney: function() {
                var total = 0;
                _.each(this.request.sourceDetailList, function(item) {
                    total += (parseFloat(item.payMoney) || 0);
                });
                return total;
            },
            //付款账户金额
            totalAccountMoney: function() {
                var total = 0;
                _.each(this.request.detailList, function(item) {
                    total += (parseFloat(item.accountingMoney) || 0);
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
                    input: pageDiv.find("#payDate"),
                    value: new Date()
                });

                if (page.query.payOrderId) {
                    purchaseService.get.getPayOrderDetail({ id: page.query.payOrderId }, vm.response, function(responseData) {
                        _.extend(vm.request, _.omit(responseData.data, 'deletedIDs', 'deletedSourceIDs'));
                        _.each(vm.request.sourceDetailList, function(item) {
                            item.userLogo = xunSoft.ajax.serviceBase() + "Shop/User/OrderUser/" + item.sourceTypeId + "/" + xunSoft.user.tenantId() + "/" + item.sourceId;
                        });
                    });
                } else {
                    this.request.sponsorId = xunSoft.user.userId();
                }
            },

            // 选择单据
            selectSources: function() {
                if (vm.request.supplierId == '') {
                    xunSoft.helper.showMessage("请选择供应商");
                } else {
                    mainView.router.load({
                        url: 'purchase/payOrder/selectSources.ios.html',
                        query: {
                            sourceEId: vm.request.supplierId,
                            sourceDetailList: vm.request.sourceDetailList,
                        }
                    });
                }

            },
            // 添加账户
            selectAccount: function() {
                mainView.router.load({
                    url: 'purchase/payOrder/editAccount.ios.html',
                    query: {
                        detailList: vm.request.detailList
                    },

                });
            },

            updateSources: function(sourceItem) {
                eShop.modal({
                    title: '修改单据收款',
                    afterText: '<div class="input-field">金额:<input id="payMoney" type="number" value="' + sourceItem.payMoney + '" class="modal-text-input"></div>',
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
                        //修改单据
                        if (index == 1) {
                            var inputVal = parseFloat($$(modal).find("#payMoney").val()) || 0;
                            if (inputVal <= sourceItem.unpaidMoney) {
                                sourceItem.payMoney = inputVal;
                            } else {
                                xunSoft.helper.showMessage('您输入的收款金额多余还未收款的金额');
                            }
                        }
                        //删除单据
                        if (index == 2) {
                            vm.request.sourceDetailList.$remove(sourceItem);
                            //是否删除已经保存的明细
                            if (sourceItem.paySourceDetailId) {
                                vm.request.deletedSourceIDs += ',' + sourceItem.paySourceDetailId;
                            }
                        }
                    }
                });
            },


            // 更新付款单账户
            updateAccount: function(accountItem) {
                eShop.modal({
                    title: '修改收款账户',
                    afterText: '<div class="input-field">付款金额:<input id="payMoney" type="number" value="' + accountItem.payMoney + '" class="modal-text-input"></div>' +
                        '<div class="input-field">手续费:<input id="feeMoney" type="number" value="' + accountItem.feeMoney + '" class="modal-text-input"></div>' +
                        '<div class="input-field">备注:<input maxlength="100" id="description" placeholder="备注" type="text" value="' + accountItem.description + '" class="modal-text-input"></div>',
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
                            var modelDiv = $$(modal);
                            accountItem.payMoney = parseFloat(modelDiv.find("#payMoney").val()) || 0;
                            accountItem.feeMoney = parseFloat(modelDiv.find("#feeMoney").val()) || 0;
                            accountItem.accountingMoney = accountItem.payMoney + accountItem.feeMoney;
                            accountItem.description = modelDiv.find("#description").val();
                        }
                        if (index == 2) {
                            vm.request.detailList.$remove(accountItem);

                            //是否删除已经保存的账户信息
                            if (accountItem.payDetailId) {
                                vm.request.deletedIDs += "," + accountItem.payDetailId;
                            }
                        }
                    }
                });
            },

            // 保存付款单
            save: function() {
                if (vm.request.supplierId == '') {
                    xunSoft.helper.showMessage("请选择供应商");
                    return;
                }
                if (!vm.request.costTypeId || vm.request.costTypeId == '') {
                    xunSoft.helper.showMessage('请选择支出类型');
                    return;
                }
                if (vm.request.sourceDetailList.length == 0) {
                    xunSoft.helper.showMessage('请至少选择一个付款单据');
                    return;
                }
                if (vm.request.detailList.length == 0) {
                    xunSoft.helper.showMessage('请至少选择一个付款账户');
                    return;
                }

                if (vm.totalPayMoney > vm.totalAccountMoney) {
                    xunSoft.helper.showMessage('应付款金额大于账户总额');
                    return;
                }

                var request = {
                    data: vm.request
                };
                purchaseService.put.putPayOrder(request, {}, function(responseData) {
                    xunSoft.helper.showMessage("付款订单已经修改成功");
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

//付款单账户录入回调
eShop.onPageInit('purchase_payOrder_editAccount', function(page) {
    var pageDiv = $$(page.container);

    // Vue视图模型
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                accountId: [],
                payMoney: '',
                feeMoney: 0,
                description: ''
            },
            response: {
                accounts: baseInfoService.accounts,
                selectAccounts: []
            },
        },
        computed: {
            //付款金额
            accountingMoney: function() {
                var remainMoney = 0;
                //计算付款金额
                remainMoney = (parseFloat(this.request.payMoney) || 0) + (parseFloat(this.request.feeMoney) || 0);

                return remainMoney;
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
                    xunSoft.helper.showMessage('您至少需要选择一个付款账户');
                    return;
                }

                // 付款金额有效性验证
                if (!xunSoft.valid.validDataRange(this.request.payMoney)) {
                    xunSoft.helper.showMessage("请输入正确的付款金额");
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
                            existAccount.payMoney = vm.request.payMoney;
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
                                newAccountInfo.payMoney = vm.request.payMoney;
                                newAccountInfo.feeMoney = vm.request.feeMoney;
                                newAccountInfo.accountingMoney = vm.accountingMoney;
                                newAccountInfo.description = vm.request.description;
                                page.query.detailList.push(newAccountInfo);
                            }
                        }

                    });
                    vm.request.accountId = [];
                    xunSoft.helper.showMessage('付款账户已经保存');
                }
            },
        }
    });

    vm.init();
});

// 付款单票据选择回调
eShop.onPageInit('purchase_payOrder_selectSources', function(page) {
    var pageDiv = $$(page.container);

    // Vue视图模型
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                query: {
                    tenantId: xunSoft.user.tenantId(),
                    sourceEId: 0,
                    sourceTypeId: -1,
                    shopId: xunSoft.user.shopId()
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

                this.request.query.sourceEId = page.query.sourceEId;

                pageDiv.find('.pull-to-refresh-content').on('refresh', function() {
                    //下拉刷新
                    eShop.pullToRefreshDone();
                    vm.refresh();
                });

                this.load();

            },
            refresh: function() {
                this.response.data = [];
                this.response.total = 0;
                this.request.pageIndex = 1;
                this.load();
            },
            load: function() {
                purchaseService.get.getPayOrderSourceList(vm.request, {}, function(responseData) {

                    //是否返回数据
                    if (_.isArray(responseData.data) && responseData.data.length > 0) {

                        vm.response.total = responseData.total;
                        //添加数据
                        _.each(responseData.data, function(item) {
                            item.isChecked = false;
                            vm.response.data.push(item);
                        })
                    }
                });
            },
            // save: function() {
            //     if (_.isArray(page.query.sourceDetailList)) {
            //         //遍历单据数据源
            //         _.each(vm.response.data, function(item) {
            //             //是否被选中
            //             if (item.isChecked) {
            //                 item.payMoney = item.unpaidMoney;
            //                 item.userLogo = xunSoft.ajax.serviceBase() + "Shop/User/OrderUser/" + item.sourceTypeId + "/" + xunSoft.user.tenantId() + "/" + item.sourceId;
            //                 page.query.sourceDetailList.push(_.omit(item, 'isChecked'));
            //             }
            //         });

            //     }
            //     mainView.router.back();
            // }

              //保存
            save: function() {
                page.query.sourceDetailList.splice(0);
                _.each(vm.response.data, function(item) {
                    //是否已经选择
                    if (item.isCheck) {
                        if (page.query.sourceDetailList) {
                            item.payMoney = item.unpaidMoney;
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


///////////////////////////////
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