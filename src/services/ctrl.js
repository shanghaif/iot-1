import {put} from './crud'
export function ctrlService(tid, serviceid, params) {
    let ctrlcmd = {
        identifier: serviceid,
        tid: tid,
        params: params,
    };
    this.loading = true;
    let _this = this;
    put("api/service", ctrlcmd, "uid=" + this.$store.state.activeAlarm.sid)
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            _this.loading = false;
        });
}
export default {
    ctrlService,
}