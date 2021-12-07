export default function ({ $auth, redirect }) {
  if ($auth.user && !$auth.user.blocked) {
    return redirect('/welcome')
  }
}
