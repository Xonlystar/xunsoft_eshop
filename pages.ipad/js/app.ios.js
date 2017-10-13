var eShop = new Framework7({
	cache: true,
	modalTitle: '提示',
	modalButtonOk: '确定',
	modalButtonCancel: '取消',
	modalPreloaderTitle: '正在玩命加载....',
	scrollTopOnNavbarClick: true,
	smartSelectBackText: '返回',
	smartSelectPopupCloseText: '关闭',
	smartSelectPickerCloseText: '确定',
	
});

var $$ = Dom7;

var leftView = eShop.addView('.view-left', {});
var mainView = eShop.addView('.view-main', {       
    dynamicNavbar: false,
	domCache: true
});
//vue自定义过滤器
Vue.filter( 'dateTime' , function(value) {
        return xunSoft.helper.formatDateTime(value);
 });

var loginView = eShop.addView('#login')

window.onload = function() {
	if(xunSoft.user.companyName() 
		&& xunSoft.user.userName() 
		&& xunSoft.user.userPassword()){
		//自动登录
		var request={
			data:{
				companyName:xunSoft.user.companyName(),
				userName:xunSoft.user.userName(),
				userPassword:xunSoft.user.userPassword
			}
		}
		//用户登录
		accountService.post.postLogin(request,null,function(responseData){
			eShop.closeModal();

			mainView.router.load({
				url:'dashboard.ios.html'
			});
		});

	}else{
    	//用户登录
		loginView.router.load({
			url:'account/login.ios.html'
    	});
	}
}

//首页初始化加载
eShop.onPageInit('main_dashBoard', function(page) {

	var pageDiv = $$(page.container);

	var vm = new Vue({
		el: page.container,
		data: {
			title: xunSoft.user.shopName(),
			userLogo: '../img/user.png',
			request: {
				query: {
					tenantId: xunSoft.user.tenantId(),
					shopId: xunSoft.user.shopId(),
					startTime: "",
					endTime: "",
				}
			},
			response:{
				monthPayMoney:'',
				monthReceiptMoney:'',
				monthReceiveTotal:'',
				monthSaleTotal:'',
				weekReceiptMoney:'',
				weekPayMoney:'',
				weekReceiveTotal:'',
				weekSaleTotal:''
			}
		},
		methods: {
			init: function() {
				this.userLogo = xunSoft.ajax.serviceBase() + "Shop/User/Logo/" + xunSoft.user.tenantId() + "/" + xunSoft.user.userId();
				_.extend(vm.request.query, xunSoft.helper.getFormatDate(2));
				reportService.get.getDefaultReport(vm.request, vm.response);
			}
		}
	});

	vm.init();

});

