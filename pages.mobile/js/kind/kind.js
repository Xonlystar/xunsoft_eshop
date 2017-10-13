//货品明细
eShop.onPageInit('kind_kindDetail', function(page) {

    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                item: "",
                Amount: "",
                Price: "",
                salePrice: "",
            },
            response: {
                data: {},
                type: ""
            },
        },
        methods: {
            init: function() {
                console.log(page.query.item);
                vm.request.item = page.query.item;
                vm.response.type = page.query.type || "",

                    vm.request.Amount = page.query.item.purchaseAmount || page.query.item.receiveAmount || page.query.item.returnAmount || page.query.item.transferAmount || page.query.item.checkAmount || page.query.item.profitLossAmount || page.query.item.saleAmount ||
                    page.query.item.deliverAmount;
                vm.request.Price = page.query.item.purchasePrice || page.query.item.receivePrice || page.query.item.returnPrice || page.query.item.salePrice || page.query.item.deliverPrice;
                vm.request.salePrice = page.query.item.salePrice;


            },
            //弹出pop框
            // showPop: function() {
            // 	var buttons = [{
            // 			text: '相机',
            // 			onClick: function() {
            // 				xunSoft.device.photo.takePhoto(function(imgUrl) {
            // 					vm.request.userLogo = imgUrl;
            // 				});
            // 			}
            // 		},
            // 		{
            // 			text: '相册',
            // 			onClick: function() {
            // 				xunSoft.device.photo.getPhoto(function(imgUrl) {
            // 					vm.request.userLogo = imgUrl;
            // 				});
            // 			}
            // 		},
            // 		{
            // 			text: '取消',
            // 			color: 'red'
            // 		},
            // 	];
            // 	eShop.actions("#userLogo", buttons);
            // },
            load: function() {
                kindService.get.getKindDetail(vm.request, vm.response, function(responseData) {
                    //筛选有图片的信息
                    var pictureGroupList = _.filter(responseData.data.pictureGroupList, function(data) {
                        return data.resourceIds != null;
                    });
                    _.each(pictureGroupList, function(item) {
                        var request = {
                            resourceId: item.resourceIds
                        };

                        //获取对应的图片资源
                        kindService.get.getKindPictures(request, null, function(responseData) {
                            if (_.isArray(responseData.data) && responseData.data.length > 0) {
                                _.each(responseData.data, function(item) {
                                    var fileUrl = xunSoft.ajax.serviceBase() + 'Kind/Kind/Picture?fileName=' + item.tempFileName;
                                    var imgDiv = '<div class="swiper-slide text-center"> <img src="' + fileUrl + '" /> </div>';
                                    vm.imgSwipper.appendSlide(imgDiv);
                                });
                            }
                        });
                    })
                });
            }
        }

    });

    vm.init();

});



//货品录入
eShop.onPageInit('kind_add', function(page) {

    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                brandId: '',
                kindClassId: '',
                kindNo: '',
                kindName: '',
                sizeGroupId: '',
                unitId: '',
                purchasePrice: '',
                purchaseCost: '',
                saleMember: '',
                salePrice: '',
                priceList: [],
                color: [],
                size: []
            },
            response: {
                brands: baseInfoService.brands,
                kindClasses: [],
                colors: baseInfoService.colors,
                sizeGroups: baseInfoService.sizeGroups,
                sizes: [],
                units: baseInfoService.units
            }
        },
        watch: {
            'request.sizeGroupId': function(val, oldVal) {
                if (val != oldVal && val > 0) {
                    vm.response.sizes = _.filter(baseInfoService.sizes, function(item) { return item.sizeGroupId == val; });
                    console.log(vm.response.sizes);
                }
            },
            'request.brandId': function(val, oldVal) {
                if (val != oldVal && val > 0) {
                    //获取分类
                    kindService.get.getKindClass({ brandId: val }, {}, function(responseData) {
                        vm.response.kindClasses = responseData.data;
                        console.log(vm.response.kindClasses);
                    });
                }
            }
        },
        methods: {
            init: function() {

            },
            selectBefore: function() {
                var e = e || window.event;
                if (!vm.request.brandId) {
                    xunSoft.helper.showMessage("请先选择品牌!");
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }
            },
            selectBefores: function() {
                var e = e || window.event;
                if (!vm.request.sizeGroupId) {
                    xunSoft.helper.showMessage("请先选择尺码组!");
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }
            },
            //保存货品
            save: function() {
                if (!vm.request.kindNo) {
                    xunSoft.helper.showMessage("商品货号不能为空!");
                    return;
                }
                if (!vm.request.kindName) {
                    xunSoft.helper.showMessage("货号名称不能为空!");
                    return;
                }
                if (!vm.request.brandId) {
                    xunSoft.helper.showMessage("货号品牌不能为空!");
                    return;
                }
                if (!vm.request.kindClassId) {
                    xunSoft.helper.showMessage("货号分类不能为空!");
                    return;
                }
                if (!vm.request.sizeGroupId) {
                    xunSoft.helper.showMessage("货品尺码组不能为空!");
                    return;
                }
                if (!vm.request.sizeId) {
                    xunSoft.helper.showMessage("货号尺码不能为空!");
                    return;
                }
                if (!vm.request.unitId) {
                    xunSoft.helper.showMessage("货号单位不能为空!");
                    return;
                }
                if (!vm.request.colorId) {
                    xunSoft.helper.showMessage("货号颜色不能为空!");
                    return;
                }
                var request = {
                    data: vm.request
                };
                request.data.colorList = _.map(vm.request.colorId, function(item) { return { colorId: item } });
                request.data.sizeList = _.map(vm.request.sizeId, function(item) { return { sizeId: item } });
                request.data.priceList.push({ ItemKey: "purchase-price", Value: vm.request.purchasePrice });
                request.data.priceList.push({ ItemKey: "purchase-cost", Value: vm.request.purchaseCost });
                request.data.priceList.push({ ItemKey: "sale-member", Value: vm.request.saleMember });
                request.data.priceList.push({ ItemKey: "sale-price", Value: vm.request.salePrice });
                console.log(request, page.query);
                //return;

                //保存货品
                kindService.post.postKind(request, {}, function(responseData) {

                    if (page.query.editPage) {
                        // mainView.router.load({
                        //     url: page.query.editPage,
                        //     query: {
                        //         detailList: page.query.detailList,
                        //         kindId: responseData.data.kindId
                        //     }
                        // });
                        mainView.router.back();
                    } else if (_.isArray(page.query.detailList)) {
                        page.query.detailList.push(kind);
                        mainView.router.back();
                    } else {
                        mainView.router.back();
                    }
                });
            }
        }
    });

    vm.init();
});


//货品选择
eShop.onPageInit('kind_selectKind', function(page) {
    var pageDiv = $$(page.container);
    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                query: {
                    brandId: '',
                    kincClassId: '',
                    kindName: ''
                },
                pageIndex: 1,
                pageSize: xunSoft.user.pageSize()
            },
            response: {
                total: 0,
                data: [],
                selectedKind: [],
                selectedTotal: 0,
                key: 0, //销售的批发级别
                curr: 1, //从哪个模块进来
            }

        },
        methods: {
            init: function() {
                this.load();
                //判断当前父页面
                var fromPageUrl = mainView.activePage.fromPage.url;
                var str = fromPageUrl.slice(0, fromPageUrl.indexOf("/"));
                if (str === 'saleBatch') {
                    vm.response.curr = 0;
                } else if (str === 'purchase') {
                    vm.response.curr = 1;
                } else if (str === 'warehouse') {
                    vm.response.curr = 2;
                }
                //获取批发级别
                if (vm.response.curr == 0) { //批发级别
                    vm.response.key = _.find(baseInfoService.customers, function(item) { return item.companyId == page.query.customerId }).businessData.defaultBatchSaleGrade;
                }
                vm.response.selectedKind = _.extend(page.query.detailList);
                _.each(vm.response.selectedKind, function(item) {
                    item.Amount = item.purchaseAmount || item.receiveAmount || item.returnAmount || item.saleAmount || item.transferAmount || item.checkAmount || item.profitLossAmount || item.deliverAmount;
                    item.Price = item.purchasePrice || item.receivePrice || item.returnPrice || item.salePrice || item.deliverPrice;
                })
                this.selectedTotal();
                pageDiv.find('.pull-to-refresh-content').on('refresh', function() {
                    eShop.pullToRefreshDone();
                    vm.refresh();
                })

            },
            selectedTotal: function() {
                var total = 0;
                _.each(vm.response.selectedKind, function(item) {
                    total += parseInt(item.Amount) || 0;
                });
                vm.response.selectedTotal = total;
            },
            //加载下一页
            load: function() {
                kindService.get.getKindList(vm.request, vm.response, function() {
                    vm.resetAmount();
                });
            },
            //重新加载
            refresh: function() {
                this.request.pageIndex = 1;
                this.response.total = 0;
                this.response.data = [];
                this.load();
            },
            //选择商品
            select: function(kind) {
                if (page.query.editPage) {
                    mainView.router.load({
                        url: page.query.editPage,
                        query: {
                            detailList: page.query.detailList,
                            kindId: kind.kindId
                        }
                    });
                } else if (_.isArray(page.query.detailList)) {
                    page.query.detailList.push(kind);
                    mainView.router.back();
                }
            },
            //点击弹框
            showModel: function(kind) {
                var e = e || window.event;
                e.preventDefault();
                e.stopPropagation();

                kindService.get.getKindDetail({ id: kind.kindId }, {}, function(result) {
                    var kindDetail = result.data;
                    var html = "";
                    var wholesalePrice = 0;
                    if (vm.response.curr == 0) { //销售--获取批发价
                        //批发价
                        var currPrice = _.find(kind.priceList, function(item) { return item.itemKey == vm.response.key; });
                        wholesalePrice = (currPrice && currPrice.value) || 0;
                    }
                    //添加单价和折扣率
                    if (vm.response.curr != 2) {
                        var purchasePrice = _.find(kind.priceList, function(item) { return item.itemKey == 'purchase-price'; }).value;
                        var salePrice = _.find(kind.priceList, function(item) { return item.itemKey == 'sale-price'; }).value;
                        var discountRate = ((vm.response.curr == 1 ? purchasePrice : wholesalePrice) / salePrice * 100).toFixed(2)
                        html += "<table style='margin:10px auto;width:100%;'><tr>";
                        //价格
                        html += "<td style='width:40px;font-weight:bold'>单价</td>";
                        html += ["<td>",
                            "<input onchange='getChangePrice(this)'  data-curr='" + vm.response.curr + "' onfocus='getFocus(this)' type='text' style='width:100%;' id='resetPrice' value='" + (vm.response.curr == 1 ? purchasePrice : wholesalePrice) + "'>",
                            "<input onchange='getChangePrice(this)' data-curr='" + vm.response.curr + "' onfocus='getFocus(this)' type='hidden' style='width:100%;' id='resetHiddenPrice' value='" + salePrice + "'>",
                            "</td>"
                        ].join("");
                        //折扣率
                        html += "<td style='width:50px;font-weight:bold;padding-left:15px;'>折扣率</td>";
                        html += "<td><input onchange='getChangeRate(this)'  data-curr='" + vm.response.curr + "' onfocus='getFocus(this)' type='text' style='width:100%;' id='resetDiscountRate' value='" + discountRate + "%'></td>";
                        html += "</tr></table>";
                    }
                    html += [
                        "<table id='kindSelect' border='1' style='width:100%;height:100%; text-align: center;border-collapse:collapse;'>",
                        "<thead>",
                        "<tr>",
                        "<td rowspan='2' style='min-width:50px;'>尺码</td>",
                        "<td colspan=" + kindDetail.colorList.length + ">颜色</td>",
                        "</tr>"
                    ].join("");
                    _.each(kindDetail.colorList, function(item) {
                        html += '<td>' + item.colorName + '</td>';
                    });
                    html += '</thead><tbody>';
                    _.each(kindDetail.sizeList, function(item) {
                        html += '<tr><td>' + item.sizeText + '</td>';
                        for (var i = 0; i < kindDetail.colorList.length; i++) {
                            var info = _.find(vm.response.selectedKind, function(item2) {
                                return item2.kindId == kind.kindId &&
                                    item2.colorId == kindDetail.colorList[i].colorId &&
                                    item2.sizeId == item.sizeId;
                            });
                            if (info && info.Amount) {
                                html += '<td><input onfocus="getFocus(this)" data-colorid="' + kindDetail.colorList[i].colorId + '" data-color="' + kindDetail.colorList[i].colorName + '" data-sizeid="' + item.sizeId + '" data-size=' + item.sizeText + ' type="number" value="' + info.Amount + '" style="width:100%;height:100%;border:none;text-align:right;"></td>';
                            } else {
                                html += '<td><input onfocus="getFocus(this)" data-colorid="' + kindDetail.colorList[i].colorId + '" data-color="' + kindDetail.colorList[i].colorName + '" data-sizeid="' + item.sizeId + '" data-size=' + item.sizeText + ' type="number" style="width:100%;height:100%;border:none;text-align:right;"></td>';
                            }
                        }
                        html += '</tr>';
                    });

                    html += "</tbody></table>";
                    eShop.modal({
                        title: kind.kindName + "-" + kind.kindNo,
                        text: html,
                        buttons: [{
                                text: '取消'
                            },
                            {
                                text: '确认',
                                onClick: function() { //添加已选择货品
                                    //用户选择的颜色尺码组合
                                    var newKinds = [];
                                    var inputs = $$("#kindSelect input");
                                    _.each(inputs, function(item) {
                                        //获取新的货品信息
                                        var value = $$(item).val() || 0;
                                        var newKind = {};
                                        _.extend(newKind, kindDetail);
                                        newKind.kindId = kind.kindId;
                                        newKind.kind = kindService.utility.parseKind(kindDetail).kind;
                                        newKind.salePrice == kindService.utility.parseKind(kindDetail).salePrice;
                                        newKind.sizeId = $$(item).attr('data-sizeid');
                                        newKind.sizeText = _.find(kindDetail.sizeList, function(item) { return item.sizeId == newKind.sizeId }).sizeText;
                                        newKind.colorId = $$(item).attr('data-colorid');
                                        newKind.colorName = _.find(kindDetail.colorList, function(item) { return item.colorId == newKind.colorId }).colorName;
                                        //折扣率
                                        if (vm.response.curr != 2) {
                                            if ($$('#resetDiscountRate').val().indexOf("%") == -1) {
                                                newKind.discountRate = $$('#resetDiscountRate').val() || 100;
                                            } else {
                                                newKind.discountRate = ($$('#resetDiscountRate').val() && $$('#resetDiscountRate').val().slice(0, -1)) || 100;
                                            }
                                        }
                                        newKind.Amount = value;
                                        //价格
                                        if (vm.response.curr == 1) {
                                            var index = _.findIndex(kindDetail.priceList, { itemKey: 'purchase-price' });
                                            kindDetail.priceList[index].value = $$('#resetPrice').val() || kindDetail.priceList[index].value; //修改价格
                                            kind.priceList[index].value = $$('#resetPrice').val() || kind.priceList[index].value; //修改价格
                                        } else if (vm.response.curr == 0) {
                                            var index1 = _.findIndex(kind.priceList, { itemKey: vm.response.key + "" });
                                            if (index1 != -1) {
                                                kind.priceList[index1].value = $$('#resetPrice').val() || kind.priceList[index1].value; //修改价格                                             
                                            } else {
                                                kind.priceList.push({ itemKey: vm.response.key + "", value: $$('#resetPrice').val() });
                                            }
                                            var index2 = _.findIndex(kindDetail.priceList, { itemKey: vm.response.key + "" });
                                            if (index2 != -1) {
                                                kindDetail.priceList[index2].value = $$('#resetPrice').val() || kindDetail.priceList[index2].value; //修改价格
                                            } else {
                                                kindDetail.priceList.push({ itemKey: vm.response.key + "", value: $$('#resetPrice').val() });
                                            }
                                            newKind.wholesalePrice = $$('#resetPrice').val() || 0;
                                        }
                                        newKind.priceList = kindDetail.priceList;
                                        //newKind[page.query.param.Price]=_.find(kindDetail.priceList,function(item){ return item.itemKey==page.query.param.price;}).value;
                                        //newKind[page.query.param.Money]=newKind[[page.query.param.Price]]*value;
                                        newKind.kind.colorName = $$(item).attr('data-color');
                                        newKind.kind.sizeText = $$(item).attr('data-size');
                                        if (value) {
                                            //如果是盘点单，还需要获取账面数量
                                            if (page.query.type && page.query.type == "checkStockOrder" && page.query.warehouseId) {
                                                var tempRequest = {
                                                    query: {
                                                        TenantId: xunSoft.user.tenantId(),
                                                        BrandId: kind.brandId,
                                                        KindId: kind.kindId,
                                                        ColorId: newKind.colorId,
                                                        SizeId: newKind.sizeId,
                                                        Batch: "",
                                                        WarehouseId: page.query.warehouseId
                                                    },
                                                    PageIndex: 1,
                                                    PageSize: 15
                                                };
                                                kindService.get.getKindAccountAmount(tempRequest, {}, function(responseData) {
                                                    newKind.accountAmount = responseData.total;
                                                    newKinds.push(newKind);
                                                    vm.check(newKinds);
                                                }, function() {
                                                    newKind.accountAmount = 0;
                                                    newKinds.push(newKind);
                                                    vm.check(newKinds);
                                                });
                                            } else {
                                                newKinds.push(newKind);
                                                vm.check(newKinds);
                                            }
                                        }
                                    });
                                }
                            }
                        ]
                    })
                });
            },
            //
            resetAmount: function() {
                var currData = [];
                _.each(vm.response.selectedKind, function(selectItem) {
                    if (!currData[selectItem.kindId]) { currData[selectItem.kindId] = [] }
                    currData[selectItem.kindId].push(selectItem);
                });
                _.each(vm.response.data, function(item) {
                    if (!item.selectAmount) { item.selectAmount = 0 }
                    _.each(currData[item.kindId], function(value, key) {
                        if (key == 0) {
                            item.selectAmount = parseInt(value.Amount);
                        } else {
                            item.selectAmount += parseInt(value.Amount);
                        }
                    });
                });
                console.log(vm.response.data);
            },
            check: function(newKinds) {
                _.each(newKinds, function(newKind) {
                    //检查货品是否已经存在
                    var kindInfo = _.find(vm.response.selectedKind, function(item) {
                        return item.kindId == newKind.kindId &&
                            item.sizeId == newKind.sizeId &&
                            item.colorId == newKind.colorId;
                    });
                    if (!kindInfo) {
                        //追加货品信息
                        vm.response.selectedKind.push(newKind);
                    } else {
                        //更新已有的货品信息
                        _.extend(kindInfo, newKind);
                    }
                    vm.resetAmount();
                    vm.selectedTotal();
                });
            },
            //设置查询参数
            query: function() {
                mainView.router.load({
                    url: 'kind/selectKindFilter.ios.html',
                    query: {
                        para: vm.request.query,
                        callback: vm.refresh
                    }
                });
            },
            //添加
            add: function() {
                mainView.router.load({
                    url: 'kind/add.ios.html',
                    query: page.query,
                    ignoreCache: true
                });
            },
            //保存
            save: function() {
                if (_.isFunction(page.query.callback)) {
                    page.query.callback(vm.response.selectedKind);
                }
                mainView.router.back();
            }
        }
    });

    vm.init();
});


//货品选择过滤
eShop.onPageInit('kind_selectKindFilter', function(page) {

    var pageDiv = $$(page.container);

    var vm = new Vue({
        el: page.container,
        data: {
            request: {
                brandId: 0,
                kindClassId: 0
            },
            response: {
                brands: baseInfoService.brands,
                kindClass: []
            }
        },
        watch: {
            'request.brandId': function(value, oldVal) {
                console.log(value);
                if (value != oldVal && (value != 0 || value != '')) {
                    kindService.get.getKindClass({ brandId: value }, {}, function(responseData) {
                        if (_.isArray(responseData.data)) {
                            vm.response.kindClass = responseData.data;
                        }
                    });
                }
            }
        },
        methods: {
            init: function() {
                if (page.query && page.query.para) {
                    vm.request.brandId = page.query.para.brandId;
                }
                if (page.query && page.query.para) {
                    vm.request.kincClassId = page.query.para.kincClassId;
                }
            },
            //保存
            save: function() {
                if (page.query && page.query.para) {
                    page.query.para.brandId = vm.request.brandId;
                }
                if (page.query && page.query.para) {
                    page.query.para.kincClassId = vm.request.kincClassId;
                }
                mainView.router.back();
                if (_.isFunction(page.query.callback)) {
                    page.query.callback();
                }
            }
        }
    });

    vm.init();

});