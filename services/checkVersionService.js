var checkVersionService={
	get:{
		getLatestVersion:function(request,response,success,fail){
			$$.ajax({
				url:"http://api.fir.im/apps/latest/58cb53d3548b7a6cf0000143",
				crossDomain: true,
				method:"get",
				data: request,
				dataType: 'json',
				cache: false,
				timeout: 10000,
				success:function(data, status, xhr){
					eShop.hideIndicator();
					if(_.isFunction(success)) {
						console.log(data);
						success(data);
					}
				},
				error:function(xhr, status){
					eShop.hideIndicator();
					xunSoft.helper.showMessage('获取数据出错,请您稍后重新尝试！', '警告');
					if(_.isFunction(fail)) {
						fail();
					}
				}
			});
		}
	}
}