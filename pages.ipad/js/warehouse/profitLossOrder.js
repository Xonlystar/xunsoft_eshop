//损益单列表回调
eShop.onPageInit('warehouse_profitLossOrder_list',function(page){
    var pageDiv=$$(page.container);

    var vm=new Vue({
    	el:page.container,
    	data:{
    		request:{
    			query:{
	               	profitLossOrderNo:'',
	           		createTimeFrom:'',
	               	createTimeTo:'',
	               	status:'',
	               	creatorId:'',
	               	sponsorId:'',
	               	auditorId:'',
	                tenantId:xunSoft.user.tenantId(),
	                warehouseId:xunSoft.user.shopId(),
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
    	    	warehouseService.get.getProfitLossList(vm.request,vm.response);
    	    } ,
	        //查询
	        query:function(){
	            mainView.router.load({
	                url:'warehouse/common/filter.ios.html',
	                query:{
	                    para:vm.request.query,
	                    type:0,
	                    callback:vm.refresh
	                }
	            });
	        },
	        //删除益损单
	        delete:function(profitLossOrder){  
	          eShop.confirm('确定删除吗?', function () {     
	                warehouseService.delete.deleteProfitLossOrder({id:profitLossOrder.profitLossOrderId},{},function(responseData){
	                    vm.response.data.$remove(profitLossOrder);
	                    xunSoft.helper.showMessage("单据删除成功！");  
	               });
	          });       
	        },  
	        //修改单据状态
		  	updateState:function(flag,order){
		  		var request={
		  			data:{
		  				tenantId:xunSoft.user.tenantId(),
		  				entityId:order.profitLossOrderId,
		  				flag:flag
		  			}
		  		};
		  		
		  		//修改单据的状态
		  		warehouseService.put.putProfitLossOrderState(request,{},function(responseData){
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
	        //收货单编辑
	        update:function(profitLossOrder){
	            mainView.router.load({
	                url:'warehouse/profitLossOrder/update.ios.html',
	                query:{
	                    orderId:profitLossOrder.profitLossOrderId
	                }
	            });
	        }
        }
    });
        vm.init();
});

eShop.onPageInit('warehouse_profitLossOrder_detail',function(page){
    var pageDiv=$$(page.container);
    var vm=new Vue({
    	el:page.container,
    	data:{
    		request:{
               	id:0
    		},
    		response:{
    			data:[]
    		}
    	},
    	methods:{
    		init:function(){
    			//获取明细Id
    			vm.request.id=page.query.profitLossOrderId;

    			this.load();
    			  //下拉刷新
                pageDiv.find('.pull-to-refresh-content').on('refresh',function(){
                    eShop.pullToRefreshDone();
                    vm.load();
                 });
    	    },
    	    load:function(){
    	    	warehouseService.get.getProfitLossOrderDetail(vm.request,vm.response);
    	    }

        }
    });
        vm.init();
});

//损益单录入回调
eShop.onPageInit('warehouse_profitLossOrder_add',function(page){
    var pageDiv=$$(page.container);
    var vm=new Vue({
    	el:page.container,
    	data:{
    		request:{
    			profitLossOrderNo:'',
    			sourceOrderNo:'',
    			profitLossDate:xunSoft.helper.formatDate(new Date()),
    			SponsorOrganId:xunSoft.user.shopId(),
    			sponsorId:'',
    			creatorId:xunSoft.user.userId(),
    			tenantId:xunSoft.user.tenantId(),
    			warehouseId:xunSoft.user.shopId(),
    			description:'',
    			detailList:[]
    		},
    		response:{
    			users:baseInfoService.users,

    		}
    	},
    	methods:{
    		init:function(){
    			 //益损日期
	             var profitLossDate = eShop.calendar({
	                  input: pageDiv.find('#profitLossDate')[0],                
               }); 
	             this.loadProfitLoss();
    		},
    		loadProfitLoss:function(){
    			if(page.query.profitLossOrderId){
					var request={
						id:page.query.profitLossOrderId
					};
					//获取益损单详细信息
					warehouseService.get.getProfitLossOrderDetail(request,{},function(responseData){
						//订单基本信息
						_.extend(vm.request,_.omit(responseData.data,'deletedIDs','detailList'));
						
						//获取货品信息
						_.each(responseData.data.detailList,function(item){
							//过滤货品信息
							var newKind=kindService.utility.parseOrderKind(item);
							vm.request.detailList.push(newKind);
						});
					});
				}else{
					vm.request.sponsorId=xunSoft.user.userId();
				}

    		},
			//保存
			save:function(){	
				if (vm.request.sourceOrderNo=='') {
					xunSoft.helper.showMessage("请输入原始单号");
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
				warehouseService.post.postProfitLossOrder(postRequest,{},function(responseData){
					xunSoft.helper.showMessage("收货订单已经保存成功！");
					vm.request.description='';
					vm.request.sourceOrderNo='';
					vm.request.detailList=[];
				});
			},
			

			//退出
			back:function(){
				var requestInfo=this.request;

				if(requestInfo.detailList.length>0){
					eShop.confirm('您的损益单已经发生更改，是否取消?',function(){
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

//编辑益损单回调
eShop.onPageInit('warehouse_profitLossOrder_update',function(page){
    var pageDiv=$$(page.container);
    var vm=new Vue({
		el:page.container,
    	data:{
    		request:{
    			profitLossDate:'',
    			sponsorId:'',
				sourceOrderNo:'',
				profitLossOrderNo:'',
				description:'',
				detailList:[],
				//删除货品列表
				deletedIDs:'0'
    		},
    		response:{
				users:baseInfoService.users,
			}
    	},
    	computed:{
			//总金额
			totalprofitLossMoney:function(){
				var total=0;
				_.each(this.request.detailList,function(item){
					total+=parseFloat(item.profitLossMoney);
				});
				return total;
			},
			totalProfitLossAmount:function(){
				var total=0;
				_.each(this.request.detailList,function(item){
					total+=parseFloat(item.profitLossAmount);
				});
				return total;
			}
		},
		methods:{
    		init:function(){
	    		 //益损日期
	             var profitLossDate = eShop.calendar({
	                  input: pageDiv.find('#profitLossDate')[0],                
	             }); 
	             if(page.query.orderId){
						warehouseService.get.getProfitLossOrderDetail({id:page.query.orderId},{},function(responseData){
							//订单基本信息
							_.extend(vm.request,_.omit(responseData.data,'deletedIDs','detailList'));
							
							//获取货品信息
							_.each(responseData.data.detailList,function(item){
								//过滤货品信息
								var newKind=kindService.utility.parseOrderKind(item);
								newKind.profitLossDetailId=item.profitLossDetailId;
								
								vm.request.detailList.push(newKind);
							});
						});
				}      
    		},
			//删除货品
			delete:function(kind){
				if(kind.profitLossDetailId){
	            		vm.request.deletedIDs+=(','+kind.profitLossDetailId);
	            }
			},
			//保存货品
			save:function(){

				if(vm.request.detailList.length==0){
					xunSoft.helper.showMessage("请至少选择一件货品");
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
				warehouseService.put.putProfitLossOrder(requestData,{},function(){
					xunSoft.helper.showMessage('修改益损单信息成功！');
					mainView.router.back();
				});
			}   	
		}
    });
	vm.init();
})


//修改商品价格回调
eShop.onPageInit('warehouse_profitLossOrder_editKindPrice',function(page){
	     var pageDiv=$$(page.container);
	     var vm=new Vue({el:page.container,
			data:{
				request:{
					profitLossAmount:1,
					profitLossMoney:0,
					retailPrice:0,
					description:'',
				}
			},
			//检测参数改变
			watch:{
				'request.profitLossAmount':function(val,oldval){
					var newVal=parseInt(val) || 0;
					if(newVal<=0 || newVal>999999){
						return;
					}
					this.request.profitLossMoney=this.request.retailPrice*
					this.request.profitLossAmount;
				}
			},
			methods:{
				init:function(){
					if(page.query.kind){
						_.extend(vm.request,page.query.kind);
					}
				},

				//保存修改
				save:function(){
				if(vm.request.profitLossAmount<=0 || vm.request.profitLossAmount>999999){
             		xunSoft.helper.showMessage("请输入合理的数量!");
             		return;
             	}
					if(page.query.kind){
						_.extend(page.query.kind,vm.request);
					}
					mainView.router.back();
				},			
			}
		});

		vm.init();

})

//编辑货品回调
eShop.onPageInit('warehouse_profitLossOrder_editKind',function(page){

        var pageDiv=$$(page.container);
        var vm=new Vue({
        	el:page.container,
        	data:{
	    		request:{
	    		  kindId:'', 
	              colorId:'',
	              sizeId:'',
	              unitId:0,
	              profitLossAmount:0,
	              profitLossMoney:0,
				  description:'',
				  kind:null,
				  inventory:'',
				  retailPrice:0
	    		},
	    		response:{
	    			kindDetail:{
	    				kindId:0
	    			},
	    			selectedKind:[]
	    		}
        	},
        	//检测参数变化
        	watch:{
				'request.profitLossAmount':function(val,oldval){
					var newVal=parseInt(val) || 0;
					if(newVal<=0 || newVal>999999){
						return;
					}
					vm.calculate();
				},
				'request.colorId':function(val,oldval){
					if (this.request.sizeId!='') {
						this.loadWarehouseCount();
					}
				},
				'request.sizeId':function(val,oldval){
					if (this.request.colorId!='') {
						this.loadWarehouseCount();
					}
				},
        	},
        	methods:{
             init:function(){

                 this.loadKind();  
               
             },
             //获取货品颜色，尺码的库存数量
             loadWarehouseCount:function(){
             	var requestqty={ 
             		kindId:page.query.kindId,
             		colorId:vm.request.colorId,
             		sizeId:vm.request.sizeId
             	};
             	//获取商品库存信息
             	warehouseService.get.getShopWarehouseSum(requestqty,{},function(responseDataqty){
             		vm.request.inventory=responseDataqty.data;
             	});
             	if(_.isArray(page.query.detailList)){
					vm.response.selectedKind=[];
					_.each(page.query.detailList,function(item){
						if(item.kindId==vm.request.kindId&&item.colorId==vm.request.colorId
							&&item.sizeId==vm.request.sizeId){
							vm.request.profitLossAmount=item.profitLossAmount;
							vm.request.description=item.description;
							vm.request.retailPrice=item.retailPrice;
							vm.request.profitLossMoney=item.profitLossMoney;
						}else{
							vm.request.profitLossAmount=0;
							vm.request.description='';
							vm.request.retailPrice=0;
							vm.request.profitLossMoney=0;
						}

					});
				}
             },
             //加载货品信息
             loadKind:function(){
             	var request={
             		id:page.query.kindId
             	};
             	
             	//获取商品信息
             	kindService.get.getKindDetail(request,{},function(responseData){
             		//设置货品信息	
					vm.response.kindDetail=responseData.data;
					var kindInfo=kindService.utility.parseKind(responseData.data);
					vm.request.kind=_.pick(responseData.data,'kindId','accountAmount','checkAmount','profitLossAmount','detailList',
						'kindName','colorName','sizeText','kindClassName','kindNo','brandName','unitName');
					vm.request.kindId=responseData.data.kindId;
					vm.request.unitId=responseData.data.unitId;
					//获取成本价
					var costPrice=_.find(responseData.data.priceList,function(item){ return item.itemKey=="purchase-cost";}); 
					if(costPrice){
						vm.request.retailPrice=costPrice.value;
					}
				});
             },
             //保存修改信息
             save:function(){

             	if (vm.request.colorId=="") {
             		xunSoft.helper.showMessage("至少选择一种颜色");
             		return;
             	}
             	if (vm.request.sizeId=="") {
             		xunSoft.helper.showMessage("至少选择一种尺码");
             		return;
             	}
             	if(vm.request.profitLossAmount<=0 || vm.request.profitLossAmount>999999){
             		xunSoft.helper.showMessage("请输入合理的数量!");
             		return;
             	}
             	
             	//复制货品信息
             	var newKind=_.clone(vm.request);
             	//获取颜色尺码
             	var sizeInfo=_.find(this.response.kindDetail.sizeList,function(item){
             		return item.sizeId==newKind.sizeId;
             	});
             	if(sizeInfo){
             		newKind.kind.sizeText=sizeInfo.sizeText;            		
             	}
             	var colorInfo=_.find(this.response.kindDetail.colorList,function(item){
             		return item.colorId==newKind.colorId;
             	});
             	if(colorInfo){
             		newKind.kind.colorName=colorInfo.colorName;
             	}

             	//如果货品列表不为空
             	if(page.query.detailList){
             	    //遍历货品列表根据sizeId、colorId、kindId	查找是否有相同货品
             	    var kindInfo=_.find(page.query.detailList,function(item){
             	   	  return (item.kindId==newKind.kindId)&&(item.sizeId==newKind.sizeId)&&(item.colorId==newKind.colorId);
             		});
             		//找到相同货品用新的货品替换原有值。
             		if (kindInfo) {
             			kindInfo.profitLossAmount=newKind.profitLossAmount;
             			kindInfo.profitLossMoney=newKind.profitLossMoney;
             			kindInfo.description=newKind.description;
             		}else{
             			page.query.detailList.push(newKind);
             		}
             		vm.request.sizeId='';
             		vm.request.colorId='';
             		vm.request.profitLossAmount=0;
             		vm.request.profitLossMoney=0;
             		vm.request.description='';
             		xunSoft.helper.showMessage("添加货品成功");
             
             	}
             	
             },
             calculate:function(){
             		var requestInfo=this.request;
             		requestInfo.profitLossMoney=requestInfo.retailPrice*
					requestInfo.profitLossAmount;
             }
          }
        });
    vm.init();

})
