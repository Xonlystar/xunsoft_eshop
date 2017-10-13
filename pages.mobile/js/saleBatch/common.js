//通用过滤选择页面
eShop.onPageInit('saleBatch_common_filter', function(page) {
	var pageDiv = $$(page.container);

	//视图模型
	var vm = new Vue({
		el: page.container,
		data: {
			request: {
				customerId: '',
				createTimeFrom: '',
				createTimeTo: '',
				status: '',
				creatorId: '',
				sponsorId: '',
				auditorId: '',
			},
			response: {
				customers: baseInfoService.customers,
				users: baseInfoService.users,
				orderState: baseInfoService.orderStates
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
				vm.request.customerId = vm.request.createTimeFrom = vm.request.createTimeTo = vm.request.status = vm.request.creatorId = vm.request.sponsorId = vm.request.auditorId = '';
			}
		}
	});

	vm.init();
})


//打印
eShop.onPageInit('saleBatch_common_print', function(page) {
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
					//出货单
					if(page.query.orderType == "deliver") {
						this.printDeliverOrder();
					}
					//收款单
					if(page.query.orderType == "receiptOrder") {
						this.printReceiptOrder();
					}
					//客户退货单
					if(page.query.orderType == "returnOrder") {
						this.printReturn();
					}
					//销售单
					if(page.query.orderType == "saleOrder") {
						this.printSaleOrder();
					}
					//零售单
					if(page.query.orderType == "saleRetailOrder") {
						this.printSaleRetailOrder();
					}

				}

			},
			//出货单
			printDeliverOrder: function() {
				saleService.get.getDeliverOrderDetail(vm.request, {}, function(responseDate) {
					var enter = vm.response.enter;
					var printStr=""; //vm.center(responseDate.data.sponsorName+",欢迎您!");
					
					printStr += enter + "出货单号:" + responseDate.data.deliverOrderNo;
					printStr += enter + "出货客户:" + responseDate.data.customerName;
					printStr += enter + "出货日期:" + xunSoft.helper.formatDate(responseDate.data.deliverDate);
					if(responseDate.data.accountName) {
						printStr += enter + "收款账户:" + responseDate.data.accountName;
					}
					printStr += enter + "出货总量:" + responseDate.data.detailSummary.deliverAmount;
					printStr += enter + "出货总额:" + responseDate.data.detailSummary.deliverMoney.toFixed(2);
					printStr += enter + "经手人:" + responseDate.data.sponsorName + enter + enter;

					printStr += "--------出货货品信息--------";
					_.each(responseDate.data.detailList, function(item) {
						printStr += enter + "名称:" + item.kindName + "  货号:" + item.kindNo;
						printStr += enter + "颜色:" + item.colorName + "  尺码:" + item.sizeText;
						printStr += enter + "批发价:" + item.wholesalePrice.toFixed(2) + "  数量:" + item.deliverAmount;
						printStr += enter + "折扣:" + item.discountRate + "    总金额:" + item.deliverMoney.toFixed(2);
						printStr += enter + "-----------------------";

					});

					printStr += enter + "打印时间:" + xunSoft.helper.formatDateTime(new Date());
					vm.response.printStr = printStr;
				})
			},
			//收款单
			printReceiptOrder: function() {
				saleService.get.getReceiptOrderDetail(vm.request, {}, function(responseDate) {
					var enter = vm.response.enter;

					var printStr =""; // vm.center("demo欢迎您!");
					printStr += enter + "收款单号:" + responseDate.data.receiptOrderNo;
					printStr += enter + "收款客户:" + responseDate.data.customerName;
					printStr += enter + "收款日期:" + xunSoft.helper.formatDate(responseDate.data.receiptDate);
					printStr += enter + "收款类型:" + responseDate.data.costTypeName;
					printStr += enter + "经手人:" + responseDate.data.sponsorName + enter + enter;

					printStr += "--------收款单据信息--------";
					_.each(responseDate.data.sourceDetailList, function(item) {
						printStr += enter + "收款单号:" + item.sourceNo;
						printStr += enter + "日期:" + xunSoft.helper.formatDate(item.sourceDate);
						printStr += enter + "单据类型:" + item.sourceTypeName;
						printStr += enter + "单据金额:" + item.sumMoney.toFixed(2) + "  本次收款:" + item.receiptMoney.toFixed(2);
						printStr += enter + "-----------------------" + enter + enter;

					});
					printStr += enter + "--------收款账户信息--------";
					_.each(responseDate.data.detailList, function(item) {
						printStr += enter + "账户名称:" + item.accountName;
						printStr += enter + "账户代码:" + item.accountCode;
						printStr += enter + "收款金额:" + item.receiptMoney.toFixed(2);
						printStr += enter + "-----------------------";

					});
					printStr += enter + "打印时间:" + xunSoft.helper.formatDateTime(new Date());
					vm.response.printStr = printStr;
				})
			},
			//客户退货单
			printReturn: function() {
				saleService.get.getReturnDetail(vm.request, {}, function(responseDate) {
					var enter = vm.response.enter;

					var printStr = ""; //vm.center("demo欢迎您!");
					printStr += enter + "退货订单号:" + responseDate.data.returnOrderNo;
					printStr += enter + "退货客户:" + responseDate.data.customerName;
					printStr += enter + "日期:" + xunSoft.helper.formatDate(responseDate.data.returnDate);
					printStr += enter + "退货总量:" + responseDate.data.detailSummary.returnAmount;
					printStr += enter + "退货总额:" + responseDate.data.detailSummary.returnMoney.toFixed(2);
					if(responseDate.data.accountName) {
						printStr += enter + "退款账户:" + responseDate.data.accountName;
						printStr += enter + "本次退款:" + responseDate.data.advanceMoney.toFixed(2);
					}
					printStr += enter + "经手人:" + responseDate.data.sponsorName + enter + enter;

					printStr += "--------退货货品信息--------";
					_.each(responseDate.data.detailList, function(item) {
						printStr += enter + "名称:" + item.kindName;
						printStr += enter + "颜色:" + item.colorName + "  尺码:" + item.sizeText;
						printStr += enter + "批发价:" + item.wholesalePrice.toFixed(2) + "  数量:" + item.returnAmount;
						printStr += enter + "折扣:" + item.discountRate + "    总金额:" + item.returnMoney.toFixed(2);
						printStr += enter + "-----------------------";

					});
					printStr += enter + "打印时间:" + xunSoft.helper.formatDateTime(new Date());
					vm.response.printStr = printStr;
				})
			},
			//销售单
			printSaleOrder: function() {
				saleService.get.getSaleOrderDetail(vm.request, {}, function(responseDate) {
					var enter = vm.response.enter;

					var printStr = ""; //vm.center(responseDate.data.sponsorName+"欢迎您!");
					printStr += enter + "销售单号:" + responseDate.data.saleOrderNo;
					printStr += enter + "销售客户:" + responseDate.data.customerName;
					printStr += enter + "定金金额:" + responseDate.data.advanceMoney.toFixed(2);
					printStr += enter + "订单日期:" + xunSoft.helper.formatDate(responseDate.data.placeDate);
					printStr += enter + "订单交期:" + xunSoft.helper.formatDate(responseDate.data.deliverDate);
					printStr += enter + "销售数量:" + responseDate.data.detailSummary.saleAmount;
					printStr += enter + "销售金额:" + responseDate.data.detailSummary.saleMoney.toFixed(2);
					printStr += enter + "经手人:" + responseDate.data.sponsorName + enter + enter;

					printStr += "--------销售货品信息--------";
					_.each(responseDate.data.detailList, function(item) {
						printStr += enter + "名称:" + item.kindName;
						printStr += enter + "颜色:" + item.colorName + "  尺码:" + item.sizeText;
						printStr += enter + "批发价:" + item.wholesalePrice.toFixed(2) + "  数量:" + item.saleAmount;
						printStr += enter + "折扣:" + item.discountRate + "    总金额:" + item.saleMoney.toFixed(2);
						printStr += enter + "-----------------------";

					});
					printStr += enter + "打印时间:" + xunSoft.helper.formatDateTime(new Date());
					vm.response.printStr = printStr;
				})
			},
			//零售单
			printSaleRetailOrder: function() {
				saleRetailService.get.getSaleOrderDetail(vm.request, {}, function(responseDate) {
					var enter = vm.response.enter;

					var printStr = ""; //vm.center(responseDate.data.sponsorName+"欢迎您!");
					printStr += enter + "零售单号:" + responseDate.data.saleOrderNo;
					printStr += enter + "零售日期:" + xunSoft.helper.formatDate(responseDate.data.saleDate);
					if(responseDate.data.memberCard_MemberName) {
						printStr += enter + "会员信息:" + responseDate.data.memberCard_MemberName;
					}
					printStr += enter + "销售金额:" + responseDate.data.detailSummary.saleMoney.toFixed(2);
					printStr += enter + "促销金额:" + responseDate.data.detailSummary.performanceMoney.toFixed(2);
					printStr += enter + "应收金额:" + responseDate.data.detailSummary.saleMoney.toFixed(2);
					printStr += enter + "积分抵扣:" + responseDate.data.accountScoreMoney;
					printStr += enter + "代金券:" + responseDate.data.accountTicketMoney;
					printStr += enter + "实收金额:" + responseDate.data.detailSummary.actualMoney.toFixed(2);
					printStr += enter + "经手人:" + responseDate.data.sponsorName + enter + enter;
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
			}
		}
	});

	vm.init();

});

//销售首页
eShop.onPageInit('saleBatch_default', function(page) {

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
				deliverycount: 0,//出货数量
				deliveryMoney: 0,//出货金额
				memberCardCount:0,//会员个数
				payMoney: 0, //收款金额
				returnCount: 0,//退货数量
				returnMoney: 0,//退货金额
				saleMoney: 0,//销售金额
				saleCount: 0,//销售数量
				saleRetailCount: 0,//零售总数量 
				saleRetailMoney: 0//零售总金额
			}
		},
		methods: {
			init: function() {
				var mySwiperSlow = eShop.swiper('.swiper-slow', {
				  pagination:'.swiper-slow .swiper-pagination',
				  speed: 600
				});  
				_.extend(vm.request.query, xunSoft.helper.getFormatDate(2));
				reportService.get.getSaleDefaultReport(vm.request, vm.response);
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