export default function ({ $auth, redirect }) {
  if ($auth.user) {
    if ($auth.user.verified) {
      return redirect('/')
    }
  }
}
