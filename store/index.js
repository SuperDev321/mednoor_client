export const state = () => ({
  email: '',
  code: null,
})

export const mutations = {
  setEmail(state, email) {
    state.email = email
  },
  setCode(state, code) {
    state.code = code
  },
}
