export default function ({ $axios, app }, inject) {
  // Create axios instance
  const api = $axios.create({
    headers: {
      common: {
        Accept: 'application/json',
      },
    },
  })
  // Create interceptor to add the user's token.
  api.onRequest((config) => {
    if (app.$auth.loggedIn) {
      const token = app.$auth.strategy.token.get().split(' ')[1] // Get the token only
      api.setToken(token, 'Bearer') // Bearer token
    }
    return config
  })

  // SET THE APIS URL
  api.setBaseURL(process.env.API_URL)

  // Inject to context as $api
  inject('api', api)
}
