//销售订单列表回调
eShop.onPageInit('saleBatch_saleOrder_list',function(page){
    var pageDiv=$$(page.container);

    var vm=new Vue({
    	el:page.container,
    	data:{
    		request:{
    			query:{
    				saleOrderNo:'',
    				customerId:'',
    				status:'',
		  			createTimeFrom:'',
		  			createTimeTo:'',
		  			creatorId:'',
		  			sponsorId:'',
		  			auditorId:'',
		  			tenantId:xunSoft.user.tenantId(),
		  			shopId:xunSoft.user.shopId(),
		  			orderBy:'saleOrderId desc',
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
    			saleService.get.getSaleOrderList(vm.request,vm.response);
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
            update:function(saleOrder){
                mainView.router.load({
                    url:'saleBatch/saleOrder/update.ios.html',
                    query:{
                        orderId:saleOrder.saleOrderId
                    }
                });
            },
            //修改单据状态
            updateState:function(flag,order){
                var request={
                    data:{
                        tenantId:xunSoft.user.tenantId(),
                        entityId:order.saleOrderId,
                        flag:flag
                    }
                };

                //修改单据的状态
                saleService.put.putSaleUpdateState(request,{},function(responseData){
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
            delete:function(saleOrder){
                var request={
                    id:saleOrder.saleOrderId
                };
                eShop.confirm('您确定要删除选中的付款单据吗？',function(){
                    saleService.delete.deleteSaleOrder(request,{},function(responseData){
                       vm.response.data.$remove(saleOrder);
                       xunSoft.helper.showMessage('单据删除成功');
                    });
                });
            }
    	}
    });

    vm.init();
});

//销售订单明细
eShop.onPageInit('saleBatch_saleOrder_detail',function(page){
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
                saleService.get.getSaleOrderDetail(vm.request,vm.response);
            }
        }
    });
    vm.init();
});

//销售订单录入
eShop.onPageInit('saleBatch_saleOrder_add',function(page){

    var pageDiv=$$(page.container);

    var vm=new Vue({
        el:page.container,
        data:{
            request:{
                customerId:0,
                placeDate:xunSoft.helper.formatDate(new Date()),
                deliverDate:xunSoft.helper.formatDate(new Date()),
                sponsorId:0,
                sponsorOrganId:xunSoft.user.shopId(),
                sponsorShopId:xunSoft.user.shopId(),
                deliverWarehouseId:xunSoft.user.shopId(),
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
                this.loadSaleOrder();
            },
            loadSaleOrder:function(){
                if(page.query.orderId){
                    var request={ id:page.query.orderId };
                    
                    saleService.get.getSaleOrderDetail(request,{},function(responseData){
                        //订单基本信息
                        _.extend(vm.request,_.pick(responseData.data,'customerId','placeDate'
                            ,'deliverDate','sponsorId','advanceMoney','description'));

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
            //保存
            save:function(){

                if(vm.request.customerId==0){
                    xunSoft.helper.showMessage('请选择客户信息');
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
                saleService.post.postSaleOrder(request,{},function(){
                    vm.request.detailList=[];
                    xunSoft.helper.showMessage('销售订单保存成功！');
                });
            }
        }
    });

    vm.init();
});

//销售订单货品修改
eShop.onPageInit('saleBatch_saleOrder_editKind',function(page){
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
                wholesalePrice:0,
                saleAmount:0,
                saleMoney:0,
                discountRate:100,
                deliverDate:'',
                description:'',
                kind:null
            },
            response:{
                selectedKind:[],
                kindDetail:{
                }
            }
        },
        methods:{
            init:function(){
                this.loadKind();

                eShop.calendar({
                    input:pageDiv.find("#deliverDate"),
                    minDate:new Date()
                });

                this.calculateKind();
            },
            //加载
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
                if(!saleService.utility.saleCalculate(vm.request,true)){
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
                if(vm.request.wholesalePrice<=0 || vm.request.wholesalePrice>999999){
                    xunSoft.helper.showMessage('请输入合理的销售价！');
                    return;
                }    
                if(vm.request.saleAmount<=0 || vm.request.saleAmount>999999){
                    xunSoft.helper.showMessage("请输入合理的数量!");
                    return;
                }
                    vm.request.sizeId=[];
                    vm.request.colorId=[];
                    xunSoft.helper.showMessage("货品信息处理成功!"); 
                    vm.calculateKind();   
                }else{
                    xunSoft.helper.showMessage("无法添加货品信息",'警告');
                    mainView.router.back();
                }
            },
            //计算价格信息
            calculate:function(){
                var requestInfo=this.request;
                saleService.utility.saleCalculate(requestInfo);
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

//销售订单货品修改
eShop.onPageInit('saleBatch_saleOrder_editKindPrice',function(page){
    var pageDiv=$$(page.container);

    var vm=new Vue({
        el:page.container,
        data:{
            request:{
                salePrice:0,
                wholesalePrice:0,
                saleAmount:0,
                saleMoney:0,
                discountRate:100,
                deliverDate:'',
                description:'',
            },
            response:{
               
            }
        },
        methods:{
            init:function(){
                this.loadKind();

                eShop.calendar({
                    input:pageDiv.find("#deliverDate"),
                    minDate:new Date()
                });
            },
            //加载
            loadKind:function(){
               if(page.query.kind){
                    _.extend(vm.request,_.omit(page.query.kind,'kind'))
               }
            },
            //保存货品
            saveKind:function(){
                if(vm.request.wholesalePrice<=0 || vm.request.wholesalePrice>999999){
                    xunSoft.helper.showMessage('请输入合理的销售价！');
                    return;
                }    
                if(vm.request.saleAmount<=0 || vm.request.saleAmount>999999){
                    xunSoft.helper.showMessage("请输入合理的数量!");
                    return;
                }
                if(!saleService.utility.saleCalculate(vm.request,true)){
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
                saleService.utility.saleCalculate(requestInfo);
            }
        }
    });

    vm.init();
});

//销售订单修改
eShop.onPageInit('saleBatch_saleOrder_update',function(page){
    var pageDiv=$$(page.container);

    var vm=new Vue({
        el:page.container,
        data:{
            request:{
                saleOrderNo:'',
                customerId:0,
                placeDate:'',
                deliverDate:'',
                sponsorId:0,
                advanceMoney:0,
                description:'',
                detailList:[],
                //删除货品列表
                deletedIDs:'0'
            },
            response:{
                customers:baseInfoService.customers,
                users:baseInfoService.users,
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
                this.loadSaleOrder();
            },
            loadSaleOrder:function(){
                if(page.query.orderId){
                    var request={ id:page.query.orderId };
                    
                    saleService.get.getSaleOrderDetail(request,{},function(responseData){
                        //订单基本信息
                        _.extend(vm.request,_.omit(responseData.data,'detailList','deletedIDs'));

                        //获取货品信息
                        _.each(responseData.data.detailList,function(item){
                            //过滤货品信息
                            var newKind=kindService.utility.parseOrderKind(item);
                            newKind.saleDetailId=item.saleDetailId;
                            vm.request.detailList.push(newKind);
                        });
                    });

                }else{
                   vm.request.sponsorId=xunSoft.user.userId(); 
                }
            },
            //删除货品
            delete:function(kind){
                if(kind.saleDetailId){
                    vm.request.deletedIDs+=','+kind.saleDetailId;
                }
            },          
            //保存
            save:function(){

                if(vm.request.customerId==0){
                    xunSoft.helper.showMessage('请选择客户信息');
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
                saleService.put.putSaleOrder(request,{},function(){
                    xunSoft.helper.showMessage('修改销售订单成功！');
                    mainView.router.back();
                });
            }
        }
    });

    vm.init();
});