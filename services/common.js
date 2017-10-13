var xunSoft = {

    //实用函数
    helper: {
        //显示信息
        showMessage: function(_message, _title) {

            if (_message) {
                var title = _title ? _title : '友情提示';

                eShop.addNotification({
                    title: title,
                    message: _message,
                    hold: 1500,
                    closeIcon: false
                });
            }
        },
        showConfirm: function(_message, _title) {
            if (_message) {
                var title = _title ? _title : '友情提示';

                eShop.addNotification({
                    title: title,
                    message: _message,
                    hold: 1500,
                    closeIcon: false
                });
            }
        },
        //格式化日期
        formatDate: function(dateVal) {
            var newDateStr = '';

            if (_.isDate(dateVal)) {
                var month = dateVal.getMonth() + 1;
                var day = dateVal.getDate();
                if (month < 10) {
                    month = "0" + month;
                }
                if (day < 10) {
                    day = "0" + day;
                }
                return newDateStr = dateVal.getFullYear() + '-' + month + '-' + day;
            } else if (_.isString(dateVal) || _.isNumber(dateVal)) {
                try {
                    return arguments.callee(new Date(dateVal))
                } catch (ex) {
                    console.log(ex);
                }
            }
            return newDateStr;
        },
        //格式化日期时间
        formatDateTime: function(dateVal) {
            var newDateStr = '';

            if (_.isDate(dateVal)) {
                newDateStr = dateVal.getFullYear() + '-' + (dateVal.getMonth() + 1) + '-' + dateVal.getDate() +
                    " " + dateVal.getHours() + ":" + dateVal.getMinutes() + ":";
                if (dateVal.getSeconds() < 10) {
                    newDateStr += "0";
                }
                newDateStr += dateVal.getSeconds();
            }
            if (_.isString(dateVal) || _.isNumber(dateVal)) {
                try {
                    var tempDate = new Date(dateVal);
                    newDateStr = tempDate.getFullYear() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getDate() +
                        " " + tempDate.getHours() + ":" + tempDate.getMinutes() + ":";
                    if (tempDate.getSeconds() < 10) {
                        newDateStr += "0";
                    }
                    newDateStr += tempDate.getSeconds();
                } catch (ex) {
                    console.log(ex);
                }
            }
            return newDateStr;
        },
        //
        getFormatDate: function(type, state) {
            /**
             * type:0 获取本周起始截止日期时间
             * 		1 获取本月起始截止日期时间
             * 		2获取本季起始截止日期时间
             *      3获取本年起始截止日期时间
             * state:0 返回日期
             * state:1 返回时间
             */
            state = state == null ? 0 : state;
            var dateResult = {
                startTime: '',
                endTime: ''
            };
            //现在的时间
            var current = new Date();
            //一天的毫秒数
            var millisecond = 1000 * 60 * 60 * 24;
            //获得当前月份0-11    
            var currentMonth = current.getMonth();
            //获得当前年份4位年    
            var currentYear = current.getFullYear();
            switch (type) {
                case 0:
                    {
                        var week = current.getDay();
                        var month = current.getDate();
                        //减去的天数
                        var minusDay = week != 0 ? week - 1 : 6;
                        var startTime = new Date(current.getTime() - (minusDay * millisecond));
                        var endTime = new Date(startTime.getTime() + (6 * millisecond));
                        if (state === 0) {
                            dateResult.startTime = xunSoft.helper.formatDate(startTime);
                            dateResult.endTime = xunSoft.helper.formatDate(endTime);
                        } else if (state == 1) {
                            dateResult.startTime = xunSoft.helper.formatDateTime(startTime);
                            dateResult.endTime = xunSoft.helper.formatDateTime(endTime);
                        }
                        break;
                    }
                case 1:
                    {
                        //求出本月第一天  
                        var firstDay = new Date(currentYear, currentMonth, 1);
                        //当为12月的时候年份需要加1,月份需要更新为0 也就是下一年的第一个月    
                        if (currentMonth == 11) {
                            currentYear++;
                            currentMonth = 0; //就为    
                        } else {
                            //否则只是月份增加,以便求的下一月的第一天    
                            currentMonth++;
                        }
                        //下月的第一天    
                        var nextMonthDayOne = new Date(currentYear, currentMonth, 1);
                        //求出上月的最后一天    
                        var lastDay = new Date(nextMonthDayOne.getTime() - millisecond);

                        if (state === 0) {
                            dateResult.startTime = xunSoft.helper.formatDate(firstDay);
                            dateResult.endTime = xunSoft.helper.formatDate(lastDay);
                        } else if (state == 1) {
                            dateResult.startTime = xunSoft.helper.formatDateTime(firstDay);
                            dateResult.endTime = xunSoft.helper.formatDateTime(lastDay);
                        }
                        break;
                    }
                case 2:
                    {
                        //获得本季度开始月份    
                        var seasonStartMonth = xunSoft.helper.getSeasonStartMonth(currentMonth);
                        //获得本季度结束月份    
                        var seasonEndMonth = seasonStartMonth + 2;
                        //获得本季度开始的日期    
                        var SeasonStartDate = new Date(currentYear, xunSoft.helper.getSeasonStartMonth(currentMonth), 1);
                        //获得本季度结束的日期    
                        var seasonEndDate = new Date(currentYear, seasonEndMonth, xunSoft.helper.getMonthDays(currentYear, seasonEndMonth));
                        if (state === 0) {
                            dateResult.startTime = xunSoft.helper.formatDate(SeasonStartDate);
                            dateResult.endTime = xunSoft.helper.formatDate(seasonEndDate);
                        } else if (state == 1) {
                            dateResult.startTime = xunSoft.helper.formatDateTime(SeasonStartDate);
                            dateResult.endTime = xunSoft.helper.formatDateTime(seasonEndDate);
                        }
                        break;
                    }
                case 3:
                    {
                        //获得本年开始的日期    
                        var SeasonStartDate = new Date(currentYear, 0, 1);
                        //获得本年结束的日期    
                        var seasonEndDate = new Date(currentYear, 11, 31);
                        if (state === 0) {
                            dateResult.startTime = xunSoft.helper.formatDate(SeasonStartDate);
                            dateResult.endTime = xunSoft.helper.formatDate(seasonEndDate);
                        } else if (state == 1) {
                            dateResult.startTime = xunSoft.helper.formatDateTime(SeasonStartDate);
                            dateResult.endTime = xunSoft.helper.formatDateTime(seasonEndDate);
                        }
                        break
                    }
            }
            return dateResult;
        },
        getMonthDays: function(year, month) {
            //本月第一天 1-31    
            var relativeDate = new Date(year, month, 1);
            //获得当前月份0-11    
            var relativeMonth = relativeDate.getMonth();
            //获得当前年份4位年    
            var relativeYear = relativeDate.getFullYear();

            //当为12月的时候年份需要加1    
            //月份需要更新为0 也就是下一年的第一个月    
            if (relativeMonth == 11) {
                relativeYear++;
                relativeMonth = 0;
            } else {
                //否则只是月份增加,以便求的下一月的第一天    
                relativeMonth++;
            }
            //一天的毫秒数    
            var millisecond = 1000 * 60 * 60 * 24;
            //下月的第一天    
            var nextMonthDayOne = new Date(relativeYear, relativeMonth, 1);
            //返回得到上月的最后一天,也就是本月总天数    
            return new Date(nextMonthDayOne.getTime() - millisecond).getDate();
        },
        //获取本季起始的月份
        getSeasonStartMonth: function(month) {
            var quarterMonthStart = 0;
            var spring = 0; //春    
            var summer = 3; //夏    
            var fall = 6; //秋    
            var winter = 9; //冬    
            //月份从0-11    
            if (month < 3) {
                return spring;
            }

            if (month < 6) {
                return summer;
            }

            if (month < 9) {
                return fall;
            }

            return winter;
        }
    },
    valid: {
        //邮箱验证
        validEmail: function(email) {
            var reg = /^\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}$/;
            if (new RegExp(reg).test(email)) {
                return true;
            }
            return false;
        },
        //手机号验证
        validPhone: function(phone) {
            var reg = /^0?(13|14|15|18|17)[0-9]{9}$/;
            if (new RegExp(reg).test(phone)) {
                return true;
            }
            return false;
        },
        //整数验证
        validNum: function(num) {
            var reg = /^[1-9]\d*$/;
            if (new RegExp(reg).test(num)) {
                return true;
            }
            return false;
        },

        //正浮点数验证
        validFloat: function(num) {
            var reg = /^[1-9]\d*.\d{0,2}$|^0.\d{0,2}$/;
            if (new RegExp(reg).test(num)) {
                return true;
            }
            return false;
        },
        //验证数据范围
        validDataRange: function(num, min, max) {

            var minVal = parseFloat(min) || 0;
            var maxVal = parseFloat(max) || 999999;

            var numVal = parseFloat(num);
            if (numVal > minVal && numVal < maxVal) {
                return true;
            }
            return false;
        },
        //腾讯QQ验证
        validQQ: function(qq) {
            var reg = /^[1-9]([0-9]{5,11})$/;
            if (new RegExp(reg).test(qq)) {
                return true;
            }
            return false;
        }

    },
    //相同的事件
    event: {
        callback: {},
        currentTime: 0,
        firstTime: 0,
        secondTime: 0,
        clickCount: 0,
        //系统返回键----无响应
        back: function(e) {
            e.preventDefault();
            eShop.closeModal();
        },
        //系统返回操作
        backEvent: function() {
            eShop.closeModal();
            var currency = eShop.getCurrentView().activePage.name;
            if (currency == "data-home") {
                xunSoft.event.exitMyApp();
            } else {
                mainView.router.back(); //返回到data-home mainView.activePage.fromPage.name == 'data-home' 
                if (_.isFunction(xunSoft.event.callback)) {
                    xunSoft.event.callback();
                }
            }
        },
        exitMyApp: function() {
            xunSoft.event.clickCount++;
            xunSoft.event.currentTime = new Date();
            if (xunSoft.event.clickCount == 1) {
                xunSoft.event.firstTime = xunSoft.event.currentTime.getSeconds() + xunSoft.event.currentTime.getMinutes() * 60 + xunSoft.event.currentTime.getHours() * 3600;
                xunSoft.helper.showMessage("再按一次返回键关闭程序");
            } else if (xunSoft.event.clickCount == 2) {
                xunSoft.event.secondTime = xunSoft.event.currentTime.getSeconds() + xunSoft.event.currentTime.getMinutes() * 60 + xunSoft.event.currentTime.getHours() * 3600;
                //2秒之类连续按才能退出应用程序
                if (xunSoft.event.secondTime - xunSoft.event.firstTime < 2) {
                    navigator.app.exitApp();
                    xunSoft.event.clickCount = 0;
                } else {
                    xunSoft.event.clickCount = 0;
                }
            }
        },
        //智能选择控件的初始化
        smartSelect: function(id) {
            var select = $$(id)[0];
            if (select.length === 0) return;
            var valueText = [];
            for (var i = 0; i < select.length; i++) {
                //console.log(select[i],select[i].selected);
                if (select[i].selected) valueText.push(select[i].textContent.trim());
            }
            var itemAfter = $$(select).parent().find('.item-after');
            if (itemAfter.length === 0) {
                $$(select).parent().find('.item-inner').append('<div class="item-after">' + valueText.join(', ') + '</div>');
            } else {
                itemAfter.text(valueText.join(', '));
            }
            if (valueText == null) {
                itemAfter.text("");
            }
        }
    },
    //硬件相关api
    device: {
        //设备操作 cordova-plugin-camera
        photo: {
            //开始拍照
            takePhoto: function(success) {
                try {
                    navigator.camera.getPicture(function(url) {
                        if (_.isFunction(success)) {
                            success(url);
                        }
                    }, function() {

                    }, {
                        quality: 100,
                        allowEdit: false,
                        destinationType: navigator.camera.DestinationType.FILE_URI,
                        sourceType: 1
                    });
                } catch (e) {
                    console.log(e);
                }
            },
            //进入相册
            getPhoto: function(success) {
                try {
                    navigator.camera.getPicture(function(url) {
                        if (_.isFunction(success)) {
                            success(url);
                        }
                    }, function() {

                    }, {
                        quality: 100,
                        allowEdit: false,
                        destinationType: navigator.camera.DestinationType.NATIVE_URI,
                        sourceType: 0
                    });
                } catch (e) {
                    console.log(e);
                }
            }
        },
        //直接调用电话  cordova plugin add cordova-plugin-sea-device
        call: function(number) {
            try {
                if (cordova.plugins.seaDevice) {
                    cordova.plugins.seaDevice.call(
                        number,
                        function(data) {
                            // 成功  
                        },
                        function(errorMsg) {
                            // 失败 
                        }
                    );
                } else {
                    xunSoft.helper.showMessage("设备未就绪");
                }
            } catch (e) {
                console.log(e);
            }
        },
        //文件操作 cordova-plugin-file-transfer
        file: {
            //上传文件
            upload: function(fileUrl, url, success, error) {

                var options = new FileUploadOptions();

                var headers = {
                    tenantId: xunSoft.user.tenantId(),
                    userId: xunSoft.user.userId(),
                    shopId: xunSoft.user.shopId(),
                    token: xunSoft.user.token(),
                    deviceId: xunSoft.user.deviceId(),
                    timestamp: (new Date()).getTime(),
                    appType: xunSoft.user.appType(),
                    version: xunSoft.user.version(),
                    Accept: 'application/json'
                };

                options.headers = headers;

                var ft = new FileTransfer();
                ft.upload(fileUrl, encodeURI(xunSoft.ajax.serviceBase() + url), success, error, options);
            },
            //下载文件
            download: function(url) {
                xunSoft.helper.showMessage("正在下载最新版本，请稍后...");
                var ft = new FileTransfer();
                var fileUrl = cordova.file.externalRootDirectory + "E售易-android.apk";
                var url = encodeURI(url);
                console.log(ft, fileUrl, url);
                ft.download(
                    url,
                    fileUrl,
                    function(entry) {
                        //xunSoft.helper.showMessage("下载完成: " + entry.toURL());
                        xunSoft.device.file.openfile(fileUrl);
                    },
                    function(error) {
                        xunSoft.helper.showMessage("错误的下载资源 " + error.source);
                        xunSoft.helper.showMessage("错误的下载路径 " + error.target);
                        xunSoft.helper.showMessage("错误代码" + error.code);
                    }
                );
            },
            //安装apk  cordova plugin add cordova-plugin-file-opener2
            openfile: function(filePath) {
                cordova.plugins.fileOpener2.open(
                    filePath,
                    'application/vnd.android.package-archive', {
                        error: function(e) {
                            xunSoft.helper.showMessage('错误代码: ' + e.status + ' - 错误信息: ' + e.message);
                        },
                        success: function() {
                            xunSoft.helper.showMessage("安装成功");
                        }
                    }
                );
            }
        },
        //扫描条码 phonegap-plugin-barcodescanner
        barcode: {
            scan: function(success, error) {
                try {
                    cordova.plugins.barcodeScanner.scan(function(result) {
                        if (result.text && _.isFunction(success)) {
                            success(result.text);
                        }
                    }, function(err) {
                        if (_.isFunction(error)) {
                            error(err);
                        }
                    });
                } catch (e) {
                    console.log(e);
                }
            }
        },
        //蓝牙 cordova-plugin-bluetooth-serial
        bluetooth: {
            write: function(text, success, error) {
                try {

                    //初始化成功
                    var address = xunSoft.setting.bluetoothId();
                    if (address == '') {
                        xunSoft.helper.showMessage('您还未设置蓝牙打印设备');
                    } else {
                        //蓝牙是否可用
                        bluetoothSerial.isEnabled(function() {
                            //是否已经连接
                            bluetoothSerial.isConnected(function() {
                                //打印数据
                                bluetoothSerial.write(text, success, error);

                            }, function() {
                                //连接蓝牙设备
                                bluetoothSerial.connect(address, function() {

                                    //打印数据
                                    bluetoothSerial.write(text, success, error);
                                }, function() {
                                    xunSoft.helper.showMessage('连接蓝牙打印机失败,请确认蓝牙打印机开机并在可识别范围内');
                                });
                            });
                        }, function() {
                            xunSoft.helper.showMessage('您还未开启蓝牙');
                        });
                    }
                } catch (ex) {
                    console.log(ex);
                }
            },
            //扫描蓝牙cordova-plugin-ble
            scan: function(success, error) {
                try {
                    evothings.ble.startScan(success, function() {
                        xunSoft.helper.showMessage('扫描蓝牙设备失败,请确认是否开启蓝牙!');
                    }, { serviceUUIDs: [] });
                } catch (e) {
                    console.log(e);
                }
            },
            //停止扫描
            stop: function() {
                try {
                    evothings.ble.stopScan();
                } catch (e) {
                    console.log(e);
                }
            }
        },
        //获取版本 cordova plugin add cordova-plugin-app-version
        getCurrentVersion: function(success) {
            cordova.getAppVersion.getVersionNumber(function(version) {
                if (_.isFunction(success)) {
                    success(version);
                }
            }, function(msg) {
                xunSoft.helper.showMessage(msg);
            });
        },
        //设置手机状态栏  cordova plugin add cordova-plugin-statusbar

    },
    //绘制图表
    paint: {
        //绘制饼图
        paintPie: function(pageDiv, tip, id, data, showType) {
            showType = showType ? true : false;
            var chart = echarts.init(pageDiv.find(id)[0]);
            var option = {
                tooltip: {
                    trigger: 'item',
                    formatter: function(obj) {
                        console.log(obj, data);

                        var result = tip + "<br/>";
                        if (!showType) {
                            if (obj.data.count != null) {
                                result += obj.data.name + "金额：￥" + obj.data.count + "<br/>";
                            }
                            if (obj.data.value != null) {
                                result += obj.data.name + "数量：" + obj.data.value;
                            }
                            return result;
                        }
                        if (obj.data.value != null) {
                            result += obj.data.name + "金额：￥" + obj.data.value + "<br/>";
                        }
                        if (obj.data.count != null) {
                            result += obj.data.name + "数量：" + obj.data.count;
                        }
                        return result;
                    }
                },
                calculable: true,
                series: [{
                    name: tip,
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', '60%'],
                    data: data
                }]
            };
            chart.setOption(option);
        },
        //绘制条形图
        paintBar: function(pageDiv, tip, id, dataX, dataCount, dataMoney, showType) {
            /*pageDiv 传入当前页的pageDiv
              tip 当前表的title
              id  显示区域的id
              dataX 横轴显示的数据--数组
              dataCount/dataMoney 纵轴显示的数组--数组
             * */
            showType = (showType == null) ? true : false;
            var chart = echarts.init(pageDiv.find(id)[0]);
            var option = {
                tooltip: {
                    trigger: 'axis',
                    formatter: function(obj) {
                        obj = obj[0];
                        var result = tip + "<br/>";
                        if (dataMoney != null && dataMoney[obj.dataIndex] != null) {
                            result += obj.name + "金额：￥" + dataMoney[obj.dataIndex] + "<br/>";
                        }
                        if (dataCount != null && dataCount[obj.dataIndex] != null) {
                            result += obj.name + "数量：" + dataCount[obj.dataIndex];
                        }
                        return result;
                    },
                    axisPointer: { // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                calculable: true,
                xAxis: [{
                    type: 'category',
                    data: dataX
                }],
                yAxis: [{
                    type: 'value',
                    axisLabel: {
                        formatter: function(value) {
                            var result = showType ? "元" : "件";
                            return value + result;
                        }
                    }
                }],
                series: [{
                    name: tip,
                    type: 'bar',
                    data: showType ? dataMoney : dataCount
                }]
            };
            chart.setOption(option);
        },
        //绘制直线图
        paintLine: function(pageDiv, tip, id, dataX, dataCount, dataMoney, showType) {
            /*
             pageDiv:当前页面的pageDiv
             tip：当前表的title
             id：当前表位置的id
             dataX：x轴的数值
             dataCount/dataMoney  y的数值 根据showType选择
             * 
             * */
            showType = (showType == null) ? true : false;
            var chart = echarts.init(pageDiv.find(id)[0]);
            var option = {
                tooltip: {
                    trigger: 'axis',
                    formatter: function(obj) {
                        obj = obj[0];
                        var result = tip + "<br/>";
                        if (dataMoney != null && dataMoney[obj.dataIndex] != null) {
                            result += obj.name + "金额：￥" + dataMoney[obj.dataIndex] + "<br/>";
                        }
                        if (dataCount != null && dataCount[obj.dataIndex] != null) {
                            result += obj.name + "数量：" + dataCount[obj.dataIndex];
                        }
                        return result;
                    },
                },
                calculable: true,
                xAxis: [{
                    type: 'category',
                    boundaryGap: false,
                    data: dataX
                }],
                yAxis: [{
                    type: 'value',
                    axisLabel: {
                        formatter: function(value) {
                            var result = showType ? "元" : "件";
                            return value + result;
                        }
                    }
                }],
                series: [{
                    name: tip,
                    type: 'line',
                    data: showType ? dataMoney : dataCount
                }],
            };
            chart.setOption(option);

        }
    },

    //用户信息
    user: {
        //租户ID
        _tenantId: 0,
        //用户ID
        _userId: 0,
        //登录名称
        _userName: '',
        //登录密码
        _userPassword: '',
        //记住密码
        _remember: true,
        //同意协议
        _agreeIssue: true,
        //职工姓名
        _employeeName: '',
        //公司名称
        _companyName: '',
        //店铺名称
        _shopName: '',
        //店铺ID
        _shopId: 0,
        //服务器Token
        _token: '',
        //页大小
        _pageSize: 15,
        //零售页
        _pageSize1: 9999999,
        //设备ID
        _deviceId: '132689C3-9C7F-46BA-9351-9B009AD485FE',
        //应用类型
        _appType: 0,
        //应用版本
        _version: '',
        tenantId: function(_tenantId) {
            if (_tenantId) {
                this._tenantId = _tenantId;
            }
            return this._tenantId;
        },
        userId: function(_userId) {
            if (_userId) {
                this._userId = _userId;
            }
            return this._userId;
        },
        userName: function(_userName) {
            if (_userName) {
                this._userName = _userName;
            }
            return this._userName;
        },
        userPassword: function(_userPassword) {
            if (_userPassword) {
                this._userPassword = _userPassword;
            }
            return this._userPassword;
        },
        remember: function(_remember) {
            if (_remember) {
                this._remember = _remember;
            }
            return this._remember;
        },
        agreeIssue: function(_agreeIssue) {
            if (_agreeIssue) {
                this._agreeIssue = _agreeIssue;
            }
            return this._agreeIssue;
        },
        employeeName: function(_employeeName) {
            if (_employeeName) {
                this._employeeName = _employeeName;
            }
            return this._employeeName;
        },
        shopId: function(_shopId) {
            if (_shopId) {
                this._shopId = _shopId;
            }
            return this._shopId;
        },
        shopName: function(_shopName) {
            if (_shopName) {
                this._shopName = _shopName;
            }
            return this._shopName;
        },
        companyName: function(_companyName) {
            if (_companyName) {
                this._companyName = _companyName;
            }
            return this._companyName;
        },
        token: function(_token) {
            if (_token) {
                this._token = _token;
            }
            return this._token;
        },
        deviceId: function(_deviceId) {
            if (_deviceId) {
                this._deviceId = _deviceId;
            }
            return this._deviceId;
        },
        appType: function() {
            if (this._appType == 0) {
                this._appType = 4;
            }
            return this._appType;
        },
        version: function() {
            if (this._version == '') {
                this._version = '1.1';
            }
            return this._version;
        },
        pageSize: function(_pageSize) {
            if (_pageSize) {
                this._pageSize = _pageSize;
            }
            return this._pageSize;
        },
        pageSize1: function(_pageSize1) {
            if (_pageSize1) {
                this._pageSize1 = _pageSize1;
            }
            return this._pageSize1;
        },
        save: function() {
            var obj = JSON.stringify(xunSoft.user);
            window.localStorage.setItem("xunsoft_user", obj);
        },
        get: function() {
            var obj = window.localStorage.getItem("xunsoft_user");
            obj = JSON.parse(obj);
            _.extend(xunSoft.user, obj);
        }

    },

    ajax: {
        //_serviceBase: 'http://localhost:51055/',
        //_serviceBase: 'http://192.168.0.99:8090/',
        //_serviceBase:'http://192.168.1.101:8086/',
        _serviceBase: 'http://www.51xssoft.com/MobileAppApi/',
        //服务基地址
        serviceBase: function(_serviceBase) {
            if (_serviceBase) {
                this._serviceBase = _serviceBase;
            }
            return this._serviceBase;
        },

        //基础Http请求
        baseRequest: function(method, url, data, success, fail) {
            eShop.showIndicator();
            // var activePage=mainView.activePage.container;
            // eShop.showProgressbar(activePage);
            $$.ajax({
                url: this.serviceBase() + url,
                method: method,
                crossDomain: true,
                data: data,
                dataType: 'json',
                cache: false,
                headers: {
                    tenantId: xunSoft.user.tenantId(),
                    userId: xunSoft.user.userId(),
                    shopId: xunSoft.user.shopId(),
                    token: xunSoft.user.token(),
                    deviceId: xunSoft.user.deviceId(),
                    timestamp: (new Date()).getTime(),
                    appType: xunSoft.user.appType(),
                    version: xunSoft.user.version(),
                    Accept: 'application/json'
                },
                timeout: 10000,
                success: function(data, status, xhr) {
                    eShop.hideIndicator();
                    //eShop.hideProgressbar(activePage);
                    if (_.isObject(data)) {
                        if (data.errorMsg) {
                            xunSoft.helper.showMessage(data.errorMsg, '错误');
                        } else {
                            if (data.code === 0) {
                                if (_.isFunction(success)) {
                                    success(data);
                                }
                            } else {
                                xunSoft.helper.showMessage('错误代码:' + data.code, '错误');
                            }
                        }
                    }
                },
                error: function(xhr, status) {
                    eShop.hideIndicator();
                    xunSoft.helper.showMessage('获取数据出错,请您稍后重新尝试！', '警告');
                    if (_.isFunction(fail)) {
                        fail();
                    }
                }
            });
        },

        //Get请求
        get: function(url, data, success, fail) {
            var para = {};
            if (data != null || data != undefined) {
                para = data;
            }
            this.baseRequest('GET', url, data, success, fail);
        },

        //异步Get请求
        getAsync: function(url, data, success, fail) {
            var para = {};
            if (data != null || data != undefined) {
                para = data;
            }
            $$.ajax({
                url: this.serviceBase() + url,
                method: 'GET',
                crossDomain: true,
                data: data,
                dataType: 'json',
                cache: false,
                headers: {
                    tenantId: xunSoft.user.tenantId(),
                    userId: xunSoft.user.userId(),
                    shopId: xunSoft.user.shopId(),
                    token: xunSoft.user.token(),
                    deviceId: xunSoft.user.deviceId(),
                    timestamp: (new Date()).getTime(),
                    appType: xunSoft.user.appType(),
                    version: xunSoft.user.version(),
                    Accept: 'application/json'
                },
                timeout: 10000,
                success: function(data, status, xhr) {
                    if (_.isFunction(success)) {
                        success(data);
                    }
                },
                error: function() {
                    if (_.isFunction(fail)) {
                        fail();
                    }
                }
            });
        },

        //Get请求
        post: function(url, data, success, fail) {
            var para = {};
            if (data != null || data != undefined) {
                para = data;
            }
            this.baseRequest('POST', url, data, success, fail);
        },

        put: function(url, data, success, fail) {
            if (data != null || data != undefined) {
                para = data;
            }
            this.baseRequest('PUT', url, data, success, fail);
        },

        delete: function(url, data, success, fail) {
            var para = {};
            if (data != null || data != undefined) {
                para = data;
            }
            this.baseRequest('DELETE', url, data, success, fail);
        }

    },

    //用户设置
    setting: {
        //蓝牙打印机ID
        _bluetoothId: '',

        //设置蓝牙ID
        bluetoothId: function(_bluetoothId) {
            if (_bluetoothId) {
                window.localStorage.setItem('app_bluetoothid', _bluetoothId);
                this._bluetoothId = _bluetoothId;
            } else {
                var savedBluetoothId = window.localStorage.getItem('app_bluetoothid');
                if (savedBluetoothId) {
                    this._bluetoothId = savedBluetoothId;
                }
            }
            return this._bluetoothId;
        }
    }
};