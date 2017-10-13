//收货单列表回调
eShop.onPageInit('purchase_receiveOrder_list',function(page){
    
	var pageDiv=$$(page.container);

	//Vue 视图模型
	var vm=new Vue({
	  el:page.container,
	  data:{
	  	request:{
	  		query:{
	  			status:'',
	  			createTimeFrom:'',
	  			createTimeTo:'',
	  			tenantId:xunSoft.user.tenantId(),
	  			shopId:xunSoft.user.shopId(),
	  			receiveOrderNo:'',
	  			supplierId:'',
	  			sponsorId:'',
	  			auditorId:'',
	  			orderBy:'receiveOrderId desc',
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
	  		//加载数据
	  		this.load();
            
	  		pageDiv.find('.pull-to-refresh-content').on('refresh',function(){
	  			//下拉刷新
	  			eShop.pullToRefreshDone();
	  			vm.refresh();

	  		})

	  	},
	  	//刷新
	  	refresh:function(){
	  		this.response.data=[];
	  		this.response.total=0;
	  		this.request.pageIndex=1;
	  		this.load();
	  	},
	  	load:function(){
	  		//获取数据
	  		purchaseService.get.getReceiveOrderList(vm.request,vm.response);
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
	  	//收货单编辑
	  	update:function(receiveOrder){
	  		mainView.router.load({
	  			url:'purchase/receiveOrder/update.ios.html',
	  			query:{
	  				orderId:receiveOrder.receiveOrderId
	  			}
	  		});
	  	},
	  	//修改单据状态
	  	updateState:function(flag,order){
	  		var request={
	  			data:{
	  				tenantId:xunSoft.user.tenantId(),
	  				entityId:order.receiveOrderId,
	  				flag:flag
	  			}
	  		};

	  		//修改单据的状态
	  		purchaseService.put.putReceiveOrderState(request,{},function(responseData){
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
	  	
	  	//删除收货单
	  	delete:function(receiveOrder){  
		  eShop.confirm('您确定要删除当前收货单吗？', function () {     
		        purchaseService.delete.deleteReceiveOrder({id:receiveOrder.receiveOrderId},{},function(responseData){
		        	vm.response.data.$remove(receiveOrder);
		        	xunSoft.helper.showMessage("单据删除成功！");	
		       });
	      });		
	  	},
	  }
	});	

	vm.init();
});

//查看明细
eShop.onPageInit('purchase_receiveOrder_detail',function(page){
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

				vm.request.id=page.query.receiveOrderId;
				this.load();
				pageDiv.find('.pull-to-refresh-content').on('refresh',function(){
		  			eShop.pullToRefreshDone();
		  			vm.load();
		  		});
			},
			load:function(){
				purchaseService.get.getReceiveOrderDetail(vm.request,vm.response);
			}
		}
	});

	vm.init();

});

//收货单录入回调
eShop.onPageInit('purchase_receiveOrder_add',function(page){
 
    var pageDiv=$$(page.container);

	var vm=new Vue({
		el:page.container,
		data:{
			request:{		
				supplierId:'',
				receiveDate:xunSoft.helper.formatDate(new Date()),
				accountId:'',
				advanceMoney:'',
				receiveStorehouseId:xunSoft.user.shopId(),
				sponsorId:'',
				updatorId:xunSoft.user.userId(),
				sponsorOrganId:xunSoft.user.shopId(),
				creatorId:xunSoft.user.userId(),
				tenantId:xunSoft.user.tenantId(),
				description:'',
				detailList:[]
			},
			response:{
				suppliers:baseInfoService.suppliers,
				users:baseInfoService.users,
				accounts:baseInfoService.accounts
			}
		},
		computed:{
			//总金额
			totalReceiveMoney:function(){
				var total=0;
				_.each(this.request.detailList,function(item){
					total+=(parseFloat(item.receiveMoney) || 0)-(parseFloat(item.taxMoney) || 0);
				});
				return total;
			}
		},
		methods:{
			init:function(){
				
			  	//收货日期
	            var calendarStart = eShop.calendar({
	                  input: pageDiv.find('#receiveDate')[0],                
	            });   
	            this.loadReceive();
	
			},	

			//加载收货订单
			loadReceive:function(){
				if(page.query.receiveOrderId){
					var request={
						id:page.query.receiveOrderId
					};
					//获取收货订单详细信息
					purchaseService.get.getReceiveOrderDetail(request,{},function(responseData){	
						//转换货品信息
						_.extend(vm.request,_.pick(responseData.data,'supplierId','receiveDate'
							,'advanceMoney','sponsorId'));

						if(_.isArray(responseData.data.detailList)){
							_.each(responseData.data.detailList,function(item){
								//转换服务器货品数据模型
								var newKind=kindService.utility.parseOrderKind(item);
								vm.request.detailList.push(newKind);
							});
						}
					});
				}else{
						vm.request.sponsorId=xunSoft.user.userId();
				}
			},
			//采购导入
			import:function(){
				mainView.router.load({
					url:'purchase/receiveOrder/purchaseList.ios.html',
					query:{
						detailList:vm.request.detailList,
                        editPage:'purchase/receiveOrder/add.ios.html'
					}		
				});
			},
			
			//保存
			save:function(){
				
				if(vm.request.supplierId==''){
					xunSoft.helper.showMessage("请选择供应商");
					return;
				}
				 if(vm.request.advanceMoney>0 && vm.request.accountId==0){
                	xunSoft.helper.showMessage('请选择本次收款的结算账户');
                    return;
                }
				if(vm.request.detailList.length==0){
					xunSoft.helper.showMessage("请至少选择一件货品");
					return;
				}
				if(vm.request.sponsorId == "") {
					xunSoft.helper.showMessage('经手人不能为空!');
					return;
				}

				//构造数据请求
				var postRequest={
					data:_.omit(vm.request,'detailList'),
				};
				//重新过滤货品基本信息
				postRequest.data.detailList=_.map(vm.request.detailList,function(item){ return _.omit(item,'kind'); });

				//保存当前单据信息
				purchaseService.post.postReceiveOrder(postRequest,{},function(responseData){
					xunSoft.helper.showMessage("收货订单已经保存成功！");
					vm.request.description='';
					vm.request.advanceMoney=0;
					vm.request.detailList=[];
				});
			},			

			//退出
			back:function(){
				var requestInfo=this.request;

				if(requestInfo.detailList.length>0){
					eShop.confirm('您的收货订单已经发生更改，是否取消?',function(){
						mainView.router.back();
					});
				}else{
					mainView.router.back();
				}
			}
		}	
	});

	vm.init();

});

//编辑收货单回调
eShop.onPageInit('purchase_receiveOrder_update',function(page){
    var pageDiv=$$(page.container);
    var vm=new Vue({
    	el:page.container,
    	data:{
    		request:{
    			receiveDate:'',
    			supplierId:'',
    			advanceMoney:0,
				accountId:0,
				advanceMoney:'',
				sponsorId:'',
				description:'',
				detailList:[],
				//删除货品列表
				deletedIDs:''
    		},
    		response:{
				suppliers:baseInfoService.suppliers,
				users:baseInfoService.users,
				accounts:baseInfoService.accounts
    		}
    	},
    	computed:{
    		//总金额
    		totalReceiveMoney:function(){
    		var total=0;
				_.each(this.request.detailList,function(item){
					total+=(parseFloat(item.receiveMoney) || 0)-(parseFloat(item.taxMoney) || 0);
				});
				return total;
			},
    	},
    	methods:{
    		init:function(){
    		
	    		 //	收货日期
	             eShop.calendar({
	                  input: pageDiv.find('#receicetDate'),
	                         
	               });  

	             if(page.query.orderId){
						purchaseService.get.getReceiveOrderDetail({id:page.query.orderId},{},function(responseData){
							//订单基本信息
							_.extend(vm.request,_.omit(responseData.data,'detailList','deletedIDs'));
							
							//获取货品信息
							_.each(responseData.data.detailList,function(item){
								//过滤货品信息
								var newKind=kindService.utility.parseOrderKind(item);
								newKind.receiveDetailId=item.receiveDetailId;
								vm.request.detailList.push(newKind);
							});
						});
				}      
	    	},
			//删除货品
			delete:function(kind){
				if(!kind.receiveDetailId){
            		return;
            	}
            	if(_.isEmpty(vm.request.deletedIDs)){
            		vm.request.deletedIDs+=kind.receiveDetailId;
            	}else{
            		vm.request.deletedIDs+=(','+kind.receiveDetailId);
            	}
			},
			//采购导入
			import:function(){
				mainView.router.load({
					url:'purchase/receiveOrder/purchaseList.ios.html',
					query:{
						detailList:vm.request.detailList,
                        editPage:'purchase/receiveOrder/add.ios.html'
					}		
				});
			},
			//保存货品
			save:function(){

				if(vm.request.detailList.length==0){
					xunSoft.helper.showMessage("请至少选择一件货品");
					return;
				}
				 if(vm.request.advanceMoney>0 && vm.request.accountId==0){
                	xunSoft.helper.showMessage('请选择本次收款的结算账户');
                    return;
                }
				if(vm.request.sponsorId == "") {
					xunSoft.helper.showMessage('经手人不能为空!');
					return;
				}
				//请求数据
				var requestData={
					data:_.omit(vm.request,'detailList'),
				};
				requestData.data.detailList=_.map(vm.request.detailList,function(item){ return _.omit(item,'kind'); });

				purchaseService.put.putReceiveOrder(requestData,{},function(){
					xunSoft.helper.showMessage('修改收货订单信息成功！');
					mainView.router.back();
				});
			}   	
    	}
	});
	vm.init();
})


//修改商品价格回调
eShop.onPageInit('purchase_receiveOrder_editKindPrice',function(page){

    var pageDiv=$$(page.container);
    var vm=new Vue({
     	el:page.container,
		data:{
			request:{
				salePrice:0,
				receivePrice:0,
				receiveAmount:0,
				receiveMoney:0,
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
				if(vm.request.receivePrice<=0 || vm.request.receivePrice>999999){
					xunSoft.helper.showMessage('请输入合理的单价！');
					return;
				}
             	if(vm.request.receiveAmount<=0 || vm.request.receiveAmount>999999){
             		xunSoft.helper.showMessage("请输入合理的数量!");
             		return;
             	}
				if (!purchaseService.utility.receiptCalculate(vm.request,true)) {
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
				purchaseService.utility.receiptCalculate(requestInfo)
			}
		}
	});

	vm.init();

})

//编辑货品回调
eShop.onPageInit('purchase_receiveOrder_editKind',function(page){

        var pageDiv=$$(page.container);
        var vm=new Vue({
        	el:page.container,
        	data:{
	    		request:{
	    		  kindId:'',
	              colorId:[],
	              sizeId:[],
	              unitId:0,
	              salePrice:0,
	              receivePrice:0,
	              receiveAmount:0,
	              receiveMoney:0,
	              discountRate:100,
	              taxRate:0,
	              taxMoney:0,
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
             init:function(){

                 this.loadKind();
                 this.calculateKind();
            
             },
             //加载货品信息
             loadKind:function(){
             	var request={
             		id:page.query.kindId
             	}
             	//获取商品信息
             	kindService.get.getKindDetail(request,{},function(responseData){
             		//设置货品信息	
					vm.response.kindDetail=responseData.data;

					var kindInfo=kindService.utility.parseKind(responseData.data);

					_.extend(vm.request,kindInfo);
				});
             },
             //保存修改信息
             save:function(){

             	if (vm.request.colorId.length==0) {
             		xunSoft.helper.showMessage("至少选择一种颜色");
             		return;
             	}
             	if (vm.request.sizeId.length==0) {
             		xunSoft.helper.showMessage("至少选择一种尺码");
             		return;
             	}
				if(vm.request.receivePrice<=0 || vm.request.receivePrice>999999){
					xunSoft.helper.showMessage('请输入合理的单价！');
					return;
				}
             	if(vm.request.receiveAmount<=0 || vm.request.receiveAmount>999999){
             		xunSoft.helper.showMessage("请输入合理的数量!");
             		return;
             	}
             	if(!purchaseService.utility.receiptCalculate(vm.request,true)){
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
             calculate:function(){
	             	var requestInfo=this.request;
	             	purchaseService.utility.receiptCalculate(requestInfo);
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

})

//从采购订单录入收货单
eShop.onPageInit('purchase_receiveOrder_purchaselist',function(page){
    var pageDiv=$$(page.container);
    var vm=new Vue({
    	el:page.container,
    	data:{
    		request:{
    			orderNo:'',
    			orderId:'',
    			orderTypeId:0
    		},
    		response:{
	  		    data:[],
	  		    kinds:[]
    		}
    	},
    	methods:{
    		init:function(){
		  		//加载数据
		  		this.loadOrderList();
    		},
    		//选择采购订单号
    		slectOrder:function(item){
    			if(vm.request.orderId!=item.orderId){
    				var selectedItem=_.find(vm.response.data,function(orderData){ return orderData.isActive; });
    				if(selectedItem){
    					selectedItem.isActive=false;
    				}
    				item.isActive=true;    				
    				vm.request.orderId=item.orderId;
    				this.loadOrderDetail();
    			}
    		},
    		//获取单号列表
	    	loadOrderList:function(){
	    		vm.response.data=[];
	    		var request={
	    			query:vm.request
	    		};
	    		//获取数据	
		  		transferService.get.getTransferOrderList(request,{},function(responseData){
		  			if(_.isArray(responseData.data)){
		  				_.each(responseData.data,function(item){
		  					var newOrderData=_.pick(item,'orderId','orderNo','purchaseAmount');	
		  					newOrderData.isActive=false;
		  					newOrderData.userLogo=xunSoft.ajax.serviceBase()
		  							+"Shop/User/OrderUser/0/"+xunSoft.user.userId()+"/"+item.orderId;
		  					vm.response.data.push(newOrderData);

		  				});
		  			}
		  		});
	    	},
	    	//加载采购订单
	    	loadOrderDetail:function(){
	    		vm.response.kinds=[];
	    		var request={
	    			query:vm.request
	    		};
	    		//获取单据信息
	    		transferService.get.getTransferOrderDetail(request,{},function(responseData){
	    			if(_.isArray(responseData.data.detailList)){
	    				_.each(responseData.data.detailList,function(item){
	    					var newKind=_.pick(item,'kindId','colorId','sizeId','unitId','transferId','originQty','transferQty1');
	    					newKind.salePrice=0;
	    					newKind.receivePrice=0;
	    					newKind.receiveAmount=parseInt(item.transferQty2) || 0;
	    					newKind.receiveMoney=0;
	    					newKind.discountRate=100;
	    					newKind.taxRate=0;
	    					newKind.taxMoney=0;
	    					newKind.description="";
	    					newKind.isChecked=true;

	    					//查找货品信息
	    					var kindInfo=_.find(responseData.data.kindList,function(kind){ return kind.kindId==newKind.kindId; });
	    					if(kindInfo){
	    						newKind.salePrice=kindInfo.salePrice;
	    					}

	    					newKind.kind=_.pick(item,'kindId','brandName','kindName','kindNo','colorName','sizeText');
	    					vm.response.kinds.push(newKind);
	    					
	    				});
	    			}

	    		});
	    	},
	    	//保存选择信息
	    	save:function(){
	    		if(_.isArray(page.query.detailList)){
	    			_.each(vm.response.kinds,function(kind){
	    				if(kind.isChecked){
	    					page.query.detailList.push(_.omit(kind,'isChecked'));
	    				}
	    			});
	    		}
	    		mainView.router.back();
	    	},
			//检查输入
			checkInput:function(){

				var requestInfo=this.request;

				if(requestInfo.receivePrice>999999 || requestInfo.receivePrice<0){
					xunSoft.helper.showMessage('请输入合理的收货单价');
					return false;
				}
				if(requestInfo.receiveAmount>999999 || requestInfo.receiveAmount<0){
					xunSoft.helper.showMessage('请输入合理的收货数量');
					return false;
				}
				if(requestInfo.taxRate>100 || requestInfo.taxRate<0){
					xunSoft.helper.showMessage('请输入合理的收货税率');
					return false;
				}

				return true;
			}
    	}
    });
	vm.init();
})

