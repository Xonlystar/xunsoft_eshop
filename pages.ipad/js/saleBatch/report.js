//进货--统计分析
eShop.onPageInit('saleBatch_report_index', function(page) {
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
			}
		},
		methods: {
			init: function() {
				vm.load(1);
				pageDiv.find(".tab-link.button").on("click", function(ele) {
					var temp = $$(this);
					var index = parseInt(temp.attr("href").slice(1));
					temp.addClass("active");
					temp.siblings().removeClass("active");
					vm.load(index);
				});
			},
			load: function(n) {
				if(n!=3){
				_.extend(vm.request.query, xunSoft.helper.getFormatDate(n));	
				}

				//vm.request.query.startTime = xunSoft.helper.formatDate(new Date().setYear(2016));

				reportService.get.getSaleDefaultReport(vm.request, {}, function(responseData) {
					var temp = [];
					_.each(responseData.data, function(item) {
						temp[item.name] = item.value;
					});

					var t = '';
					switch(n) {
						case 0:
							{
								t = "本周";
								break;
							}
						case 1:
							{
								t = "本月";
								break;
							}
						case 2:
							{
								t = "本季";
								break;
							}
					}
					var data = [
						{ "name": t+"销售", "value": temp['saleMoney'], "count": temp['salecount'] },
						{
							"name": t+"出货",
							"value": temp['deliverMoney'],
							"count": temp['delivercount']
						},
						{
							"name": t+"退货",
							"value": temp['returnMoney'],
							"count": temp['returnCount']
						},
						{
							"name": t+"零售",
							"value": temp['returnMoney'],
							"count": temp['returnCount']
						},
						{ "name": t+"收款金额", "value": temp['payMoney'] },
						{ "name": t+"新会员", "value": temp['memberCardCount'] },
					];
					xunSoft.paint.paintPie(pageDiv, "销售汇总", "#saleBatch_report", data);
				});
				reportService.get.getSaleBatchBySupplier(vm.request, {}, function(responseData) {
					vm.dealReportResult(responseData, 'supplierName', "销售汇总", "#getSaleBatchBySupplier");
				});
				reportService.get.getSaleReturnOrderByKind(vm.request, {}, function(responseData) {
					vm.dealReportResult(responseData, 'kindName', "退货汇总", "#saleReturnOrderByKind");
				});
				reportService.get.getSaleReturnOrderBySupplier(vm.request, {}, function(responseData) {
					vm.dealReportResult(responseData, 'supplierName', "退货汇总", "#saleReturnOrderBySupplier");
				});
				reportService.get.getSaleReceiptByCostType(vm.request, {}, function(responseData) {
					vm.dealReportResult(responseData, 'expendItemName', "付款汇总", "#saleReceiptByCostType");
				});
				reportService.get.getSaleReceiptBySupplier(vm.request, {}, function(responseData) {
					vm.dealReportResult(responseData, 'supplierName', "付款汇总", "#saleReceiptBySupplier");
				});
				reportService.get.getSaleByMemberCardId(vm.request, {}, function(responseData) {
					vm.dealReportResult(responseData, 'kindName', "零售汇总", "#saleByMemberCardId");
				});
				reportService.get.getSaleRetailhByKind(vm.request, {}, function(responseData) {
					vm.dealReportResult(responseData, 'kindName', "零售汇总", "#saleRetailhByKind");
				});
			},
			dealReportResult: function(responseData, xIndex, tip, id) {
				if(_.isArray(responseData.data)) {
					if(responseData.data.length > 0 && responseData.data.length <= 5) {
						var data = [];
						_.each(responseData.data, function(item) {
							data.push({ name: item[xIndex], value: item['payMoney'], count: item['totalCount'] });
						});
						xunSoft.paint.paintPie(pageDiv, tip, id, data);
						return;
					}
					if(responseData.data.length > 5 && responseData.data.length <= 10) {
						var dataX = _.map(responseData.data, function(item) { return item[xIndex] });
						var dataY = _.map(responseData.data, function(item) { return item['payMoney'] });
						var tooltip = _.map(responseData.data, function(item) { return item['totalCount'] });
						xunSoft.paint.paintBar(pageDiv, tip, id, dataX, dataY, tooltip);
						return;
					}
					if(responseData.data.length > 10) {
						var dataX = _.map(responseData.data, function(item) { return item[xIndex] });
						var dataY = _.map(responseData.data, function(item) { return item['payMoney'] });
						var tooltip = _.map(responseData.data, function(item) { return item['totalCount'] });
						xunSoft.paint.paintLine(pageDiv, tip, id, dataX, dataY, tooltip);
						return;
					}
				} else {
					xunSoft.helper.showMessage("服务器返回数据不是数组");
				}
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