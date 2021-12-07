export default function ({ $auth, redirect }) {
  const role = $auth.user.role.toLowerCase()

  if (role !== 'admin' && role !== 'moderator' && role !== 'super') {
    return redirect('/unauthorized')
  }
}
