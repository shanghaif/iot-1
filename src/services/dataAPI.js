import {getEx} from './crud'
var moment = require('moment')

export function getRealData(tid,pid,subid,index){
    return new Promise((re,rej)=>{
        getEx("data/", "real?tid=" + tid + "&pid=" + pid + '&subid=' + subid + "&index=" + index).then(
            (res) => {
              if (res && res.data && res.data.result) {
                console.log("-------------", res.data.result);
                res.data.result.forEach(realdata => {
                    realdata.picktime = moment.unix(realdata.pick_time).format()
                });
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
export function getVideoOptions(tid){
  return new Promise((re,rej)=>{
      getEx("stream/"+tid,"").then(
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
export function getHistroyData(tid,pid,subid,index,begintime,endtime){
  return new Promise((re,rej)=>{
      getEx("data/", "histroy?tid=" + tid + "&pid=" + pid + '&subid=' + subid + "&index=" + index +
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
console.log("^^^^^^^^^^^^^^^^^",getRealData)
export default {
  getRealData,
  getHistroyData,
}