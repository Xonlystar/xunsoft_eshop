//库存过滤
eShop.onPageInit('warehouse_common_filter', function(page) {
	var pageDiv = $$(page.container);

	//视图模型
	var vm = new Vue({
		el: page.container,
		data: {
			request: {
				checkStockLevelId: '',
				createTimeFrom: '',
				fromWarehouseId:'',
				toWarehouseId:'',
				createTimeTo: '',
				status: '',
				creatorId: '',
				sponsorId: '',
				auditorId: '',
			},
			response: {
				users: baseInfoService.users,
				orderState: baseInfoService.orderStates,
				transfers: baseInfoService.storehouse,
				type: '',
				checkLevels:[]		
			}
		},
		watch:{
            "request.fromWarehouseId":function(val, oldVal){
               xunSoft.event.smartSelect("#fromWarehouseId");
			},
			  "request.checkStockLevelId":function(val, oldVal){
               xunSoft.event.smartSelect("#checkStockLevelId");
			},
			  "request.toWarehouseId":function(val, oldVal){
               xunSoft.event.smartSelect("#toWarehouseId");
			},
			  "request.status":function(val, oldVal){
               xunSoft.event.smartSelect("#status");
			},
			  "request.creatorId":function(val, oldVal){
               xunSoft.event.smartSelect("#creatorId");
			},
			  "request.sponsorId":function(val, oldVal){
               xunSoft.event.smartSelect("#sponsorId");
            },
			  "request.auditorId":function(val, oldVal){
               xunSoft.event.smartSelect("#auditorId");
            }
			
        },
		methods: {
			init: function() {
				vm.response.type = page.query.type;
				 this.response.checkLevels.push({levelId:0,levelName:"全部"});
				 this.response.checkLevels.push({levelId:1,levelName:"SKU"})
				 this.response.checkLevels.push({levelId:2,levelName:"货号盘点"})
				eShop.calendar({
					input: pageDiv.find("#startDate"),
					minDate: (new Date(2015, 1, 1)),
					maxDate: (new Date())
				});
				eShop.calendar({
					input: pageDiv.find("#endDate"),
					minDate: (new Date(2015, 1, 1)),
					maxDate: (new Date())
				});

				if(page.query.para) {
					if(page.query.type == 0) {
						var newrequest = {
							createTimeFrom: '',
							createTimeTo: '',
							status: '',
							creatorId: '',
							sponsorId: '',
							auditorId: '',
						}
						_.extend(newrequest, page.query.para);
					} else {
						_.extend(vm.request, page.query.para);
					}
					
				}
			},
			save: function() {

				if(page.query.para) {
					_.extend(page.query.para, vm.request);
				}
				mainView.router.back();
				if(_.isFunction(page.query.callback)) {
					page.query.callback();
				}
			},
			clear: function() {
				vm.request.fromWarehouseId
				=vm.request.toWarehouseId
				=vm.request.supplierId
				=vm.request.createTimeFrom 
				= vm.request.createTimeTo 
				= vm.request.status 
				= vm.request.checkStockLevelId
				= vm.request.creatorId
				= vm.request.sponsorId
				= vm.request.auditorId = '';
			}
		}

	});

	vm.init();
});

//打印
eShop.onPageInit('warehouse_common_print', function(page) {
	var pageDiv = $$(page.container);

	var vm = new Vue({
		el: page.container,
		data: {
			request: {
				tenantId: xunSoft.user.tenantId(),
				id: 0
			},
			response: {
				enter: '<br/>',
				printStr: ''
			}
		},
		methods: {
			init: function() {
				if(page.query.orderId) {
					vm.request.id = page.query.orderId;
					//损益单
					if(page.query.orderType == "profitLoss") {
						this.printProfitLoss();
					}
					//库存盘点单
					if(page.query.orderType == "checkStock") {
						this.printCheckStock();
					}
	                //调拨单
					if(page.query.orderType == "shopTransfer") {
						this.printShopTransfer();
					}

				}

			},
			//益损订单打印
			printProfitLoss: function() {
				warehouseService.get.getProfitLossOrderDetail(vm.request, {}, function(responseDate) {
					var enter = vm.response.enter;

					var printStr = vm.center("demo欢迎您!");
					printStr += enter + "益损单号:" + responseDate.data.profitLossOrderNo;
					printStr += enter + "原始单号:" + responseDate.data.sourceOrderNo;
					printStr += enter + "日期:" + xunSoft.helper.formatDate(responseDate.data.profitLossDate);
					printStr += enter + "益损总数:" + responseDate.data.detailSummary.profitLossAmount;
					printStr += enter + "益损总额:" + responseDate.data.detailSummary.profitLossMoney;
					printStr += enter + "经手人:" + responseDate.data.sponsorName + enter + enter;

					printStr += "--------益损货品信息--------";
					_.each(responseDate.data.detailList, function(item) {
						printStr += enter + "名称:" + item.kindName;
						printStr += enter + "颜色:" + item.colorName + "  尺码:" + item.sizeText;
						printStr += enter + "成本价:" + item.retailPrice + "  数量:" + item.profitLossAmount;
						printStr += enter + "总额:" + item.profitLossMoney + "  库存:" + item.inventory;
						printStr += enter + "-----------------------";

					});
					printStr += enter + "打印时间:" + xunSoft.helper.formatDateTime(new Date());
					vm.response.printStr = printStr;
				})
			},
			//库存盘点单
			printCheckStock: function() {
				warehouseService.get.getCheckStockOrderDetail(vm.request, {}, function(responseDate) {
					var enter = vm.response.enter;
					var myFilter = Vue.filter('Level')
					var printStr = vm.center("demo欢迎您!");
					printStr += enter + "盘点单号:" + responseDate.data.checkStockOrderNo;
					printStr += enter + "盘点级别:" + myFilter(responseDate.data.checkStockLevelId);
					printStr += enter + "日期:" + xunSoft.helper.formatDate(responseDate.data.checkStockDate);
					printStr += enter + "经手人:" + responseDate.data.sponsorName + enter + enter;

					printStr += "----库存货品信息----";
					_.each(responseDate.data.detailList, function(item) {
						printStr += enter + "名称:" + item.kindName;
						printStr += enter + "颜色:" + item.colorName + "  尺码:" + item.sizeText;
						printStr += enter + "账面数量:" + item.accountAmount;
						printStr += enter + "盘点数量:" + item.checkAmount;
						printStr += enter + "盈亏数量:" + item.profitLossAmount;
						printStr += enter + "-----------------------";

					});
					printStr += enter + "打印时间:" + xunSoft.helper.formatDateTime(new Date());
					vm.response.printStr = printStr;
				})
			},
			//调拨单打印
			printShopTransfer: function() {
				warehouseService.get.getShopTransferDetail(vm.request, {}, function(responseDate) {
					var enter = vm.response.enter;
					var myFilter = Vue.filter('Level')
					var printStr = vm.center("demo欢迎您!");
					printStr += enter + "调拨单号:" + responseDate.data.transferOrderNo;
					printStr += enter + "调出仓库:" + myFilter(responseDate.data.fromWarehouseName);
					printStr += enter + "调入仓库:" + myFilter(responseDate.data.toWarehouseName);
					printStr += enter + "日期:" + xunSoft.helper.formatDate(responseDate.data.transferDate);
					printStr += enter + "经手人:" + responseDate.data.sponsorName + enter + enter;

					printStr += "----库存货品信息----";
					_.each(responseDate.data.detailList, function(item) {
						printStr += enter + "名称:" + item.kindName;
						printStr += enter + "颜色:" + item.colorName + "  尺码:" + item.sizeText;
						printStr += enter + "调拨数量:" + item.transferAmount;
						printStr += enter + "-----------------------";

					});
					printStr += enter + "打印时间:" + xunSoft.helper.formatDateTime(new Date());
					vm.response.printStr = printStr;
				})
			},
			center: function(value) {
				var _newStr = value;
				if(value.length < 18) {
					var newLength = (20 - value.length) / 2;
					for(var i = 0; i <= newLength; i++) {
						_newStr = "&nbsp;" + _newStr;
					}
				}
				return _newStr;
			},
			print:function(){
				xunSoft.device.bluetoothle.write(vm.response.printStr,function(){
					mainView.router.back();
				},function(){
					xunSoft.helper.showMessage('打印失败，请重新打印！');
				})
			}
		}
	});

	vm.init();

});