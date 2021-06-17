(function($) {

// 解决IE下Ajax缓存的问题,设置为不缓存
$.getJSONEx = function(url,data,callback){
    var requrl = url;
    $.ajaxSetup({cache:false});
    $.getJSON(requrl,data,callback);
    $.ajaxSetup({cache:true});
};

$.msgboxSucc = function(msg){
    if(msg==undefined){
        msg='设置成功！';
    }
   $.MessageBox({
       title: '信息',content: msg,type: 'information', 
        buttons: { confirm: {title: '确认', style: 'continue'} },usekey: true
     },function(response) {});
};

$.msgboxFail = function(msg){
    if (msg==undefined){
        msg = '设置失败!';
    }
    $.MessageBox({
      title: '错误',content: msg,type: 'information', 
      buttons: { confirm: {title: '确认', style: 'continue'} },usekey: true
     },function(response) {});
    $('.messagebox-content > div').css('color','#FF6868');
};
    
var spinner;
$(document).ajaxSend(function(e,xhr,opt){
    if (spinner==undefined){
        spinner = new Spinner();
    }
    var rc = $('#waitdiv').data('state') + 1;
    $('#waitdiv').data('state',rc);
    setTimeout(function(){
        if ($('#waitdiv').data('state')>0){
        $('.black_overlay').css('display','block');
        spinner.spin($('#waitdiv')[0]);    
        }
    },400);
    });
    
$(document).ajaxError(function(e,xhr,opt){
    $.msgboxFail('请求失败！');
});
    
$(document).ajaxComplete(function(e,xhr,opt){
    var rc = $('#waitdiv').data('state') - 1;
    $('#waitdiv').data('state',rc);
    if (rc==0){
        $('.black_overlay').css('display','none');
        spinner.stop();
    }
});

// 将一个DIV设置成百分比
$.fn.setPercent = function(percent){
    var pdiv = $(this).find('.percentinner');
    if (pdiv[0]==undefined)
    {
        $(this).append('<div class="percentdiv"><div class="percentinner"></div></div><span/>');
        $(this).find('.percentinner').height('100%');
    }
    var strperc = "" + percent + "%";
    $(this).find('span').text("  " +strperc);
    $(this).find('.percentinner').css('width',strperc);
    var bgcolor = (percent>=90)?'#F77':'#6495ED';
    $(this).find('.percentinner').css('background-color',bgcolor);
};

// table分页显示
$.fn.pagetable = function(){
    var $table=$(this);
    var currentPage=0;
    if ($table.data('currpage')!=undefined){
        currentPage = $table.data('currpage');
    }
    var pageSize = 20;
    $table.bind('paging',function(){
    $table.find('tbody tr').hide().slice(currentPage*pageSize,(currentPage+1)*pageSize).show();
    });

    var sumRows=$table.find('tbody tr').length;
    var sumPages = Math.ceil(sumRows/pageSize);
    $('.page').remove();

    var $pager= $('<div class="page"></div>');
    $pager.insertAfter($('#tablediv'));
    
    if (sumPages>1)
    {
        for (var pageIndex=0;pageIndex<sumPages;pageIndex++){
        $('<a href="#"><span class="pindex">' + (pageIndex+1) + '</span>&nbsp;</a>').bind("click",{"newPage":pageIndex},function(event){
        currentPage= event.data["newPage"];
        $table.data('currpage',currentPage);
        $pager.find(".pindex").css('color','');
        $pager.find(".pindex").css('text-decoration','underline');
        $(this).find('.pindex').css('color','#333');
        $(this).find('.pindex').css('text-decoration','none');    
        $table.trigger("paging");
           }).appendTo($pager);
        
        $pager.append(" ");
    }
    
    $pager.css('float','right');
    $pager.css('margin-right','10px');
    $pager.css('font-size','15px');
    }
    $table.trigger("paging");
    $('.pindex').css('text-decoration','underline');
    // 当前第一页
    $($pager.find(".pindex")[currentPage]).css('color','#333');
    $($pager.find(".pindex")[currentPage]).css('text-decoration','none');
};

$.fn.initform = function(geturl,seturl){
    var tempf = new cform(this);
    tempf.geturl = geturl;
    tempf.seturl = seturl;
    $(this).data('cform',tempf);
    tempf.loadData();
};
    
$.fn.reloadform = function(){
    $(this).data('cform').loadData();
};

$.fn.assert = function(item,express){
    $(this).data('cform').assert(item,express);
};

$.fn.setsavepswd = function()
{
    var allpswd = $(this).find(':password');
    var display = '**********';
    allpswd.data('initiaval',display)
    allpswd.addClass('pswdsave');
    allpswd.val(display);
    allpswd.focus(function(){
        var isdefault = true;
        allpswd.each(function(){
            if ($(this).val()!=display){
                isdefault = false;
            }
        });
        if (isdefault)
        {
            allpswd.val('');
            allpswd.first().removeClass('nosubmit');
        }
    });
    allpswd.blur(function(){
        var noinput = true;
         allpswd.each(function(){
            if ($(this).val()!=''){
                noinput = false;
            }
        });
        if (noinput)
        {
            allpswd.val(display);
            allpswd.first().addClass('nosubmit');
        }
    });
}

var cform = function(el){
var self = this;
this.eform = el;
this.invalidbgcolor = '#FF9F9F';
this.restartfsu = false;
this.saveret = true;
this.seturl = '';
this.geturl = '';

$(".contenttable tr:odd").css("background",'#F5F6F7');
    
$(self.eform).find('.tinput').change(function(){
    $(self.eform).find('.tinput').trigger('checkValid');
}); 
    
$('form#tconfig').bind('reset',function(){
    $(self.eform).find('.tinput').each(function(){
        $(this).val($(this).data('initiaval'));
    });
    $(self.eform).find('.pswdsave').addClass('nosubmit')
    self.checkAll();
    return false;
});

$('form#tconfig').bind('submit',function(){
    self.restartfsu = false;
    var allValid = true;
    $(self.eform).find('.tinput').each(function(){
        var isvalid = $(this).data('isvalid');
        if (isvalid!=undefined && !isvalid){
            $(this).focus();
            allValid = false;
            return false;
        }
        // class 'rsparam'表示该参数修改后需要重启
        if ($(this).hasClass('rsparam') && ($(this).data('initiaval')!=$(this).val()) ){
            self.restartfsu = true;
        }
    });
    if (allValid){
        self.commitData();
    }
    return false;
});


};

cform.prototype = {

    assert : function(item,expression){
        var self = this;
        $(this.eform).find(item).bind('checkValid',function(){
            var bvalid = eval(expression)
            if (bvalid){
                $(this).css('background-color','white');
            }
            else{
                $(this).css('background-color',self.invalidbgcolor);
            }
        $(this).data('isvalid',bvalid);
        });
    },
    
    loadData : function(){
        if (this.geturl==''){
            return;
        }
        var self = this;
    $.getJSONEx(this.geturl,function(json){
        for (var key in json.result){
            var inputt = $(self.eform).find("#"+key);
            if (inputt[0]!=undefined){
                if (inputt[0].nodeName==='INPUT'||inputt[0].nodeName==='SELECT'){
                    inputt.val(json.result[key]);
                    inputt.data('initiaval',json.result[key]);
                }
                else {
                    inputt.text(json.result[key]);
                }
            }
        }
         $(self.eform).trigger('loadfinish',json);
    });
        
    },
    
    commitData:function(){
        if (this.seturl==''){
            return;
        }
        var self = this;
        var reqjson = new jsonrpc();
        $(this.eform).find('.tinput').each(function(){
            if(!$(this).hasClass('nosubmit')){
                reqjson.setvalue(this.id,this.value);
            }
        });
        
        $.post(this.seturl,reqjson.jsonstr(),function(result){
            var bsucc = result.result==='true';
            if (bsucc){//更新data数据
                 $(self.eform).find('.tinput').each(function(){
                    $(this).data('initiaval',$(this).val());
                  });
            }
            $(self.eform).trigger('commitfinish',[bsucc,self.restartfsu]);
            });
    },
    
    checkAll:function(){
        $(this.eform).find('.tinput').trigger('checkValid');
    },
        
};// end of cform.prototype 

}(jQuery));

// json请求封装类
var jsonrpc = function () {
    this.jsonrpc = '2.0';
    this.method='webrpc';
    this.id = 1;
    this.params={};
}

jsonrpc.prototype ={
    setvalue:function(pname,pvalue){
        this.params[pname] = pvalue;
    },
    
    jsonstr:function(){
        return JSON.stringify(this);
    },
};

// add a zero in front of numbers<10
function fomrtNum(i){
    if (i<10) 
        {i="0" + i}
    return i
}

Date.prototype.getDateStr = function(){
    var y = this.getFullYear();
    var m = this.getMonth()+1;
    var d = this.getDate();
    m = fomrtNum(m);
    d = fomrtNum(d);
    return y+"-"+m+"-"+d;
}

Date.prototype.getTimeStr = function(){
    var h= this.getHours();
    var m= this.getMinutes();
    var s= this.getSeconds();
    h = fomrtNum(h);
    m = fomrtNum(m);
    s = fomrtNum(s);
    return h+":"+m+":"+s;
}

Date.prototype.getStr = function(){
    return this.getDateStr() + " " + this.getTimeStr();
}

Date.prototype.format = function(str){
    var reg = /^(\d+)-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;   
    var r = str.match(reg);
    if(r!=null){
        this.setFullYear(r[1]);
        this.setMonth(r[2]-1);
        this.setDate(r[3]);
        this.setHours(r[4]);
        this.setMinutes(r[5]);
        this.setSeconds(r[6]);
    }
}

function isInteger(value)
{        
  var str = value.trim();
  return (str.length!=0) && /^[-+]?\d*$/.test(str);
}

function checkDateTime(str)  
{   
    var reg = /^(\d+)-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;   
    var r = str.match(reg);
    if(r==null)return false;   
    r[2]=r[2]-1;
    var d= new Date(r[1],r[2],r[3],r[4],r[5],r[6]);   
    if(d.getFullYear()!=r[1])return false;   
    if(d.getMonth()!=r[2])return false;   
    if(d.getDate()!=r[3])return false;   
    if(d.getHours()!=r[4])return false;   
    if(d.getMinutes()!=r[5])return false;   
    if(d.getSeconds()!=r[6])return false;   
    return true;   
} 

function isipv4(value)
{
    return /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/i.test(value);
}