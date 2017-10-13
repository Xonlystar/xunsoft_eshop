var eShop = new Framework7({
	modalTitle:'提示',
	modalButtonOk:'确定',
	modalButtonCancel:'取消',
	modalPreloaderTitle:'正在玩命加载....',
	scrollTopOnNavbarClick:true,
	smartSelectBackText:'返回',
	smartSelectPopupCloseText:'关闭',
	smartSelectPickerCloseText:'确定',
	
});

var $$ = Dom7;

var leftView = eShop.addView('.view-left',{       
});
var mainView = eShop.addView('.view-main', {       
    dynamicNavbar: false,
    domCache: true
});

window.onload=function(){
    mainView.router.load({
        url:'dashboard.android.html'
    });
    baseInfoService.init();
}

//首页初始化加载
eShop.onPageInit('main_dashBoard',function(page){

	var pageDiv=$$(page.container);

	var vm=new Vue({
		el:page.container,
		data:{
			title:xunSoft.user.shopName(),
			userLogo:'../img/user.png'
		},
		methods:{
			init:function(){
				this.userLogo=xunSoft.ajax.serviceBase()+"Shop/User/Logo/"+xunSoft.user.tenantId()+"/"+xunSoft.user.userId();
			}
		}
	});

	vm.init();

});


