<template>
	<div>
		<a-button size="small" @click="add">增加</a-button>
        <a-modal
      title="枚举配置"
      :visible="visible"
      @ok="handleOk"
      @cancel="visible=false"
    >
      值:<a-input v-model="value"></a-input>
      名称:<a-input v-model="name"></a-input>
    </a-modal>
	<a-table :columns="columns" :data-source="specs" :row-key="(r)=>{return r.value}">
        <a slot="name" slot-scope="text">{{text}}</a>
		<template slot-scope="text, record" slot="operation">
			<span>
                <a @click="deleteRecord(record.value)">删除</a>
            </span>
        </template>
    </a-table>
    </div>
</template>
<script>
export default {
    props:["specs"],
    name:'EnumType',
    data(){
        return {
            value:'',
            visible:false,
            name:'',
            columns: [
                { title: '名称', dataIndex: 'name', key: 'name', scopedSlots: { customRender: 'name'}},
                { title: '值', dataIndex: 'value', key: 'value' },
                { title: '操作', key: 'operation', scopedSlots: { customRender: 'operation' } }
            ],
        }
    },
    methods:{
        add(){
            this.value = ''
            this.name = ''
            this.visible = true
        },
        deleteRecord(value){
            //const item = {name:this.name,value:this.value}
            let index = this.specs.findIndex(s=>{
                return value == s.value
            })
            if(index >= 0){
                this.specs.splice(index,1)
            }
        },
        handleOk(){
            const item = {name:this.name,value:this.value}
            let index = this.specs.findIndex(s=>{
                return s.name == item.name || item.value == s.value
            })
            if(index >= 0){
                this.$message.error("名称或值重复")
            }
            else{
                this.specs.push(item)
                this.visible = false
            }
        }
    }
}
</script>
<style scoped>

</style>