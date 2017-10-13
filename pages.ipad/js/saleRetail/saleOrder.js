//零售单列表回调
eShop.onPageInit('saleRetail_saleOrder_list', function(page) {
    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                query: {
                    tenantId: xunSoft.user.tenantId(),
                    saleStorehouseId: xunSoft.user.shopId(),
                    saleOrderNo: ''
                },
                pageIndex: 1,
                pageSize: xunSoft.user.pageSize()
            },
            response: {
                total: 0,
                data: []
            }
        },
        methods: {
            init: function() {
                this.load();

                pageDiv.find('.pull-to-refresh-content').on('refresh', function() {
                    //下拉刷新
                    eShop.pullToRefreshDone();
                    vm.refresh();

                })

            },
            //重新加载
            refresh: function() {
                vm.response.total = 0;
                vm.response.data = [];
                vm.request.pageIndex = 1;
                this.load();
            },
            //加载当前页
            load: function() {
                saleRetailService.get.getSaleOrderList(vm.request, vm.response);
            },
            //查询
            query: function() {

            },
            
            //更新状态
            updateState: function(flag, order) {
                var request={
                data:{
                    tenantId:xunSoft.user.tenantId(),
                    entityId:order.saleOrderId,
                    flag:flag
                }
                };

            //修改单据的状态
            saleRetailService.put.putSaleOrderState(request,{},function(responseData){
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
            }
        }
    });

    vm.init();

});

//零售单录入回调
eShop.onPageInit('saleRetail_saleOrder_detail', function(page) {
    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                id: 0
            },
            response: {
                data: {}
            }
        },
        methods: {
            init: function() {

                vm.request.id = page.query.orderId;

                this.load();

                pageDiv.find('.pull-to-refresh-content').on('refresh', function() {
                    //下拉刷新
                    eShop.pullToRefreshDone();
                    vm.refresh();
                })

            },
            load: function() {
                saleRetailService.get.getSaleOrderDetail(vm.request, vm.response);
            }
        }
    });

    vm.init();

});



//销售=>零售订单录入回调
eShop.onPageInit('saleRetail_saleOrder_add', function(page) {

    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                shopId: xunSoft.user.shopId(),
                //会员信息 
                memberCardId:0,
                memberCardNo:'',
                memberCard_MemberName:'',
                memberDiscountRate:0,
                memberScore:0,
                saleDate:xunSoft.helper.formatDate(new Date()),
                //折扣
                reward_CashMoney:0,
                reward_DiscountRate:0,
                reward_CashTicket:0,
                reward_Score:0,
                reward_GiftsNum:0,
                //结算信息
                accountCashMoney:0,
                accountScoreMoney:0,
                accountTicketMoney:0,
                accountCardMoney:0,
                //现金卡
                cashCard: {
                    cashCardDetailId: 0,
                    balance:0
                },
                //储值卡
                storeValueCard: {
                    storeValueCardId: 0,
                    balance: 0
                },
                ticketList: [],
                sponsorId: 0,
                sponsorOrganId: xunSoft.user.shopId(),
                sponsorShopId: xunSoft.user.shopId(),
                saleStorehouseId: xunSoft.user.shopId(),
                creatorId: xunSoft.user.userId(),
                updatorId: xunSoft.user.userId(),
                description: '',
                tenantId: xunSoft.user.tenantId(),
                detailList: []
            },
            response: {
                users: baseInfoService.users,
            }
        },
        methods: {
            init: function() {
                vm.request.sponsorId = xunSoft.user.userId();

            },
            //选择会员
            selectMember: function() {
                mainView.router.load({
                    url: 'saleRetail/saleOrder/selectMemberCard.ios.html',
                    query: {
                        request:this.request
                    }
                });
            },

            //回退
            back: function() {
                if (vm.request.detailList.length > 0) {
                    eShop.confirm('单据已经有货品信息了,您确认退出吗？', function() {
                        mainView.router.back();
                    });
                } else {
                    mainView.router.back();
                }
            },
            //扫描货品
            scanKind: function() {

            },
            //修改货品
            updateKind:function(kind){
                mainView.router.load({
                    url:'saleRetail/saleOrder/editKindPrice.ios.html',
                    query:{
                        request:vm.request,
                        kind:kind
                    }
                });
            },
            //结算
            save: function() {

                if (vm.request.detailList.length == 0) {
                    xunSoft.helper.showMessage('请至少选择一件货品');
                    return;
                }

                //计算金额
                //应收金额
                vm.request.summary_saleMoney=0;
                //数量
                vm.request.summary_saleAmount=0;
                //赠送数量
                vm.request.summary_GratisAmount=0;
                //优惠金额
                vm.request.summary_performanceMoney=0;
                //实收金额
                vm.request.summary_actualMoney=0;
                //折扣
                vm.request.reward_DiscountRate=0;

                _.each(vm.request.detailList,function(item){
                    vm.request.summary_saleMoney+=(parseFloat(item.saleMoney) || 0); 
                    vm.request.summary_saleAmount+=(parseFloat(item.saleAmount) || 0);
                    vm.request.reward_Score+=(parseFloat(item.score) || 0);
                    vm.request.summary_GratisAmount+=(parseFloat(item.gratisAmount) || 0);
                    vm.request.summary_performanceMoney+=(parseFloat(item.performanceMoney) || 0);
                    vm.request.summary_actualMoney+=(parseFloat(item.actualMoney) || 0);
                });

                vm.request.reward_DiscountRate=(vm.request.summary_actualMoney/vm.request.summary_saleMoney) *100;

                //去结算
                mainView.router.load({
                    url:'saleRetail/saleOrder/addSettlement.ios.html',
                    query:{
                        request:vm.request,
                        callback:function(){
                            vm.request.detailList=[];
                        }
                    }
                });
            }
        }
    });

    vm.init();
});

//选择会员
eShop.onPageInit('saleRetail_saleOrder_selectMemberCard',function(page){
    var pageDiv=$$(page.container);
    var vm=new Vue({
        el:page.container,
        data:{
            request:{
                query:{
                    shopId:xunSoft.user.shopId(),
                    tenantId:xunSoft.user.tenantId(),
                    openDateFrom:"",
                    openDateTo:'',
                    memberCardNo:'',
                    member_MemberName:'',
                    recentDate:'',
                    recentMoneyFrom:'',
                    recentMoneyTo:'',
                    sponsorId:''
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
            //加载
            load:function(){
                saleRetailService.get.getMemberCardList(vm.request,vm.response);
            },
            //刷新
            refresh:function(){
                this.request.pageIndex=1;
                this.response.total=0;
                this.response.data=[];
                this.load();
            },
            //查询
            query:function(){
                mainView.router.load({
                    url:'saleRetail/memberCard/filter.ios.html',
                    query:{
                        para:vm.request.query,
                        callback:vm.refresh
                    }
                });
            },
            //选择会员结束
            select:function (member){
                if(page.query.request){
                    var request=page.query.request;

                    request.memberCardId=member.memberCardId;
                    request.memberScore=member.cost_Score;
                    request.memberDiscountRate=member.discountRate;
                    request.memberCard_MemberName=member.member_MemberName;
                    if(member.member_MobilePhone){
                        request.memberCard_MemberName+=+"/"+member.member_MobilePhone
                    }
                    request.memberCardNo=member.memberCardNo;
                }
                 mainView.router.back();
            }
        }
    });

    vm.init();
});


//销售-零售录入->订单货品修改
eShop.onPageInit('saleRetail_saleOrder_editKind', function(page) {
    var pageDiv = $$(page.container);
    //前台参数
    var orderRequest=page.query.detailList;

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                kindId: 0,
                colorId:0,
                sizeId: 0,
                //吊牌价
                salePrice: 0,
                unitId: 0,
                //零售价
                retailPrice: 0,
                //折扣
                discountRate:0,
                //零售数量
                saleAmount: 0,
                //零售金额
                saleMoney: 0,
                //增送货品数量
                gratisAmount:0,
                //赠品数量
                giftsNum:0,
                //折后金额
                actualMoney:0,
                //优惠金额
                performanceMoney:0,
                //返现金额
                cashMoney:0,
                //代金券金额
                cashTicket:0,
                //库存
                inventory:0,
                description: '',
                barNo:'',
                //积分
                score:0,
                //促销活动
                activityList:[],
                //活动规则
                matchRuleList:[],
                kind: null
            },
            response: {
                //货品信息
                kindDetail: {},
                //已选择的货品
                selectedKind:[],
                //促销活动
                activity: [],
            }
        },
        watch: {            
            'request.colorId':function(val, oldval){
                if(val!='' && this.request.sizeId!=''){
                    this.loadInventory();
                }
            },
            'request.sizeId':function(val, oldval){
                 if(val!='' && this.request.colorId!=''){
                    this.loadInventory();
                }
            },
        },
        methods: {
            init: function() {
                this.loadKind();
                this.loadActivity();

                if(_.isArray(orderRequest.detailList)){
                    _.each(orderRequest.detailList,function(item){
                        if(item.kindId==page.query.kindId){
                            vm.response.selectedKind.push(item);
                        }
                    });
                }

            },
            //加载
            loadKind: function() {
                //请求数据
                var request = {
                    id: page.query.kindId
                }
                //获取商品信息
                kindService.get.getKindDetail(request, {}, function(responseData) {
                    //设置货品信息
                    vm.response.kindDetail = responseData.data;
                    vm.request.kind = kindService.utility.parseKind(responseData.data);

                    vm.request.kindId = responseData.data.kindId;
                    vm.request.unitId = responseData.data.unitId;

                    //获取吊牌价
                    var salePrice=_.find(responseData.data.priceList,function(item){ return item.itemKey=="sale-price";}); 
                    if(salePrice){
                        vm.request.salePrice=salePrice.value;
                    }

                    if(orderRequest.memberCardId>0){
                         //获取会员价
                        var memberPrice=_.find(responseData.data.priceList,function(item){ return item.itemKey=="sale-member";}); 
                        if(memberPrice){
                            vm.request.retailPrice=memberPrice.value;
                        }
                    }

                });
            },
            //加载促销活动
            loadActivity: function() {
                //请求参数
                var request = {
                    query:{
                        kindId: page.query.kindId,
                        shopId:xunSoft.user.shopId(),
                        tenantId:xunSoft.user.tenantId()
                    }
                };
                //获取促销活动
                saleRetailService.get.getActivityList(request, null, function(responseData) {
                    if(_.isArray(responseData.data)){
                        //检查促销活动
                        _.each(responseData.data,function(item){
                            //是否顺序执行
                            if(item.implementMode==0){
                                vm.request.activityList.push(item);
                                //添加匹配的规则
                                _.each(item.detailList,function(rule){
                                     vm.request.matchRuleList.push(rule);
                                });
                            }else{
                                //可选的促销活动
                                vm.response.activity.push(item);
                            }
                        });
                    }else{
                        vm.specialDiscount();
                    }                
                });
            },
            //加载颜色尺码    
            loadInventory:function(){
                var request={
                    kindId:vm.request.kindId,
                    colorId:vm.request.colorId,
                    sizeId:vm.request.sizeId
                };
                warehouseService.get.getShopWarehouseSum(request,null,function(responseData){
                    vm.request.inventory=responseData.data;
                });
            },     
            //应用促销活动
            applyActivity:function(){
                //构造参数
                var request={
                    activityData:vm.request.activityList,
                    saleAmount:vm.request.saleAmount,
                    retailPrice:vm.request.retailPrice,
                    memberCardId:orderRequest.memberCardId
                };
                
                saleRetailService.post.postApplyActivity(request,null,function(responseData){
                    //折后金额
                    var actualMoney=responseData.data.saleMoney;
                    //赠品数量
                    var giftsNum=responseData.data.saleAmount;
                    //增送货品数量
                    var goodNum=responseData.data.sizeId;
                    //返现金额
                    var moneyCash=responseData.data.retailPrice;
                    //返现金券金额
                    var ticketMoney=responseData.data.performanceMoney

                    //折扣金额
                    vm.request.actualMoney=actualMoney;
                    //优惠金额
                    vm.request.performanceMoney=vm.request.saleMoney-actualMoney+goodNum*vm.request.retailPrice;
                    //折扣率
                    vm.request.discountRate=(actualMoney/vm.request.saleMoney) * 100;

                    //总的赠送数量
                    orderRequest.reward_GiftsNum+=giftsNum;
                    //总返现金额
                    orderRequest.reward_CashMoney+=moneyCash;
                    //总返现金券金额
                    orderRequest.reward_CashTicket+=ticketMoney;

                    //增送货品数量
                    vm.request.gratisAmount=goodNum;
                    //赠品数量
                    vm.request.giftsNum=giftsNum;
                    //返现金额
                    vm.request.cashMoney=moneyCash;
                    //返现代金券
                    vm.request.cashTicket=ticketMoney;

                    //判断活动是否进行了优惠
                    if (responseData.data.colorId == 1) {
                        //计算活动积分
                        vm.selectMemberScore();
                    }else{
                        //计算特殊折扣
                         vm.specialDiscount();
                    }

                });
            },    
            //选中可选促销活动
            selectActivity:function(activity,rule){
                var newActivity=_.omit(activity,'detailList');
                newActivity.detailList=[rule];

                //查找是否已经选中
                var activity = _.find(vm.request.activityList,function(item){ return item.activityId==newActivity.activityId; });

                //是否已经选择
                if(activity){
                    vm.request.activityList.$remove(activity);
                }
                vm.request.activityList.push(newActivity);
                //重新计算
                this.calculate();

            },
            //保存货品
            saveKind: function() {
                //检查基本信息
                if (vm.request.colorId == 0) {
                    xunSoft.helper.showMessage('请选择一种颜色');
                    return;
                }
                if (vm.request.sizeId == 0) {
                    xunSoft.helper.showMessage('请选择一种尺码');
                    return;
                }
                if (vm.request.saleAmount <= 0) {
                    xunSoft.helper.showMessage('请输入销售数量');
                    return;
                }

                //获取颜色尺码
                var colorInfo=_.find(vm.response.kindDetail.colorList,function(item){ return item.colorId==vm.request.colorId; });
                if(colorInfo){
                    vm.request.kind.colorName=colorInfo.colorName
                }
                var sizeInfo=_.find(vm.response.kindDetail.sizeList,function(item){ return item.sizeId==vm.request.sizeId; });
                if(sizeInfo){
                    vm.request.kind.sizeText=sizeInfo.sizeText;
                }

                //是否已经选择
                var existKind=_.find(page.query.detailList.detailList,function(item){ return item.kindId==vm.request.kindId 
                    && item.colorId==vm.request.colorId 
                    && item.sizeId==vm.request.sizeId; });

                if(existKind){
                    page.query.detailList.detailList.$remove(existKind);
                }
                console.log(page.query.detailList.detailList);
                page.query.detailList.detailList.push(vm.request);
                xunSoft.helper.showMessage('添加货品信息成功');
                mainView.router.back();

            },
            //计算价格信息
            calculate: function() {
                //是否选择尺码
                if(this.request.sizeId==0 || this.request.colorId==0){
                    return;
                }

                //是否输入单价和数量
                var price=parseFloat(this.request.retailPrice) || -1;
                var amount=parseFloat(this.request.saleAmount) || 0;
                if(price==-1 || amount ==0){
                   return;
                }
                 this.request.saleMoney=price* amount ;

                //是否有促销活动
                if(vm.request.activityList.length==0){
                    //是否会员
                    if(orderRequest.memberCardId>0){
                         //计算会员特殊折扣
                        var request={                   
                            saleDetail:{
                                tenantId:xunSoft.user.tenantId(),
                                saleMoney:vm.request.actualMoney,
                                brandId:vm.response.kindDetail.brandId,
                                kindId:vm.request.kindId,
                                colorId:vm.request.colorId,
                                sizeId:vm.request.sizeId
                            },
                            memberCardId:orderRequest.memberCardId,
                            tenantId:xunSoft.user.tenantId(),
                        };

                        //计算会员特价折扣
                        saleRetailService.post.postSpecialDiscount(request,null,function(responseData){
                            //如果有特别会员折扣 设置订单金额
                            if(responseData.data.brandId==1){
                                //如果有特别会员折扣
                                vm.request.actualMoney=responseData.data.actualMoney;
                                vm.request.performanceMoney=vm.request.saleMoney-responseData.data.actualMoney;
                                vm.request.discountRate=(responseData.data.actualMoney/vm.request.saleMoney) *100;

                                //计算活动积分
                                saleRetailService.post.postSelectMemberScore(request,null,function(responseData){
                                    vm.request.score=responseData.data.score;
                                });

                            }else{

                                //储值卡查询
                                var storeValueCardRequest={
                                    data:{
                                        shopId:xunSoft.user.shopId(),
                                        tenantId:xunSoft.user.tenantId(),
                                        memberCardId:orderRequest.memberCardId,
                                    }
                                };

                                //查找储值卡折扣
                                saleRetailService.post.postSelectStoreValueCard(storeValueCardRequest,null,function(responseData){

                                    //计算活动积分
                                    saleRetailService.post.postSelectMemberScore(request,null,function(responseData){
                                        vm.request.score=responseData.data.score;
                                    });
                                });
                            }
                        });
                    }
                    else{
                        vm.request.actualMoney = vm.request.saleMoney;
                    }
                }else{
                    this.applyActivity();
                }
            },
            //特殊折扣
            specialDiscount:function(){
                if(orderRequest.memberCardId==0){
                    return;
                }
                //请求参数
                var discountRequest={
                    saleDetail:vm.request,
                    memberCardId:orderRequest.memberCardId
                };
                //获取折扣
                saleRetailService.post.postSpecialDiscount(memberDiscountRequest,null,function(responseData){
                    var actualMoney=responseData.data.actualMoney;
                    var performanceMoney=vm.request.saleMoney-actualMoney;
                    var discountRate=(actualMoney/vm.request.saleMoney)*100;
                    vm.request.actualMoney=actualMoney;
                    vm.request.performanceMoney=performanceMoney;
                    vm.request.discountRate=discountRate;

                    vm.selectMemberScore();
                   
                });
            },
            //会员积分
            selectMemberScore:function(){
                if(orderRequest.memberCardId==0){
                    return;
                }
                //请求参数
                var discountRequest={
                    saleDetail:vm.request,
                    memberCardId:orderRequest.memberCardId
                };
                //计算活动积分
                saleRetailService.post.postSelectMemberScore(discountRequest,null,function(responseData){
                    vm.request.score=responseData.data.score;
                });
            }
        }
    });

    vm.init();
});

//销售-Pos开单
eShop.onPageInit('saleRetail_saleOrder_settlement', function (page) {
    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                //现金卡号
                cashCarNo:'',
                //会员余额抵扣券
                memberCarBalanceMoney:0,
                //会员卡可用余额
                memberCar_balance:0,
                //现金卡抵扣券
                cashCarBalanceMoney:0,
                //现金可用余额
                cashCar_balance:0,
                //储值卡号
                storeValueCardNo:'',
                //储值卡卡号充值抵
                storeValueCardBalanceMoney:0,
                //储值卡可用余额
                storeValueCard_balance:0,
                //现金券冲抵
                cashCoupon:0,
                //积分冲抵
                integralBlance:0,
                //输入积分
                txt_integralBlance:0,
                //实收金额
                receiptsMoney:0,
                //应付金额
                receiveMoney:0,
                //实付金额
                reallyMoney:0,
                //找回金额
                payBackMoney:0

            },
            response: {
                data: [],
                //会员卡详情数据
                memberCarDetail:[],
                //会员
                memberCarMoney:0,
                //现金卡
                cashCarMoney:0,
                //储值卡
                storeValueCardMoney:0,
                //积分余额
                integral:0,
                //零售收款类型
                checkOut:[]
            }
        },
        computed:{
         

        },
        watch: {

            //现金卡检测
            'request.cashCarBalanceMoney':function(val, oldval){
                if (this.request.cashCar_balance==0||this.request.cashCar_balance==null) {
                     xunSoft.helper.showMessage('请输入现金卡卡号！');
                     this.request.cashCarBalanceMoney=0;
                     return;
                }
                else{
                    if (val>this.request.cashCar_balance) {
                        xunSoft.helper.showMessage('输入金额不能大于现金卡余额！');
                        this.request.cashCarBalanceMoney=0;
                        return;
                    }else{
                         this.request.cashCar_balance-=this.request.cashCarBalanceMoney;
                    }
                    this.calculate();
                }
            },
            'request.storeValueCardBalanceMoney':function(val,oldval){
                if (this.request.storeValueCard_balance==0||this.request.storeValueCard_balance==null) {
                     xunSoft.helper.showMessage('请输入储值卡卡号！');
                     this.request.storeValueCardBalanceMoney=0;
                     return;
                }else{
                    if (val>this.request.storeValueCard_balance) {
                        xunSoft.helper.showMessage('输入金额不能大于储值卡余额！');
                        this.request.storeValueCard_balance=0;
                        return;
                    }else{
                        this.request.storeValueCard_balance-=this.request.storeValueCardBalanceMoney;
                    }
                    this.calculate();
                }
            },
            'request.integralBlance':function(val,oldval){
                if (this.request.integralBlance>0) {
                    this.calculate();
                }
            },
            //会员卡余额检测
            'request.memberCarBalanceMoney':function(val,oldval){
                if (this.request.memberCar_balance<=0 ) {
                    xunSoft.helper.showMessage('余额不足！');
                    this.request.memberCarBalanceMoney=0;
                    return;
                }
                if (val>this.request.memberCar_balance) {
                    xunSoft.helper.showMessage('余额不足！');
                    this.request.memberCarBalanceMoney=0;
                    return;
                }
                if (val>0&&val>oldval) {
                   this.request.memberCar_balance-=parseFloat(val);
                }else{
                   this.request.memberCar_balance+=parseFloat(oldval);
                }
                this.calculate();
            },
            
        },
        methods: {
            init: function () {
                //添加付款类型付款金额属性
                _.each(baseInfoService.checkout,function(item){
                   var checkOutTpye=_.clone(item);
                   checkOutTpye.money=0;
                   vm.response.checkOut.push(checkOutTpye);
                })
                //加载数据
                this.load();
                //计算金额
                this.calculate();
            },
            load: function () {
                if (page.query.request) {
                    vm.response.data = page.query.request; 
                    console.log(page.query.request);
                    //设置会员积分
                    vm.response.integral=page.query.request.memberScore;
                    if (page.query.request.memberCardId) {
                       var requestMemberDetaiId={
                        id:page.query.request.memberCardId
                    }
                    //加载会员卡余额
                    saleRetailService.get.getMemberCardDetail(requestMemberDetaiId,null,function(responseData){
                        vm.request.memberCar_balance=responseData.data.tradeSummary_TotalTicketMoney;
                    });
                    }
                }
            },
            save:function(){
                var request=vm.request;
                if (request.reallyMoney<request.receiveMoney) {
                    xunSoft.helper.showMessage('实付金额应大于应付款金额！');
                    return;
                }
                var requestData=page.query.request;
                    requestData.tenantId=xunSoft.user.tenantId();
                    requestData.saleStorehouseId=xunSoft.user.shopId();
                    requestData.reward_CashTicket=requestData.reward_CashMoney;
                    // requestData.performanceMoney=payBackMoney;
                    // requestData.gratisAmount=0;
                    //找回金额
                    requestData.accountCashMoney=request.payBackMoney;
                    //会员卡
                    if (request.memberCarBalanceMoney) {
                        requestData.accountCashMoney=request.memberCarBalanceMoney;
                    }else{
                         requestData.accountCashMoney=0;
                    } 
                    //现金券
                    if (request.cashCoupon) {
                        requestData.accountTicketMoney=request.cashCoupon;
                    }else{
                        requestData.accountTicketMoney=0;
                    }
                    //收款金额类型
                    requestData.checkoutDetailList=[];
                    _.each(vm.response.checkOut,function(item){
                        if (item.money!=0) {
                            requestData.checkoutDetailList.push(item);
                        }
                    })
                    //储值卡余额
                    requestData.storeValueCard.balance=parseFloat(request.storeValueCard_balance)-parseFloat(request.storeValueCardBalanceMoney);
                    requestData.storeValueCardMoney=request.storeValueCardMoney;
                    //现金卡余额
                    requestData.cashCard.balance=parseFloat(request.cashCar_balance)-parseFloat(request.cashCarBalanceMoney);
                    requestData.cashCardMoney=request.cashCardMoney;
                    //
                    requestData.accountCardMoney=parseFloat(request.storeValueCardBalanceMoney)+parseFloat(request.cashCarBalanceMoney);
                    //积分抵扣金额
                    requestData.accountScoreMoney=parseFloat(request.integralBlance);
                    console.log(JSON.stringify(requestData));
                    return;
                    saleRetailService.post.postSaleOrder({data:requestData},{},function(responseData){
                        if(responseData.errorMsg==null){
                            xunSoft.helper.showMessage('结算成功！');
                            mainView.router.back();
                        }
                    })
            },
            //添加现金卡卡号
            addCashCarNumber:function(){
                if (vm.request.cashCarNo=='') {
                    xunSoft.helper.showMessage('请输入现金卡号');
                    return;

                } else{
                    var requestcashCardNo={
                        query:{
                            cashCardNo:vm.request.cashCarNo,
                            shopId:xunSoft.user.shopId(),
                            tenantId:xunSoft.user.tenantId()
                        }
                        
                    }
                    saleRetailService.get.getCashCarNo(requestcashCardNo,null,function(responseData){
                        if (responseData.data==null) {
                            xunSoft.helper.showMessage('未找到现金卡号！');
                            return;
                        }
                        else{
                            vm.request.cashCar_balance=responseData.data.balance;
                        }
                   })
                }
            },
            //添加储值卡卡号
            addStoreValueCardNumber:function(){
                if (vm.request.storeValueCardNo=='') {
                    xunSoft.helper.showMessage('请输入储值卡号');
                    return;
                }else{
                    var requestStoreValueCardNo={
                        query:{
                            storeValueCardNo:vm.request.storeValueCardNo,
                            shopId:xunSoft.user.shopId(),
                            tenantId:xunSoft.user.tenantId()
                        }
                    }
                    saleRetailService.get.getStoreValueCarNo(requestStoreValueCardNo,null,function(responseData){

                        if (responseData.data==null) {
                            xunSoft.helper.showMessage('未找到储值卡号！');
                            return;
                        }
                        else{
                            
                            vm.request.storeValueCard_balance=responseData.data.balance;
                        }
                    })
                }

            },
            //计算积分抵现金
            integralCash:function(){
                if (page.query.request.memberCardId>0) {
                    if (vm.response.data.memberScore>0) {
                        if (vm.request.txt_integralBlance<=vm.response.data.memberScore) {
                            var requestScore={                               
                                     score:vm.request.txt_integralBlance             
                            }
                            saleRetailService.get.getScoreExchangeCash(requestScore,{},function(responseData){
                                //积分对现金
                            if (responseData.data>0) {

                                    vm.request.integralBlance+=responseData.data;  
                                    vm.response.integral-=vm.request.txt_integralBlance;
                                    vm.request.txt_integralBlance=0;
                                    this.calculate();
                                }else{
                                    xunSoft.helper.showMessage('当前积分不足以抵换最低金额！');
                                }

                            });
                        }else{
                            xunSoft.helper.showMessage('输入积分不能超过现有积分！');
                            return;
                        }        
                        
                    }else{
                        xunSoft.helper.showMessage('暂无可用积分！');
                        vm.request.txt_integralBlance=0;
                        return;
                    }
                }
            },
            //计算应付金额
            calculate:function(){
                var newMoney=0;
                //应收金额
                var _payMoney=page.query.request.summary_actualMoney;  
                //实付金额
                var _rpayMoney=0;
                //找回金额
                var _payBackMoney=0;
                //应付金额计算
                //会员冲抵
                if (vm.request.memberCarBalanceMoney) {
                    _payMoney-=vm.request.memberCarBalanceMoney;
                }
                //现金冲抵
                if (vm.request.cashCarBalanceMoney) {
                    _payMoney-=vm.request.cashCarBalanceMoney;
                }
                //储值卡冲抵
                if (vm.request.storeValueCardBalanceMoney) {
                    _payMoney-=vm.request.storeValueCardBalanceMoney;
                }
                //现金券冲抵
                if (vm.request.cashCoupon) {
                    _payMoney-=vm.request.cashCoupon;
                }
                //积分冲抵
                if (vm.request.integralBlance) {
                    _payMoney-=vm.request.integralBlance;
                }
                //遍历实付金额
                _.each(vm.response.checkOut,function(item){
                        _rpayMoney+=parseFloat(item.money);
                    
                })
                //实付金额
                vm.request.reallyMoney=_rpayMoney;
                //应付金额
                vm.request.receiveMoney=_payMoney;
                //找回金额
                vm.request.payBackMoney=_rpayMoney-_payMoney;

            }
        }

    });

    vm.init();
});



//零售录入货品修改
eShop.onPageInit('saleRetail_saleOrder_editKindPrice',function(page){
    var pageDiv = $$(page.container);
    var orderRequest=page.query.kind;


     var vm = new Vue({
        el: page.container,
        data: {
            request: {
                //吊牌价
                salePrice: 0,
                //零售价
                retailPrice: 0,
                //折扣
                discountRate:100,
                //零售数量
                saleAmount: 0,
                //零售金额
                saleMoney: 0,
                //增送货品数量
                gratisAmount:0,
                //赠品数量
                giftsNum:0,
                //折后金额
                actualMoney:0,
                //优惠金额
                performanceMoney:0,
                //返现金额
                cashMoney:0,
                //代金券金额
                cashTicket:0,
                //库存
                inventory:0,
                description: '',
                //积分
                score:0,
                //促销活动
                activityList:[],
                //活动规则
                matchRuleList:[],
            },
            response: {               
                //促销活动
                activity: [],
            }
        },
        methods: {
            init: function() {
                //是否存在参数
                if(page.query.kind){
                    _.extend(vm.request,page.query.kind);
                }

            },
            //加载促销活动
            loadActivity: function() {
                //请求参数
                var request = {
                    query:{
                        kindId: page.query.kindId,
                        shopId:xunSoft.user.shopId(),
                        tenantId:xunSoft.user.tenantId()
                    }
                };
                //获取促销活动
                saleRetailService.get.getActivityList(request, null, function(responseData) {
                    if(_.isArray(responseData.data)){
                        //检查促销活动
                        _.each(responseData.data,function(item){
                            //是否顺序执行
                            if(item.implementMode==0){
                                vm.request.activityList.push(item);
                                //添加匹配的规则
                                _.each(item.detailList,function(rule){
                                     vm.request.matchRuleList.push(rule);
                                });
                            }else{
                                //可选的促销活动
                                vm.response.activity.push(item);
                            }
                        });
                    }else{
                        vm.specialDiscount();
                    }                
                });
            },   
            //应用促销活动
            applyActivity:function(){
                //构造参数
                var request={
                    activityData:vm.request.activityList,
                    saleAmount:vm.request.saleAmount,
                    retailPrice:vm.request.retailPrice,
                    memberCardId:orderRequest.memberCardId
                };
                
                saleRetailService.post.postApplyActivity(request,null,function(responseData){
                    //折后金额
                    var actualMoney=responseData.data.saleMoney;
                    //赠品数量
                    var giftsNum=responseData.data.saleAmount;
                    //增送货品数量
                    var goodNum=responseData.data.sizeId;
                    //返现金额
                    var moneyCash=responseData.data.retailPrice;
                    //返现金券金额
                    var ticketMoney=responseData.data.performanceMoney

                    //折扣金额
                    vm.request.actualMoney=actualMoney;
                    //优惠金额
                    vm.request.performanceMoney=vm.request.saleMoney-actualMoney+goodNum*vm.request.retailPrice;
                    //折扣率
                    vm.request.discountRate=(actualMoney/vm.request.saleMoney) * 100;

                    //总的赠送数量
                    orderRequest.reward_GiftsNum+=giftsNum;
                    //总返现金额
                    orderRequest.reward_CashMoney+=moneyCash;
                    //总返现金券金额
                    orderRequest.reward_CashTicket+=ticketMoney;

                    //增送货品数量
                    vm.request.gratisAmount=goodNum;
                    //赠品数量
                    vm.request.giftsNum=giftsNum;
                    //返现金额
                    vm.request.cashMoney=moneyCash;
                    //返现代金券
                    vm.request.cashTicket=ticketMoney;

                    //判断活动是否进行了优惠
                    if (responseData.data.colorId == 1) {
                        //计算活动积分
                        vm.selectMemberScore();
                    }else{
                        //计算特殊折扣
                         vm.specialDiscount();
                    }

                });
            },    
            //选中可选促销活动
            selectActivity:function(activity,rule){
                var newActivity=_.omit(activity,'detailList');
                newActivity.detailList=[rule];

                //查找是否已经选中
                var activity = _.find(vm.request.activityList,function(item){ return item.activityId==newActivity.activityId; });

                //是否已经选择
                if(activity){
                    vm.request.activityList.$remove(activity);
                }
                vm.request.activityList.push(newActivity);
                //重新计算
                this.calculate();

            },
            //保存货品
            saveKind: function() {
                //检查基本信息                
                if (vm.request.saleAmount <= 0) {
                    xunSoft.helper.showMessage('请输入销售数量');
                    return;
                }
                //赋值
                _.extend(page.query.kind,vm.request);
                mainView.router.back();

            },
            //计算价格信息
            calculate: function() {
                //是否选择尺码
                if(this.request.sizeId==0 || this.request.colorId==0){
                    return;
                }

                //是否输入单价和数量
                var price=parseFloat(this.request.retailPrice) || -1;
                var amount=parseFloat(this.request.saleAmount) || 0;
                if(price==-1 || amount ==0){
                   return;
                }
                 this.request.saleMoney=price* amount ;

                //是否有促销活动
                if(vm.request.activityList.length==0){
                    //是否会员
                    if(orderRequest.memberCardId>0){
                         //计算会员特殊折扣
                        var request={                   
                            saleDetail:{
                                tenantId:xunSoft.user.tenantId(),
                                saleMoney:vm.request.actualMoney,
                                brandId:vm.response.kindDetail.brandId,
                                kindId:vm.request.kindId,
                                colorId:vm.request.colorId,
                                sizeId:vm.request.sizeId
                            },
                            memberCardId:orderRequest.memberCardId,
                            tenantId:xunSoft.user.tenantId(),
                        };

                        //计算会员特价折扣
                        saleRetailService.post.postSpecialDiscount(request,null,function(responseData){
                            //如果有特别会员折扣 设置订单金额
                            if(responseData.data.brandId==1){
                                //如果有特别会员折扣
                                vm.request.actualMoney=responseData.data.actualMoney;
                                vm.request.performanceMoney=vm.request.saleMoney-responseData.data.actualMoney;
                                vm.request.discountRate=(responseData.data.actualMoney/vm.request.saleMoney) *100;

                                //计算活动积分
                                saleRetailService.post.postSelectMemberScore(request,null,function(responseData){
                                    vm.request.score=responseData.data.score;
                                });

                            }else{

                                //储值卡查询
                                var storeValueCardRequest={
                                    data:{
                                        shopId:xunSoft.user.shopId(),
                                        tenantId:xunSoft.user.tenantId(),
                                        memberCardId:orderRequest.memberCardId,
                                    }
                                };

                                //查找储值卡折扣
                                saleRetailService.post.postSelectStoreValueCard(storeValueCardRequest,null,function(responseData){

                                    //计算活动积分
                                    saleRetailService.post.postSelectMemberScore(request,null,function(responseData){
                                        vm.request.score=responseData.data.score;
                                    });
                                });
                            }
                        });
                    }
                }else{
                    this.applyActivity();
                }
            },
            //特殊折扣
            specialDiscount:function(){
                if(orderRequest.memberCardId==0){
                    return;
                }
                //请求参数
                var discountRequest={
                    saleDetail:vm.request,
                    memberCardId:orderRequest.memberCardId
                };
                //获取折扣
                saleRetailService.post.postSpecialDiscount(memberDiscountRequest,null,function(responseData){
                    var actualMoney=responseData.data.actualMoney;
                    var performanceMoney=vm.request.saleMoney-actualMoney;
                    var discountRate=(actualMoney/vm.request.saleMoney)*100;
                    vm.request.actualMoney=actualMoney;
                    vm.request.performanceMoney=performanceMoney;
                    vm.request.discountRate=discountRate;

                    vm.selectMemberScore();
                   
                });
            },
            //会员积分
            selectMemberScore:function(){
                if(orderRequest.memberCardId==0){
                    return;
                }
                //请求参数
                var discountRequest={
                    saleDetail:vm.request,
                    memberCardId:orderRequest.memberCardId
                };
                //计算活动积分
                saleRetailService.post.postSelectMemberScore(discountRequest,null,function(responseData){
                    vm.request.score=responseData.data.score;
                });
            }
        }
    });

    vm.init();


});