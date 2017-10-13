
//益损单菜单
Vue.component('warehouse-profitloss-menu',{
	props:['list'],
	template:
		'<div class="row no-gutter">'+
        '<div class="col-auto">'+
          '<select-order-kind :data.sync="list" edit="warehouse/profitLossOrder/editKind.ios.html"></select-order-kind>'+
        '</div>'+
        '<div class="col-auto">'+
          '<select-barcode :data.sync="list" order="11" edit="warehouse/profitLossOrder/editKindPrice.ios.html"></select-barcode>'+
        '</div>'+
        '<div v-on:click="sortMoneyKind" data-order="asc" class="col-auto">'+
          '<div class="text-center">'+
            '<i class="fa fa-jpy fa-3x"></i>'+
          '</div>'+
          '<div class="text-center">金额排序</div>'+
        '</div>'+
        '<div data-order="asc" class="col-auto">'+
          '<sort-amount :data.sync="list" prop="profitLossAmount"></sort-amount>'+
        '</div>'+
    '</div>',
    methods:{
    	//金额排序
  		sortMoneyKind:function(event){
  			if(this.list.length>1){
  				var order=$$(event.currentTarget).attr('data-order');
  				//检查排序方式
  				if(order=="asc"){
  					//asc 从小到大
  					this.list=_.sortBy(this.list,
  						function(item){ return (item.profitLossMoney-item.taxMoney); });
  					$$(event.currentTarget).attr('data-order',"desc");
  				}else{
  					//desc 从大到小
  					var orderBy=_.sortBy(this.list,function(item){ return (item.profitLossMoney-item.taxMoney); });
  					this.list=orderBy.reverse();
  					$$(event.currentTarget).attr('data-order',"asc");
  				}
  			}
  		}
    }
});

//益损订单货品明细
Vue.component('warehouse-profitloss-detail',{
	props: ['list','detail'],
	template:
		'<div>'+
        '<div>'+
          '<kind-img :kind-id="detail.kindId" :color-id="detail.colorId"></kind-img>'+
        '</div>'+
        '<div>'+
          '<div>{{detail.kind.kindName}}</div>'+
          '<div class="row no-gutter">'+
            '<div class="col-50">'+
              '品牌:{{detail.kind.brandName}}'+
            '</div>'+
            '<div class="col-50">'+
              '货号:{{detail.kind.kindNo}} '+
            '</div>'+
            
          '</div>'+
          '<div class="row no-gutter">'+
            '<div class="col-50">'+
              '颜色:{{detail.kind.colorName}}'+
            '</div>'+
            '<div class="col-50">'+
              '尺码:{{detail.kind.sizeText}} '+
            '</div>'+
          '</div>'+
          '<div class="row no-gutter">'+ 
            '<div class="col-50">'+
              '成本价:{{detail.retailPrice}} '+
            '</div>'+
            '<div class="col-50">'+
              '库存:{{detail.inventory}}'+
            '</div>'+
          '</div>'+
          '<div class="row no-gutter">'+ 
            '<div class="col-50">'+
              '数量:{{detail.profitLossAmount}} '+
            '</div>'+
            '<div class="col-50">'+
              '金额:{{detail.profitLossMoney}}'+
            '</div>'+
          '</div>'+
      '<div class="row">'+
        '<div class="col-50">'+
          '<edit-kind :data.sync="list" :kind="detail" edit="warehouse/profitLossOrder/editKindPrice.ios.html"></edit-kind>'+
        '</div>'+
        '<div class="col-50">'+
          '<delete-kind v-on:delete="delete(detail)" :data.sync="list" :kind="detail"></delete-kind>'+
        '</div>'+
      '</div>'+
    '</div>',
  methods:{
    delete:function(kind){
      this.$dispatch('delete',kind);
    }
  }
});

//库存盘点单菜单
Vue.component('warehouse-checkstock-menu',{
	props:['list'],
	template:
		'<div class="row no-gutter">'+
        '<div class="col-auto">'+
          '<select-order-kind :data.sync="list" edit="warehouse/checkStockOrder/editKind.ios.html"></select-order-kind>'+
        '</div>'+
        '<div class="col-auto">'+
          '<select-barcode :data.sync="list" order="11" edit="warehouse/checkStockOrder/editKindPrice.ios.html"></select-barcode>'+
        '</div>'+
        '<div v-on:click="sortMoneyKind" data-order="asc" class="col-auto">'+
          '<div class="text-center">'+
            '<i class="fa fa-jpy fa-3x"></i>'+
          '</div>'+
          '<div class="text-center">金额排序</div>'+
        '</div>'+
        '<div data-order="asc" class="col-auto">'+
          '<sort-amount :data.sync="list" prop="checkStockAmount"></sort-amount>'+
        '</div>'+
    '</div>',
    methods:{
    	//金额排序
  		sortMoneyKind:function(event){
  			if(this.list.length>1){
  				var order=$$(event.currentTarget).attr('data-order');
  				//检查排序方式
  				if(order=="asc"){
  					//asc 从小到大
  					this.list=_.sortBy(this.list,
  						function(item){ return item.checkStockMoney; });
  					$$(event.currentTarget).attr('data-order',"desc");
  				}else{
  					//desc 从大到小
  					var orderBy=_.sortBy(this.list,function(item){ return item.checkStockMoney; });
  					this.list=orderBy.reverse();
  					$$(event.currentTarget).attr('data-order',"asc");
  				}
  			}
  		}
    }
});

//库存盘点单货品明细
Vue.component('warehouse-checkstock-detail',{
	props: ['list','detail'],
	template:
		'<div>'+
          '<div>'+
            '<kind-img :kind-id="detail.kindId" :color-id="detail.colorId"></kind-img>'+
          '</div>'+
          '<div>'+
            '<div >{{detail.kind.kindName}}</div>'+
            '<div class="row no-gutter">'+
              '<div class="col-50">'+
                '品牌:{{detail.kind.brandName}}'+
              '</div>'+
              '<div class="col-50">'+
                '货号:{{detail.kind.kindNo}}'+
              '</div>'+
            '</div>'+
            '<div class="row no-gutter">'+
              '<div class="col-50">'+
                '颜色:{{detail.kind.colorName}}'+
              '</div>'+
              '<div class="col-50">'+
                '尺码:{{detail.kind.sizeText}}'+
              '</div>'+
            '</div>'+
           '<div class="row no-gutter">'+
            '<div class="col-50">'+
              '账面数量:{{detail.accountAmount}}'+
            '</div>'+
            '<div class="col-50">'+
              '盘点数量:{{detail.checkAmount}}'+
            '</div>'+
           '</div>'+
           '<div class="row no-gutter">'+
            '<div class="col-100">'+
              '盈亏数量:{{detail.profitLossAmount}}'+
            '</div>'+
           '</div>'+
      '</div>'+
      '<div class="row">'+
        '<div class="col-50">'+
          '<edit-kind :data.sync="list" :kind="detail" edit="warehouse/checkStockOrder/editKindPrice.ios.html"></edit-kind>'+
        '</div>'+
        '<div class="col-50">'+
          '<delete-kind v-on:delete="delete(detail)" :data.sync="list" :kind="detail"></delete-kind>'+
        '</div>'+
      '</div>'+
    '</div>',
  methods:{
    delete:function(kind){
      this.$dispatch('delete',kind);
    }
  }
});
