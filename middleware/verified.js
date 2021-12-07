export default function ({ $auth, redirect, localePath }) {
  if ($auth.user) {
    if (!$auth.user.verified) {
      return redirect(localePath('/verify-email'))
    }
  }
}
