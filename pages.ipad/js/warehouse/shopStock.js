//店铺库存列表回调
eShop.onPageInit('warehouse_shopStock_list',function(page){
    var pageDiv=$$(page.container);
    var vm=new Vue({
    	el:page.container,
    	data:{
    		request:{
    			query:{
                warehouseId:xunSoft.user.shopId(),
                tenantId:xunSoft.user.tenantId(),
                kindText:''
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
                    vm.load();
                 });
    		},
    		load:function(){
    			warehouseService.get.getShopWarehouseList(vm.request,vm.response);
    		
    		},
		  	//重新加载
		  	refresh:function(){
		  		this.response.data=[];
		  		this.response.total=0;
		  		this.request.pageIndex=1;
		  		this.load();
		  	}
           
    	}
    });

    vm.init();
});

//获取店铺库存详情
eShop.onPageInit('warehouse_shopStock_Detail',function(page){
    var pageDiv=$$(page.container);
    var vm=new Vue({
        el:page.container,
        data:{
            request:{
                kindId:0,
                sizeId:0,
                colorId:0,
                
            },
            response:{
                data:{}
            }
        },
        methods:{
            init:function(){
                //获取明细Id
                vm.request.kindId=page.query.kindId;
                vm.request.sizeId=page.query.sizeId;
                vm.request.colorId=page.query.colorId;
                //加载数据
                this.load();
                //下拉刷新
                pageDiv.find('.pull-to-refresh-content').on('refresh',function(){
                    eShop.pullToRefreshDone();
                    vm.load();
                 });
            },
            //加载数据
            load:function(){
                //获取货品库存详情
                warehouseService.get.getShopWarehouseDetail(vm.request,vm.response)
            }
        }
    });
    vm.init();
})
