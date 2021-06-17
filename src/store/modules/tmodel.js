import {
    refresh,
    removeItem,
    handleDataAsTree,
    updateItem,
    newItem,
    refreshByID,
    get,
    put
} from '@/services/crud'
let sha256 = require("js-sha256").sha256

import Vue from 'vue'


async function syncFromCloud({ un, pd, addr, dispatch, re, rej }) {
    let actions = []
    let res = await get('cloud', 'proxy?un=' + un + "&pd=" + sha256(pd) + "&addr=" + addr + "&path=/api/cfg/catalog")
    if (res && res.data) {
        const catalogs = res.data.result
        let actions = []
        if (catalogs) {

            catalogs.forEach(c => {
                actions.push(new Promise((cre, crej) => {
                    dispatch("saveCatalog", c).then(() => cre()).catch(err => {
                        crej(err)
                    })
                }))
            })
        }

        res = await get('cloud', 'proxy?un=' + un + "&pd=" + sha256(pd) + "&addr=" + addr + "&path=/api/cfg/tmodel")
        if (res && res.data) {
            const models = res.data.result
            if (models) {
                models.forEach(m => {
                    actions.push(new Promise((cre, crej) => {
                        dispatch("saveTModel", m).then(() => cre()).catch(err => {
                            crej(err)
                        })
                    }))
                    //await dispatch("saveTModel",m)
                })
            }
        }

    }
    Promise.all(actions).then(() => re()).catch((err) => rej(err))
}

function copyCatalog(state) {
    const catalogs = []
    //const cache = {}
    if (state.tmodels && state.catalogCache) {
        for (let cid in state.catalogCache) {
            const c = state.catalogCache[cid]
            const nc = { uid: c.uid, s_name: c.s_name, parent_id: c.parent_id }
            catalogs.push(nc)
        }
        let { tree, cache } = handleDataAsTree(catalogs)
        state.catalogModelTree = tree
        state.tmodels.forEach(m => {
            const nm = { uid: m.uid, s_name: m.s_name, catalog_id: m.catalog_id, key: m.key }
            const nc = cache[nm.catalog_id]
            if (!nc.children) {
                nc.children = []
            }
            nc.children.push(nm)
        })

    }
}

function keepStepCatalog(state) {
    //const catalogModelTree = []
    if (state.tmodels && state.catalogCache) {
        for (const m of state.tmodels) {
            m.key = m.uid
            const c = state.catalogCache[m.catalog_id]

            m.catalog = c
            if (c) {
                m.catalog_name = c.name
                /*
                const nm = {uid:m.uid,s_name:m.s_name,catalog_id:m.catalog_id,key:m.key}
                if(!c.children){
                    c.children = [nm]
                }
                else{
                    const index = c.children.findIndex(c=>{
                        return c.uid === m.uid && c.s_name === m.s_name && c.catalog_id
                    })
                    
                    if(index >= 0){
                        c.children[index] = nm
                    }
                    else{
                        c.children.push(nm)
                    }
                }
               
                m.isLeaf = true*/

            }
        }
    }
    copyCatalog(state)
}

export default {
    namespaced: true,
    state: {
        catalogs: [],
        catalogCache: undefined,
        tmodels: [],
        tmodelCache: {},
        catalogModelTree: []
    },
    getters: {
        catalogs: state => {
            return state.catalogs
        },
        tmodels: state => {
            return state.tmodels
        },
    },
    mutations: {
        setCatalogs(state, catalogs) {
            const tree = handleDataAsTree(catalogs)
            state.catalogs = tree.tree
            state.catalogCache = tree.cache
            keepStepCatalog(state)
            //localStorage.setItem(process.env.VUE_APP_USER_KEY, JSON.stringify(user))

        },
        setTModels(state, tmodels) {
            state.tmodels = tmodels
            keepStepCatalog(state)
            if (tmodels) {
                state.tmodelCache = {}
                tmodels.forEach(m => {
                    state.tmodelCache[m.uid] = m
                });
            }


        },
        setTModel(state, tmodel) {
            const catalogId = tmodel.catalog_id
            const catalog = state.catalogCache[catalogId]
            if (catalog) {
                let index = catalog.children.findIndex(c => {
                    return c.uid == tmodel.uid
                })
                if (index >= 0) {
                    Vue.$set(catalog.children, index, tmodel)
                }
                index = state.tmodels.findIndex(m => {
                    return m.uid === tmodel.uid
                })
                if (index >= 0) {
                    Vue.$set(state.tmodels, index, tmodel)
                }
                state.tmodelCache[tmodel.uid] = tmodel
            }
        }

    },
    actions: {
        syncModels({ dispatch }, { un, pd, addr }) {
            return new Promise((re, rej) => {
                syncFromCloud({ un, pd, addr, dispatch, re, rej })
            }
            )
        },
        ModelFromCloud({ dispatch }, { un, pd, addr,uid }){
            return new Promise((re,rej)=>{
                get('cloud', 'proxy?un=' + un + "&pd=" + sha256(pd) + "&addr=" + addr + "&path=/api/cfg/tmodel/" + uid).then((res)=>{
                    if(res && res.data && res.data.result){
                        dispatch('saveTModel',res.data.result).then(()=>re()).catch(err=>{
                            rej(err)
                        })
                    }else{
                        rej()
                    }
                }).catch(err=>{
                    rej(err)
                })
            })
        },
        ModelToCloud({ dispatch }, { un, pd, addr,uid }){
            return new Promise((re,rej)=>{
                get('tmodel', uid).then((res)=>{
                    if(res && res.data && res.data.result){
                        console.log(res,dispatch,un,pd,addr,uid)
                        put("api/cfg/cloud/proxy",res.data.result,'un=' + un + "&pd=" + sha256(pd) + 
                            "&addr=" + addr + "&path=/api/cfg/tmodel/")
                        .then(()=>{
                            re()
                        }).catch(err=>{
                            rej(err)
                        })
                    }else{
                        rej()
                    }
                }).catch(err=>{
                    rej(err)
                })
            })
        },

        refreshCatalogs({ commit }) {
            console.log('refresh catalogs-------------------')
            return refresh(commit, 'setCatalogs', 'catalog')
        },
        removeCatalog({ dispatch }, id) {
            return removeItem('catalog', id, dispatch, 'refreshCatalogs')
        },
        saveCatalog({ dispatch }, item) {
            return updateItem('catalog', item, dispatch, 'refreshCatalogs')
        },
        newCatalog({ dispatch }, obj) {
            return newItem('catalog', obj, dispatch, 'refreshCatalogs')
        },
        refreshTModels({ commit }) {
            console.log('refreshTModels-------------------')
            return new Promise((re, rej) => {
                refresh(commit, 'setCatalogs', 'catalog').then(() => {
                    refresh(commit, 'setTModels', 'tmodel').then(() => {
                        re()
                    }).catch(err => {
                        rej(err)
                    })
                }).catch(err => {
                    rej(err)
                })
            })
            //return refresh(commit,'setTModels','tmodel')
        },
        refreshTModelByID({ commit }, id) {
            console.log('refreshTModel-------------------', id)
            return new Promise((re, rej) => {
                refreshByID(commit, 'setTModel', 'tmodel').then(() => {
                    re()
                }).catch(err => {
                    rej(err)
                })
            })

        },
        removeTModel({ dispatch }, id) {
            return removeItem('tmodel', id, dispatch, 'refreshTModels')
        },
        saveTModel({ dispatch }, obj) {
            let catalog = obj.catalog
            if (typeof obj.body === 'string') {
                obj.body = JSON.parse(obj.body)
            }
            if (typeof obj.containner_rule === 'string') {
                obj.containner_rule = JSON.parse(obj.containner_rule)

            }
            return updateItem('tmodel', obj, dispatch, 'refreshTModels',undefined,(obj)=>{
                delete obj.catalog
            },(obj)=>{
                obj.catalog = catalog
            })
        },

        newTModel({ dispatch }, obj) {
            let catalog = obj.catalog
            return newItem('tmodel', obj, dispatch, 'refreshTModels',undefined,(obj)=>{
                delete obj.catalog
            },(obj)=>{
                obj.catalog = catalog
            })
        },


    }
}
