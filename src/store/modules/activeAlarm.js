import { refreshEx } from '../../services/crud'

var moment = require('moment');
import io from 'socket.io-client'

let msgClient
function initMsgChannel(dispatch) {
  console.log("hello-------------------------------11")
  msgClient = io('', { transports: ['websocket'], path: "/ws/" })
  msgClient.on('connect', () => {
    console.log('+++ io connected! ++++', msgClient.id)
    dispatch('onUID', msgClient.id)
    msgClient.on("alarm", (data) => {
      console.log("------------------data------------", data)
      dispatch('alarm', data)
    })
    msgClient.on("alarmRefresh",(data)=>{
      console.log("---------------alarmrefreshed-------------",data)
      dispatch('refreshActiveAlarm')
    })
  })

  return msgClient
  //console.log(msgClient,getToken,io)
}
export default {
  namespaced: true,
  state: {
    activeAlarms: [],
    cache: {},
    sid: '',
  },
  getters: {
    activeAlarms: state => {
      return state.activeAlarms
    },
    SID: state => {
      return state.sid
    }
  },
  mutations: {
    setUID(state, id) {
      state.sid = id
    },
    setAlarms(state, { result }) {
      state.cache = {}
      console.log("------result", result)
      const alarms = result
      /*const tc = rootState.station.thingCache*/
      if (alarms) {
        /*alarms.forEach(a=>{
          translate(a,tc)
       })*/
        state.activeAlarms = alarms
        if (alarms) {
          let i = 0
          alarms.forEach(a => {
            a.index = i
            i++
            state.cache[a.alarm_id + a.m_id + a.mindex + a.t_id] = a
            a.alarm_time = moment.unix(a.time).format()
          });
        }
      }
      else {
        state.activeAlarms = []
      }
      console.log("******************", state.activeAlarms)

    },
    setAlarm(state, alarm) {
      if (alarm) {
        const id = alarm.alarm_id + alarm.m_id + alarm.mindex + alarm.t_id
        const oldAlarm = state.cache[id]
        if (alarm.flag == "BEGIN") {

          if (oldAlarm) {
            return;
          }
          state.cache[id] = alarm
          alarm.index = state.activeAlarms.length
          alarm.alarm_time = moment.unix(alarm.time).format()
          state.activeAlarms.push(alarm)
        }
        else {
          if (!oldAlarm) {
            return
          }
          delete state.cache[id]
          state.activeAlarms.splice(oldAlarm.index, 1)
          for (let i = oldAlarm.index; i < state.activeAlarms.length; i++) {
            state.activeAlarms[i].index--
          }

        }
      }
    }
  },
  actions: {
    refreshActiveAlarm({ commit, rootState, dispatch }) {
      if (!msgClient) {
        initMsgChannel(dispatch)
      }
      return refreshEx(commit, 'setAlarms', 'alarm/active', rootState)
    },
    alarm({ commit }, alarm) {
      commit("setAlarm", alarm)
    },
    onUID({ commit }, id) {
      commit('setUID', id)
    }
  }
}