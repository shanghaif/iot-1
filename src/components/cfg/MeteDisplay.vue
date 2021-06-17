<template>
    <div>
        <a-tag>{{meteDisp}}</a-tag>
    </div>
</template>
<script>
export default {
    props:['meteInfo'],
    computed:{
        meteDisp(){
            if(this.meteInfo){
                const metesubname = (!this.meteInfo.mete_subname) ? "": this.meteInfo.mete_subname
                
                //tmodel_id,thing_sno,mete_type,mete_id,mete_index,mete_subid
                let disp = this.meteInfo.id + ":" + this.meteInfo.tmodel_name + "/" + this.meteInfo.thing_sno_expression + "/" 
                + this.meteInfo.mete_type + "." + this.meteInfo.mete_name+
                '/' + metesubname + '/量索引:' + this.meteInfo.mete_index_expression
                return disp
            }
            return ""
        }
    }
}
</script>
<style>

</style>