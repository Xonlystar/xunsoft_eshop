//筛选
eShop.onPageInit('purchase_common_filter', function(page) {

	var pageDiv = $$(page.container);

	//视图模型
	var vm = new Vue({
		el: page.container,
		data: {
			request: {
				supplierId: '',
				createTimeFrom: '',
				createTimeTo: '',
				status: '',
				creatorId: '',
				sponsorId: '',
				auditorId: '',
			},
			response: {
				suppliers: baseInfoService.suppliers,
				users: baseInfoService.users,
				orderState: baseInfoService.orderStates
			}
		},
		watch: {
            "request.supplierId": function (val, oldVal) {
                xunSoft.event.smartSelect("#supplierId");
            },
             "request.status": function (val, oldVal) {
                xunSoft.event.smartSelect("#status");
            },
             "request.creatorId": function (val, oldVal) {
                xunSoft.event.smartSelect("#creatorId");
            },
             "request.sponsorId": function (val, oldVal) {
                xunSoft.event.smartSelect("#sponsorId");
            },
             "request.auditorId": function (val, oldVal) {
                xunSoft.event.smartSelect("#auditorId");
            }
        },
		methods: {
			init: function() {

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
					_.extend(vm.request, page.query.para);
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
				vm.request.supplierId = vm.request.createTimeFrom = vm.request.createTimeTo = vm.request.status = vm.request.creatorId = vm.request.sponsorId = vm.request.auditorId = '';
			}
		}

	});

	vm.init();

});

//打印
eShop.onPageInit('purchase_common_print', function(page) {
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
					//采购单
					if(page.query.orderType == "purchase") {
						this.printPurchase();
					}
					//收货单
					if(page.query.orderType == "receive") {
						this.printReceive();
					}
					//退货单
					if(page.query.orderType == "return") {
						this.printReturn();
					}
					//付款单
					if(page.query.orderType == "pay") {
						this.printPay();
					}
				}

			},
			//采购订单打印
			printPurchase: function() {
				purchaseService.get.getPurchaseOrderDetail(vm.request, {}, function(responseDate) {
					var enter = vm.response.enter;

					var printStr=""; //vm.center(responseDate.data.creatorName+",欢迎您!");
					
					printStr+=enter+"采购订单号:"+responseDate.data.purchaseOrderNo;
					printStr+=enter+"供应商:"+responseDate.data.supplierName;
					printStr+=enter+"下单日期:"+xunSoft.helper.formatDate(responseDate.data.placeDate);
					printStr+=enter+"订单交期:"+xunSoft.helper.formatDate(responseDate.data.deliverDate);
					printStr+=enter+"预付金额:"+ responseDate.data.advanceMoney.toFixed(2);
					printStr+=enter+"采购总数:"+responseDate.data.detailSummary.purchaseAmount;
					printStr+=enter+"采购总额:"+responseDate.data.detailSummary.purchaseMoney.toFixed(2);
					printStr+=enter+"经手人:"+responseDate.data.creatorName+enter+enter;

					printStr+="-----------采购货品信息-----------";
					_.each(responseDate.data.detailList,function(item){
						printStr+=enter+"名称:"+item.kindName;
						printStr+=enter+"颜色:"+item.colorName+"  尺码:"+item.sizeText;
						printStr+=enter+"采购价:"+item.purchasePrice.toFixed(2)+"  数量:"+item.purchaseAmount;
						printStr+=enter+"税率:"+item.taxRate+"  税额:"+item.taxMoney;
						printStr+=enter+"折扣:"+item.discountRate+"   总金额:"+(item.purchasePrice-item.taxMoney).toFixed(2);
						printStr+=enter+"-----------------------------------------";
								
					});
					printStr += enter + "打印时间:" + xunSoft.helper.formatDateTime(new Date());
					vm.response.printStr = printStr;
				})
			},
			//收货单
			printReceive: function() {
				purchaseService.get.getReceiveOrderDetail(vm.request, {}, function(responseDate) {
					var enter = vm.response.enter;

					var printStr=""; //vm.center(responseDate.data.creatorName+",欢迎您!");
					printStr+=enter+"收货订单号:"+responseDate.data.receiveOrderNo;
					printStr+=enter+"供应商:"+responseDate.data.supplierName;
					printStr+=enter+"日期:"+xunSoft.helper.formatDate(responseDate.data.receiveDate);
					printStr+=enter+"付款金额:"+responseDate.data.advanceMoney.toFixed(2);
					printStr+=enter+"经手人:"+responseDate.data.creatorName+enter+enter;

					printStr+="--------收货货品信息--------";
					_.each(responseDate.data.detailList,function(item){
						printStr+=enter+"名称:"+item.kindName;
						printStr+=enter+"颜色:"+item.colorName+"  尺码:"+item.sizeText;
						printStr+=enter+"收货价:"+item.receivePrice.toFixed(2)+"  数量:"+item.receiveAmount;
						printStr+=enter+"税率:"+item.taxRate+"  税额:"+item.taxMoney.toFixed(2);
						printStr+=enter+"折扣:"+item.discountRate+"  总金额:"+(item.receivePrice-item.taxMoney).toFixed(2);
						printStr+=enter+"-----------------------------------------";
				
					});
					printStr += enter + "打印时间:" + xunSoft.helper.formatDateTime(new Date());
					vm.response.printStr = printStr;
				})
			},
			//退货单
			printReturn: function() {
				purchaseService.get.getReturnOrderDetail(vm.request, {}, function(responseDate) {
					var enter = vm.response.enter;

					var printStr=""; //vm.center(responseDate.data.creatorName+",欢迎您!");
					printStr+=enter+"退货订单号:"+responseDate.data.returnOrderNo;
					printStr+=enter+"供应商:"+responseDate.data.supplierName;
					printStr+=enter+"日期:"+xunSoft.helper.formatDate(responseDate.data.returnDate);
					if (responseDate.data.accountName) {
						printStr+=enter+"结算账户:"+responseDate.data.accountName;
						printStr+=enter+"本次退款:"+responseDate.data.advanceMoney.toFixed(2);
					}
					printStr+=enter+"经手人:"+responseDate.data.creatorName+enter+enter;

					printStr+="--------退货货品信息--------";
					_.each(responseDate.data.detailList,function(item){
						printStr+=enter+"名称:"+item.kindName;
						printStr+=enter+"颜色:"+item.colorName+"  尺码:"+item.sizeText;
						printStr+=enter+"退货价:"+item.returnPrice.toFixed(2)+"  数量:"+item.returnAmount;
						printStr+=enter+"税率:"+item.taxRate+"  税额:"+item.taxMoney.toFixed(2);
						printStr+=enter+"折扣:"+item.discountRate+"   总金额:"+(item.returnPrice-item.taxMoney).toFixed(2);
						printStr+=enter+"-----------------------------------------";
								
					});
					printStr += enter + "打印时间:" + xunSoft.helper.formatDateTime(new Date());
					vm.response.printStr = printStr;
				})
			},
			//付款单
			printPay: function() {
				purchaseService.get.getPayOrderDetail(vm.request, {}, function(responseDate) {
					var enter = vm.response.enter;

					var printStr=""; //vm.center(responseDate.data.creatorName+",欢迎您!");
					printStr+=enter+"付款单号:"+responseDate.data.payOrderNo;
					printStr+=enter+"收款单位:"+responseDate.data.supplierName;
					printStr+=enter+"日期:"+xunSoft.helper.formatDate(responseDate.data.payDate);
					printStr+=enter+"支出类型:"+responseDate.data.costTypeName;
					printStr+=enter+"经手人:"+responseDate.data.creatorName+enter+enter;

					printStr+="--------付款单据信息--------";
					_.each(responseDate.data.sourceDetailList,function(item){
						printStr+=enter+"付款单号:"+item.sourceNo;
						printStr+=enter+"日期:"+item.sourceDate;
						printStr+=enter+"单据类型:"+item.sourceTypeName;
						printStr+=enter+"单据金额:"+item.sumMoney.toFixed(2)+"  本次付款额:"+item.payMoney.toFixed(2);
						printStr+=enter+"---------------------------------"+enter+enter;
								
					});
					printStr += enter + "--------付款账户信息--------";
					_.each(responseDate.data.detailList, function(item) {
						printStr += enter + "账户名称:" + item.accountName;
						printStr += enter + "账户代码:" + item.accountCode;
						printStr += enter + "付款金额:" + item.payMoney.toFixed(2) + "  手续费:" + item.feeMoney.toFixed(2);
						printStr += enter + "支出金额:" + item.accountingMoney.toFixed(2) + "  备注:" + item.description;
						printStr += enter + "-----------------------------------------";
								
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

//首页
eShop.onPageInit('purchase_default', function(page) {

	var pageDiv = $$(page.container);

	var vm = new Vue({
		el: page.container,
		data: {
			request: {
				query: {
					tenantId: xunSoft.user.tenantId(),
					shopId: xunSoft.user.shopId(),
					startTime: "",
					endTime: "",
				}
			},
			response: {
				payMoney: 0,
				purchaseCount: 0,
				purchaseMoney: 0,
				receiveCount: 0,
				receiveMoney: 0,
				returnCount: 0,
				returnMoney: 0	
			}
		},
		methods: {
			init: function() {
				_.extend(vm.request.query, xunSoft.helper.getFormatDate(1));
				reportService.get.getPurchaseDefaultReport(vm.request, vm.response);
			},
			select: function(url) {
				if(url) {
					mainView.router.load({
						url: url
					});
				}
			}
		}
	});

	vm.init();
    
});