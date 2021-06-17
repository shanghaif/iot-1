import {
    refresh,
    //refreshByID,
    put,
    removeItem,
    updateItem,
    newItem,
    get
} from '@/services/crud'
import Vue from 'vue'
let sha256 = require("js-sha256").sha256
function initStation(s, state, ms) {
    s.title = s.s_name
    s.key = s.uid
    state.stationCache[s.uid] = s
    s.tmodel = ms[s.model_id]
    state.thingCache[s.uid] = s
}
export default {
    namespaced: true,
    state: {
        stations: [],
        stationCache: {},
        thingCache: {},
        activeStation: null,
        stationTree: []

    },
    getters: {
        stations: state => {
            return state.stations
        },
        thingCache: state => {
            return state.thingCache
        },
        activeStation: state => {
            return state.activeStation
        },
        stationTree: state => {
            return state.stationTree
        },
        activeDevs: state => {
            if (state.activeStation && state.activeStation.devs) {
                return state.activeStation.devs
            }
            return []
        }

    },
    mutations: {
        setStations(state, stations) {
            state.stations = stations.result
            state.stationCache = {}
            state.stationTree = []
            var rootState = stations.rootState
            var ms = rootState.tmodel.tmodelCache
            if (state.stations) {
                let foundActive = false
                state.stations.forEach(s => {
                    initStation(s, state, ms)
                    if (state.activeStation) {
                        if (s.uid == state.activeStation.uid) {
                            state.activeStation = s
                            foundActive = true
                        }
                    }
                });
                if (!foundActive) {
                    if (state.stations.length > 0) {
                        state.activeStation = state.stations[0]
                    }
                    else {
                        state.activeStation = undefined
                    }

                }
                let tree = []
                state.stations.forEach(s => {
                    if (s.parent_id == '') {
                        tree.push(s)
                    }
                    else {
                        let p = state.thingCache[s.parent_id]
                        if (p) {
                            if (!p.children) {
                                p.children = []
                            }
                            p.children.push(s)
                        }
                    }
                });
                state.stationTree = tree
            }
        },

        setActiveStation(state, res) {
            if (res.result && res.result.length == 1) {
                let station = res.result[0]
                let rootState = res.rootState
                var ms = rootState.tmodel.tmodelCache
                initStation(station, state, ms)
                Vue.set(state, 'activeStation', station)
                //state.activeStation = station
                state.stationCache[station.uid] = Object.assign(state.stationCache[station.uid], station)
            }

        },
        setChildren(state, { id, children, rootState }) {
            var ms = rootState.tmodel.tmodelCache
            const s = state.stationCache[id]
            let { data } = children
            let { count } = children
            if (s) {
                data.forEach((c) => {
                    //state.stationCache[s.uid] = s
                    c.tmodel = ms[c.model_id]
                    state.thingCache[c.uid] = c
                })
                data.sort((a, b) => {
                    return a.uid < b.uid
                })
                Vue.set(s, 'devs', data)
                Vue.set(s, 'count', count)
                //s.devs = children

            }
        }
    },
    actions: {
        refreshStations({ commit, rootState }) {
            return refresh(commit, 'setStations', 'station', rootState)
        },
        removeStation({ dispatch }, id) {
            return removeItem('station', id, dispatch, 'refreshStations')
        },
        removeActiveStation({ dispatch, state }) {
            if (state.activeStation) {
                return removeItem('station', state.activeStation.uid, dispatch, 'refreshStations')
            }
            return new Promise((re) => {
                re()
            })
        },
        saveStation({ dispatch }, station) {
            return updateItem('station', station, dispatch)
        },
        newStation({ dispatch }, { station, hasChildren }) {
            return newItem('station', station, dispatch, 'refreshStations',
                hasChildren ? "createChildren=true" : undefined)
        },
        syncStationToCloud(param, { things, pd, un, edgeID,addr }) {
            return new Promise((re, rej) => {
                put("api/cfg/cloud/proxy", things, 'un=' + un + "&pd=" + sha256(pd) +
                    "&addr=" + addr + "&path=/api/cfg/syncByEdge/" + edgeID)
                    .then(() => {
                        re()
                    }).catch(err => {
                        rej(err)
                    })
            })

        },
        refreshActiveStation({ commit, rootState, state }, obj) {
            let id = obj && obj['id'],param
            if (!id || id == '') {
                id = state.activeStation.uid
            }
            //return refreshByID(commit,'setActiveStation','station',id,rootState)
            return new Promise((re, rej) => {
                get('station', id).then((res) => {
                    if (res && res.data) {
                        commit('setActiveStation', { id, result: res.data.result, rootState })
                        if (obj.page) {
                            param = `${id}?children=true&page=${obj.page || 1}`
                            
                        } else {
                            
                            param = `${id}?children=true`
                        }
                        get('station', param).then((resdev) => {
                            if (resdev && resdev.data && resdev.data.result) {
                                commit('setChildren', { id, children: resdev.data.result, rootState })

                            }
                            re()
                        }).catch(err => rej(err))
                    }
                }).catch((e2) => {
                    rej(e2)
                })
            })
        },
        refreshStationChildren({ commit, rootState, state }, id) {
            if (id == "" || !id) {
                id = state.activeStation ? state.activeStation.uid : ''
            }
            if (id === '') {
                return new Promise((re, rej) => {
                    rej()
                })
            }
            return new Promise((re, rej) => {
                get('station/', id + "?children=true").then((res) => {
                    if (res && res.data && res.data.result) {
                        commit('setChildren', { id, children: res.data.result, rootState })

                    }
                    re()
                }).catch(err => {
                    rej(err)
                })
            })
        },

    }
}
