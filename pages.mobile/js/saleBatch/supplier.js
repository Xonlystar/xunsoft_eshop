//销售订单列表回调
eShop.onPageInit('supplier_list', function(page) {
    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            query: "",
            request: {
                query: {
                    tenantId: xunSoft.user.tenantId(),
                    shopId: xunSoft.user.shopId(),
                },
                pageIndex: 1,
                pageSize: xunSoft.user.pageSize()
            },
            response: {
                total: 0,
                data: [],
            }
        },
        computed: {
            computedList: function() {
                try {
                    var callback = [];
                    var newData = this.response.data.filter(function(item) {
                        return item.companyName.indexOf(vm.query) !== -1;
                    })
                    var tempResult = [];
                    _.each(newData, function(item) {
                        //转换信息
                        var supplier = _.pick(item, 'companyId', 'contactList', 'companyName', 'companyRegisterTypeId', 'companyRegisterTypeName', 'isEnable',
                            'contactNumber', 'createTime');
                        var name = Utils.CSpell.getSpell(supplier.companyName).split(",")[0];
                        if (name.indexOf("[") == -1) {
                            name = name.slice(0, 1);
                        } else {
                            name = name.slice(1, 2)
                            if (supplier.companyName.indexOf("长沙") != -1) { name = "c" }
                        }
                        supplier.time = name;
                        if (!tempResult[name]) { tempResult[name] = [] }
                        tempResult[name].push(supplier);
                    });
                    for (var o in tempResult) {
                        callback.push({ time: o, value: tempResult[o] })
                    }
                    callback.sort(function(a, b) {
                        return a.time > b.time;
                    });
                    return callback;
                } catch (e) {

                }
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
            //打电话
            call: function(contact, e) {
                var e = e || window.event;
                e.preventDefault();
                e.stopPropagation();
                if (!contact || !contact.telephone || (contact.telephone && !xunSoft.valid.validNum(contact.telephone))) {
                    xunSoft.helper.showMessage("电话格式错误!");
                    return;
                }
                xunSoft.device.call(contact.telephone);
            },
            detail: function(supplier) {
                mainView.router.load({
                    url: 'supplier/detail.ios.html',
                    query: {
                        companyId: supplier.companyId,
                        callback: this.refresh
                    }
                });
            },
            load: function() {
                purchaseService.get.getSupplierList(this.request, {}, function(responseData) {
                    vm.response.total = responseData.data.length;
                    vm.response.data = responseData.data;
                });
            },
            //弹出框
            showMenu: function(item) {
                var buttons = [];
                buttons.push({
                    text: '编辑',
                    onClick: function() {
                        vm.update(item)
                    }
                });
                buttons.push({
                    text: '删除',
                    onClick: function() {
                        vm.delete(item)
                    }
                });
                buttons.push({
                    text: '取消',
                    color: 'red'
                });
                eShop.actions(pageDiv.container, buttons);
            },
            //修改供应商
            update: function(supplier) {
                mainView.router.load({
                    url: 'supplier/update.ios.html',
                    query: {
                        companyId: supplier.companyId,
                        callback: this.refresh
                    }
                });
            },
            //删除供应商
            delete: function(supplier) {
                eShop.confirm('您确定要删除当前供应商吗？', function() {
                    purchaseService.delete.delelteSupplier({ id: supplier.companyId }, {}, function(responseData) {
                        _.each(vm.response.data, function(value, key) {
                            if (value.time == supplier.time) {
                                vm.response.data[key].value.$remove(supplier);
                            }
                        });
                        vm.response.total--;
                        xunSoft.helper.showMessage('供应商删除成功');
                    });
                });
            }
        }
    });

    vm.init();
});

//供应商详情回调
eShop.onPageInit('supplier_detail', function(page) {
    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                id: 0,
            },
            response: {
                data: [],
            }
        },

        methods: {
            init: function() {
                vm.request.id = page.query.companyId;
                this.load();
                pageDiv.find('.pull-to-refresh-content').on('refresh', function() {
                    eShop.pullToRefreshDone();
                    vm.load();
                });
            },
            load: function() {
                purchaseService.get.getSupplierDetail(vm.request, vm.response);
            },
            edit: function(e) {
                e.preventDefault();
                e.stopPropagation()
                mainView.router.load({
                    url: 'supplier/update.ios.html',
                    query: {
                        companyId: vm.response.data.companyId,
                        callback: this.load
                    }
                });
            },
        }
    });

    vm.init();
});

//销售订单列表回调
eShop.onPageInit('supplier_add', function(page) {
    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                tenantId: xunSoft.user.tenantId(),
                shopId: xunSoft.user.shopId(),
                description: '',
                companyName: '',
                companyRegisterTypeId: '',
                cityId: '',
                address: '',
                businessData: {},
                id: '',
                contactList: [],
            },
            response: {
                companyRegisterTypes: [],
                districts: baseInfoService.district
            }
        },
        watch: {
            "request.companyRegisterTypeId": function(val, oldVal) {
                xunSoft.event.smartSelect("#companyRegisterTypeId");
            },
            "request.cityId": function(val, oldVal) {
                xunSoft.event.smartSelect("#cityId");
            }
        },

        methods: {
            init: function() {
                pageDiv.find('.pull-to-refresh-content').on('refresh', function() {
                    eShop.pullToRefreshDone();
                    vm.load();
                });
                this.response.companyRegisterTypes.push({ companyRegisterTypeId: 110005, companyRegisterTypeName: '独资' });
                this.response.companyRegisterTypes.push({ companyRegisterTypeId: 110010, companyRegisterTypeName: '合资' });
                this.response.companyRegisterTypes.push({ companyRegisterTypeId: 110015, companyRegisterTypeName: '国企' });
                this.response.companyRegisterTypes.push({ companyRegisterTypeId: 110020, companyRegisterTypeName: '外资' });
            },
            save: function() {
                //判断
                if (vm.request.companyName == "") {
                    xunSoft.helper.showMessage('供应商不能为空!');
                    return;
                }
                if (vm.request.businessData.swapRate < 0 || vm.request.businessData.swapRate > 100) {
                    xunSoft.helper.showMessage('请输入正确的换货比率!');
                    return;
                }
                if (vm.request.businessData.swapLimitDays < 0 || vm.request.businessData.swapLimitDays > 1000) {
                    xunSoft.helper.showMessage('请输入正确的换货期限!');
                    return;
                }
                if (vm.request.contactList[0] && vm.request.contactList[0].mobile && !xunSoft.valid.validPhone(vm.request.contactList[0].mobile)) {
                    xunSoft.helper.showMessage('请输入正确的联系电话!');
                    return;
                }
                if (vm.request.contactList[0] && vm.request.contactList[0].telephone && !xunSoft.valid.validPhone(vm.request.contactList[0].telephone)) {
                    xunSoft.helper.showMessage('请输入正确的手机号!');
                    return;
                }
                if (vm.request.contactList[0] && vm.request.contactList[0].email && !xunSoft.valid.validEmail(vm.request.contactList[0].email)) {
                    xunSoft.helper.showMessage('请输入正确的电子邮箱!');
                    return;
                }
                //处理数据获取请求信息
                var request = {
                    data: vm.request
                };
                //保存
                purchaseService.post.postSupplier(request, {}, function() {
                    xunSoft.helper.showMessage('供应商保存成功！');
                    vm.request.companyName = vm.request.description = vm.request.companyRegisterTypeId =
                        vm.request.cityId = vm.request.address = vm.request.businessData = vm.request.contactList = "";
                });
            }
        }
    });

    vm.init();
});



//销售订单列表回调
eShop.onPageInit('supplier_update', function(page) {
    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                tenantId: xunSoft.user.tenantId(),
                shopId: xunSoft.user.shopId(),
                description: '',
                companyId: page.query.companyId,
                companyName: '',
                companyRegisterTypeId: '',
                cityId: '',
                address: '',
                businessData: {},
                contactList: [],
            },
            response: {
                companyRegisterTypes: [],
                districts: baseInfoService.district
            }
        },
        watch: {
            "request.companyRegisterTypeId": function(val, oldVal) {
                xunSoft.event.smartSelect("#companyRegisterTypeId");
            },
            "request.cityId": function(val, oldVal) {
                xunSoft.event.smartSelect("#cityId");
            }
        },

        methods: {
            init: function() {
                this.response.companyRegisterTypes.push({ companyRegisterTypeId: 110005, companyRegisterTypeName: '独资' });
                this.response.companyRegisterTypes.push({ companyRegisterTypeId: 110010, companyRegisterTypeName: '合资' });
                this.response.companyRegisterTypes.push({ companyRegisterTypeId: 110015, companyRegisterTypeName: '国企' });
                this.response.companyRegisterTypes.push({ companyRegisterTypeId: 110020, companyRegisterTypeName: '外资' });
                if (page.query.companyId) {
                    purchaseService.get.getSupplierDetail({ id: page.query.companyId }, {}, function(responseData) {
                        _.extend(vm.request, responseData.data);
                    });
                } else {
                    vm.request.sponsorId = xunSoft.user.userId();
                }
            },
            save: function() {
                if (vm.request.companyName == "") {
                    xunSoft.helper.showMessage('供应商不能为空!');
                    return;
                }
                if (vm.request.businessData.swapRate < 0 || vm.request.businessData.swapRate > 100) {
                    xunSoft.helper.showMessage('请输入正确的换货比率!');
                    return;
                }
                if (vm.request.businessData.swapLimitDays < 0 || vm.request.businessData.swapLimitDays > 1000) {
                    xunSoft.helper.showMessage('请输入正确的换货期限!');
                    return;
                }
                if (vm.request.contactList[0] && vm.request.contactList[0].mobile && !xunSoft.valid.validPhone(vm.request.contactList[0].mobile)) {
                    xunSoft.helper.showMessage('请输入正确的联系电话!');
                    return;
                }
                if (vm.request.contactList[0] && vm.request.contactList[0].telephone && !xunSoft.valid.validPhone(vm.request.contactList[0].telephone)) {
                    xunSoft.helper.showMessage('请输入正确的手机号!');
                    return;
                }
                if (vm.request.contactList[0] && vm.request.contactList[0].email && !xunSoft.valid.validEmail(vm.request.contactList[0].email)) {
                    xunSoft.helper.showMessage('请输入正确的电子邮箱!');
                    return;
                }
                //处理数据获取请求信息
                var request = {
                    data: vm.request
                };
                //保存
                purchaseService.put.putSupplier(request, {}, function() {
                    xunSoft.helper.showMessage('供应商保存成功！');
                    if (_.isFunction(page.query.callback)) {
                        page.query.callback();
                    }
                    mainView.router.back();
                });
            }
        }
    });

    vm.init();
});