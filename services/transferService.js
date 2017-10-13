var transferService={

	get:{
		//获取未传输的单据信息
	    getTransferOrderList:function(request,response,success,error){
	        xunSoft.ajax.get('Transfer/List',request,function(responseData){

	            //转换返回的数据
	            if(_.isArray(responseData.data) && _.isArray(response.data)){
	                _.each(responseData.data,function(item){
	                    response.data.push(item);
	                });
	            }

	            //成功执行的回调函数
	            if(_.isFunction(success)){
	                success(responseData);
	            }

	        },error);
	    },

	    //获取未传输的单据的货品信息
	    getTransferOrderDetail:function(request,response,success,error){
	    	xunSoft.ajax.get('Transfer/Detail',request,success,error);
	    }
	}

};