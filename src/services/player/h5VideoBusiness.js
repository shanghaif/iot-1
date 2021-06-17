function H5VideoBussiness() {
    this.currentVideos = [];//当前的播放列表
    //移除video
    this.moveVideo = function () {

    }
    this.AddVideo = function (nodeid) {
        var _this = this;
        layer.prompt({ title: '输入1 子码流 输入0 主码流', formType: 1 }, function (pass, index) {
            var VideoDev = cacheService.getSubDev(nodeid);
            if (pass =="") {
                pass = "0";
            }
            businessService.getVideoRTSPUrl(VideoDev, parseInt(pass), function (url) {
                console.log(url);
                if ($.inArray(nodeid, _this.currentVideos) >= 0) {

                } else {
                    _this.currentVideos.push(nodeid);
                    _this.CreateVideo("videoMainPanel", 480, nodeid, url);
                }
            });
        });
      
    }
    this.CreateVideo = function (pDivid, videoWidth, nodeid, url, playBackTime) {
        var _this = this;
        var h5VideoPlayer = new H5VideoPlayer();
        var wsurl = _this.getVideoWSUrl(url);
        console.log(wsurl);
        h5VideoPlayer.z = 0;//默认焦距
        h5VideoPlayer.CurrentVideo = cacheService.getSubDev(nodeid);
        //回放文件获取
        h5VideoPlayer.GetBackPlayVideoListFunc = function (showTime, createDownSpeedDiv) {
            if (showTime.getHours() >= 12) {
                var start = showTime.Format("yyyy-MM-dd 00:00:00");
                var endtime = new Date();
                endtime = (endtime.setDate(showTime.getDate() + 1));
                var end = (new Date(endtime)).Format("yyyy-MM-dd 23:59:59");
                _this.getVideoFileList(h5VideoPlayer.CurrentVideo, start, end, createDownSpeedDiv, h5VideoPlayer);
            } else {
                var startTime = new Date();
                startTime = (startTime.setDate(showTime.getDate() - 1));
                var start = (new Date(startTime)).Format("yyyy-MM-dd 00:00:00");
                var end = showTime.Format("yyyy-MM-dd 23:59:59");
                _this.getVideoFileList(h5VideoPlayer.CurrentVideo, start, end, createDownSpeedDiv, h5VideoPlayer);
            }
        }
        //回放视频
        h5VideoPlayer.showBackTimeVideo = function (currentTime) {
            if (h5VideoPlayer.timeFileList && h5VideoPlayer.timeFileList.length > 0) {
                var fileName = "";
                $.each(h5VideoPlayer.timeFileList, function (_index, _obj) {
                    if (_obj.beginTime.getTime() <= currentTime.getTime() && _obj.endTime.getTime() >= currentTime.getTime()) {
                        fileName = _obj.fileName;
                        intimehasfile = false;
                    }
                });
                if (fileName != "") {
                    var node = cacheService.getSubDev(nodeid);
                    businessService.getVideoBackFileList(node, 0, "", "", function (result) {
                        var rtsp = "";
                        if (result && result.rtsp) {
                            rtsp = result.rtsp;
                            if (rtsp.endsWith("/")) {
                                rtsp = rtsp.substr(0, rtsp.length - 1);
                            }
                            rtsp = rtsp + "?starttime=" + currentTime.Format("yyyyMMddThhmmssZ");
                            rtsp = "rtsp://192.168.1.10:554/stream/playback/" + guid() + "?token=" + base64encode("url:" + rtsp);
                        }
                        h5VideoPlayer.h5VideoWSPlayer(wsurl, rtsp);
                    }, function (err) { });
                } else {
                    h5VideoPlayer.stop();
                    h5VideoPlayer.h5VideoWSPlayer(wsurl, "");
                    console.log("此处无视频");
                }
            }
        }
        //实时
        h5VideoPlayer.RealTimePlayVideoFunc = function (currentTime) {
            h5VideoPlayer.h5VideoWSPlayer(wsurl, url);
        }
        //播放实时
        h5VideoPlayer.Addh5VideoPlay(pDivid, nodeid, videoWidth, url, h5VideoPlayer.CurrentVideo.value.name, wsurl);
        if (playBackTime) {
            h5VideoPlayer.showVideoByTime(playBackTime);
        }
        //"rtsp://192.168.1.195:554/stream/static/live/2"
        //调整摄像头
        h5VideoPlayer.turnLeftFunc = function () {
            _this.moveVideo(h5VideoPlayer.CurrentVideo, -1, 0);
        }
        h5VideoPlayer.turnRightFunc = function () {
            console.log("turnRightFunc");
            _this.moveVideo(h5VideoPlayer.CurrentVideo, 1, 0);
        }
        h5VideoPlayer.turnUpFunc = function () {
            _this.moveVideo(h5VideoPlayer.CurrentVideo, 0, 1);
        }
        h5VideoPlayer.turnDownFunc = function () {
            _this.moveVideo(h5VideoPlayer.CurrentVideo, 0, -1);
        }
        h5VideoPlayer.turnPlusFunc = function () {
            _this.zoomVideo(h5VideoPlayer, 1);
        }
        h5VideoPlayer.turnMinusFunc = function () {
            _this.zoomVideo(h5VideoPlayer, 0);
        }
        h5VideoPlayer.turnStopFunc = function () {
            _this.moveVideoStop(h5VideoPlayer.CurrentVideo);
        }
        h5VideoPlayer.zoomStopFunc = function () {
            _this.zoomVideoStop(h5VideoPlayer.CurrentVideo);
        }
        h5VideoPlayer.closeBackFunc = function () {
            _this.currentVideos.splice($.inArray(nodeid, _this.currentVideos), 1);
        }

    }
    //获取视频文件列表 时间参数都是字符串形式
    this.getVideoFileList = function (node, startTime, endTime, createDownSpeedDiv, h5VideoPlayer) {
        var _this = this;
        businessService.getVideoBackFileList(node, 0, startTime, endTime, function (result) {
            var newFileList = [];
            if (result && result.files && result.files.length > 0) {
                $.each(result.files, function (_index, _obj) {
                    var foreEndTime = null;
                    if (newFileList.length > 0) {
                        foreEndTime = newFileList[newFileList.length - 1].endTime;
                    }
                    var _thisBeginTime = new Date(_obj.beginTime.replace("T", " ").replace("Z", ""));
                    var _thisEndTime = new Date(_obj.endTime.replace("T", " ").replace("Z", ""));
                    //if(foreEndTime && ((_thisBeginTime.getTime() - foreEndTime.getTime()) / 1000 > 2)){
                    //    newFileList.push({
                    //        beginTime: foreEndTime,
                    //        endTime: _thisBeginTime,
                    //        fileName: ""
                    //    })
                    //}
                    newFileList.push({
                        beginTime: _thisBeginTime,
                        endTime: _thisEndTime,
                        fileName: _obj.fileName
                    })
                });
            }
            h5VideoPlayer.timeFileList = newFileList;
            createDownSpeedDiv(node.value.objId, newFileList, startTime, endTime);
            //根据newFileList生成底部
        }, function (err) {

        })
    }
    //获取播放websocket地址
    this.getVideoWSUrl = function (rtspUrl) {
        var port = parseInt(rtspUrl.split(':')[2].split('/')[0]);
        port++;
        return "ws:" + rtspUrl.split(':')[1] + ":" + port + "/ws/rtsp"
    }
    //移动摄像头
    this.moveVideo = function (currentVideo, x, y) {
        var beginParams = new Array();
        var beginx = new keyValue();
        beginx.name = 'X';
        beginx.value = x;
        var beginy = new keyValue();
        beginy.name = 'Y';
        beginy.value = y;
        beginParams.push(beginx);
        beginParams.push(beginy);
        businessService.ctrlPTZ(currentVideo, 0, beginParams, '2DMove', 'begin');
    }
    //停止移动摄像头
    this.moveVideoStop = function (currentVideo) {
        var stopParams = new Array();
        businessService.ctrlPTZ(currentVideo, 0, stopParams, '2DMove', 'stop');
    }
    //调整摄像头焦距
    this.zoomVideo = function (player, ctrType) {
        var currentVideo = player.CurrentVideo;
        if (ctrType == 0) {
            if (player.z > -1) {
                player.z = player.z - 0.02;
            }
        } else {
            if (player.z < 1) {
                player.z = player.z + 0.02;
            }
        }
        var beginParams = new Array();
        var beginz = new keyValue();
        beginz.name = 'Z';
        beginz.value = player.z;
        beginParams.push(beginz);
        businessService.ctrlPTZ(currentVideo, 0, beginParams, '2DZoom', 'begin');
    }
    //停止移动摄像头
    this.zoomVideoStop = function (currentVideo) {
        var stopParams = new Array();
        businessService.ctrlPTZ(currentVideo, 0, stopParams, '2DZoom', 'stop');
    }
}
var H5VideoBussinessObj = null;


//日期格式化
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
function guid() {
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}