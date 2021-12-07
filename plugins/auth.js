export default ({ app, $auth }) => {
  $auth.onRedirect((to, from) => {
    return app.localePath(to)
  })
}
