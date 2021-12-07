export default function ({ $auth, redirect }) {
  if ($auth.user && $auth.user.deleted) {
    return redirect('/deleted')
  }
}
