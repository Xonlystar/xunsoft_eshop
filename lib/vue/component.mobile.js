//单据状态
Vue.component('order-flag', {
    props: ['flag'],
    template: ' <span v-if="flag==\'L\'" style="color:#c10018;border:1px solid #c10018;" >待提交</span> ' +
        ' <span v-if="flag==\'T\'"  style=" color:#2d8bf5;border:1px solid #2d8bf5;">已提交</span> ' +
        ' <span v-if="flag==\'S\'"  style="color:#272822;border:1px solid #272822;">已审核</span> '


});

Vue.component('order-status', {
    props: ['flag'],
    template: ' <span v-if="flag==\'L\'" class="order-status" style="width:48px;height:48px;background: transparent url(../img/' +
        'status5.png);background-size:48px 48px; display:block;position: absolute;right:0;top:0;z-index:10;"></span>' +
        '<span v-if="flag==\'T\'" class="order-status" style="width:48px;height:48px;background: transparent url(../img/' +
        'status2.png);background-size:48px 48px; display:block;position: absolute;right:0;top:0;z-index:10;"></span>' +
        '<span v-if="flag==\'S\'" class="order-status" style="width:48px;height:48px;background: transparent url(../img/' +
        'status3.png);background-size:48px 48px; display:block;position: absolute;right:0;top:0;z-index:10;"></span>'
});

//加载更多数据
//加载更多数据
Vue.component('load-more-normal', {
    props: ['total', 'data'],
    template: '<div class="text-center" style="padding-bottom:8px;margin-top:20px;"><a v-show="total>0" v-on:click="loadMore" href="#">加载更多....</a></div>',
    methods: {
        loadMore: function() {

            if (_.isArray(this.data)) {
                if (this.data.length == this.total) {
                    xunSoft.helper.showMessage('已经没有更多数据可以加载了....');
                } else {
                    this.$dispatch('load');
                }
            } else {
                this.$dispatch('load');
            }
        }
    }
});
//加载更多数据
Vue.component('load-more', {
    props: ['total', 'data'],
    template: '<div class="text-center" style="padding-bottom:8px;margin-top:20px;"><a v-show="total>0" v-on:click="loadMore" href="#">加载更多....</a></div>',
    methods: {
        loadMore: function() {

            if (_.isArray(this.data)) {
                var curLength = 0;
                _.each(this.data, function(value, kye) {
                    curLength += value.value.length;
                })
                if (curLength == this.total) {
                    xunSoft.helper.showMessage('已经没有更多数据可以加载了....');
                } else {
                    this.$dispatch('load');
                }
            } else {
                this.$dispatch('load');
            }
        }
    }
});


//货品图片
Vue.component('kind-img', {
    props: ['kindId', 'colorId', 'allowScale'],
    template: '<img class="img-kind img-responsive" src="../img/kind.gif" v-on:load="load" v-on:click="toMax"/>',
    watch: {
        'kindId': function(val, oldVal) {
            var img = $$(this.$el);
            if (img.attr('src').indexOf('img/kind.gif') > 0) {
                var colorid = this.colorId ? this.colorId : 0;
                if (this.kindId) {
                    img.attr('src', xunSoft.ajax.serviceBase() + "Kind/Kind/Picture/" + this.kindId + "/" + xunSoft.user.tenantId() + "/" + colorid);
                }
            }
        }
    },
    methods: {
        load: function(event) {
            if ($$(event.currentTarget).attr('src').indexOf('img/kind.gif') > 0) {
                var colorid = this.colorId ? this.colorId : 0;
                if (this.kindId) {
                    $$(event.currentTarget).attr('src', xunSoft.ajax.serviceBase() + "Kind/Kind/Picture/" + this.kindId + "/" + xunSoft.user.tenantId() + "/" + colorid);
                }
            }
        },
        toMax: function() {
            if (!this.allowScale) { return; }
            var colorid = this.colorId ? this.colorId : 0;
            var myPhotoBrowserDark = eShop.photoBrowser({
                photos: [xunSoft.ajax.serviceBase() + "Kind/Kind/Picture/" + this.kindId + "/" + xunSoft.user.tenantId() + "/" + colorid],
                theme: 'dark',
                type: 'popup',
                toolbar: false,
                backLinkText: '  ',
                lazyLoading: true,
                expositionHideCaptions: true,
            });
            myPhotoBrowserDark.open();
        }
    }
});


//选择货品
Vue.component('select-order-kind', {
    props: ['data', 'edit', 'type'],
    template: '<a v-on:click="select" class="select_product_a"> &nbsp; </a>',
    methods: {
        select: function() {
            var tempData = this.data;
            //销售模块-必须选择客户
            var fromPageUrl = mainView.activePage.url;
            var str = fromPageUrl.slice(0, fromPageUrl.indexOf("/"));
            if (str === 'saleBatch') {
                if (!this.data.customerId) {
                    xunSoft.helper.showMessage("请先选择客户...");
                    return;
                } else {
                    tempData = this.data.detailList
                }
            }
            //如果是库存盘点单，需要先选择仓库

            if (this.type && this.type == "checkStockOrder") {
                if (!this.data.warehouseId) {
                    xunSoft.helper.showMessage("请先选择仓库...");
                    return;
                } else {
                    tempData = this.data.detailList
                }
            }
            mainView.router.load({
                url: 'kind/selectKind.ios.html',
                query: {
                    customerId: this.data.customerId, //销售必须要有客户
                    detailList: tempData,
                    editPage: this.edit,
                    type: this.type,
                    warehouseId: this.data.warehouseId,
                    callback: this.callback
                }
            });
        },
        callback: function(responseData) {
            this.$dispatch('select', responseData);
        }
    }
});

//金额排序
Vue.component('sort-money', {
    props: ['data', 'prop'],
    template: '<a v-on:click="sort($event)" class="text-center"><i class="fa fa-jpy fa-2x"></i></a>',
    methods: {
        sort: function(event) {
            var component = this;
            if (_.isArray(component.data) && component.data.length > 1) {
                var order = $$(event.currentTarget).attr('data-order');
                //检查排序方式
                if (order == "asc") {
                    //asc 从小到大
                    component.data = _.sortBy(component.data,
                        function(item) {
                            return item[component.prop] || 0;
                        });
                    $$(event.currentTarget).attr('data-order', "desc");
                } else {
                    //desc 从大到小
                    var orderBy = _.sortBy(component.data, function(item) {
                        return item[component.prop] || 0;
                    });
                    component.data = orderBy.reverse();
                    $$(event.currentTarget).attr('data-order', "asc");
                }
            }
            this.$dispatch('sort');
        }
    }
});


//数量排序
Vue.component('sort-amount', {
    props: ['data', 'prop'],
    template: '<a v-on:click="sort($event)" class="text-center"><i class="fa fa-sort fa-2x"></i></a>',
    methods: {
        sort: function(event) {
            var component = this;
            if (_.isArray(component.data) && component.data.length > 1) {
                var order = $$(event.currentTarget).attr('data-order');
                //检查排序方式
                if (order == "asc") {
                    //asc 从小到大
                    component.data = _.sortBy(component.data,
                        function(item) {
                            return item[component.prop] || 0;
                        });
                    $$(event.currentTarget).attr('data-order', "desc");
                } else {
                    //desc 从大到小
                    var orderBy = _.sortBy(component.data, function(item) {
                        return item[component.prop] || 0;
                    });
                    component.data = orderBy.reverse();
                    $$(event.currentTarget).attr('data-order', "asc");
                }
            }
            this.$dispatch('sort');
        }
    }
});

/*编辑货品*/

Vue.component('edit-kind', {
    props: ['data', 'kind', 'edit'],
    template: '<a v-on:click="update"  href="#" style="color:#8e8e93;">></a>',
    methods: {
        update: function() {
            if (_.isArray(this.data.detailList)) {
                if (this.edit) {
                    mainView.router.load({
                        url: this.edit,
                        query: {
                            kind: this.kind,
                            request: this.data
                        }
                    });
                }
            }
            this.$dispatch('update');
        }
    }
});

//货品删除
Vue.component('delete-kind', {
    props: ['data', 'kind'],
    template: '<a v-on:click="delete" href="#"  style="text-decoration:none;color:#fff;line-height:30px;">删除</a>',
    methods: {
        delete: function() {
            var component = this;
            eShop.confirm("确定删除么?", component.kind.kind.kindName, function() {
                if (_.isArray(component.data)) {
                    component.data.$remove(component.kind);
                    console.log(component.data);
                }
                component.$dispatch('delete', component.kind);
            });
        }
    }
});
//货品删除
Vue.component('delete-kinded', {
    props: ['data'],
    template: '<a v-on:click="delete" href="#"  style="text-decoration:none;color:#fff;line-height:30px;">删除</a>',
    methods: {
        delete: function() {
            var component = this;
            eShop.confirm("确定删除么?", function() {
                if (_.isArray(component.data)) {
                    component.data.$remove(component);
                }
                component.$dispatch('delete', component);
            });
        }
    }
});

//扫描条码组件
Vue.component('select-barcode', {
    props: ['data', 'order', 'edit'],
    template: '<a v-on:click="scan" class="text-center"><i class="fa fa-barcode fa-2x"></i></a>',
    methods: {
        scan: function() {
            var component = this;
            xunSoft.device.barcode.scan(function(barcode) {
                //var barcode="A001000185";
                //console.log('扫描到条码：'+barcode);

                var request = {
                    barCode: barcode
                };
                //通过条码获取数据
                kindService.get.getKindByBar(request, null, function(responseData) {
                    var kindInfo = kindService.utility.parseKind(responseData.data);

                    //采购订单
                    if (component.order == "11") {
                        kindInfo.purchasePrice = 0;
                        kindInfo.purchaseAmount = 0;
                        kindInfo.purchaseMoney = 0;
                        kindInfo.discountRate = 100;
                        kindInfo.taxRate = 0;
                        kindInfo.taxMoney = 0;
                        kindInfo.deliverDate = '',
                            kindInfo.description = '';
                    }
                    //采购收获
                    if (component.order == "12") {
                        kindInfo.receivePrice = 0;
                        kindInfo.receiveAmount = 0;
                        kindInfo.receiveMoney = 0;
                        kindInfo.discountRate = 100;
                        kindInfo.taxRate = 0;
                        kindInfo.taxMoney = 0;
                        kindInfo.description = '';
                    }
                    //采购退货
                    if (component.order == "13") {
                        kindInfo.returnPrice = 0;
                        kindInfo.returnAmount = 0;
                        kindInfo.returnMoney = 0;
                        kindInfo.discountRate = 100;
                        kindInfo.taxRate = 0;
                        kindInfo.taxMoney = 0;
                        kindInfo.deliverDate = '';
                        kindInfo.description = '';
                    }
                    //销售订单
                    if (component.order == "21") {
                        kindInfo.wholesalePrice = 0;
                        kindInfo.saleAmount = 0;
                        kindInfo.saleMoney = 0;
                        kindInfo.discountRate = 100;
                        kindInfo.deliverDate = '';
                        kindInfo.description = "";
                    }
                    //销售出库
                    if (component.order == "22") {
                        kindInfo.deliverAmount = 0;
                        kindInfo.wholesalePrice = 0;
                        kindInfo.discountRate = 100;
                        kindInfo.deliverMoney = 0;
                    }
                    //客户退货
                    if (component.order == "23") {
                        kindInfo.returnAmount = 0;
                        kindInfo.wholesalePrice = 0;
                        kindInfo.discountRate = 100;
                        kindInfo.returnMoney = 0;
                        kindInfo.description = '';
                    }
                    //零售
                    if (component.order == "24") {
                        kindInfo.retailPrice = 0;
                        kindInfo.saleAmount = 0;
                        kindInfo.discountRate = 100;
                        kindInfo.saleMoney = 0;
                        kindInfo.gratisAmount = 0;
                        kindInfo.giftsNum = 0;
                        kindInfo.actualMoney = 0;
                        kindInfo.performanceMoney = 0;
                        kindInfo.cashMoney = 0;
                        kindInfo.cashTicket = 0;
                        kindInfo.score = 0;
                        kindInfo.inventory = 0;
                        kindInfo.description = '';
                    }

                    if (_.isArray(component.data)) {
                        //是否存在
                        var exsitKind = _.find(component.data, function(item) { return item.barNo == barcode; });
                        if (exsitKind) {

                        } else {
                            component.data.push(kindInfo);
                        }
                    }
                    component.$dispatch('scan', kindInfo);
                    if (component.edit) {
                        mainView.router.load({
                            url: component.edit,
                            query: {
                                kind: kindInfo
                            }
                        });
                    }
                })

            });
        }
    }
});


//货品信息
Vue.component('kind-info', {
    props: ['kind'],
    template: '<div class="item-media">' +
        '<kind-img :kind-id="kind.kindId"></kind-img>' +
        '</div>' +
        '<div class="item-inner">' +
        '<div class="item-title-row">' +
        '<div class="item-title">{{kind.kindName}}</div>' +
        '<div class="item-after">{{kind.priceList | kindPrice "sale-price" | currency}}/{{kind.unitName}}</div>' +
        '</div>' +
        '<div class="item-text"> ' +
        '<div class="row"> ' +
        '<div class="col-33"><div>品牌:{{kind.brandName}}</div></div>' +
        '<div class="col-33"><div>货号:{{kind.kindNo}}</div></div>' +
        '<div class="col-33"><div>分类:{{kind.kindClassName}}</div></div>' +
        '</div>' +
        '<div class="row"> ' +
        '<div class="col-33"><div>尺码组:{{kind.sizeGroupName}}</div></div> ' +
        '<div class="col-33"><div>重量:{{kind.weight}}Kg</div></div> ' +
        '<div class="col-33"><div>季节:{{kind.seasonName}}</div></div>' +
        '</div>' +
        '</div>' +
        '</div>',
});

//供应商选择器
Vue.component('select-supplier', {
    props: ['data', 'source', 'max', 'editStatus'],
    template: '<div>' +
        '<div v-if=' + 'editStatus==="true"' + ' v-on:click="select($event,item)" data-id="{{item.companyId}}" v-for="item in source" class="chip item">' +
        '<div class="chip-media"><i style="color:#fff" class="fa fa-qq"></i></div>' +
        '<div class="chip-label">{{item.companyName }}</div>' +
        '</div>' +
        '<div v-if=' + 'editStatus==="false"' + ' v-on:click="select($event,item)" data-id="{{item.companyId}}" v-for="item in source" class="chip item">' +
        '<div class="chip-media"><i style="color:#fff" class="fa fa-qq"></i></div>' +
        '<div class="chip-label">{{item.companyName }}</div>' +
        '</div>' +
        '<div v-on:click="add" class="chip">' +
        '<div class="chip-media bg-white"><i class="fa fa-plus"></i></div>' +
        '<div class="chip-label">新供应商</div>' +
        '</div>' +
        '<div v-on:click="switch($event)" data-type="expend" class="chip">' +
        '<div class="chip-media bg-white"><i class="fa fa-exchange"></i></div>' +
        '<div class="chip-label switch-label">确认</div>' +
        '</div>' +
        '</div>',
    watch: {
        'data': function(val, oldVal) {
            var chapWrapDiv = $$(this.$el);
            if (this.editStatus === 'false') {
                if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
                    chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
                }
                return;
            }

            //最大数量
            var maxItem = parseInt(this.max) || 1;
            if (maxItem > 1 && _.isArray(val) && val.length == 0) {
                chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
            }
            if (maxItem > 1 && _.isArray(val) && val.length > 0) {
                _.each(val, function(item) {
                    if (!chapWrapDiv.find('.chip[data-id="' + item + '"]').hasClass('bg-green')) {
                        chapWrapDiv.find('.chip[data-id="' + item + '"]').addClass('bg-green');
                    }
                });
            }
            if (maxItem == 1) {
                if (this.data != '') {
                    if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
                        chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
                    }
                } else {
                    chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
                }
            }
        }
    },
    methods: {
        select: function(event, supplier) {
            if (this.editStatus === 'false') {
                xunSoft.helper.showMessage("供应商不可修改");
                return;
            }

            //Div 元素
            var chipDiv = $$(event.currentTarget);
            //最大数量
            var maxItem = parseInt(this.max) || 1;

            //检查选中的状态
            if (chipDiv.hasClass('bg-green')) {
                chipDiv.removeClass('bg-green');

                if (maxItem == 1) {
                    this.data = 0;
                } else {
                    this.data.$remove(supplier.companyId);
                }
            } else {

                if (maxItem == 1) {
                    chipDiv.parent().find('.chip.bg-green').removeClass('bg-green');
                    this.data = supplier.companyId;
                } else {
                    this.data.push(supplier.companyId);
                }

                chipDiv.addClass('bg-green');
            }

        },
        add: function() {
            eShop.prompt('新供应商名称', '新供应商', function(result) {
                if (!_.isEmpty(result)) {
                    var request = {
                        data: {
                            companyName: result
                        }
                    };
                    purchaseService.post.postSupplier(request, {}, function(responseData) {
                        baseInfoService.suppliers.push(responseData.data);
                    });
                }
            });
        },
        //切换显示
        switch: function(event) {
            //Div 元素
            var chipDiv = $$(event.currentTarget);
            var dataType = chipDiv.attr('data-type');
            if (dataType == "expend") {
                chipDiv.attr('data-type', 'shrink')

                chipDiv.parent().find('.chip.item:not(.bg-green)').css('display', 'none');
                chipDiv.find('.switch-label').text('更多');
            } else {
                chipDiv.attr('data-type', 'expend');

                chipDiv.parent().find('.chip.item:not(.bg-green)').css('display', 'inline-flex');
                chipDiv.find('.switch-label').text('确认');
            }
        }
    }
});


//客户选择器
Vue.component('select-customer', {
    props: ['data', 'source', 'max', 'editStatus'],
    template: '<div>' +
        '<div v-if=' + 'editStatus==="true"' + ' v-on:click="select($event,item)" data-id="{{item.companyId}}" v-for="item in source" class="chip item">' +
        '<div class="chip-media"><i style="color:#fff" class="fa fa-qq"></i></div>' +
        '<div class="chip-label">{{item.companyName }}</div>' +
        '</div>' +
        '<div v-if=' + 'editStatus==="false"' + ' v-on:click="select($event,item)" data-id="{{item.companyId}}" v-for="item in source" class="chip item">' +
        '<div class="chip-media"><i style="color:#fff" class="fa fa-qq"></i></div>' +
        '<div class="chip-label">{{item.companyName }}</div>' +
        '</div>' +
        '<div v-on:click="add" class="chip">' +
        '<div class="chip-media bg-white"><i class="fa fa-plus"></i></div>' +
        '<div class="chip-label">新客户</div>' +
        '</div>' +
        '<div v-on:click="switch($event)" data-type="expend" class="chip">' +
        '<div class="chip-media bg-white"><i class="fa fa-exchange"></i></div>' +
        '<div class="chip-label switch-label">确认</div>' +
        '</div>' +
        '</div>',
    watch: {
        'data': function(val, oldVal) {

            var chapWrapDiv = $$(this.$el);
            if (this.editStatus === 'false') {
                if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
                    chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
                }
                return;
            }

            //最大数量
            var maxItem = parseInt(this.max) || 1;
            if (maxItem > 1 && _.isArray(val) && val.length == 0) {
                chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
            }
            if (maxItem > 1 && _.isArray(val) && val.length > 0) {
                _.each(val, function(item) {
                    if (!chapWrapDiv.find('.chip[data-id="' + item + '"]').hasClass('bg-green')) {
                        chapWrapDiv.find('.chip[data-id="' + item + '"]').addClass('bg-green');
                    }
                });
            }
            if (maxItem == 1) {
                if (this.data != '') {
                    if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
                        chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
                    }
                } else {
                    chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
                }
            }
        }
    },
    methods: {
        select: function(event, supplier) {
            if (this.editStatus === 'false') {
                xunSoft.helper.showMessage("客户不可修改");
                return;
            }
            //Div 元素
            var chipDiv = $$(event.currentTarget);
            //最大数量
            var maxItem = parseInt(this.max) || 1;

            //检查选中的状态
            if (chipDiv.hasClass('bg-green')) {
                chipDiv.removeClass('bg-green');

                if (maxItem == 1) {
                    this.data = 0;
                } else {
                    this.data.$remove(supplier.companyId);
                }
            } else {

                if (maxItem == 1) {
                    chipDiv.parent().find('.chip.bg-green').removeClass('bg-green');
                    this.data = supplier.companyId;
                } else {
                    this.data.push(supplier.companyId);
                }

                chipDiv.addClass('bg-green');
            }

        },
        add: function() {
            eShop.prompt('新客户名称', '新客户', function(result) {
                if (!_.isEmpty(result)) {
                    var request = {
                        data: {
                            companyName: result
                        }
                    };
                    saleService.post.postCustomer(request, {}, function(responseData) {
                        baseInfoService.customers.push(responseData.data);
                    });
                }
            });
        },
        //切换显示
        switch: function(event) {
            //Div 元素
            var chipDiv = $$(event.currentTarget);
            var dataType = chipDiv.attr('data-type');
            if (dataType == "expend") {
                chipDiv.attr('data-type', 'shrink')

                chipDiv.parent().find('.chip.item:not(.bg-green)').css('display', 'none');
                chipDiv.find('.switch-label').text('更多');
            } else {
                chipDiv.attr('data-type', 'expend');

                chipDiv.parent().find('.chip.item:not(.bg-green)').css('display', 'inline-flex');
                chipDiv.find('.switch-label').text('确认');
            }
        }
    }
});

//用户选择器
Vue.component('select-user', {
    props: ['data', 'source', 'max'],
    template: '<div>' +
        '<div v-on:click="select($event,item)" data-id="{{item.userId}}" v-for="item in source" class="chip item">' +
        '<div class="chip-media"><i style="color:#fff" class="fa fa-user"></i></div>' +
        '<div class="chip-label">{{item.employeeName }}</div>' +
        '</div>' +
        '<div v-on:click="switch($event)" data-type="expend" class="chip">' +
        '<div class="chip-media bg-white"><i class="fa fa-exchange"></i></div>' +
        '<div class="chip-label switch-label">确认</div>' +
        '</div>' +
        '</div>',
    watch: {
        'data': function(val, oldVal) {
            var chapWrapDiv = $$(this.$el);
            //最大数量
            var maxItem = parseInt(this.max) || 1;
            //是否有值
            if (maxItem > 1 && _.isArray(val) && val.length == 0) {
                chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
            }
            if (maxItem > 1 && _.isArray(val) && val.length > 0) {
                _.each(val, function(item) {
                    if (!chapWrapDiv.find('.chip[data-id="' + item + '"]').hasClass('bg-green')) {
                        chapWrapDiv.find('.chip[data-id="' + item + '"]').addClass('bg-green');
                    }
                });
            }
            if (maxItem == 1) {
                if (this.data != '') {
                    if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
                        chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
                    }
                } else {
                    chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
                }
            }
        }
    },
    methods: {
        select: function(event, user) {
            //Div 元素
            var chipDiv = $$(event.currentTarget);
            //最大数量
            var maxItem = parseInt(this.max) || 1;

            //检查选中的状态
            if (chipDiv.hasClass('bg-green')) {
                chipDiv.removeClass('bg-green');

                if (maxItem == 1) {
                    this.data = 0;
                } else {
                    this.data.$remove(user.userId);
                }
            } else {

                if (maxItem == 1) {
                    chipDiv.parent().find('.chip.bg-green').removeClass('bg-green');
                    this.data = user.userId;
                } else {
                    this.data.push(user.userId);
                }

                chipDiv.addClass('bg-green');
            }
        },
        //切换显示
        switch: function(event) {
            //Div 元素
            var chipDiv = $$(event.currentTarget);
            var dataType = chipDiv.attr('data-type');
            if (dataType == "expend") {
                chipDiv.attr('data-type', 'shrink')

                chipDiv.parent().find('.chip.item:not(.bg-green)').css('display', 'none');
                chipDiv.find('.switch-label').text('更多');
            } else {
                chipDiv.attr('data-type', 'expend');

                chipDiv.parent().find('.chip.item:not(.bg-green)').css('display', 'inline-flex');
                chipDiv.find('.switch-label').text('确认');
            }
        }
    }
});

//颜色选择器
Vue.component('select-color', {
    props: ['data', 'source', 'max', 'kindId'],
    template: '<div>' +
        '<div v-on:click="select($event,item)" data-id="{{item.colorId}}" v-for="item in source" class="chip">' +
        '<div class="chip-media"><i style="color:#fff" class="fa fa-paint-brush"></i></div>' +
        '<div class="chip-label">{{item.colorName }}</div>' +
        '</div>' +
        '<div v-on:click="add" class="chip">' +
        '<div class="chip-media bg-white"><i class="fa fa-plus"></i></div>' +
        '<div class="chip-label">新颜色</div>' +
        '</div>' +
        '</div>',
    watch: {
        'data': function(val, oldVal) {
            var chapWrapDiv = $$(this.$el);
            //最大数量
            var maxItem = parseInt(this.max) || 1;
            if (maxItem > 1 && _.isArray(val) && val.length == 0) {
                chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
            }
            if (maxItem > 1 && _.isArray(val) && val.length > 0) {
                _.each(val, function(item) {
                    if (!chapWrapDiv.find('.chip[data-id="' + item + '"]').hasClass('bg-green')) {
                        chapWrapDiv.find('.chip[data-id="' + item + '"]').addClass('bg-green');
                    }
                });
            }
            if (maxItem == 1) {
                if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
                    chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
                }
            }

        }
    },
    methods: {
        select: function(event, color) {
            //Div 元素
            var chipDiv = $$(event.currentTarget);
            //最大数量
            var maxItem = parseInt(this.max) || 1;

            //检查选中的状态
            if (chipDiv.hasClass('bg-green')) {
                chipDiv.removeClass('bg-green');

                if (maxItem == 1) {
                    this.data = 0;
                } else {
                    this.data.$remove(color.colorId);
                }
            } else {

                if (maxItem == 1) {
                    chipDiv.parent().find('.chip.bg-green').removeClass('bg-green');
                    this.data = color.colorId;
                } else {
                    this.data.push(color.colorId);
                }

                chipDiv.addClass('bg-green');
            }
        },
        add: function() {

            var component = this;

            var kindid = parseInt(this.kindId) || 0;

            eShop.prompt('新颜色名称', '新颜色', function(result) {
                if (!_.isEmpty(result)) {
                    var request = {
                        data: {
                            colorName: result
                        }
                    };

                    if (kindid == 0) {
                        //保存颜色
                        kindService.post.postColor(request, {}, function(responseData) {
                            baseInfoService.colors.push(responseData.data);
                        });
                    } else {

                        request.data.kindId = kindid;
                        //保存货品颜色
                        kindService.post.postKindColor(request, {}, function(responseData) {
                            component.source.push(responseData.data);
                        });
                    }
                }
            });
        }
    }

});

//尺码选择器
Vue.component('select-size', {
    props: ['data', 'source', 'max', 'sizeGroupId', 'kindId'],
    template: '<div>' +
        '<div v-on:click="select($event,item)" data-id="{{item.sizeId}}" v-for="item in source" class="chip">' +
        '<div class="chip-media"><i style="color:#fff" class="fa fa-pencil"></i></div>' +
        '<div class="chip-label">{{item.sizeText }}</div>' +
        '</div>' +
        '<div v-on:click="add" class="chip">' +
        '<div class="chip-media bg-white"><i class="fa fa-plus"></i></div>' +
        '<div class="chip-label">新尺码</div>' +
        '</div>' +
        '</div>',
    watch: {
        'data': function(val, oldVal) {
            var chapWrapDiv = $$(this.$el);
            //最大数量
            var maxItem = parseInt(this.max) || 1;
            if (maxItem > 1 && _.isArray(val) && val.length == 0) {
                chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
            }
            if (maxItem > 1 && _.isArray(val) && val.length > 0) {
                _.each(val, function(item) {
                    if (!chapWrapDiv.find('.chip[data-id="' + item + '"]').hasClass('bg-green')) {
                        chapWrapDiv.find('.chip[data-id="' + item + '"]').addClass('bg-green');
                    }
                });
            }
            if (maxItem == 1) {
                if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
                    chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
                }
            }
        }
    },
    methods: {
        select: function(event, size) {
            //Div 元素
            var chipDiv = $$(event.currentTarget);
            //最大数量
            var maxItem = parseInt(this.max) || 1;

            //检查选中的状态
            if (chipDiv.hasClass('bg-green')) {
                chipDiv.removeClass('bg-green');

                if (maxItem == 1) {
                    this.data = 0;
                } else {
                    this.data.$remove(size.sizeId);
                }
            } else {

                if (maxItem == 1) {
                    chipDiv.parent().find('.chip.bg-green').removeClass('bg-green');
                    this.data = size.sizeId;
                } else {
                    this.data.push(size.sizeId);
                }

                chipDiv.addClass('bg-green');
            }
        },
        add: function() {
            if (this.sizeGroupId > 0 || this.kindId > 0) {

                var component = this;

                eShop.prompt('新尺码名称', '新尺码', function(result) {
                    if (!_.isEmpty(result)) {
                        var request = {
                            data: {
                                sizeGroupId: component.sizeGroupId,
                                sizeText: result
                            }
                        };
                        var kindId = parseInt(component.kindId) || 0;
                        if (kindId == 0) {
                            //保存尺码
                            kindService.post.postSize(request, {}, function(responseData) {
                                baseInfoService.sizes.push(responseData.data);
                                component.source.push(responseData.data);
                            });
                        } else {
                            request.data.kindId = kindId;
                            //保存货品尺码
                            kindService.post.postKindSize(request, {}, function(responseData) {
                                component.source.push(responseData.data);
                            });
                        }
                    }
                });
            }
        }
    }
});

//货品尺码组选择器
Vue.component('select-size-group', {
    props: ['data', 'source', 'max'],
    template: '<div>' +
        '<div v-on:click="select($event,item)" data-id="{{item.sizeGroupId}}" v-for="item in source" class="chip">' +
        '<div class="chip-media"><i style="color:#fff" class="fa fa-window-restore"></i></div>' +
        '<div class="chip-label">{{item.sizeGroupName }}</div>' +
        '</div>' +
        '<div v-on:click="add" class="chip">' +
        '<div class="chip-media bg-white"><i class="fa fa-plus"></i></div>' +
        '<div class="chip-label">新尺码组</div>' +
        '</div>' +
        '</div>',
    watch: {
        'data': function(val, oldVal) {
            var chapWrapDiv = $$(this.$el);
            //最大数量
            var maxItem = parseInt(this.max) || 1;
            if (maxItem > 1 && _.isArray(val) && val.length == 0) {
                chapWrapDiv.find('.chip.bg-green').removeClass('bg-green');
            }
            if (maxItem > 1 && _.isArray(val) && val.length > 0) {
                _.each(val, function(item) {
                    if (!chapWrapDiv.find('.chip[data-id="' + item + '"]').hasClass('bg-green')) {
                        chapWrapDiv.find('.chip[data-id="' + item + '"]').addClass('bg-green');
                    }
                });
            }
            if (maxItem == 1) {
                if (!chapWrapDiv.find('.chip[data-id="' + this.data + '"]').hasClass('bg-green')) {
                    chapWrapDiv.find('.chip[data-id="' + this.data + '"]').addClass('bg-green');
                }
            }
        }
    },
    methods: {
        select: function(event, sizeGroup) {
            //Div 元素
            var chipDiv = $$(event.currentTarget);
            //最大数量
            var maxItem = parseInt(this.max) || 1;

            //检查选中的状态
            if (chipDiv.hasClass('bg-green')) {
                chipDiv.removeClass('bg-green');

                if (maxItem == 1) {
                    this.data = 0;
                } else {
                    this.data.$remove(sizeGroup.sizeGroupId);
                }
            } else {

                if (maxItem == 1) {
                    chipDiv.parent().find('.chip.bg-green').removeClass('bg-green');
                    this.data = sizeGroup.sizeGroupId;
                } else {
                    this.data.push(sizeGroup.sizeGroupId);
                }

                chipDiv.addClass('bg-green');
            }

        },
        add: function() {
            eShop.prompt('新货品尺码组', '新尺码组', function(result) {
                if (!_.isEmpty(result)) {
                    var request = {
                        data: {
                            sizeGroupName: result
                        }
                    };
                    kindService.post.postSizeGroup(request, {}, function(responseData) {
                        baseInfoService.sizeGroups.push(responseData.data);
                    });
                }
            });
        }
    }
});

//云报表时间选择控件
Vue.component('select-date', {
    props: ['data'],
    template: ['<div id="select-date">',
        '<div class="buttons-row top">',
        '<a href="#tabDay" class="tab-link active button" v-on:click="loadReport(0,$event)">日</a>',
        '<a href="#tabWeek" class="tab-link button " v-on:click="loadReport(1,$event)">周</a>',
        '<a href="#tabMonth" class="tab-link button" v-on:click="loadReport(2,$event)">月</a>',
        '<a href="#tabYear" class="tab-link button " v-on:click="loadReport(3,$event)">年</a>',
        ' <a href="#tabDefine" class="tab-link button" v-on:click="loadReport(4,$event)">自定义</a>',
        '</div>',
        '<div class="tab-detail">',
        '<div id="tabDay" class="tab active row">',
        '<a href="" class="col-20 text-center" v-on:click="prev(0)">前一天</a>',
        '<span class="col-60 text-center">{{data.startTime|date}}</span>',
        '<a href="" class="col-20 text-center" v-on:click="next(0)">后一天</a>',
        '</div>',
        '<div id="tabWeek" class="tab  row">',
        '<a href="" class="col-20 text-center" v-on:click="prev(1)">上一周</a>',
        '<span class="col-60 text-center">{{data.startTime|date}}~{{data.endTime|date}}</span>',
        '<a href="" class="col-20 text-center" v-on:click="next(1)">下一周</a>',
        '</div>',
        '<div id="tabMonth" class="tab  row">',
        '<a href="" class="col-20 text-center" v-on:click="prev(2)">上一月</a>',
        '<span class="col-60 text-center">{{data.startTime|dateYM}}</span>',
        '<a href="" class="col-20 text-center" v-on:click="next(2)">下一月</a>',
        '</div>',
        '<div id="tabYear" class="tab  row">',
        '<a href="" class="col-20 text-center" v-on:click="prev(3)">上一年</a>',
        '<span class="col-60 text-center">{{data.startTime|dateY}}</span>',
        '<a href="" class="col-20 text-center" v-on:click="next(3)">下一年</a>',
        '</div>',
        '<div id="tabDefine" class="tab row">',
        '<input class="col-35 no-gutter text-center row-date" v-model="data.startTime | date" type="text" id="startTime" v-on:change="change"/>',
        '<a href="" class="col-15 no-gutter text-center">开始</a>',
        '<input class="col-35 no-gutter text-center row-date" v-model="data.endTime | date" type="text" id="endTime" v-on:change="change"/>',
        '<a href="" class="col-15 no-gutter text-center">结束</a>',
        '</div>',
        '</div>',
        '</div>'
    ].join(""),
    methods: {
        loadReport: function(n, e) {
            var e = e || window.event;
            var dom = $$(e.target);
            var pageDiv = $$("#select-date");
            var detailDom = pageDiv.find(dom.attr("href"));
            dom.addClass("active");
            detailDom.addClass("active");
            dom.siblings().removeClass("active");
            detailDom.siblings().removeClass("active");
            switch (n) {
                case 0: //日
                    this.data.startTime = xunSoft.helper.formatDate(new Date());
                    this.data.endTime = xunSoft.helper.formatDate(new Date())
                    break;
                case 1: //周
                    this.data.startTime = xunSoft.helper.getFormatDate(0).startTime;
                    this.data.endTime = xunSoft.helper.getFormatDate(0).endTime;
                    break;
                case 2: //月
                    this.data.startTime = xunSoft.helper.getFormatDate(1).startTime;
                    this.data.endTime = xunSoft.helper.getFormatDate(1).endTime;
                    break;
                case 3: //年
                    this.data.startTime = xunSoft.helper.getFormatDate(3).startTime;
                    this.data.endTime = xunSoft.helper.getFormatDate(3).endTime;
                    break;
            }
            this.$dispatch('fresh', n);
        },
        prev: function(n) {
            //一天的毫秒数
            var millisecond = 1000 * 60 * 60 * 24;
            var start = new Date(this.data.startTime).getTime();
            var end = new Date(this.data.endTime).getTime();
            switch (n) {
                case 0: //日
                    this.data.startTime = xunSoft.helper.formatDate(new Date(start - millisecond));
                    this.data.endTime = xunSoft.helper.formatDate(new Date(end - millisecond));
                    break;
                case 1: //周
                    this.data.startTime = xunSoft.helper.formatDate(new Date(start - millisecond * 7));
                    this.data.endTime = xunSoft.helper.formatDate(new Date(end - millisecond * 7));
                    break;
                case 2: //月
                    var temp = new Date(this.data.startTime);
                    this.data.startTime = xunSoft.helper.formatDate(new Date(temp.setMonth(temp.getMonth() - 1)));
                    //this.dataendTime = xunSoft.helper.getFormatDate(1).endTime;
                    break;
                case 3: //年
                    var temp = new Date(this.data.startTime);
                    this.data.startTime = xunSoft.helper.formatDate(new Date(temp.setFullYear(temp.getFullYear() - 1)));
                    //this.data.endTime = xunSoft.helper.getFormatDate(3).endTime;
                    break;
            }
            this.$dispatch('fresh', n);
        },
        next: function(n) {
            //一天的毫秒数
            var millisecond = 1000 * 60 * 60 * 24;
            var start = new Date(this.data.startTime).getTime();
            var end = new Date(this.data.endTime).getTime();
            switch (n) {
                case 0: //日
                    this.data.startTime = xunSoft.helper.formatDate(new Date(start + millisecond));
                    this.data.endTime = xunSoft.helper.formatDate(new Date(end + millisecond));
                    break;
                case 1: //周
                    this.data.startTime = xunSoft.helper.formatDate(new Date(start + millisecond * 7));
                    this.data.endTime = xunSoft.helper.formatDate(new Date(end + millisecond * 7));
                    break;
                case 2: //月
                    var temp = new Date(this.data.startTime);
                    this.data.startTime = xunSoft.helper.formatDate(new Date(temp.setMonth(temp.getMonth() + 1)));
                    //this.data.endTime = xunSoft.helper.getFormatDate(1).endTime;
                    break;
                case 3: //年
                    var temp = new Date(this.data.startTime);
                    this.data.startTime = xunSoft.helper.formatDate(new Date(temp.setFullYear(temp.getFullYear() + 1)));
                    //this.data.endTime = xunSoft.helper.getFormatDate(3).endTime;
                    break;
            }
            this.$dispatch('fresh', n);
        },
        change: function() {
            this.$dispatch('fresh');
        }
    }
});