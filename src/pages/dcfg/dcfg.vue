<template>
  <div class="new-page">
    <a-layout>
      <a-layout-sider
        breakpoint="lg"
        collapsed-width="0"
        width="300"
        class="left-sider"
      >
        <station-tree
          @tree-selected="selectTreeNode"
          @tree-add="addStation"
          @tree-edit="editStation"
        ></station-tree>
      </a-layout-sider>
      <a-layout>
        <a-layout-content style="margin: 0 0 0 5px">
          <div
            class="content"
            :style="{ minHeight: minHeight + 'px' }"
          >
            <station-dlg ref="stationDlg"></station-dlg>
            <thing-cfg-dlg ref="thingCfgDlg"></thing-cfg-dlg>
            <div class="station-info">
              <station-property-cfg></station-property-cfg>
              <dev-list></dev-list>
            </div>
          </div>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>
<script>
//import PageLayout from '@/layouts/PageLayout'
import StationPropertyCfg from '../../components/cfg/dcfg/StationPropertyCfg.vue'
import StationTree from '../../components/cfg/dcfg/StationTree.vue'
import StationDlg from '../../components/cfg/dcfg/StationDlg.vue'
import DevList from '../../components/cfg/dcfg/DevList.vue'
import ThingCfgDlg from '../../components/cfg/dcfg/ThingCfgDlg.vue'
//import { mapState } from "vuex";
export default {
  components: {
    StationPropertyCfg,
    StationTree,
    StationDlg,
    DevList,
    ThingCfgDlg
    //PageLayout,
  },
  computed: {
    minHeight() {
      return document.body.clientHeight - 150
    },
    isEdge() {
      return process.env.VUE_APP_TYPE === 'edge'
    }
  },
  mounted() {
    this.refresh()
  },

  data() {
    return {
      //curStation: null,
      addNew: true
    }
  },
  methods: {
    selectPage(page) {
      console.log('page :>> ', page)
      this.$store.dispatch('station/refreshActiveStation', {
        id: this.$store.state.station.stationCache.uid,
        page
      })
      this.curPage = page
    },
    refresh() {
      //this.$store.dispatch("area/refreshAreas");
      if (
        !this.$store.state.tmodel.tmodels ||
        this.$store.state.tmodel.tmodels.length == 0
      ) {
        this.$store.dispatch('tmodel/refreshTModels')
      }
      this.$store.dispatch('station/refreshStations')
    },
    selectTreeNode(stationId) {
      //let _this = this
      this.$store.dispatch('station/refreshActiveStation', { id: stationId })
    },
    confirm(hasEdge) {
      var createChildren
      let _this = this
      return new Promise((re) => {
        if (hasEdge && !_this.isEdge) {
          re(false)
        } else {
          _this.$confirm({
            title: '创建子设备',
            content: '是否根据配置创建子设备?',
            onOk() {
              //const mid = station.model_id//找到模板
              //console.log(station);
              createChildren = true
              re(createChildren)
            },
            onCancel() {
              createChildren = false
              re(createChildren)
            }
          })
        }
      })
    },
    saveEditStation(owner, _this) {
      let station = _this.item
      _this.$store.dispatch('thingView/saveThing', station).then(() => {
        _this.$refs.thingCfgDlg.Close()
      })
    },
    save(_this, station) {
      //const _this = this
      if (this.addNew) {
        let m = this.$store.state.tmodel.tmodelCache[station.model_id]
        let cr = m.containner_rule
        if (typeof m.containner_rule == 'string') {
          cr = JSON.parse(m.containner_rule)
        }
        if (cr) {
          console.log('*****************', cr)
          var hasEdge = false
          if (cr.contain_rule) {
            cr.contain_rule.forEach((r) => {
              if (r.model_id == 'IOTBASEmEdgeCTL') {
                hasEdge = true
              }
            })
          }
        }

        this.confirm(hasEdge).then((createChildren) => {
          _this.$store
            .dispatch('station/newStation', {
              station,
              hasChildren: createChildren
            })
            .then(() => {
              _this.$refs.stationDlg.Close()
            })
        })
      } else {
        _this.$store.dispatch('station/saveStation', station).then(() => {
          _this.$refs.stationDlg.Close()
        })
      }
    },

    addStation() {
      this.isNew = true
      this.$refs.stationDlg.Show(this.save, undefined, this)
    },
    editStation(sid) {
      this.isNew = false
      let station = this.$store.state.station.stationCache[sid]
      this.$refs.thingCfgDlg.Show(this.saveEditStation, this, station)
    }
  }
}
</script>
<style lang="less">
@import 'index';
</style>
