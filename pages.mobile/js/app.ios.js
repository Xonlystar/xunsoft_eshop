var eShop = new Framework7({
    cache: true,
    swipeBackPage: false,
    swipePanel: 'left',
    swipePanelOnlyClose: true,
    tapHold: true,
    modalTitle: 'E售易',
    modalButtonOk: '确定',
    modalButtonCancel: '取消',
    modalPreloaderTitle: '加载中....',
    smartSelectBackText: '返回',
    smartSelectPopupCloseText: '关闭',
    smartSelectPickerCloseText: '确定',
    smartSelectBackOnSelect: true, //智能选择
});

var $$ = Dom7;

//主视图
var mainView = eShop.addView('.view-main', {
    domCache: true,
});

// 过滤器
Vue.filter('dateYM', function(val) { //2017年8月
    try {
        if (_.isString(val) || _.isNumber(val)) {
            val = new Date(val);
        }
        var month = val.getMonth() + 1;
        var year = val.getFullYear();
        return year + "年" + month + "月";
    } catch (error) {
        return val;
    }
    return val;
})
Vue.filter('dateY', function(val) { //2017
    try {
        if (_.isString(val) || _.isNumber(val)) {
            val = new Date(val);
        }
        var year = val.getFullYear();
        return year;
    } catch (error) {
        return val;
    }
    return val;
})



//货币-保留规则  小数保留两位，整数保存不变
Vue.filter('currencys', function(val) {
    try {

        var currency = val.Substring(val.IndexOf('.') + 1, 2);
        if (currency == '00') {
            val = val.IndexOf('.');
        } else {
            val = val.toFixed(2);
        }


    } catch (error) {
        return val;
    }
    return val;
})



setTimeout(function() {

    // if(xunSoft.user.userId()==0){
    // 	mainView.router.load({
    // 		url:'account/login.ios.html'
    // 	});
    // }else{
    // 	mainView.router.load({
    // 		url:'home.ios.html'
    // 	});
    // }
    mainView.router.load({
        url: 'account/login.ios.html',
        query: {
            id: 0
        }
    });

}, 1000)

//选择货品输入框获取焦点时候选中
function getFocus(obj) {
    var value = $$(obj).val();
    if (value) {
        obj.select();
    }
}

//选择货品 单价变化监听
function getChangePrice(obj) {
    var salePrice = $$("#resetHiddenPrice").val();
    var purchasePrice = 0;
    var wholesalePrice = 0;
    var discountRate = 0; //折扣率
    var curr = $$(obj).attr("data-curr");
    var reg = /^(0|[1-9][0-9]{0,9})(\.[0-9]{1,2})?$/;
    if (!reg.test($$(obj).val())) {
        xunSoft.helper.showMessage("价格格式输入有误...");
        $$(obj).val(salePrice);
    }
    if (parseFloat($$(obj).val()) > parseFloat(salePrice)) {
        xunSoft.helper.showMessage("价格不能大于折扣率...");
        $$(obj).val(salePrice);
    }
    if (curr == 1) { //采购
        purchasePrice = $$(obj).val();
        discountRate = (purchasePrice / salePrice * 100).toFixed(2) + '%';
    } else if (curr == 0) { //销售
        wholesalePrice = $$(obj).val();
        discountRate = (wholesalePrice / salePrice * 100).toFixed(2) + '%';
    }
    $$("#resetDiscountRate").val(discountRate);
}

//选择货品 折扣率变化监听
function getChangeRate(obj) {
    var price = 0;
    var salePrice = $$("#resetHiddenPrice").val();
    var discountRate = $$(obj).val();
    if (discountRate.indexOf("%") != -1) {
        discountRate = discountRate.slice(0, -1);
    }
    var reg = /^(0|[1-9][0-9]{0,9})(\.[0-9]{1,2})?$/;
    if (!reg.test(discountRate)) {
        xunSoft.helper.showMessage("折扣率格式输入有误...");
        $$(obj).val("100%");
        discountRate = 100;
    }
    if (discountRate && parseFloat(discountRate) > 100) {
        xunSoft.helper.showMessage("请输入正确的折扣率(0-100)");
        $$(obj).val("100%");
        discountRate = 100;
    }
    $$("#resetPrice").val(salePrice * discountRate / 100);
}


//设置状态栏颜色
if (window.StatusBar && window.device) {
    StatusBar.backgroundColorByHexString("#2A85C3");
    if (parseInt(device.version) < 5) { StatusBar.hide() }
}


//左侧页面事件监听
$$("#user ul li").on("click", "a", function(e) {
    var e = e || window.event;
    e.preventDefault();
    e.stopPropagation();
    eShop.closePanel();
    eShop.params.swipePanelOnlyClose = true;
    var obj = $$(e.target).parents("li");
    switch (obj.text()) {
        case '我的信息':
            mainView.router.load({ url: 'account/user.ios.html' });
            break;
        case '反馈信息':
            mainView.router.load({ url: 'setting/feedback.ios.html' });
            break;
        case '软件设置':
            mainView.router.load({ url: 'setting/option.ios.html' });
            break;
        case '功能介绍':
            mainView.router.load({ url: 'setting/help.ios.html' });
            break;
        case '关于讯商':
            mainView.router.load({ url: 'setting/about.ios.html' });
            break;
        case '检查更新':
            check();
            break;
        case '修改密码':
            update();
            break;
        case '退出登录':
            loginOut();
            break;
    }
});

//修改密码
function update() {
    eShop.modal({
        title: '修改密码',
        afterText: '<div class="input-field"><input id="oldPwd" type="password" placeholder="原密码" class="modal-text-input"></div><div class="input-field"><input id="newPwd" type="password" placeholder="新密码" class="modal-text-input"></div><div class="input-field"><input id="newSurePwd" type="password" placeholder="新确认密码" class="modal-text-input"></div>\n',
        buttons: [{
            text: '取消',
            close: true,
        }, {
            text: '修改',
            close: true,
        }],
        onClick: function(modal, index) {
            //修改单据
            if (index == 1) {
                var oldPwd = $$(modal).find("#oldPwd").val() || "";
                var newPwd = $$(modal).find("#newPwd").val() || "";
                var newSurePwd = $$(modal).find("#newSurePwd").val() || "";
                if (!oldPwd | !newPwd | !newSurePwd) {
                    xunSoft.helper.showMessage("输入不能为空！");
                    return;
                }
                if (newPwd !== newSurePwd) {
                    xunSoft.helper.showMessage("新密码两次输入不一致！");
                    return;
                }
                var request = { oldPassword: oldPwd, newPassword: newPwd };
                accountService.put.putPassword(request, {}, function(responseData) {
                    xunSoft.helper.showMessage("密码修改成功");
                });
            }
        }
    });
}

function loginOut() {
    eShop.confirm("您确定退出登录吗？", function() {
        eShop.params.swipePanelOnlyClose = true;
        document.removeEventListener("backbutton", xunSoft.event.backEvent, false);
        xunSoft.user.userId(0);

        //用户登录
        mainView.router.load({
            url: 'account/login.ios.html',
            query: {
                id: 1
            }
        });
    });
}
//检查更新
function check() {
    var request = {
        api_token: "aefbf1368d84a1f12d3252881d59872e",
    }
    checkVersionService.get.getLatestVersion(request, {}, function(responseData) {
        var serverVersion = responseData.versionShort;
        var targetUrl = responseData.direct_install_url;
        if (!window.cordova) {
            xunSoft.helper.showMessage("不在移动端设备使用...");
            return;
        }
        xunSoft.device.getCurrentVersion(function(v) {
            var currentVersion = v;
            var msg = "检测到新版本，是否立即更新?" + "<div style='text-align:left'>更新日志：";
            msg += responseData.changelog.replace(/(\d+\.)/g, "<br>$1") + "</div>";
            if (currentVersion < serverVersion) {
                eShop.confirm(msg, function(fileSystem) {
                    xunSoft.device.file.download(targetUrl);
                });
            } else {
                xunSoft.helper.showMessage("该版本已是最新!");
            }
        });
    });
}