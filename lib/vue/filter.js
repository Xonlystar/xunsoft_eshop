//日期过滤器
Vue.filter('date', function (value) {
   return xunSoft.helper.formatDate(value);
})

//时间过滤器
Vue.filter('dateTime', function (value) {
   return xunSoft.helper.formatDateTime(value);
})

//折扣率/税率
Vue.filter('discountRate',function(value){
	if(_.isNumber(value)){
		return (value/100).toFixed(2);
	}
	if(_.isString(value)){
		var newVal=parseFloat(value);
		return (newVal/100).toFixed(2)
	}
	return 0;
});

//获取对象的属性
Vue.filter('prop',function(obj,prop){
	var val='';
	if(obj && prop){
		val=obj[prop];
		if(!val){
			val='';
		}
	}

	return val;
});	

//盘点级别
Vue.filter('Level',function(value){
	var key='';
	if (value=="0") {
		key="全部";
	}
	if (value=="1") {
		key="SKU";
	}
	if (value=="2") {
		key="货号盘点";
	}
	return key;
});
//问题转换
Vue.filter('Solve',function(value){
	key="";
	if (value=="0") {
		key="未解决";
	}
	if (value=="1") {
		key="已解决";
	}
	return key;
})

//货品价格Key
Vue.filter('kindPirceKey',function(value){
	var displayKey='';

	if(value=="purchase-price"){
		displayKey="采购单价";
	}
	if(value=="purchase-cost"){
		displayKey="成本价";
	}
	if(value=="sale-member"){
		displayKey="会员价";
	}
	if(value=="sale-price"){
		displayKey="零售价";
	}
	if(value=="1"){
		displayKey="一级批发价";
	}
	if(value=="2"){
		displayKey="二级批发价";
	}
	if(value=="3"){
		displayKey="三级批发价";
	}
	if(value=="4"){
		displayKey="四级批发价";
	}
	if(value=="5"){
		displayKey="五级批发价";
	}


	return displayKey;
});

//货品价格过滤器
Vue.filter('kindPrice',function(priceList,key){
	var returnPrice=0;

	if(_.isArray(priceList)){
		var price=_.find(priceList,function(item){ return item.itemKey==key; });
		if(price){
			returnPrice=price.value;
		}
	}

	return returnPrice;
});

//数组筛选 
Vue.filter('arraySkip',function(array,skip,index){
	var skipCount=0,indexVal=0,result=[];
	if(!_.isNumber(skip)){
		skipCount=parseInt(skip) || 3;
	}else{
		skipCount=skip;
	}
	if(!_.isNumber(index)){
		indexVal=parseInt(index) || 0;
	}else{
		indexVal=index;
	}

	for (var i = 0; i < array.length; i+=skipCount) {
		if(array[i+indexVal]){
			result.push(array[i+indexVal]);
		}else{
			break;
		}
	}

	return result;
});


//数组统计
Vue.filter('arraySum',function(array,prop){
	var sum=0;

	if(_.isArray(array)){
		_.each(array,function(item){
			sum+=( parseFloat(item[prop]) || 0  );
		});
	}

	return sum;
});
