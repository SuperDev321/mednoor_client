export default {
  data: () => ({
    umUploadProgress: 0,
    umPictures: [],
    umUploaded: [],
  }),
  mounted() {},
  watch: {
    umPictures(pics) {
      if (pics && pics.length > 0) {
        pics.forEach((pic) => {
          if (this.umUploaded !== undefined && this.umUploaded !== null) {
            if (!this.umUploaded.includes(pic)) {
              if (!this.umUploaded) {
                this.umUploaded = []
              }
              this.umUploaded.push(pic)
              const cancelToken = this.$api.CancelToken
              const source = cancelToken.source()
              if (!this.uploadToken) {
                this.uploadToken = []
              }
              this.uploadToken.push({
                uuid: pic.uuid,
                source,
              })
              // Upload goes here
              if (this.$refs.uploadBox) {
                this.$refs.uploadBox.$emit('upload', pic)
              }
              const data = new FormData()
              data.append('picture', pic)
            }
          }
        })
      }
    },
  },
  methods: {
    onProgress(progressEvent, idx, uuid) {
      let totalLength = 0
      if (progressEvent) {
        totalLength = progressEvent.lengthComputable
          ? progressEvent.total
          : progressEvent.target.getResponseHeader('content-length') ||
            progressEvent.target.getResponseHeader(
              'x-decompressed-content-length'
            )
      }
      if (totalLength !== null && totalLength !== undefined) {
        if (progressEvent) {
          this.umUploadProgress = Math.round(
            (progressEvent.loaded * 100) / totalLength
          )
        } else {
          this.umUploadProgress = 0
        }
        if (this.$refs && this.$refs.uploadBox && (idx === null || idx)) {
          const data = {
            progress: this.umUploadProgress,
          }
          if (idx !== null) {
            data.index = idx
          }
          if (uuid) {
            data.uuid = uuid
          }
          this.$refs.uploadBox.$emit('progress-change', data)
        }
      }
    },
  },
}
