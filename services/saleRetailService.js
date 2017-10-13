var saleRetailService={

    get:{
        //获取POS单列表
        getSaleOrderList:function(request,response,success,fail){
            xunSoft.ajax.get('SaleRetail/SaleOrder/List',request,function(responseData){

                if(_.isArray(responseData.data) && _.isArray(response.data)){
                    if(responseData.data.length>0){
                        //设置请求响应参数
                        request.pageIndex++;
                        response.total=responseData.total;

                        var tempResult=[];
                        //过滤返回的结果
                        _.each(responseData.data,function(item){
                            var newSaleOrder=_.pick(item,'saleOrderId','saleOrderNo','memberCard_MemberName',
                                'memberCardNo','saleDate','detailSummary','createTime','creatorName','submitTime','auditTime') ;
                            
                            newSaleOrder.flag='L';
                            if(item.submitTime){
                                newSaleOrder.flag="T"
                            }
                            if(item.auditTime){
                                newSaleOrder.flag="S";
                            }
                            if(!tempResult[newSaleOrder.saleDate]){tempResult[newSaleOrder.saleDate]=[]}
                                tempResult[newSaleOrder.saleDate].push(newSaleOrder);
                        });
                        for(var o in tempResult){
                                response.data.push({time:o,value:tempResult[o]})
                            }
                    }
                }
                if(_.isFunction(success)){
                    success(responseData);
                } 


            },fail);                
        },
        //获取POS单详情
        getSaleOrderDetail:function(request,response,success,fail){
            xunSoft.ajax.get('SaleRetail/SaleOrder/Detail',request,function(responseData){
                if(response.data){
                    response.data=responseData.data;
                }
                if(_.isFunction(success)){
                    success(responseData);
                } 
            },fail);
        },
        //获取会员卡列表
        getMemberCardList:function(request,response,success,error){
            xunSoft.ajax.get('SaleRetail/MemberCard/List',request,function(responseData){

                   if(_.isArray(responseData.data) && _.isArray(response.data)){
                    if(responseData.data.length>0){
                        //设置请求响应参数
                        request.pageIndex++;
                        response.total=responseData.total;

                        var tempResult=[];
                        //过滤返回的结果
                        _.each(responseData.data,function(item){
                            var newMemberCard=_.pick(item,'memberCardId','member_MemberName','tradeSummary_RecentMoney','tradeSummary_TotalCashMoney',
                                'tradeSummary_TotalScore','tradeSummary_TotalTicketMoney','tradeSummary_TotalConsumption','memberCardNo',
                                'createTime','cost_Score','cost_Score','isEnable','discountRate','cost_TicketMoney','member_Birthday');
                            newMemberCard.userLogo = xunSoft.ajax.serviceBase() + "SaleRetail/MemberCard/Logo?memberCardId=" + item.memberCardId + "&tenantId=" + xunSoft.user.tenantId();
                            
                            if(!tempResult[newMemberCard.createTime]){tempResult[newMemberCard.createTime]=[]}
                                tempResult[newMemberCard.createTime].push(newMemberCard);
                        });
                        for(var o in tempResult){
                            response.data.push({time:o,value:tempResult[o]})
                        }
                    }
                }
                if(_.isFunction(success)){
                    success(responseData);
                }    
            },error);
        },
        //获取会员卡详细信息
        getMemberCardDetail:function(request,response,success,error){
            xunSoft.ajax.get("SaleRetail/MemberCard/Detail",request,function(responseData){
                if(responseData.data && response ){
                    response.data=responseData.data;
                }
                if(_.isFunction(success)){
                    success(responseData);
                } 
            },error);
        },
        //获取促销活动
        getActivityList:function(request,response,success,error) {
           xunSoft.ajax.get('SaleRetail/SaleOrder/Activity',request, success,error);
        },
         
        //获取促销活动规格
        getActivityRule:function(request,response,success,error){
            xunSoft.ajax.get('SaleRetail/SaleOrder/ActivityRule',request, success,error);
        },
        //获取现金卡卡号和余额
        getCashCarNo:function(request,response,success,error){
            xunSoft.ajax.get('SaleRetail/SaleOrder/GetCashCard',request,success,error);
        },
        //获取储值卡卡号
        getStoreValueCarNo:function(request,response,success,error){
            xunSoft.ajax.get('SaleRetail/SaleOrder/GetStoreCard',request,success,error);
        },
        //获取现金抵用券
        getTicket:function(request,response,success,error){
            xunSoft.ajax.get('SaleRetail/SaleOrder/GetTicket',request,success,error);
        },
        //获取积分抵用现金
        getScoreExchangeCash:function(request,response,success,error){
            xunSoft.ajax.get('SaleRetail/SaleOrder/ScoreExchangeCash',request,success,error);
        }
    },
    post:{
        
    	//添加会员卡
        postMemberCard:function(request,response,success,error){
             xunSoft.ajax.post('SaleRetail/MemberCard/Add',request,success,error);
        },
        //应用促销活动
        postApplyActivity:function(request,response,success,error){
            xunSoft.ajax.post('SaleRetail/SaleOrder/ApplyActivity',request, success,error);
        }, 
        //计算会员特价折扣
        postSpecialDiscount:function(request,response,success,error){
            xunSoft.ajax.post('SaleRetail/SaleOrder/SpecialDiscount',request, success,error);
        },
        //计算活动积分
        postSelectMemberScore:function(request,response,success,error){
            xunSoft.ajax.post('SaleRetail/SaleOrder/SelectMemberScore',request, success,error);
        },
        //计算储值卡
        postSelectStoreValueCard:function(request,response,success,error){
            xunSoft.ajax.post('SaleRetail/SaleOrder/SelectStoreValueCard',request, success,error);
        },
        //保存零售单
        postSaleOrder:function(request,response,success,error){
            xunSoft.ajax.post('SaleRetail/SaleOrder/Add',request, success,error);
        }
    },
    put:{
        //启用或停用会员卡
        updateMemberCardState:function(request,response,success,error){
             xunSoft.ajax.put('SaleRetail/MemberCard/UpdateState',request,success,error);
        },
        //修改会员卡信息
         putMemberCard:function(request,response,success,error){
             xunSoft.ajax.put('SaleRetail/MemberCard/Update',request,success,error);
        },
        //修改零售订单状态
        putSaleOrderState: function(request, response, success, error) {
            xunSoft.ajax.put('SaleRetail/SaleOrder/UpdateState', request, success, error);
        }
    },
    delete:{
        //删除会员卡
        deleteMemberCard:function(request,response,success,error){
            xunSoft.ajax.delete('SaleRetail/MemberCard/Delete',request,success,error);
        }
    }
};