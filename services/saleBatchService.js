var saleService = {

	get: {
		//销售模块首页统计信息
        getMobileSaleBatch: function(request, response, success, error) {
			xunSoft.ajax.get('Report/SaleBatchReport/GetMobileSale', request, function(responseData) {
                if (_.isArray(responseData.data) && responseData.data.length > 0) {
                    response.mobileSaleBatch = responseData.data;
				}
                if (_.isFunction(success)) {
					success(responseData);
				}
			}, function() {
                if (_.isFunction(error)) {
					error();
				}
			});
		},
		//获取销售订单列表
		getSaleOrderList: function(request, response, success, fail) {
			xunSoft.ajax.get('SaleBatch/SaleOrder/List', request, function(responseData) {
				if(_.isArray(responseData.data) && _.isArray(response.data)) {
					if(responseData.data.length > 0) {
						//设置请求响应参数
						request.pageIndex++;
						response.total = responseData.total;

						//过滤返回的结果
						_.each(responseData.data, function(item) {
							var newSaleOrder = _.pick(item, 'saleOrderId', 'saleOrderNo', 'customerName',
								'deliverDate', 'placeDate', 'detailSummary', 'creatorId', 'createTime', 'creatorName', 'sponsorName');

							newSaleOrder.flag = 'L';
							if(item.submitTime) {
								newSaleOrder.flag = "T"
							}
							if(item.auditTime) {
								newSaleOrder.flag = "S";
							}

							if(!tempResult[newSaleOrder.placeDate]){tempResult[newSaleOrder.placeDate]=[]}
								tempResult[newSaleOrder.placeDate].push(newSaleOrder);
							});
					}
				}

				if(_.isFunction(success)) {
					success(responseData);
				}

			}, fail);
		},
		//获取销售订单明细
		getSaleOrderDetail: function(request, response, success, fail) {
			xunSoft.ajax.get('SaleBatch/SaleOrder/Detail', request, function(responseData) {
				response.data = responseData.data;
				if(_.isFunction(success)) {
					success(responseData);
				}
			}, fail);
		},
		//获取出货单
		getDeliverOrderList: function(request, response, success, fail) {
			xunSoft.ajax.get('SaleBatch/DeliverOrder/List', request, function(responseData) {
				if(_.isArray(responseData.data) && _.isArray(response.data)) {
					if(responseData.data.length > 0) {
						//设置请求响应参数
						request.pageIndex++;
						response.total = responseData.total;
						var tempResult=[];
						//过滤返回的结果
						_.each(responseData.data, function(item) {
							var newDeliverOrder = _.pick(item, 'deliverOrderId', 'deliverOrderNo', 'customerName', 'deliverDate', 'detailSummary', 'creatorId', 'createTime', 'creatorName', 'sponsorName');

							newDeliverOrder.flag = 'L';
							if(item.submitTime) {
								newDeliverOrder.flag = "T"
							}
							if(item.auditTime) {
								newDeliverOrder.flag = "S";
							}

							if(!tempResult[newDeliverOrder.deliverDate]){tempResult[newDeliverOrder.deliverDate]=[]}
									tempResult[newDeliverOrder.deliverDate].push(newDeliverOrder);
							});
							for(var o in tempResult){
								response.data.push({time:o,value:tempResult[o]})
							}
					}
				}
				if(_.isFunction(success)) {
					success(responseData);
				}
			}, fail);
		},
		//获取出货单明细
		getDeliverOrderDetail: function(request, response, success, fail) {
			xunSoft.ajax.get('SaleBatch/DeliverOrder/Detail', request, function(responseData) {
				response.data = responseData.data;
				if(_.isFunction(success)) {
					success(responseData);
				}
			}, fail);
		},
		//获取收款单列表
		getReceiptOrderList: function(request, response, success, fail) {
			xunSoft.ajax.get('SaleBatch/ReceiptOrder/List', request, function(responseData) {
                if(_.isArray(responseData.data) && responseData.data.length > 0) {
					//是否存在下一页
					if(request.pageIndex) {
						request.pageIndex++;
					}
					//总数量
						response.total = responseData.total;
					var tempResult=[];
					//将数据存入本地
					_.each(responseData.data, function(item) {

							//转换单据信息
					  var receiptOrder = _.pick(item, 'receiptOrderId', 'receiptOrderNo', 'customerName', 'detailSummary', 'sponsorName', 'receiptDate');

						receiptOrder.flag = 'L';
							if(item.submitTime) {
							receiptOrder.flag = 'T';
							}
							if(item.auditTime) {
							receiptOrder.flag = 'S';
							}
						if(!tempResult[receiptOrder.receiptDate]){tempResult[receiptOrder.receiptDate]=[]}
						tempResult[receiptOrder.receiptDate].push(receiptOrder);
						});
					for(var o in tempResult){
						response.data.push({time:o,value:tempResult[o]})
					}
				}
                if (_.isFunction(success)) {
					success(responseData);
				}
			}, fail);
		},
		//获取收款单明细
		getReceiptOrderDetail: function(request, response, success, fail) {
			xunSoft.ajax.get('SaleBatch/ReceiptOrder/Detail', request, function(responseData) {
                if (response.data) {
					response.data = responseData.data;
				}
                if (_.isFunction(success)) {
					success(responseData);
				}
			}, fail);
		},
		//获取需要收款的单据信息
		getReceiptOrderOrderList: function(request, response, success, fail) {
			xunSoft.ajax.get('SaleBatch/ReceiptOrder/ReceiptOrderList', request, success, fail);
		},
		//获取客户退货单列表
		getReturnOrderList: function(request, response, success, fail) {
			xunSoft.ajax.get('SaleBatch/Return/List', request, function(responseData) {
				if(_.isArray(responseData.data) && _.isArray(response.data)) {
					if(responseData.data.length > 0) {
						//设置请求响应参数
						request.pageIndex++;
						response.total = responseData.total;

						var tempResult=[];
						//过滤返回的结果
						_.each(responseData.data, function(item) {
							var newSaleOrder = _.pick(item, 'returnOrderId', 'returnOrderNo', 'customerName',
								'returnDate', 'detailSummary', 'createTime', 'creatorName');

							newSaleOrder.flag = 'L';
							if(item.submitTime) {
								newSaleOrder.flag = "T"
							}
							if(item.auditTime) {
								newSaleOrder.flag = "S";
							}

							if(!tempResult[newSaleOrder.returnDate]){tempResult[newSaleOrder.returnDate]=[]}
									tempResult[newSaleOrder.returnDate].push(newSaleOrder);
						});
							for(var o in tempResult){
								response.data.push({time:o,value:tempResult[o]})
							}
					}
				}

				if(_.isFunction(success)) {
					success(responseData);
				}

			}, fail);
		},
		//获取退货单详细信息
		getReturnDetail: function(request, response, success, fail) {
			xunSoft.ajax.get('SaleBatch/Return/Detail', request, function(responseData) {
				if(response) {
					response.data = responseData.data;
				}
				if(_.isFunction(success)) {
					success(responseData);
				}
			}, fail);
        },
        //获取客户列表
        getCustomerList: function(request, response, success, error) {
            xunSoft.ajax.get('SaleBatch/Customer/List', request, function(responseData) {
                if (response) {
                    response.data = responseData.data;
		}
                if (_.isFunction(success)) {
                    success(responseData);
                }
            }, function() {
                if (_.isFunction(error)) {
                    error(error);
                }
            });
	},
        //获取客户详情
        getCustomerDetail: function(request, response, success, error) {
            xunSoft.ajax.get('SaleBatch/Customer/Detail', request, function(responseData) {
                if (_.isObject(responseData.data) && response) {
                    response.data = responseData.data;
                }
                if (_.isFunction(success)) {
                    success(responseData);
                }
            }, function() {
                if (_.isFunction(error)) {
                    error();
                }
            });
        }
    },
	post: {
		//保存销售订单
		postSaleOrder: function(request, response, success, error) {
			xunSoft.ajax.post('SaleBatch/SaleOrder/Add', request, success, error);
		},
		//保存出货单
		postDeliverOrder: function(request, response, success, error) {
			xunSoft.ajax.post('SaleBatch/DeliverOrder/Add', request, success, error);
		},
		//保存客户信息
		postCustomer: function(request, response, success, error) {
			xunSoft.ajax.post('SaleBatch/Customer/Add', request, success, error);
		},
		//保存收款单
		postReceiptOrder: function(request, response, success, error) {
			xunSoft.ajax.post('SaleBatch/ReceiptOrder/Add', request, success, error);
		},
		//保存退货单
		postReturnOrder: function(request, response, success, error) {
			xunSoft.ajax.post('SaleBatch/Return/Add', request, success, error);
	},
        //添加客户
        postCustomer: function(request, response, success, error) {
            xunSoft.ajax.post('SaleBatch/Customer/Add', request, success, error);
        },

    },
	put: {
		//修改销售订单
		putSaleOrder: function(request, response, success, error) {
			xunSoft.ajax.put('SaleBatch/SaleOrder/Update', request, success, error);
		},
		//修改单据状态
		putSaleUpdateState: function(request, response, success, error) {
			xunSoft.ajax.put('SaleBatch/SaleOrder/UpdateState', request, success, error);
		},

		//修改销售单
		putDeliverOrder: function(request, response, success, error) {
			xunSoft.ajax.put('SaleBatch/DeliverOrder/Update', request, success, error);
		},
		//修改单据状态
		putDeliverUpdateState: function(request, response, success, error) {
			xunSoft.ajax.put('SaleBatch/DeliverOrder/UpdateState', request, success, error);
		},

		//修改收货单
		putReceiptOrder: function(request, response, success, error) {
			xunSoft.ajax.put('SaleBatch/ReceiptOrder/Update', request, success, error);
		},
		//修改单据状态
		putReceiptUpdateState: function(request, response, success, error) {
			xunSoft.ajax.put('SaleBatch/ReceiptOrder/UpdateState', request, success, error);
		},

		//修改退货
		putReturnOrder: function(request, response, success, error) {
			xunSoft.ajax.put('SaleBatch/Return/Update', request, success, error);
		},
		//修改单据状态
		putReturnUpdateState: function(request, response, success, error) {
			xunSoft.ajax.put('SaleBatch/Return/UpdateState', request, success, error);
	},
        //修改客户
        putCustomer: function(request, response, success, error) {
            xunSoft.ajax.put('SaleBatch/Customer/Update', request, success, error);
        },
    },
	delete: {
		//删除销售订单
		deleteSaleOrder: function(request, response, success, error) {
			xunSoft.ajax.delete('SaleBatch/SaleOrder/Delete', request, success, error);
		},
		//删除销售单
		deleteDeliverOrder: function(request, response, success, error) {
			xunSoft.ajax.delete('SaleBatch/DeliverOrder/Delete', request, success, error);
		},
		//删除收款单
		deleteReceiptOrder: function(request, response, success, error) {
			xunSoft.ajax.delete('SaleBatch/ReceiptOrder/Delete', request, success, error);
		},
		//删除退货单
		deleteReturnOrder: function(request, response, success, error) {
			xunSoft.ajax.delete('SaleBatch/Return/Delete', request, success, error);
        },
        //删除客户
        delelteCustomer: function(request, response, success, error) {
            xunSoft.ajax.delete('SaleBatch/Customer/Delete?id=' + request.id, request, success, error);
		}
	},
	utility: {
		//验证数据
		deliverValid: function(requestInfo) {
            if (!xunSoft.valid.validDataRange(requestInfo.wholesalePrice, -1)) {
				return '请输入合理的单价';
			}
			if (!xunSoft.valid.validNum(requestInfo.deliverAmount)) {
				return '数量只能为正整数';
			}
            if (!xunSoft.valid.validDataRange(requestInfo.deliverAmount, -1, 2147483647)) {
				return '请输入合理的数量';
			}
			
			
            /*if (!xunSoft.valid.validDataRange(requestInfo.discountRate, -1, 101)) {
				return '请输入合理的折扣率';
			}*/
			return '';
		},
		//计算金额
		deliverCalculate: function(requestInfo, isShowInfo) {
			var e = e || window.event;
			var result = saleService.utility.deliverValid(requestInfo);
            if (result) {
                if (isShowInfo) {
					xunSoft.helper.showMessage(result);
				}
				return false;
			}
			//计算折扣
			var keyword = $$(e.target).parent().prev().text();
            if (keyword === '单价') { //修改单价-->计算折扣率
                 if(requestInfo.wholesalePrice * 100 % requestInfo.salePrice==0)
                {
                   requestInfo.discountRate = (requestInfo.wholesalePrice / requestInfo.salePrice * 100);
                }
                else
                {
                     requestInfo.discountRate = (requestInfo.wholesalePrice / requestInfo.salePrice * 100).toFixed(2);
                }
            }
            if (keyword === '折扣率%') { //修改折扣率-->计算采购价
                requestInfo.wholesalePrice = (requestInfo.salePrice * requestInfo.discountRate / 100).toFixed(2);
            }
            //计算折扣
            var tempDeliverMoney = (requestInfo.wholesalePrice * requestInfo.deliverAmount) * (requestInfo.discountRate / 100);
            //计算税额
            requestInfo.taxMoney = tempDeliverMoney * (requestInfo.taxRate / 100);
            //最后的金额
            requestInfo.deliverMoney =requestInfo.wholesalePrice * requestInfo.deliverAmount; //tempDeliverMoney;
            return true;
			/*var e = e || window.event;
			var result = saleService.utility.deliverValid(requestInfo);
            if (result) {
                if (isShowInfo) {
					xunSoft.helper.showMessage(result);
				}
				return false;
			}
			//计算折扣
			var keyword = $$(e.target).parent().prev().text();
            if (keyword === '单价') { //修改单价-->计算折扣率
                 if(requestInfo.wholesalePrice * 100 % requestInfo.salePrice==0)
                {
                   requestInfo.discountRate = (requestInfo.wholesalePrice / requestInfo.salePrice * 100).toFixed(2);
                }
                else
                {
                     requestInfo.discountRate = (requestInfo.wholesalePrice / requestInfo.salePrice * 100).toFixed(2);
                }
            }
            if (keyword === '折扣率%'&&requestInfo.salePrice!=0) { //修改折扣率-->计算采购价
                requestInfo.wholesalePrice = (requestInfo.salePrice * requestInfo.discountRate / 100).toFixed(2);
            }
            //计算折扣
            var tempDeliverMoney = (requestInfo.wholesalePrice * requestInfo.deliverAmount) * (requestInfo.discountRate / 100);
            //计算税额
            requestInfo.taxMoney = tempDeliverMoney * (requestInfo.taxRate / 100);
            //最后的金额
            requestInfo.deliverMoney = tempDeliverMoney;
            return true;*/
		},
		//验证数据
		receiptValid: function(requestInfo) {
            if (!xunSoft.valid.validDataRange(requestInfo.receivePrice, -1)) {
				return '请输入合理的收货单价';
			}
            if (!xunSoft.valid.validDataRange(requestInfo.receiveAmount, -1, 2147483647)) {
				return '请输入合理的收货数量';
			}
            /*if (!xunSoft.valid.validDataRange(requestInfo.discountRate, -1, 101)) {
				return '请输入合理的折扣率';
			}*/
            if (!xunSoft.valid.validDataRange(requestInfo.taxRate, -1, 101)) {
				return '请输入合理的收货税率';
			}
			return '';
		},
		//计算金额
		receiptCalculate: function(requestInfo, isShowInfo) {
			var result = saleService.utility.receiptValid(requestInfo);
            if (result) {
                if (isShowInfo) {
					xunSoft.helper.showMessage(result);
				}
				return false;
			}
			//计算折扣
			var tempReceiveMoney = (requestInfo.receivePrice * requestInfo.receiveAmount) * (requestInfo.discountRate / 100);
			//计算税额
			requestInfo.taxMoney = tempReceiveMoney * (requestInfo.taxRate / 100);
			//最后的金额
			requestInfo.receiveMoney = requestInfo.receivePrice * requestInfo.receiveAmount;//tempReceiveMoney;
			return true;
		},
		//验证数据
		returnValid: function(requestInfo) {
            if (_.isArray(requestInfo.colorId)) {
                if (requestInfo.colorId.length == 0) {
	                return '请至少选择一种颜色';
	            }
			}
            if (_.isArray(requestInfo.sizeId)) {
                if (requestInfo.sizeId.length == 0) {
	                return '请至少选择一种尺码';
	            }
			}
            
            if (!xunSoft.valid.validDataRange(requestInfo.wholesalePrice, -1)) {
				return '请输入合理的单价';
			}
            if (!xunSoft.valid.validDataRange(requestInfo.returnAmount, -1, 2147483647)) {
				return '请输入合理的数量';
			}
            
			return '';
		},
		//计算金额
		returnCalculate: function(requestInfo, isShowInfo) {
			var e = e || window.event;
			var result = saleService.utility.returnValid(requestInfo);
            if (result) {
                if (isShowInfo) {
					xunSoft.helper.showMessage(result);
				}
				return false;
			}
			//计算折扣
			var keyword = $$(e.target).parent().prev().text();
            if (keyword === '单价') { //修改单价-->计算折扣率
                 if(requestInfo.wholesalePrice * 100 % requestInfo.salePrice==0)
                {
                   requestInfo.discountRate = (requestInfo.wholesalePrice / requestInfo.salePrice * 100);
                }
                else
                {
                     requestInfo.discountRate = (requestInfo.wholesalePrice / requestInfo.salePrice * 100).toFixed(2);
                }
            }
            if (keyword === '折扣率%') { //修改折扣率-->计算采购价
                requestInfo.wholesalePrice = (requestInfo.salePrice * requestInfo.discountRate / 100).toFixed(2);
            }
            //计算折扣
            var tempReturnMoney = (requestInfo.wholesalePrice * requestInfo.returnAmount) * (requestInfo.discountRate / 100);
            //计算税额
            requestInfo.taxMoney = tempReturnMoney * (requestInfo.taxRate / 100);
            //最后的金额
            requestInfo.returnMoney = requestInfo.wholesalePrice * requestInfo.returnAmount; //tempReturnMoney;
            return true;
		},
		
		//销售验证
         //验证数据
        saleValid: function(requestInfo) {
            if (!xunSoft.valid.validDataRange(requestInfo.wholesalePrice, -1)) {
                return '请输入合理的单价';
            }
            if (!xunSoft.valid.validDataRange(requestInfo.saleAmount, -1, 2147483647)&&!xunSoft.valid.validNum(requestInfo.saleAmount)) {
                return '请输入合理的数量';
            }
            
            return '';
        },
        //计算金额
        saleCalculate: function(requestInfo, isShowInfo) {
            var e = e || window.event;
            var result = saleService.utility.saleValid(requestInfo);
            if (result) {
                if (isShowInfo) {
                    xunSoft.helper.showMessage(result);
                }
                return false;
            }
            var keyword = $$(e.target).parent().prev().text();
            if (keyword === '单价') { //修改单价-->计算折扣率
                 if(requestInfo.wholesalePrice * 100 % requestInfo.salePrice==0)
                {
                   requestInfo.discountRate = (requestInfo.wholesalePrice / requestInfo.salePrice * 100);
                }
                else
                {
                     requestInfo.discountRate = parseFloat((requestInfo.wholesalePrice / requestInfo.salePrice * 100).toFixed(2));
                }
            }
            if (keyword === '折扣率%') { //修改折扣率-->计算采购价
                requestInfo.wholesalePrice = (requestInfo.salePrice * requestInfo.discountRate / 100);
            }
            //计算折扣
            var tempSaleMoney = (requestInfo.wholesalePrice * requestInfo.saleAmount) * (requestInfo.discountRate / 100);
            //计算税额
            requestInfo.taxMoney = tempSaleMoney * (requestInfo.taxRate / 100);
            //最后的金额
            requestInfo.saleMoney = requestInfo.wholesalePrice * requestInfo.saleAmount; //tempSaleMoney;123
            return true;
        },
        saleValid1: function(requestInfo) {
            if (!xunSoft.valid.validDataRange(requestInfo.retailPrice, -1)) {
                return '请输入合理的单价';
            }
            if (!xunSoft.valid.validDataRange(requestInfo.saleAmount, -1, 2147483647)&&!xunSoft.valid.validNum(requestInfo.saleAmount)) {
                return '请输入合理的数量';
            }
            
            return '';
        },
        //计算金额
        saleCalculate1: function(requestInfo, isShowInfo) {
            var e = e || window.event;
            var result = saleService.utility.saleValid1(requestInfo);
            if (result) {
                if (isShowInfo) {
                    xunSoft.helper.showMessage(result);
                }
                return false;
            }
            var keyword = $$(e.target).parent().prev().text();
            if (keyword === '单价') { //修改单价-->计算折扣率
                 if(requestInfo.retailPrice * 100 % requestInfo.salePrice==0)
                {
                   requestInfo.discountRate = (requestInfo.retailPrice / requestInfo.salePrice * 100);
                }
                else
                {
                     requestInfo.discountRate = (requestInfo.retailPrice / requestInfo.salePrice * 100).toFixed(2);
                }
            }
            if (keyword === '折扣率%') { //修改折扣率-->计算采购价
                requestInfo.retailPrice = (requestInfo.salePrice * requestInfo.discountRate / 100);
            }
            //计算折扣
            var tempSaleMoney = (requestInfo.retailPrice * requestInfo.saleAmount);
            //计算税额
            requestInfo.taxMoney = tempSaleMoney * (requestInfo.taxRate / 100);
            //最后的金额
            requestInfo.saleMoney = tempSaleMoney;
            return true;
        },
	}
};