
var mapError = {}
function init(){
    mapError[-340001] = "用户不存在"
    mapError[-340002] = "用户密码错误"
    mapError[-330001] = "数据库错误"

}
init()
function showError(message,code,errMsg){
    let err = mapError[code]
    if(err){
        console.log(errMsg)
        message.error(err  + " " +  errMsg)
    }
    else{
        if(errMsg){
            message.error("发生错误:" + errMsg)
        }else{
            message.error("发生错误")
        }
       
    }
}

function getError(error){
    let err = mapError[error.code]
    return err
}

module.exports = {showError,getError}