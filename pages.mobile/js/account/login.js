//登录
eShop.onPageInit('account_login', function(page) {

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                data: {
                    companyName: "",
                    userName: "",
                    userPassword: "",
                    remember: "",
                    agreeIssue: "",
                }
            },
            response: {
                data: [],
                total: 0
            }
        },
        methods: {
            init: function() {
                xunSoft.user.get();
                vm.request.data.companyName=xunSoft.user.companyName(),
                vm.request.data.userName=xunSoft.user.userName(),
                vm.request.data.userPassword=xunSoft.user.userPassword(),
                vm.request.data.remember=xunSoft.user.remember(),
                vm.request.data.agreeIssue=xunSoft.user.agreeIssue(),            
                //等待设备就绪
                document.addEventListener("deviceready", vm.onDeviceReady, false);
            },
            onDeviceReady: function() {
                document.removeEventListener("backbutton", xunSoft.event.backEvent, false);
                // 注册事件监听  
                document.addEventListener("backbutton", xunSoft.event.back, false);
            },
            login: function() {
                if (!vm.request.data.agreeIssue) {
                    xunSoft.helper.showMessage("您需同意迅商软件会员服务条款!");
                    return;
                }
                if (_.isEmpty(vm.request.data.companyName)) {
                    xunSoft.helper.showMessage("公司名称不能为空!");
                    return;
                }
                if (_.isEmpty(vm.request.data.userName)) {
                    xunSoft.helper.showMessage("用户名称不能为空!");
                    return;
                }
                if (_.isEmpty(vm.request.data.userPassword)) {
                    xunSoft.helper.showMessage("密码不能为空!");
                    return;
                }
                var request = {
                        data: {
                            companyName: vm.request.data.companyName,
                            userName: vm.request.data.userName,
                            userPassword: vm.request.data.userPassword,
                        }
                    }
                    //用户登录
                accountService.post.postLogin(request, null, function(responseData) {
                    eShop.closeModal();
                    xunSoft.user.remember(vm.request.data.remember);
                    xunSoft.user.agreeIssue(vm.request.data.agreeIssue);
                    //记住密码
                    if(vm.request.data.remember){
                        xunSoft.user.save();
                    }else{
                        window.localStorage.removeItem("xunsoft_user")
                    }
                    if (page.query.id === 0) {
                        mainView.router.load({
                            url: 'home.ios.html'
                        });
                    } else if (page.query.id === 1) {
                        mainView.router.back();
                    }
                    eShop.params.swipePanelOnlyClose = false;
                    document.removeEventListener("backbutton", xunSoft.event.back, false);
                    document.addEventListener("backbutton", xunSoft.event.backEvent, false);
                });
            }
        }
    });
    vm.init();
});

//登录
eShop.onPageInit('account_loginPhone', function(page) {

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                data: {
                    phoneNum: '13254564545',
                    phoneCode: '',
                    userPassword: "123456",
                    remember: false,
                    agreeIssue: true,
                }
            },
            response: {
                data: [],
                total: 0
            }
        },
        methods: {
            init: function() {
                //等待设备就绪
                document.addEventListener("deviceready", vm.onDeviceReady, false);
            },
            onDeviceReady: function() {
                document.removeEventListener("backbutton", xunSoft.event.backEvent, false);
                // 注册事件监听  
                document.addEventListener("backbutton", xunSoft.event.back, false);
            },
            getCode: function() {
                //获取验证码
                if (_.isEmpty(vm.request.data.phoneNum)) {
                    xunSoft.helper.showMessage("手机号不能为空!");
                    return;
                }
                if (!xunSoft.valid.validPhone(vm.request.data.phoneNum)) {
                    xunSoft.helper.showMessage("手机号格式错误!");
                    return;
                }
            },
            login: function(n) {
                if (!vm.request.data.agreeIssue) {
                    xunSoft.helper.showMessage("您需同意迅商软件会员服务条款!");
                    return;
                }
                if (_.isEmpty(vm.request.data.phoneNum)) {
                    xunSoft.helper.showMessage("手机号不能为空!");
                    return;
                }
                if (!xunSoft.valid.validPhone(vm.request.data.phoneNum)) {
                    xunSoft.helper.showMessage("手机号格式错误!");
                    return;
                }
                var request = {
                    data: {
                        phoneNum: vm.request.data.phoneNum,
                        userPassword: vm.request.data.userPassword,
                    }
                }
                accountService.post.postLoginByPhone(request, null, function(responseData) {
                    eShop.closeModal();
                    xunSoft.user.remember(vm.request.data.remember);
                    //记住密码
                    if(vm.request.data.remember){
                        xunSoft.user.save();
                    }
                    if (page.query.id == 0) {
                        mainView.router.load({
                            url: 'home.ios.html'
                        });
                    } else if (page.query.id == 1) {
                        mainView.router.back();
                    }
                    eShop.params.swipePanelOnlyClose = false;
                    document.removeEventListener("backbutton", xunSoft.event.back, false);
                    document.addEventListener("backbutton", xunSoft.event.backEvent, false);
                });
            }
        }
    });
    vm.init();
});