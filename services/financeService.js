var financeService={

	post:{
		addExpendType:function(request,response,success,error){
			xunSoft.ajax.post('Finance/ExpendType/Add',request,success,error);
		},
		addRevenueType:function(request,response,success,error){
			xunSoft.ajax.post('Finance/RevenueType/Add',request,success,error);
		}
	}

};