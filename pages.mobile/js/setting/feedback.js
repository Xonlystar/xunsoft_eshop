//问题提交
eShop.onPageInit('setting_feedback',function(page){
	var pageDiv=$$(page.container);

	var vm=new Vue({
		el:page.container,
		data:{
			request:{
				title:'',
				content:'',
				isSolve:0,
				status:0,
				typeId:0,
				updatorId:xunSoft.user.userId(),
				tenantId:xunSoft.user.tenantId()
			},
			response:{
				data:{}
			}
		},
		methods:{
			init:function(){

			},
			save:function(){
				if (vm.request.title=='') {
					xunSoft.helper.showMessage("请输入标题！");
					return;
				}
				if (vm.request.content=='') {
					xunSoft.helper.showMessage("内容不能为空！");
					return;
				}
				var postRequest={
					data:vm.request
				}
				settingService.post.postSettingFeedback(postRequest,{},function(responseData){
					vm.request.title='';
					vm.request.content='';
					xunSoft.helper.showMessage("反馈提交成功！");
				});
			}
		}
	});
	vm.init();
});

//我的反馈
eShop.onPageInit('setting_feedbackList',function(page){
	var pageDiv=$$(page.container);

	var vm=new Vue({
		el:page.container,
		data:{
			request:{
				query:{
					tenantId:xunSoft.user.tenantId(),
					userId:xunSoft.user.userId,
					orderBy:'a.createTime desc'
				},
				pageIndex:1,
	  			pageSize:xunSoft.user.pageSize()
			},
			response:{
				data:[],
				total:0
			}
		},
		methods:{
			init:function(){
				this.load();
				//下拉刷新
		  		pageDiv.find('.pull-to-refresh-content').on('refresh',function(){
		  			eShop.pullToRefreshDone();
		  			vm.refresh();
		  		})
			},
			refresh:function(){
				vm.response.data=[];
				vm.request.pageIndex=1;
				vm.response.total=0;
				this.load();
			},
			load:function(){
				settingService.get.getSettingFeedbackList(vm.request,vm.response);
			}
		}
	});
	vm.init();
});