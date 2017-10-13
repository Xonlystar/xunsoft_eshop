//登录
eShop.onPageInit('account_login',function(page){

	var vm = new Vue({
		el: page.container,
		data: {
			request: {
				data: {
					companyName: 'demo',
					userName: 'admin',
					userPassword:"123456"
				}
			},
			response: {
				data: [],
				total: 0
			}
		},
		methods: {
			login: function() {
				if(_.isEmpty(vm.request.data.companyName)) {
					xunSoft.helper.showMessage("公司名称不能为空!");
					return;
				}
				if(_.isEmpty(vm.request.data.userName)) {
					xunSoft.helper.showMessage("用户名称不能为空!");
					return;
				}
				if(_.isEmpty(vm.request.data.userPassword)) {
					xunSoft.helper.showMessage("密码不能为空!");
					return;
				}
				
				//用户登录
				accountService.post.postLogin(vm.request,null,function(responseData){
					eShop.closeModal();

					mainView.router.load({
						url:'dashboard.ios.html'
					});
				});

			}
		}
	});

});