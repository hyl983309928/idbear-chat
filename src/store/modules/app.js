import api from 'lib/api/api.js'

const app = {
  state: {
    userInfo: {},
    robotInfo: {},
    is_miniprogram: false
  },
  mutations: {
    SET_USERINFO: (state, obj) => {
      state.userInfo = obj
    },
    SET_ROBOTINFO: (state, obj) => {
      state.robotInfo = obj
    },
    SET_IS_MINIPROGRAM: (state, flag) => {
      state.is_miniprogram = flag
    }
  },
  actions: {
    getUserInfo ({commit, state}, openid) {
      if (!state.userInfo.openid) {
        return api.user.getUserInfo(openid)
          .then((data) => {
            commit('SET_USERINFO', data.results[0] || {})
            return data.results[0]
          })
      } else {
        return new Promise(function (resolve, reject) {
          resolve(state.userInfo)
        })
      }
    },
    getRobotInfo ({commit, state}, robotId) {
      if (!state.robotInfo.id) {
        return api.user.getRobotInfo(robotId)
          .then((data) => {
            commit('SET_ROBOTINFO', data || {})
            return data
          })
      } else {
        return new Promise(function (resolve, reject) {
          resolve(state.robotInfo)
        })
      }
    }
  }
}

export default app
