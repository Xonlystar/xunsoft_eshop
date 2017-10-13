
//设置模块默认页面
eShop.onPageInit('setting_default',function(page){

	var pageDiv=$$(page.container);

	var vm=new Vue({
		el:page.container,
		data:{
			response:{
				//天气信息
				weather:{
					address:'武汉',
					min:7,
					max:18
				}
			}
		},
		methods:{
			init:function(){
				
			},
			//单击项目
			itemClick:function(url){
				if(url){
					mainView.router.load({
						url:url
					});
				}
			},
			loginOut:function(){
				eShop.confirm("您确定退出登录吗？",function(){
					xunSoft.user.userId(0);
					eShop.loginScreen();
				});
			}
		}
	});

	vm.init();

});