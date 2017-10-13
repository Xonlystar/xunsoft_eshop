var eShop = new Framework7({
	material:false,
	swipeBackPage:false,
	modalTitle:'E售易',
	modalButtonOk:'确定',
	modalButtonCancel:'取消',
	modalPreloaderTitle:'加载中....',
	smartSelectBackText:'返回',
	smartSelectPopupCloseText:'关闭',
	smartSelectPickerCloseText:'确定',
});


//销售
var mainView=eShop.addView('.view-main',{
	domCache:false
});


setTimeout(function(){
	console.log('加载。。。');
	mainView.router.load({
		url:'home.android.html'
	});
},1000)