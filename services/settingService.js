var settingService={

	get:{
		getSettingFeedbackList:function(request,response,success,error){
			xunSoft.ajax.get('Shop/Feedback/List',request,function(responseData){
				//检查数据
                if(_.isArray(responseData.data) && responseData.data.length>0){
                    //是否存在下一页
                    if(request.pageIndex){
                        request.pageIndex++;
                    }
                    //总数量
                    response.total=responseData.total;
                    //将数据存入本地
                    _.each(responseData.data,function(item){

                        //转换单据信息
                        var settingFeedbackListOrder=_.pick(item,'title','tenantId','createTime','content','isSolve','status');
                        response.data.push(settingFeedbackListOrder);
                    });
                }
                if(_.isFunction(success)){
                    success(responseData);
                }
			},function(){
                if(_.isFunction(error)){
                    error();
                }
              })
		}	
	},

	post:{
		postSettingFeedback:function(request,response,success,error){
			 xunSoft.ajax.post('Shop/Feedback/Add',request,success,error);
		}
	},

	put:{},

	delete:{}
}