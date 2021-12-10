export const removeTracksFromStream = (stream) => {
  if (stream) {
    stream.getTracks().forEach(track => (
      track.stop()
    ))
  }
}
