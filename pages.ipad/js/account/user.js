//我的信息
eShop.onPageInit('account_user', function(page) {
	var pageDiv = $$(page.container);
	var vm = new Vue({
		el: page.container,
		data: {
			request: {
				query: {
					tenantId: xunSoft.user.tenantId(),
					userId: xunSoft.user.userId()
				}
			},
			response: {
				data: {},
			}
		},
		methods: {
			//初始化数据
			init: function() {
				this.load();
			},
			//加载数据
			load: function() {
				accountService.get.getInfo(vm.request,vm.response);
			},
			//弹出pop框
			showPop: function() {
				var buttons = [{
						text: '相机',
						onClick: function() {
							xunSoft.device.photo.takePhoto(function(imgUrl) {
								console.log(imgUrl);
                                xunSoft.device.file.upload(imgUrl,'Shop/User/Upload',function(){
                                	xunSoft.helper.showMessage('头像上传成功');
                                });
							});
						}
					},
					{
						text: '相册',
						onClick: function() {
							xunSoft.device.photo.getPhoto(function(imgUrl) {
								console.log(imgUrl);
								xunSoft.device.file.upload(imgUrl,'Shop/User/Upload',function(){
									xunSoft.helper.showMessage('头像上传成功');
								});
							});
						}
					},
					{
						text: '取消',
						color: 'red'
					},
				];
				eShop.actions(buttons);

			},
			//修改密码
			update: function() {
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
						if(index == 1) {
							var oldPwd = $$(modal).find("#oldPwd").val() || "";
							var newPwd = $$(modal).find("#newPwd").val() || "";
							var newSurePwd=$$(modal).find("#newSurePwd").val() || "";
							if(!oldPwd|!newPwd|!newSurePwd){
								xunSoft.helper.showMessage("输入不能为空！");
								return ;
							}
							if(newPwd!==newSurePwd){
								xunSoft.helper.showMessage("新密码两次输入不一致！");
								return ;
							}
							var request={oldPassword:oldPwd,newPassword:newPwd};
							accountService.put.putPassword(request,{},function(responseData){
								xunSoft.helper.showMessage("密码修改成功");
							});
						}
					}
				});
			}
		},
	});
	vm.init();
});