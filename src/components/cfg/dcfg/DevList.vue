<template>
  <a-spin :spinning="spinning">
    <div
      v-if="station"
      style="margin: 20px 0 0 0"
    >
      <sync-model-dlg ref="syncDlg"></sync-model-dlg>
      <a-space>
        <a-button @click="addThing">增加设备...</a-button>
        <a-button
          v-if="isEdge"
          @click="syncToCloud"
        >同步到云端...</a-button>
        <a-button @click="refresh">刷新</a-button>
      </a-space>
      <thing-cfg-dlg ref="thingDlg"></thing-cfg-dlg>
      <a-list
        item-layout="horizontal"
        :data-source="station.devs"
        style="margin: 10px 0 0 0"
        :grid="{ gutter: 16, xs: 1, sm: 2, md: 4, lg: 4, xl: 6, xxl: 3 }"
      >
        <a-list-item
          slot="renderItem"
          slot-scope="item"
        >
          <a-card
            :title="item.s_name"
            size="small"
          >
            <a slot="extra">
              <a-space>
                <a-icon
                  type="edit"
                  @click="editThing(item)"
                />
                <a-icon
                  type="delete"
                  @click="removeDev(item)"
                />
              </a-space>
            </a>
            <a-tag
              color="green"
              v-if="item.status_used == 1"
            >
              {{ item.tmodel.s_name }}
            </a-tag>
            <a-tag
              color="gray"
              v-if="item.status_used != 1"
            >
              {{ item.tmodel.s_name }}
            </a-tag>
            <br />
            <div style="
                display: block;
                word-break: break-all;
                word-wrap: break-word;
              ">
              {{ item.uid }}
            </div>
            <br />
            编号:{{ item.sno }}
          </a-card>
        </a-list-item>
      </a-list>
      <a-pagination
        v-if="station.count > 20"
        :default-current="curPage"
        :total="station.count"
        @change="selectPage"
      />
    </div>
  </a-spin>
</template>
<script>
import { post, update, remove } from '@/services/crud'
import ThingCfgDlg from '../dcfg/ThingCfgDlg.vue'
import SyncModelDlg from '@/components/cfg/sync/SyncModelDlg.vue'
export default {
  name: 'DevList',
  components: {
    ThingCfgDlg,
    SyncModelDlg
  },
  computed: {
    station() {
      return this.$store.state.station.activeStation
    },

    isEdge() {
      return process.env.VUE_APP_TYPE === 'edge'
    }
  },
  data() {
    return {
      spinning: false,
      curPage: 1
    }
  },
  methods: {
    selectPage(page) {
      console.log('page :>> ', page)
      this.$store.dispatch('station/refreshActiveStation', {
        id: this.$store.state.station.uid,
        page
      })
      this.curPage = page
    },
    thingsToCloud(child) {
      var edge
      this.station.devs.forEach((dev) => {
        if (dev.model_id == 'IOTBASEmEdgeCTL') {
          edge = dev
        }
      })
      if (edge) {
        //{ things, pd, un, edgeID,addr }
        return this.$store.dispatch('station/syncStationToCloud', {
          edgeID: edge.uid,
          things: this.station.devs,
          un: child.username,
          pd: child.password,
          addr: child.svrAddr
        })
      }
    },
    syncToCloud() {
      this.$refs.syncDlg.showDlg(this.thingsToCloud)
    },
    thingAction(fun, owner, item) {
      //const item = dlg.$data.item
      const _this = owner
      fun('thing', item).then((res) => {
        console.log('***************', res)
        if (res && res.data && res.data.result) {
          item.uid = res.data.result.uid
        }
        if (item.station) {
          console.log(item)
          fun('thingstation', {
            thing_id: item.uid,
            station_id: item.station.uid
          })
            .then(() => {
              //let itemparams = item.params
              let setParams = {
                thing_id: item.uid,
                values: item.params
              }
              fun('thingparam', setParams)
            })
            .finally(() => {
              _this.refresh()
            })
        }
      })
    },
    refresh() {
      this.spinning = true
      let _this = this
      this.$store
        .dispatch('station/refreshActiveStation', {
          id: this.$store.state.station.uid
        })
        .finally(() => {
          _this.spinning = false
        })
    },
    addThingToSvr(owner, dlg) {
      const item = dlg.$data.item
      console.log('add item--------------', item)
      owner.thingAction(post, owner, item)
    },
    updateThingToSvr(owner, dlg) {
      const item = dlg.$data.item
      console.log('update item--------------', item)
      owner.thingAction(update, owner, item)
    },
    addThing() {
      //this.curStation = record;
      //console.log("-------------", record);
      this.spinning = true
      this.$refs.thingDlg.Show(this.addThingToSvr, this, {
        isNew: true,
        station: this.station
      })
      this.spinning = false
    },
    editThing(child) {
      //this.curStation = record;
      //console.log("-------------", record);
      this.spinning = true
      const item = JSON.parse(JSON.stringify(child)) //Object.assign({}, child);
      item.isNew = false
      item.station = this.station
      this.$refs.thingDlg.Show(this.updateThingToSvr, this, item)
      this.spinning = false
    },
    removeDev(child) {
      let _this = this
      this.spinning = true
      remove('thing', child.uid).finally(() => {
        _this.refresh()
      })
    }
  }
}
</script>