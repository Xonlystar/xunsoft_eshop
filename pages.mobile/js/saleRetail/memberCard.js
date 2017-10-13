//会员卡列表回调
eShop.onPageInit('saleRetail_memberCard_list', function(page) {
    var pageDiv = $$(page.container);
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                query: {
                    shopId: xunSoft.user.shopId(),
                    tenantId: xunSoft.user.tenantId(),
                    userId:xunSoft.user.userId(),
                    openDateFrom: "",
                    openDateTo: '',
                    memberCardNo: '',
                    member_MemberName: '',
                    recentDate: '',
                    recentMoneyFrom: '',
                    recentMoneyTo: '',
                    sponsorId: ''
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
            //加载
            load: function() {
                saleRetailService.get.getMemberCardList(vm.request, vm.response);
            },
            //刷新
            refresh: function() {
                this.request.pageIndex = 1;
                this.response.total = 0;
                this.response.data = [];
                this.load();
            },
            //查询
            query: function() {
                mainView.router.load({
                    url: 'saleRetail/memberCard/filter.ios.html',
                    query: {
                        para: vm.request.query,
                        callback: vm.refresh
                    }
                });
            },
            //修改
            update: function(memberCard) {
                mainView.router.load({
                    url: 'saleRetail/memberCard/update.ios.html',
                    query: {
                        memberCardId: memberCard.memberCardId,
                        callback: vm.refresh
                    }
                });
            },
            //删除
            delete: function(memberCard) {
                var request = {
                    id: memberCard.memberCardId
                };
                eShop.confirm('您确定要删除选中的会员卡么？', function() {
                    saleRetailService.delete.deleteMemberCard(request, {}, function(responseData) {
                        vm.response.data.$remove(memberCard);
                        xunSoft.helper.showMessage('会员卡删除成功');
                    });
                });
            },
            //启用或停用会员卡
            enable: function(flag, memberCard) {
                var request = {
                    data: {
                        entityId: memberCard.memberCardId,
                        tenantId: xunSoft.user.tenantId(),
                        flag: flag
                    }
                };

                saleRetailService.put.updateMemberCardState(request, {}, function(responseData) {
                    if (flag == 6) {
                        memberCard.isEnable = 0;
                        xunSoft.helper.showMessage('会员卡禁用成功');
                    } else if (flag == 5) {
                        memberCard.isEnable = 1;
                        xunSoft.helper.showMessage('会员卡启用成功');
                    }
                });

            },
            //弹出框
            showMenu:function(item){
                var buttons=[];
                if(item.isEnable=='0'){
                    buttons.push({
                        text:'启用',
                        onClick:function(){
                            vm.enable('5',item);
                        }
                    });
                }
                if(item.isEnable=='1'){
                    buttons.push({
                        text:'禁用',
                        onClick:function(){
                            vm.enable('6',item)
                        }
                    });
                }
                
                buttons.push({
                    text:'取消',
                    color:'red'
                });
                eShop.actions(pageDiv.container, buttons);
            }

        }
    });

    vm.init();

});

//会员卡录入回调
eShop.onPageInit('saleRetail_memberCard_add', function(page) {
    var pageDiv = $$(page.container);

    //视图模型
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                shopId: xunSoft.user.shopId(),
                tenantId: xunSoft.user.tenantId(),
                memberCardTypeId: '',
                memberCardNo: '',
                discountRate: '',
                openDate: xunSoft.helper.formatDate(new Date()),
                description: '',
                sponsorId: 0,
                userId: 0,
                ShopId: xunSoft.user.shopId(),
                member_MemberName: '',
                member_Birthday: xunSoft.helper.formatDate(new Date()),
                member_MarriageDate: xunSoft.helper.formatDate(new Date()),
                member_MobilePhone: "",
                member_Email: '',
                member_QQ: '',
                member_WechatNo: '',
                member_Sex: 1,
                storeValueCardId: '',
                userLogo: ''
            },
            response: {
                memberCardType: baseInfoService.memberCardType,
                users: baseInfoService.users,
            }
        },
        computed: {
            //选择卡类型后自动获得 默认折扣率
            getDiscount: function() {
                var memberCardTypeId = "";
                memberCardTypeId = this.request.memberCardTypeId;
                var index = _.findIndex(this.response.memberCardType, function(item) {
                    return item.memberCardTypeId === memberCardTypeId;
                });
                if (index === -1) {
                    return;
                }
                var result = vm.response.memberCardType[index].discountRate.toFixed(2)
                this.request.discountRate = result;
                return result;
            }
        },
        watch: {
            "request.userId": function(val, oldVal) {
                xunSoft.event.smartSelect("#userId");
            }
        },
        methods: {
            //日期控件初始化
            init: function() {
                eShop.calendar({
                    input: pageDiv.find("#openDate"),
                    maxDate: new Date()
                });
                eShop.calendar({
                    input: pageDiv.find("#marriageDate"),
                    maxDate: new Date()
                });
                eShop.calendar({
                    input: pageDiv.find("#member_Birthday"),
                    maxDate: new Date()
                });
                this.request.sponsorId = xunSoft.user.userId();
                this.request.userId = xunSoft.user.userId();
            },
            //回退
            back: function() {
                if (vm.request.memberCardTypeId || vm.request.memberCardNo || vm.request.member_MemberName) {
                    eShop.confirm('会员卡部分信息已填写,您确认退出吗？', function() {
                        mainView.router.back();
                    });
                } else {
                    mainView.router.back();
                }
            },
            showPop: function() {
                var buttons = [{
                        text: '相机',
                        onClick: function() {
                            xunSoft.device.photo.takePhoto(function(imgUrl) {
                                vm.request.userLogo = imgUrl;
                            });
                        }
                    },
                    {
                        text: '相册',
                        onClick: function() {
                            xunSoft.device.photo.getPhoto(function(imgUrl) {
                                vm.request.userLogo = imgUrl;
                            });
                        }
                    },
                    {
                        text: '取消',
                        color: 'red'
                    },
                ];
                eShop.actions("#userLogo", buttons);
            },
            //会员卡录入
            save: function() {
                if (vm.request.memberCardNo == "") {
                    xunSoft.helper.showMessage('会员卡号不能为空!');
                    return;
                }
                if (vm.request.memberCardTypeId == "") {
                    xunSoft.helper.showMessage('会员卡类型不能为空!');
                    return;
                }
                if (vm.request.openDate == "") {
                    xunSoft.helper.showMessage('建卡日期不能为空!');
                    return;
                }
                if (vm.request.shopId == "") {
                    xunSoft.helper.showMessage('建卡店铺不能为空!');
                    return;
                }
                if (vm.request.member_MemberName == "") {
                    xunSoft.helper.showMessage('会员姓名不能为空!');
                    return;
                }
                if (vm.request.member_Birthday == "") {
                    xunSoft.helper.showMessage('出生日期不能为空!');
                    return;
                }
                if (vm.request.sponsorId == "") {
                    xunSoft.helper.showMessage('经手人不能为空!');
                    return;
                }
                if (vm.request.member_Sex == "") {
                    xunSoft.helper.showMessage('性别不能为空!');
                    return;
                }
                if (vm.request.member_Email != "" && vm.request.member_Email != null) {
                    if (!xunSoft.valid.validPhone(vm.request.member_MobilePhone)) {
                        xunSoft.helper.showMessage("邮箱格式不正确");
                        return;
                    }
                }
                if (vm.request.member_MobilePhone != "" && vm.request.member_MobilePhone != null) {
                    if (!xunSoft.valid.validPhone(vm.request.member_MobilePhone)) {
                        xunSoft.helper.showMessage("手机号格式不正确");
                        return;
                    }
                }
                if (vm.request.member_QQ != "" && vm.request.member_QQ != null) {
                    if (!xunSoft.valid.validPhone(vm.request.member_MobilePhone)) {
                        xunSoft.helper.showMessage("QQ号码格式不正确");
                        return;
                    }
                }
                if (vm.request.discountRate != "" && vm.request.discountRate != null) {
                    if (!xunSoft.valid.validFloat(vm.request.discountRate)) {
                        xunSoft.helper.showMessage("默认折扣率必须为数字，小数点后最多有两位!");
                        return;
                    }
                }

                //提交数据
                var request = {
                    data: vm.request
                };

                //保存
                saleRetailService.post.postMemberCard(request, {}, function() {
                    vm.request.memberCardTypeId = vm.request.memberCardNo = vm.request.member_MemberName =
                        vm.request.description = vm.request.member_MobilePhone = vm.request.member_Email =
                        vm.request.member_WechatNo = vm.request.member_Sex = "";
                    xunSoft.helper.showMessage('会员卡录入成功！');
                    mainView.router.back();
                });

            },
        }
    });
    vm.init();
});

//会员卡更新回调
eShop.onPageInit('saleRetail_memberCard_update', function(page) {
    var pageDiv = $$(page.container);

    //视图模型
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                shopId: xunSoft.user.shopId(),
                tenantId: xunSoft.user.tenantId(),
                memberCardTypeId: '',
                memberCardNo: '',
                discountRate: '',
                openDate: xunSoft.helper.formatDate(new Date()),
                description: '',
                sponsorId: 0,
                ShopId: xunSoft.user.shopId(),
                member_MemberName: '',
                member_Birthday: xunSoft.helper.formatDate(new Date()),
                member_MarriageDate: xunSoft.helper.formatDate(new Date()),
                member_MobilePhone: "",
                member_Email: '',
                member_QQ: '',
                age: 0,
                member_WechatNo: '',
                member_Sex: '',
                userLogo: '',
                userId: 0,
            },
            response: {
                memberCardType: baseInfoService.memberCardType,
                users: baseInfoService.users
            }
        },
        watch: {
            "request.memberCardTypeId": function(val, oldVal) {
                xunSoft.event.smartSelect("#memberCardTypeId");
            },
            "request.sponsorId": function(val, oldVal) {
                xunSoft.event.smartSelect("#sponsorId");
            },
            "request.member_Sex": function(val, oldVal) {
                xunSoft.event.smartSelect("#member_Sex");
            }
        },
        computed: {
            //选择卡类型后自动获得 默认折扣率
            getDiscount: function() {
                var memberCardTypeId = "";
                memberCardTypeId = this.request.memberCardTypeId;
                var index = _.findIndex(this.response.memberCardType, function(item) {
                    return item.memberCardTypeId === memberCardTypeId;
                });
                if (index === -1) {
                    return;
                }
                var result = vm.response.memberCardType[index].discountRate.toFixed(2);
                if (this.rquest.memberCardTypeId == page.query.memberCard.memberCardTypeId) {
                    return;
                }
                this.request.discountRate = result;
                return result;
            }
        },
        methods: {
            //日期控件初始化
            init: function() {
                eShop.calendar({
                    input: pageDiv.find("#openDate"),
                    maxDate: new Date()
                });
                eShop.calendar({
                    input: pageDiv.find("#marriageDate"),
                    maxDate: new Date()
                });
                eShop.calendar({
                    input: pageDiv.find("#member_Birthday"),
                    maxDate: new Date()
                });
                saleRetailService.get.getMemberCardDetail({ "id": page.query.memberCardId }, vm.response, function(responseData) {
                    _.extend(vm.request, responseData.data);
                    vm.request.discountRate = vm.request.discountRate.toFixed(2);


                });
            },

            showPop: function() {
                var buttons = [{
                        text: '相机',
                        onClick: function() {
                            xunSoft.device.photo.takePhoto(function(imgUrl) {
                                vm.request.userLogo = imgUrl;
                            });
                        }
                    },
                    {
                        text: '相册',
                        onClick: function() {
                            xunSoft.device.photo.getPhoto(function(imgUrl) {
                                vm.request.userLogo = imgUrl;
                            });
                        }
                    },
                    {
                        text: '取消',
                        color: 'red'
                    },
                ];
                eShop.actions("#userLogo", buttons);
            },
            //会员卡录入
            save: function() {
                if (vm.request.memberCardTypeId == "") {
                    xunSoft.helper.showMessage('会员卡类型不能为空!');
                    return;
                }
                if (vm.request.memberCardNo == "") {
                    xunSoft.helper.showMessage('会员卡号不能为空!');
                    return;
                }
                if (vm.request.openDate == "") {
                    xunSoft.helper.showMessage('建卡日期不能为空!');
                    return;
                }
                if (vm.request.shopId == "") {
                    xunSoft.helper.showMessage('建卡店铺不能为空!');
                    return;
                }
                if (vm.request.member_MemberName == "") {
                    xunSoft.helper.showMessage('会员姓名不能为空!');
                    return;
                }
                if (vm.request.member_Birthday == "") {
                    xunSoft.helper.showMessage('出生日期不能为空!');
                    return;
                }
                if (vm.request.sponsorId == "") {
                    xunSoft.helper.showMessage('经手人不能为空!');
                    return;
                }
                if (vm.request.member_Sex == "") {
                    xunSoft.helper.showMessage('性别不能为空!');
                    return;
                }
                if (vm.request.member_MobilePhone != "" && vm.request.member_MobilePhone != null) {
                    if (!xunSoft.valid.validPhone(vm.request.member_MobilePhone)) {
                        xunSoft.helper.showMessage("手机号格式不正确");
                        return;
                    }
                }
                if (vm.request.member_Email != "" && vm.request.member_Email != null) {
                    if (!xunSoft.valid.validEmail(vm.request.member_Email)) {
                        xunSoft.helper.showMessage("邮箱格式不正确");
                        return;
                    }
                }
                if (vm.request.member_QQ != "" && vm.request.member_QQ != null) {
                    if (!xunSoft.valid.validQQ(vm.request.member_QQ)) {
                        xunSoft.helper.showMessage("QQ号码格式不正确");
                        return;
                    }
                }
                if (vm.request.discountRate != "" && vm.request.discountRate != null) {
                    if (!xunSoft.valid.validFloat(vm.request.discountRate)) {
                        xunSoft.helper.showMessage("默认折扣率必须为数字，小数点后最多有两位!");
                        return;
                    }
                }

                //提交数据
                var request = {
                    data: vm.request
                };

                //保存
                saleRetailService.put.putMemberCard(request, {}, function() {
                    xunSoft.helper.showMessage('会员卡修改成功！');
                    mainView.router.back();
                    if (_.isFunction(page.query.callback)) {
                        page.query.callback();
                    }
                });

            },
        }
    });
    vm.init();
});

//通用过滤选择页面
eShop.onPageInit('saleRetail_memberCard_filter', function(page) {
    var pageDiv = $$(page.container);

    //视图模型
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                openDateFrom: "",
                openDateTo: '',
                memberCardNo: '',
                member_MemberName: '',
                recentDate: '',
                recentMoneyFrom: '',
                recentMoneyTo: '',
                sponsorId: ''
            },
            response: {
                users: baseInfoService.users,
            }
        },
        methods: {
            init: function() {
                //初始化页面时间控件
                eShop.calendar({
                    input: pageDiv.find("#startDate"),
                    minDate: (new Date(2015, 1, 1)),
                    maxDate: (new Date())
                });
                eShop.calendar({
                    input: pageDiv.find("#endDate"),
                    minDate: (new Date(2015, 1, 1)),
                    maxDate: (new Date())
                });
                eShop.calendar({
                    input: pageDiv.find("#recentDate"),
                    minDate: (new Date(2015, 1, 1)),
                    maxDate: (new Date())
                });
                //获取传过来的值
                if (page.query.para) {
                    _.extend(vm.request, page.query.para);
                }

            },
            //保存数据，回传给列表页，执行刷新
            save: function() {
                if (page.query.para) {
                    _.extend(page.query.para, vm.request);
                }
                mainView.router.back();
                if (_.isFunction(page.query.callback)) {
                    page.query.callback();
                }
            },
            //清空输入的数据
            clear: function() {
                vm.request.openDateFrom = vm.request.openDateTo = vm.request.memberCardNo = vm.request.member_MemberName = vm.request.recentDate = vm.request.sponsorId = vm.request.member_Sex = vm.request.recentMoneyFrom = vm.request.recentMoneyTo = '';
            }
        }
    });

    vm.init();
})

//会员卡详情页
eShop.onPageInit('saleRetail_memberCard_detail', function(page) {
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
                vm.request.id = page.query.memberCardId;
                pageDiv.find('.pull-to-refresh-content').on('refresh', function() {
                    eShop.pullToRefreshDone();
                    vm.load();
                });
                this.load();
            },
            load: function() {
                saleRetailService.get.getMemberCardDetail(vm.request, vm.response, function(responseData) {
                    //遍历用户列表得到 建卡人姓名
                    _.each(baseInfoService.users, function(item) {
                        if (item.userId === vm.response.data.sponsorId) {
                            vm.response.data.sponsorName = item.userName;
                        }
                    });
                });
            },
            edit: function(e) {
                e.preventDefault();
                e.stopPropagation()
                mainView.router.load({
                    url: 'saleRetail/memberCard/update.ios.html',
                    query: {
                        memberCardId: vm.response.data.memberCardId,
                        callback: this.load
                    }
                });
            }
        }
    });
    vm.init();
});