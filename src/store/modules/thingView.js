import {
    //refresh,
    //refreshByID,
    //removeItem,
    //updateItem,
    //newItem,
    get,
    getAll,
    update,
    getEx ,
} from '@/services/crud'

var moment = require('moment');
//import Vue from 'vue'
function getChildren(re, rej, parentId, commit) {
    get("station", "condition?stations.parent_id=" + parentId).then((resdev) => {
        if (resdev && resdev.data && resdev.data.result) {
            commit('setChildStation', { parentId, children: resdev.data.result })
        }
        get("station", parentId + "?children=true").then(res => {
            if (res && res.data && res.data.result) {
                commit('setThing', { parentId, things: res.data.result })
            }
            re()
        }).catch(err => rej(err))
    }).catch(err => rej(err))
}

export default {
    namespaced: true,
    state: {
        stationTree: [],
        stationCache: {},
        thingCache: {},
        modelCache: {},
        edges:[],
        activeThing:{},

    },
    getters: {
        stationTree: state => {
            return state.stationTree
        },
        thingCache: state => {
            return state.thingCache
        },
    },
    mutations: {
        setModels(state, models) {
            if (models) {
                models.forEach(m => {
                    state.modelCache[m.uid] = m
                    if (typeof m.body == 'string') {
                        m.obody = JSON.parse(m.body)
                    }
                })
            }
        },
        setEdges(state,edges){
            state.edges = edges
        },
        setChildStation(state, { parentId, children }) {
            //console.log("**********", rootState)
            if (children) {
                children.sort((a, b) => {
                    return a.s_name < b.s_name
                })

                children.forEach(c => {

                    state.stationCache[c.uid] = c
                    c.model = state.modelCache[c.model_id]
                    if (c.model) {
                        c.isLeaf = !c.model.is_station
                    }
                })
                let tree = []
                children.forEach(c => {

                    if (!c.parent_id) {
                        tree.push(c)
                    } else {
                        let p = state.stationCache[c.parent_id]
                        if (p) {
                            if (!p.children) {
                                p.children = []
                            }
                            p.children.push(c)
                        }
                    }
                })

                if (parentId === "") {
                    state.stationTree = tree

                } else {
                    let p = state.stationCache[parentId]
                    if (p) {
                        p.children = tree
                    }
                }

            }
        },
        setThing(state, { parentId, things }) {
            //console.log("**********", rootState)
            let { data = [] } = things
            
            if (data.length > 0) {
                data.sort((a, b) => {
                    return a.s_name < b.s_name
                })

                let p = state.stationCache[parentId]
                if (p) {
                    p.children = []
                    data.forEach(t => {
                        t.type = 'obj'
                        t.isLeaf = true
                        state.thingCache[t.uid] = t
                        p.children.push(t)
                        t.model = state.modelCache[t.model_id]
                        if (t.model) {
                            t.isLeaf = !t.model.is_station
                        }
                    });
                }
            }
            state.stationTree = [...state.stationTree]
        },
        setActiveThing(state,view){
            state.activeThing = view
            if(view && view.values){
                view.values.forEach(v=>{
                    v.picktime = moment.unix(v.pick_time).format()
                })
            }
        }
    },
    actions: {
        refreshStations({ commit }, parentId) {
            if (!parentId) {
                parentId = ""
            }
            return new Promise((re, rej) => {
                if (parentId == "") {
                    getAll("tmodel").then(res => {
                        if (res && res.data && res.data.result) {
                            commit('setModels', res.data.result)
                        }
                    }).then(() => {
                        getChildren(re, rej, parentId, commit)
                    })
                } else {
                    getChildren(re, rej, parentId, commit)
                }
            })
        },
        refreshEdges({commit}){
            get("thing","condition?model_id=IOTBASEmEdgeCTL").then((res=>{
                if (res && res.data && res.data.result) {
                    commit('setEdges', res.data.result)
                }
            }))
        },
        saveThing({ commit }, item) {
            console.log("---------", commit)
            return new Promise((re, rej) => {
                update("/thing", item).then((res) => {
                    console.log("***************", res);
                    if (res && res.data && res.data.result) {
                        item.uid = res.data.result.uid;
                    }
                    let setParams = {
                        thing_id: item.uid,
                        values: item.params,
                    };
                    
                    update("thingparam", setParams);
                    if (item.station) {
                        console.log(item);
                        update("/thingstation", {
                            thing_id: item.uid,
                            station_id: item.station.uid,
                        }).catch((err => {
                            rej(err)
                        }))
                            .then(() => {
                                re() //let itemparams = item.params
                            })
                            .catch((err) => {
                                rej(err)
                            });
                    }
                });
            })

        },
        refreshActiveThing({commit},tid){
            getEx("data/view/"+tid).then((data)=>{
                if(data && data.data && data.data.result){
                    commit('setActiveThing',data.data.result)
                }
            })
        }
    }
}
