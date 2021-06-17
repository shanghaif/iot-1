import {
    refresh,
} from '@/services/crud'

export default {
    namespaced: true,
    state: {
        areas: [],
        areaCache:{}

    },
    getters: {
        areas: state => {
            return state.areas
        }
    },
    mutations: {
        setAreas(state, areas) {
            state.areaCache = {}
            if(areas){
                areas.forEach(a => {
                    state.areaCache[a.uid] = a
                });
                let tree = []
                areas.forEach(a=>{
                    if(a.parent_id && a.parent_id != "" ){
                        let p = state.areaCache[a.parent_id]
                        if(p){
                            if(!p.children){
                                p.children = []
                            }
                            p.children.push(a)
                        }
                    }else{
                        tree.push(a)
                    }
                })
                state.areas = tree
            }
        },
       
    },
    actions: {
        refreshAreas({ commit }) {
            return refresh(commit, 'setAreas', 'area')
        },
       
        
    }
}
