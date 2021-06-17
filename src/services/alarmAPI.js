import {getEx} from './crud'


export function getRealAlarm(tid,aid,index){
    return new Promise((re,rej)=>{
        getEx("alarm/", "real?tid=" + tid + "&aid=" + aid + "&index=" + index).then(
            (res) => {
              if (res && res.data && res.data.result) {
               
                re(res.data.result)
              }
              else{
                re([])
              }
             
            }
          ).catch(err=>{
              rej(err)
          });
    })
   
}

export function getAlarmHistory(tid,aid,index,begintime,endtime){
  return new Promise((re,rej)=>{
      getEx("alarm/", "histroy?tid=" + tid + "&aid=" + aid + "&index=" + index +
      "&begintime="+begintime + "&endtime="+endtime).then(
          (res) => {
            if (res && res.data && res.data.result) {
              console.log("-------------", res.data.result);
              re(res.data.result)
            }
            else{
              re([])
            }
           
          }
        ).catch(err=>{
            rej(err)
        });
  })
 
}

export default {
  getRealAlarm,
  getAlarmHistory,
}