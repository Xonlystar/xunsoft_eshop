//采购订单列表回调
eShop.onPageInit('purchase_purchaseOrder_list',function(page){

	var pageDiv=$$(page.container);

	//Vue 视图模型
	var vm=new Vue({
	  el:page.container,
	  data:{
	  	request:{
	  		query:{
	  			purchaseOrderNo:'',
	  			supplierId:'0',
	  			status:'',
	  			createTimeFrom:'',
	  			createTimeTo:'',
	  			creatorId:'',
	  			sponsorId:'',
	  			auditorId:'',
	  			tenantId:xunSoft.user.tenantId(),
	  			shopId:xunSoft.user.shopId(),
	  			orderBy:'createTime desc',
	  		},
	  		pageIndex:1,
	  		pageSize:xunSoft.user.pageSize()
	  	},
	  	response:{
	  		total:0,
	  		data:[]
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
	  	//重新加载
	  	refresh:function(){
	  		this.response.data=[];
	  		this.response.total=0;
	  		this.request.pageIndex=1;
	  		this.load();
	  	},
	  	//继续加载
	  	load:function(){
	  		//获取数据
	  		purchaseService.get.getPurchaseOrderList(vm.request,vm.response);
	  	},
	  	//查询
	  	query:function(){
	  		mainView.router.load({
	  			url:'purchase/common/filter.ios.html',
	  			query:{
	  				para:vm.request.query,
	  				callback:vm.refresh
	  			}
	  		});
	  	},
	  	//采购订单编辑
	  	update:function(purchaseOrder){
	  		mainView.router.load({
	  			url:'purchase/purchaseOrder/update.ios.html',
	  			query:{
	  				orderId:purchaseOrder.purchaseOrderId
	  			}
	  		});
	  	},
	  	//修改单据状态
	  	updateState:function(flag,order){
	  		var request={
	  			data:{
	  				tenantId:xunSoft.user.tenantId(),
	  				entityId:order.purchaseOrderId,
	  				flag:flag
	  			}
	  		};

	  		//修改单据的状态
	  		purchaseService.put.putPurchaseOrderState(request,{},function(responseData){
	  			xunSoft.helper.showMessage('单据操作成功');
	  			if(responseData.data.submitTime){
	  				order.flag='T';
	  			}
	  			if(responseData.data.auditTime){
	  				order.flag='S';
	  			}
	  			if(flag=='2'){
	  				order.flag='L';
	  			}
	  			if(flag=='4'){
	  				order.flag='T';
	  			}
	  		});

	  	},	  	
	  	//删除单据
	  	delete:function(purchaseOrder){
	  		eShop.confirm('您确定要删除当前采购订单吗？',function(){
	  			purchaseService.delete.deletePurchaseOrder({ id:purchaseOrder.purchaseOrderId },{},function(responseData){
		  			vm.response.data.$remove(purchaseOrder);
		  			xunSoft.helper.showMessage('单据删除成功');
		  		});
	  		});
	  	}
	  }
	});	

	vm.init();
});


//查看明细
eShop.onPageInit('purchase_purchaseOrder_detail',function(page){
	var pageDiv=$$(page.container);

	var vm=new Vue({
		el:page.container,
		data:{
			request:{
				id:0
			},
			response:{
				data:{}
			}
		},
		methods:{
			init:function(){

				vm.request.id=page.query.orderId;
				this.load();
				pageDiv.find('.pull-to-refresh-content').on('refresh',function(){
		  			eShop.pullToRefreshDone();
		  			vm.load();
		  		});
			},
			load:function(){
				purchaseService.get.getPurchaseOrderDetail(vm.request,vm.response);
			}
		}
	});

	vm.init();

});

//采购订单录入回调
eShop.onPageInit('purchase_purchaseOrder_add',function(page){

	var pageDiv=$$(page.container);

	var vm=new Vue({
		el:page.container,
		data:{
			request:{
				supplierId:'',
				placeDate:xunSoft.helper.formatDate(new Date()),
				deliverDate:xunSoft.helper.formatDate(new Date()),
				receiveStorehouseId:xunSoft.user.shopId(),
				advanceMoney:0,
				sponsorId:0,
				sponsorOrganId:xunSoft.user.shopId(),
				sponsorShopId:xunSoft.user.shopId(),
				tenantId:xunSoft.user.tenantId(),
				creatorId:xunSoft.user.userId(),
				updatorId:xunSoft.user.userId(),
				description:'',
				detailList:[]
			},
			response:{
				suppliers:baseInfoService.suppliers,
				users:baseInfoService.users
			}
		},
		computed:{
			//总金额
			totalPurchaseMoney:function(){
				var total=0;
				_.each(this.request.detailList,function(item){
					total+=(parseFloat(item.purchaseMoney) || 0)-(parseFloat(item.taxMoney) || 0);
				});
				return total;
			}
		},
		methods:{
			init:function(){				

				eShop.calendar({
					input:pageDiv.find("#placeDate"),
					maxDate:new Date()
				});
				eShop.calendar({
					input:pageDiv.find("#deliverDate"),
					minDate:new Date()
				});
				this.loadPurchase();
			},

			//加载采购订单
			loadPurchase:function(){
				if(page.query.purchaseOrderId){
					var request={
						id:page.query.purchaseOrderId
					};
					//获取采购订单详细信息
					purchaseService.get.getPurchaseOrderDetail(request,{},function(responseData){
						
						//转换货品信息
						_.extend(vm.request,_.pick(responseData.data,'supplierId','placeDate','deliverDate'
							,'advanceMoney','sponsorId','description'));

						if(_.isArray(responseData.data.detailList)){
							_.each(responseData.data.detailList,function(item){
								//转换服务器货品数据模型
								vm.request.detailList.push(kindService.utility.parseOrderKind(item));
							});
						}
					});
				}else{					
					vm.request.sponsorId=xunSoft.user.userId();
				}
			},
		
			//退出
			back:function(){
				var requestInfo=this.request;
				if(requestInfo.detailList.length>0){
					eShop.confirm('您的采购订单已经发生更改，是否取消?',function(){
						mainView.router.back();
					});
				}else{
					mainView.router.back();
				}
			},
			//保存采购订单
			save:function(){

				if(vm.request.supplierId==''){
					xunSoft.helper.showMessage("请选择供应商");
					return;
				}
				if(vm.request.detailList.length==0){
					xunSoft.helper.showMessage("请至少选择一件货品");
					return;
				}
				if(vm.request.sponsorId == "") {
					xunSoft.helper.showMessage('采购人不能为空!');
					return;
				}

				//构造数据请求
				var postRequest={
					data:_.omit(vm.request,'detailList'),
				};
				//重新过滤货品基本信息
				postRequest.data.detailList=_.map(vm.request.detailList,function(item){ return _.omit(item,'kind'); });
				//保存当前单据信息
				purchaseService.post.postPurchaseOrder(postRequest,{},function(responseData){
					xunSoft.helper.showMessage("采购订单已经保存成功！");

					//清空基本信息
					vm.request.description='';
					vm.request.advanceMoney=0;
					vm.request.detailList=[];					
				});

				console.log(vm.request);
			}
		}
	});

	vm.init();
});

//采购订单修改
eShop.onPageInit('purchase_purchaseOrder_update',function(page){

	var pageDiv=$$(page.container);

	var vm=new Vue({
		el:page.container,
		data:{
			request:{
				purchaseOrderNo:'',
				purchaseOrderId:0,
				supplierId:'',
				placeDate:'',
				deliverDate:'',
				advanceMoney:0,
				sponsorId:'',
				description:'',
				detailList:[],
				//删除货品列表
				deletedIDs:''
			},
			response:{
				suppliers:baseInfoService.suppliers,
				users:baseInfoService.users
			}
		},
		computed:{
			//总金额
			totalPurchaseMoney:function(){
				var total=0;
				_.each(this.request.detailList,function(item){
					total+=(parseFloat(item.purchaseMoney) || 0)-(parseFloat(item.taxMoney) || 0);
				});
				return total;
			}
		},
		methods:{
			init:function(){

				//创建日历
				eShop.calendar({
					input:pageDiv.find("#placeDate"),
					maxDate:new Date()
				});
				eShop.calendar({
					input:pageDiv.find("#deliverDate"),
					minDate:new Date()
				});

				if(page.query.orderId){
					purchaseService.get.getPurchaseOrderDetail({id:page.query.orderId},{},function(responseData){
						//订单基本信息
						_.extend(vm.request,_.omit(responseData.data,'detailList','deletedIDs'));

						//获取货品信息
						_.each(responseData.data.detailList,function(item){
							//过滤货品信息
							var newKind=kindService.utility.parseOrderKind(item);
							newKind.purchaseDetailId=item.purchaseDetailId;

							vm.request.detailList.push(newKind);
						});
					});
				}
			},
			  //删除货品
            delete:function(kind){
            	
            	if(!kind.purchaseDetailId){
            		return;
            	}
            	if(_.isEmpty(vm.request.deletedIDs)){
            		
            		vm.request.deletedIDs+=kind.purchaseDetailId;
            	}else{
            		vm.request.deletedIDs+=(','+kind.purchaseDetailId);
            	}
            },   
			//金额排序
			sortMoneyKind:function(event){
				if(vm.request.detailList.length>1){
					var order=$$(event.currentTarget).attr('data-order');
					//检查排序方式
					if(order=="asc"){
						//asc 从小到大
						vm.request.detailList=_.sortBy(vm.request.detailList,
							function(item){ return (item.purchaseMoney-item.taxMoney); });
						$$(event.currentTarget).attr('data-order',"desc");
					}else{
						//desc 从大到小
						var orderBy=_.sortBy(vm.request.detailList,function(item){ return (item.purchaseMoney-item.taxMoney); });
						vm.request.detailList=orderBy.reverse();
						$$(event.currentTarget).attr('data-order',"asc");
					}
				}
			},
			//保存货品
			save:function(){

				if(vm.request.supplierId==''){
					xunSoft.helper.showMessage("请选择供应商");
					return;
				}
				if(vm.request.detailList.length==0){
					xunSoft.helper.showMessage("请至少选择一件货品");
					return;
				}
				if(vm.request.sponsorId == "") {
					xunSoft.helper.showMessage('采购人不能为空!');
					return;
				}
				//请求数据
				var requestData={
					data:_.omit(vm.request,'detailList'),
				};
				requestData.data.detailList=_.map(vm.request.detailList,function(item){ return _.omit(item,'kind'); });

				purchaseService.put.putPurchaseOrder(requestData,{},function(){
					xunSoft.helper.showMessage('修改采购订单信息成功！');
					mainView.router.back();
				});
			}
		}
	});

	vm.init();
});

//修改商品价格信息
eShop.onPageInit('purchase_purchaseOrder_editKindPrice',function(page){
	var pageDiv=$$(page.container);

	var vm=new Vue({
		el:page.container,
		data:{
			request:{
				salePrice:0,
				purchasePrice:0,
				purchaseAmount:0,
				purchaseMoney:0,
				discountRate:100,
				taxRate:0,
				taxMoney:0,
				deliverDate:'',
				description:'',
			}
		},
		methods:{
			init:function(){
				if(page.query.kind){
					_.extend(vm.request,page.query.kind);
				}

				eShop.calendar({
					input:pageDiv.find("#deliverDate"),
					minDate:new Date()
				});

			},

			//保存修改
			save:function(){
                if(vm.request.purchasePrice<=0 || vm.request.purchasePrice>999999){
					xunSoft.helper.showMessage('请输入合理的采购价！');
					return;
				}
				if(vm.request.purchaseAmount<=0 || vm.request.purchaseAmount>999999){
             		xunSoft.helper.showMessage("请输入合理的数量!");
             		return;
             	}
				if(!purchaseService.utility.purchaseCalculate(vm.request,true)){
					return;
				}

				if(page.query.kind){
					_.extend(page.query.kind,vm.request);
				}
				mainView.router.back();
			},

			//计算价格信息
			calculate:function(){
				var requestInfo=this.request;
				purchaseService.utility.purchaseCalculate(requestInfo);
				}
				}
	});

	vm.init();
});

//采购订单编辑商品信息
eShop.onPageInit('purchase_purchaseOrder_editKind',function(page){

	var pageDiv=$$(page.container);

	var vm=new Vue({
		el:page.container,
		data:{
			request:{
				kindId:'',
				colorId:[],
				sizeId:[],
				salePrice:0,
				unitId:0,				
				purchasePrice:0,
				purchaseAmount:0,
				purchaseMoney:0,
				discountRate:100,
				taxRate:0,
				taxMoney:0,
				deliverDate:'',
				description:'',
				kind:null
			},
			response:{
				kindDetail:{
					kindId:0
				},
				selectedKind:[]
			}
		},
		methods:{
			//初始化
			init:function(){
				this.loadKind();

				eShop.calendar({
					input:pageDiv.find("#deliverDate"),
					minDate:new Date()
				});
				this.calculateKind();

			},

			//获取货品信息
			loadKind:function(){
				//请求数据
				var request={
					id:page.query.kindId
				}
				//获取商品信息
				kindService.get.getKindDetail(request,{},function(responseData){
					//设置货品信息
					vm.response.kindDetail=responseData.data;

					var kind=kindService.utility.parseKind(responseData.data);
					_.extend(vm.request,kind);

					//获取预设的采购价
					var purchasePrice=_.find(responseData.data.priceList,function(item){ return item.itemKey=="purchase-price"; });
					if(purchasePrice){
						vm.request.purchasePrice=purchasePrice.value;
					}
				});
			},

			//保存当前的选择信息
			save:function(){
				//检查基本信息
				if(vm.request.colorId.length==0){
					xunSoft.helper.showMessage('请至少选择一种颜色！');
					return;
				}
				if(vm.request.sizeId.length==0){
					xunSoft.helper.showMessage('请至少选择一种尺码！');
					return;
				}
				if(vm.request.purchasePrice<=0 || vm.request.purchasePrice>999999){
					xunSoft.helper.showMessage('请输入合理的采购价！');
					return;
				}
				if(vm.request.purchaseAmount<=0 || vm.request.purchaseAmount>999999){
             		xunSoft.helper.showMessage("请输入合理的数量!");
             		return;
             	}

				//检查输入数据是否合理
				if(!purchaseService.utility.purchaseCalculate(vm.request,true)){
					return;
				}

				//用户选择的颜色尺码组合
				var newKinds=[];

				//遍历颜色
				_.each(vm.request.colorId,function(colorId){

					var colorInfo=_.find(vm.response.kindDetail.colorList,function(item){ return item.colorId==colorId; });

					//遍历尺码
					_.each(vm.request.sizeId,function(sizeId){

						var sizeInfo=_.find(vm.response.kindDetail.sizeList,function(item){return item.sizeId==sizeId; });

						//获取新的货品信息
						var newKind=_.omit(vm.request,'colorId','sizeId','kind');
						newKind.sizeId=sizeId;
						newKind.colorId=colorId;
						newKind.kind=_.clone(vm.request.kind);
						newKind.kind.colorName=colorInfo.colorName;
						newKind.kind.sizeText=sizeInfo.sizeText;
						newKinds.push(newKind);
					})

				});

				if(page.query.detailList){
					//添加新的货品信息
					_.each(newKinds,function(newKind){
						//检查货品是否已经存在
						var kindInfo=_.find(page.query.detailList,function(item){ return item.kindId==newKind.kindId 
																		&& item.sizeId==newKind.sizeId 
																		&& item.colorId==newKind.colorId;});
						if(!kindInfo){
							//追加货品信息
							page.query.detailList.push(newKind);
						}else{
							//更新已有的货品信息
							_.extend(kindInfo,newKind);
						}
					});	
					vm.request.sizeId=[];
					vm.request.colorId=[];
					xunSoft.helper.showMessage("货品信息处理成功!");
					this.calculateKind();	
				}else{
					xunSoft.helper.showMessage("无法添加货品信息",'警告');
					mainView.router.back();
				}
			},

			//计算价格信息
			calculate:function(){
				var requestInfo=this.request;
				purchaseService.utility.purchaseCalculate(requestInfo);
			},

			//计算已经选择的货品信息
			calculateKind:function(){
				if(_.isArray(page.query.detailList)){
					vm.response.selectedKind=[];
					_.each(page.query.detailList,function(item){
						console.log(item);
						if(item.kindId==page.query.kindId){
							vm.response.selectedKind.push(item);
						}
					});
				}
			}
		}
	});

	vm.init();

});