import {
    refresh,
} from '@/services/crud'

export default {
    namespaced: true,
    state: {
        config:{}

    },
    getters: {
        config: state => {
            return state.config
        }
    },
    mutations: {
        setConfig(state,config){
            console.log("%%%%%%%",config)
            state.config = config
        }
    },
    actions: {
        refreshConfig({ commit }) {
            return refresh(commit, 'setConfig', 'config')
        },
       
        
    }
}
