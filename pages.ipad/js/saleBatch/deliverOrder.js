//出货单列表回调
eShop.onPageInit('saleBatch_deliverOrder_list',function(page){
    var pageDiv=$$(page.container);

	var vm=new Vue({
    	el:page.container,
    	data:{
    		request:{
    			query:{
    				deliverOrderNo:'',
    				customerId:'',
    				status:'',
		  			createTimeFrom:'',
		  			createTimeTo:'',
		  			creatorId:'',
		  			sponsorId:'',
		  			auditorId:'',
		  			tenantId:xunSoft.user.tenantId(),
		  			shopId:xunSoft.user.shopId(),
		  			orderBy:'deliverOrderId desc',
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
                });
    		},
    		load:function(){
    			saleService.get.getDeliverOrderList(vm.request,vm.response);
    		},
            refresh:function(){
                this.request.pageIndex=1;
                this.response.total=0;
                this.response.data=[];
                this.load();
            },
            //查询
            query:function(){
                mainView.router.load({
                    url:'saleBatch/common/filter.ios.html',
                    query:{
                        para:vm.request.query,
                        callback:vm.refresh
                    }
                });
            },
            //更新
            update:function(deliverOrder){
                mainView.router.load({
                    url:'saleBatch/deliverOrder/update.ios.html',
                    query:{
                        orderId:deliverOrder.deliverOrderId
                    }
                });
            },
            //更新状态
            updateState:function(flag,order){
                var request={
                    data:{
                        tenantId:xunSoft.user.tenantId(),
                        entityId:order.deliverOrderId,
                        flag:flag
                    }
                };

                //修改单据的状态
                saleService.put.putDeliverUpdateState(request,{},function(responseData){
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
            //删除
            delete:function(deliverOrder){
                var request={
                    id:deliverOrder.deliverOrderId
                };
                eShop.confirm('您确定要删除选中的出货单据吗？',function(){
                    saleService.delete.deleteDeliverOrder(request,{},function(responseData){
                       vm.response.data.$remove(deliverOrder);
                       xunSoft.helper.showMessage('单据删除成功');
                    });
                });
            }
    	}
    });

    vm.init();
});

//出货单录入详情
eShop.onPageInit('saleBatch_deliverOrder_detail',function(page){
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
                pageDiv.find('.pull-to-refresh-content').on('refresh',function(){
                    eShop.pullToRefreshDone();
                    vm.load();
                });
                this.load();
            },
            load:function(){
                saleService.get.getDeliverOrderDetail(vm.request,vm.response);
            }
        }
    });
    
    vm.init();
});

//出货单录入回调
eShop.onPageInit('saleBatch_deliverOrder_add',function(page){
    
    var pageDiv=$$(page.container);

    var vm=new Vue({
        el:page.container,
        data:{
            request:{
                customerId:0,
                deliverDate:xunSoft.helper.formatDate(new Date()),
                sponsorId:0,
                sponsorOrganId:xunSoft.user.shopId(),
                sponsorShopId:xunSoft.user.shopId(),
                deliverWarehouseId:xunSoft.user.shopId(),
                accountId:0,
                advanceMoney:0,
                creatorId:xunSoft.user.userId(),
                updatorId:xunSoft.user.userId(),
                description:'',
                tenantId:xunSoft.user.tenantId(),
                detailList:[]
            },
            response:{
                customers:baseInfoService.customers,
                users:baseInfoService.users,
                accounts:baseInfoService.accounts
            }
        },
        methods:{
            init:function(){
                eShop.calendar({
                    input:pageDiv.find("#deliverDate"),
                    minDate:new Date()
                });
                this.loadDeliverOrder();
            },
            loadDeliverOrder:function(){
                if(page.query.orderId){
                    var request={
                        id:page.query.orderId
                    };
                    saleService.get.getDeliverOrderDetail(request,{},function(responseData){
                        //扩展数据
                        _.extendOwn(vm.request,_.pick(responseData.data,'customerId','deliverDate'
                            ,'sponsorId','accountId','advanceMoney'));

                        //获取货品明细
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
            //回退
            back:function(){
                if(vm.request.detailList.length>0){
                    eShop.confirm('单据已经有货品信息了,您确认退出吗？',function(){
                        mainView.router.back();
                    });
                }else{
                    mainView.router.back();
                }
            },         
            //扫描货品
            scanKind:function(){

            },
            //保存
            save:function(){

                if(vm.request.customerId==0){
                    xunSoft.helper.showMessage('请选择客户信息');
                    return;
                }

                if(vm.request.advanceMoney>0 && vm.request.accountId==0){
                	xunSoft.helper.showMessage('请选择本次收款的结算账户');
                    return;
                }

                if(vm.request.detailList.length==0){
                    xunSoft.helper.showMessage('请至少选择一件货品');
                    return;
                }
                if(vm.request.sponsorId == "") {
                    xunSoft.helper.showMessage('经手人不能为空!');
                    return;
                }

                //处理数据获取请求信息
                var request={
                    data:_.omit(vm.request,'detailList')
                };
                request.data.detailList=[];
                _.each(vm.request.detailList,function(item){
                    var newKind=_.omit(item,'kind');
                    request.data.detailList.push(newKind);
                });

                //保存
                saleService.post.postDeliverOrder(request,{},function(){
                    vm.request.detailList=[];
                    xunSoft.helper.showMessage('出货单保存成功！');
                });
            }
        }
    });

    vm.init();
});

//编辑货品信息
eShop.onPageInit('saleBatch_deliverOrder_editKind',function(page){
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
				deliverAmount:0,
				wholesalePrice:0,
				discountRate:100,
				deliverMoney:0,
				kind:null			
			},
			response:{
				kindDetail:{},
                selectedKind:[]
			}
		},
		methods:{
			init:function(){
				this.loadKind();
			},
			loadKind:function(){
				 //请求数据
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
			//保存货品
            saveKind:function(){
               
                //检查基本信息
                if(!saleService.utility.deliverCalculate(vm.request,true)){
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
                if(vm.request.wholesalePrice<=0 || vm.request.wholesalePrice>999999 ){
                    xunSoft.helper.showMessage('请输入合理的销售价！');
                    return;
                }
                if(vm.request.deliverAmount<=0 || vm.request.deliverAmount>999999){
                    xunSoft.helper.showMessage("请输入合理的数量!");
                    return;
                }
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
                saleService.utility.deliverCalculate(requestInfo);
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

//编辑货品价格
eShop.onPageInit('saleBatch_deliverOrder_editKindPrice',function(page){
	var pageDiv=$$(page.container);

	var vm=new Vue({
		el:page.container,
		data:{
			request:{
				salePrice:0,
                wholesalePrice:0,
                deliverAmount:0,
                deliverMoney:0,
                discountRate:100,
                description:'',
			}
		},
		methods:{
			init:function(){
				if(page.query.kind){
                    _.extend(vm.request,_.omit(page.query.kind,'kind'))
               }
			},
			 //保存货品
            saveKind:function(){
                if(vm.request.wholesalePrice<=0 || vm.request.wholesalePrice>999999 ){
                    xunSoft.helper.showMessage('请输入合理的销售价！');
                    return;
                }
                if(vm.request.deliverAmount<=0 || vm.request.deliverAmount>999999){
                    xunSoft.helper.showMessage("请输入合理的数量!");
                    return;
                }
                if(!saleService.utility.deliverCalculate(vm.request,true)){
                    return;
                }
                if(page.query.kind){
                    _.extend(page.query.kind,vm.request)
                }
                mainView.router.back();
            },
            //计算价格信息
            calculate:function(){
                var requestInfo=this.request;
                saleService.utility.deliverCalculate(requestInfo);
            }
		}
	});

	vm.init();
});

//货品修改
eShop.onPageInit('saleBatch_deliverOrder_update',function(page){
    var pageDiv=$$(page.container);

    var vm=new Vue({
        el:page.container,
        data:{
            request:{
                customerId:0,
                deliverDate:'',
                sponsorId:0,
                accountId:0,
                advanceMoney:0,
                description:'',
                detailList:[],
                //删除货品列表
                deletedIDs:'0'
            },
            response:{
                customers:baseInfoService.customers,
                users:baseInfoService.users,
                accounts:baseInfoService.accounts
            }
        },
        methods:{
            init:function(){
                eShop.calendar({
                    input:pageDiv.find("#deliverDate"),
                    minDate:new Date()
                });
                this.loadDeliverOrder();
            },
            loadDeliverOrder:function(){
                if(page.query.orderId){
                    var request={
                        id:page.query.orderId
                    };
                    saleService.get.getDeliverOrderDetail(request,{},function(responseData){
                        //扩展数据
                        _.extendOwn(vm.request,_.omit(responseData.data,'detailList','deletedIDs'));

                        //获取货品明细
                        _.each(responseData.data.detailList,function(item){
                            //过滤货品信息
                            var newKind=kindService.utility.parseOrderKind(item);
                            newKind.deliverDetailId=item.deliverDetailId;
                            vm.request.detailList.push(newKind);
                        });
                    });
                }else{
                   mainView.router.back();
                }
            },
            //删除
            delete:function(kind){
                if(kind.deliverDetailId){
                   vm.request.deletedIDs+=(','+kind.deliverDetailId);
                }
            },
            //保存
            save:function(){
               if(vm.request.customerId==0){
                    xunSoft.helper.showMessage('请选择客户信息');
                    return;
                }

                if(vm.request.advanceMoney>0 && vm.request.accountId==0){
                    xunSoft.helper.showMessage('请选择本次收款的结算账户');
                    return;
                }

                if(vm.request.detailList.length==0){
                    xunSoft.helper.showMessage('请至少选择一件货品');
                    return;
                }
                if(vm.request.sponsorId == "") {
                    xunSoft.helper.showMessage('经手人不能为空!');
                    return;
                }


                //处理数据获取请求信息
                var request={
                    data:_.omit(vm.request,'detailList')
                };
                request.data.detailList=[];
                _.each(vm.request.detailList,function(item){
                    var newKind=_.omit(item,'kind');
                    request.data.detailList.push(newKind);
                });

                //保存
                saleService.put.putDeliverOrder(request,{},function(){
                    xunSoft.helper.showMessage('出货单修改成功！');
                    mainView.router.back();
                });
            }
        }
    });

    vm.init();
});