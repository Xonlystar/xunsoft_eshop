//软件设置
eShop.onPageInit('setting_option',function(page){

	var pageDiv=$$(page.container);

	var vm=new Vue({
		el:page.container,
		data:{
			request:{
				bluetoothId:''
			},
			response:{
				bluetooths:[]
			}
		},
		methods:{
			init:function(){
				this.loadBluetooth();
			},
			//加载蓝牙设备
			loadBluetooth:function(){
			    console.log('检索蓝牙');
			    xunSoft.device.bluetooth.scan(function(device){
                   // console.log('startScan found device named: ' + device.name);
                    console.log(JSON.stringify(device));
                    if(device.name){
                        var newPrint={
                            id:device.address,
                            name:device.name
                        };
                        console.log(JSON.stringify(newPrint));
                        var exist=_.find(vm.response.bluetooths,function(item){  return item.id==newPrint.id });
                        if(!exist){
                            vm.response.bluetooths.push(newPrint);
                        }
                    }
			    });
			},
			save:function(){
				if (!vm.request.bluetoothId) {
					xunSoft.helper.showMessage('请选择蓝牙！');
					return;
				}
				var id=vm.request.bluetoothId;
				xunSoft.setting.bluetoothId(id);
				xunSoft.helper.showMessage('蓝牙保存成功!');
			}
		}
	});

	vm.init();

});

eShop.onPageBack('setting_option',function(){
    console.log('页面隐藏');
    xunSoft.device.bluetooth.stop();
})
