const mediaType = {
  audio: 'audioType',
  video: 'videoType',
  screen: 'screenType'
}
const _EVENTS = {
  exitRoom: 'exitRoom',
  openRoom: 'openRoom',
  startVideo: 'startVideo',
  stopVideo: 'stopVideo',
  startAudio: 'startAudio',
  stopAudio: 'stopAudio',
  startScreen: 'startScreen',
  stopScreen: 'stopScreen',
  startRemoteMedia: 'startRemoteMedia',
  stopRemoteMedia: 'stopRemoteMedia',
}


class MediaClient {
  constructor(localMediaEl, remoteVideoEl, remoteAudioEl, mediasoupClient, socket, name, roomId, successCallback) {
    console.log('new media client')
    this.name = name
    this.localMediaEl = localMediaEl
    this.remoteVideoEl = remoteVideoEl
    this.remoteAudioEl = remoteAudioEl
    this.mediasoupClient = mediasoupClient

    socket.request = function request(type, data = {}) {
      return new Promise((resolve, reject) => {
        socket.emit(type, data, (data) => {
          if (data.error) {
            reject(data.error)
          } else {
            resolve(data)
          }
        })
      })
    }

    this.socket = socket
    this.producerTransport = null
    this.consumerTransport = null
    this.device = null
    this.roomId = roomId

    this.isVideoOnFullScreen = false
    this.isDevicesVisible = false

    this.consumers = new Map()
    this.producers = new Map()

    /**
     * map that contains a mediatype as key and producerId as value
     */
    this.producerLabel = new Map()

    this._isOpen = false
    this.eventListeners = new Map()

    Object.keys(_EVENTS).forEach(
      function (evt) {
        this.eventListeners.set(evt, [])
      }.bind(this)
    )

    this.createRoom(roomId).then(
      async function () {
        await this.join(name, roomId)
        this.initSockets()
        this._isOpen = true
        successCallback()
      }.bind(this)
    )
  }

  /// /////// INIT /////////

  async createRoom(roomId) {
    await this.socket
      .request('createRoom', {
        room_id: roomId
      })
      .catch((err) => {
        console.log('Create room error:', err)
      })
  }

  join(name, roomId) {
    return this.socket
      .request('join', {
        name,
        room_id: roomId
      })
      .then(
        async function (e) {
          console.log('Joined to room', e)
          const data = await this.socket.request('getRouterRtpCapabilities')
          const device = await this.loadDevice(data)
          this.device = device
          await this.initTransports(device)
          this.socket.emit('getProducers')
        }.bind(this)
      )
      .catch((err) => {
        console.log('Join error:', err)
      })
  }

  async loadDevice(routerRtpCapabilities) {
    let device
    try {
      device = new this.mediasoupClient.Device()
    } catch (error) {
      if (error.name === 'UnsupportedError') {
        console.error('Browser not supported')
        alert('Browser not supported')
      }
      console.error(error)
    }
    await device.load({
      routerRtpCapabilities
    })
    return device
  }

  async initTransports(device) {
    // init producerTransport
    {
      const data = await this.socket.request('createWebRtcTransport', {
        forceTcp: false,
        rtpCapabilities: device.rtpCapabilities
      })

      if (data.error) {
        console.error(data.error)
        return
      }

      this.producerTransport = device.createSendTransport(data)

      this.producerTransport.on(
        'connect',
        function ({ dtlsParameters }, callback, errback) {
          return this.socket
            .request('connectTransport', {
              dtlsParameters,
              transport_id: data.id
            })
            .then(callback)
            .catch(errback)
        }.bind(this)
      )

      this.producerTransport.on(
        'produce',
        async function ({ kind, rtpParameters }, callback, errback) {
          try {
            const { producer_id: producerId } = await this.socket.request('produce', {
              producerTransportId: this.producerTransport.id,
              kind,
              rtpParameters
            })
            // eslint-disable-next-line node/no-callback-literal
            callback({ id: producerId })
          } catch (err) {
            errback(err)
          }
        }.bind(this)
      )

      this.producerTransport.on(
        'connectionstatechange',
        function (state) {
          switch (state) {
            case 'connecting':
              break

            case 'connected':
              // localVideo.srcObject = stream
              break

            case 'failed':
              this.producerTransport.close()
              break

            default:
              break
          }
        }.bind(this)
      )
    }

    // init consumerTransport
    {
      const data = await this.socket.request('createWebRtcTransport', {
        forceTcp: false
      })

      if (data.error) {
        console.error(data.error)
        return
      }

      // only one needed
      this.consumerTransport = device.createRecvTransport(data)
      this.consumerTransport.on(
        'connect',
        function ({ dtlsParameters }, callback, errback) {
          this.socket
            .request('connectTransport', {
              transport_id: this.consumerTransport.id,
              dtlsParameters
            })
            .then(callback)
            .catch(errback)
        }.bind(this)
      )

      this.consumerTransport.on(
        'connectionstatechange',
        function (state) {
          switch (state) {
            case 'connecting':
              break

            case 'connected':
              // remoteVideo.srcObject = await stream;
              // await socket.request('resume');
              break

            case 'failed':
              this.consumerTransport.close()
              break

            default:
              break
          }
        }.bind(this)
      )
    }
  }

  initSockets() {
    this.socket.on(
      'consumerClosed',
      function ({ consumer_id: consumerId }) {
        console.log('Closing consumer:', consumerId)
        this.removeConsumer(consumerId)
      }.bind(this)
    )

    /**
     * data: [ {
     *  producerId:
     *  producer_socket_id:
     * }]
     */
    this.socket.on(
      'newProducers',
      async function (data) {
        console.log('New producers', data)
        for (const { producer_id: producerId, producer_data: producerData } of data) {
          await this.consume(producerId, producerData)
        }
      }.bind(this)
    )

    this.socket.on(
      'disconnect',
      function () {
        this.exit(true)
      }.bind(this)
    )
  }

  /// ///// MAIN FUNCTIONS /////////////

  async produce(type, deviceId = null) {
    let mediaConstraints = {}
    let audio = false
    let screen = false
    switch (type) {
      case mediaType.audio:
        mediaConstraints = {
          audio: {
            deviceId
          },
          video: false
        }
        audio = true
        break
      case mediaType.video:
        mediaConstraints = {
          audio: false,
          video: {
            width: {
              min: 640,
              ideal: 1920
            },
            height: {
              min: 400,
              ideal: 1080
            },
            deviceId
            /* aspectRatio: {
                            ideal: 1.7777777778
                        } */
          }
        }
        break
      case mediaType.screen:
        mediaConstraints = false
        screen = true
        break
      default:
        return
    }
    if (!this.device.canProduce('video') && !audio) {
      console.error('Cannot produce video')
      return
    }
    if (this.producerLabel.has(type)) {
      console.log('Producer already exists for this type ' + type)
      return
    }
    console.log('Mediacontraints:', mediaConstraints)
    let stream
    try {
      stream = screen
        ? await navigator.mediaDevices.getDisplayMedia()
        : await navigator.mediaDevices.getUserMedia(mediaConstraints)

      const track = audio ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0]
      const params = {
        track
      }
      if (!audio && !screen) {
        params.encodings = [
          {
            rid: 'r0',
            maxBitrate: 100000,
            // scaleResolutionDownBy: 10.0,
            scalabilityMode: 'S1T3'
          },
          {
            rid: 'r1',
            maxBitrate: 300000,
            scalabilityMode: 'S1T3'
          },
          {
            rid: 'r2',
            maxBitrate: 900000,
            scalabilityMode: 'S1T3'
          }
        ]
        params.codecOptions = {
          videoGoogleStartBitrate: 1000
        }
      }
      const producer = await this.producerTransport.produce(params)

      console.log('Producer', producer)

      this.producers.set(producer.id, producer)

      // let elem
      // if (!audio) {
      //   elem = document.createElement('video')
      //   elem.srcObject = stream
      //   elem.id = producer.id
      //   elem.playsinline = false
      //   elem.autoplay = true
      //   elem.className = 'vid'
      //   this.localMediaEl.appendChild(elem)
      //   this.handleFS(elem.id)
      // }

      producer.on('trackended', () => {
        this.closeProducer(type)
      })

      producer.on('transportclose', () => {
        console.log('Producer transport close');
        switch (type) {
          case mediaType.audio:
            this.event(_EVENTS.stopAudio, stream)
            break
          case mediaType.video:
            this.event(_EVENTS.stopVideo, stream)
            break
          default:
            break
        }
        this.producers.delete(producer.id)
      })

      producer.on('close', () => {
        console.log('Closing producer')
        switch (type) {
          case mediaType.audio:
            this.event(_EVENTS.stopAudio, stream)
            break
          case mediaType.video:
            this.event(_EVENTS.stopVideo, stream)
            break
          default:
            break
        }
        this.producers.delete(producer.id)
      })

      this.producerLabel.set(type, producer.id)

      switch (type) {
        case mediaType.audio:
          this.event(_EVENTS.startAudio, stream)
          break
        case mediaType.video:
          this.event(_EVENTS.startVideo, stream)
          break
        case mediaType.screen:
          this.event(_EVENTS.startScreen)
          break
        default:
          return
      }
    } catch (err) {
      console.log('Produce error:', err)
    }
  }

  // eslint-disable-next-line require-await
  async consume(producerId, producerData) {
    // let info = await this.roomInfo()
    const { name: producerUserId } = producerData;

    this.getConsumeStream(producerId).then(
      function ({ consumer, stream, kind }) {
        consumer.producerUserId = producerUserId
        this.consumers.set(consumer.id, consumer)

        // let elem
        // if (kind === 'video') {
        //   elem = document.createElement('video')
        //   elem.srcObject = stream
        //   elem.id = consumer.id
        //   elem.playsinline = false
        //   elem.autoplay = true
        //   elem.className = 'vid'
        //   this.remoteVideoEl.appendChild(elem)
        //   this.handleFS(elem.id)
        // } else {
        //   elem = document.createElement('audio')
        //   elem.srcObject = stream
        //   elem.id = consumer.id
        //   elem.playsinline = false
        //   elem.autoplay = true
        //   this.remoteAudioEl.appendChild(elem)
        // }
        this.event(_EVENTS.startRemoteMedia, { stream, kind, producerUserId })
        consumer.on(
          'trackended',
          function () {
            this.removeConsumer(consumer.id)
          }.bind(this)
        )

        consumer.on(
          'transportclose',
          function () {
            this.removeConsumer(consumer.id)
          }.bind(this)
        )
      }.bind(this)
    )
  }

  async getConsumeStream(producerId) {
    const { rtpCapabilities } = this.device
    const data = await this.socket.request('consume', {
      rtpCapabilities,
      consumerTransportId: this.consumerTransport.id, // might be
      producerId
    })
    const { id, kind, rtpParameters } = data

    const codecOptions = {}
    const consumer = await this.consumerTransport.consume({
      id,
      producerId,
      kind,
      rtpParameters,
      codecOptions
    })
    console.log(consumer)

    const stream = new MediaStream()
    stream.addTrack(consumer.track)

    return {
      consumer,
      stream,
      kind
    }
  }

  closeProducer(type) {
    if (!this.producerLabel.has(type)) {
      console.log('There is no producer for this type ' + type)
      return
    }

    const producerId = this.producerLabel.get(type)
    console.log('Close producer', producerId)

    this.socket.emit('producerClosed', {
      producer_id: producerId
    })

    this.producers.get(producerId).close()
    this.producers.delete(producerId)
    this.producerLabel.delete(type)

    // if (type !== mediaType.audio) {
    //   const elem = document.getElementById(producerId)
    //   elem.srcObject.getTracks().forEach(function (track) {
    //     track.stop()
    //   })
    //   elem.parentNode.removeChild(elem)
    // }

    switch (type) {
      case mediaType.audio:
        this.event(_EVENTS.stopAudio)
        break
      case mediaType.video:
        this.event(_EVENTS.stopVideo)
        break
      case mediaType.screen:
        this.event(_EVENTS.stopScreen)
        break
      default:

    }
  }

  pauseProducer(type) {
    if (!this.producerLabel.has(type)) {
      console.log('There is no producer for this type ' + type)
      return
    }

    const producerId = this.producerLabel.get(type)
    this.producers.get(producerId).pause()
  }

  resumeProducer(type) {
    if (!this.producerLabel.has(type)) {
      console.log('There is no producer for this type ' + type)
      return
    }

    const producerId = this.producerLabel.get(type)
    this.producers.get(producerId).resume()
  }

  removeConsumer(consumerId) {
    // const elem = document.getElementById(consumerId)
    // elem.srcObject.getTracks().forEach(function (track) {
    //   track.stop()
    // })
    // elem.parentNode.removeChild(elem)
    const consumer = this.consumers.get(consumerId);
    if (consumer) {
      const producerUserId = consumer.producerUserId;
      const kind = consumer.kind;
      this.event(_EVENTS.stopRemoteMedia, { userId: producerUserId, kind })
    }

    this.consumers.delete(consumerId)
  }

  exit(offline = false) {
    const clean = function () {
      this._isOpen = false
      this.consumerTransport.close()
      this.producerTransport.close()
      this.socket.off('disconnect')
      this.socket.off('newProducers')
      this.socket.off('consumerClosed')
    }.bind(this)

    if (!offline) {
      this.socket
        .request('exitRoom')
        .then((e) => console.log(e))
        .catch((e) => console.warn(e))
        .finally(
          function () {
            clean()
          }
        )
    } else {
      clean()
    }

    this.event(_EVENTS.exitRoom)
  }

  /// ////  HELPERS //////////

  async roomInfo() {
    const info = await this.socket.request('getMyRoomInfo')
    return info
  }

  static get mediaType() {
    return mediaType
  }

  event(evt, data = null) {
    if (this.eventListeners.has(evt)) {
      this.eventListeners.get(evt).forEach((callback) => callback(data))
    }
  }

  on(evt, callback) {
    this.eventListeners.get(evt).push(callback)
  }

  /// ///// GETTERS ////////

  isOpen() {
    return this._isOpen
  }

  static get EVENTS() {
    return _EVENTS
  }

  /// ///// UTILITY ////////

  copyURL() {
    const tmpInput = document.createElement('input')
    document.body.appendChild(tmpInput)
    tmpInput.value = window.location.href
    tmpInput.select()
    document.execCommand('copy')
    document.body.removeChild(tmpInput)
    console.log('URL copied to clipboard 👍')
  }

  showDevices() {
    // if (!this.isDevicesVisible) {
    //   reveal(devicesList)
    //   this.isDevicesVisible = true
    // } else {
    //   hide(devicesList)
    //   this.isDevicesVisible = false
    // }
  }

  handleFS(id) {
    const videoPlayer = document.getElementById(id)
    videoPlayer.addEventListener('fullscreenchange', (e) => {
      if (videoPlayer.controls) return
      const fullscreenElement = document.fullscreenElement
      if (!fullscreenElement) {
        videoPlayer.style.pointerEvents = 'auto'
        this.isVideoOnFullScreen = false
      }
    })
    videoPlayer.addEventListener('webkitfullscreenchange', (e) => {
      if (videoPlayer.controls) return
      const webkitIsFullScreen = document.webkitIsFullScreen
      if (!webkitIsFullScreen) {
        videoPlayer.style.pointerEvents = 'auto'
        this.isVideoOnFullScreen = false
      }
    })
    videoPlayer.addEventListener('click', (e) => {
      if (videoPlayer.controls) return
      if (!this.isVideoOnFullScreen) {
        if (videoPlayer.requestFullscreen) {
          videoPlayer.requestFullscreen()
        } else if (videoPlayer.webkitRequestFullscreen) {
          videoPlayer.webkitRequestFullscreen()
        } else if (videoPlayer.msRequestFullscreen) {
          videoPlayer.msRequestFullscreen()
        }
        this.isVideoOnFullScreen = true
        videoPlayer.style.pointerEvents = 'none'
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen()
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        }
        this.isVideoOnFullScreen = false
        videoPlayer.style.pointerEvents = 'auto'
      }
    })
  }
}

export default MediaClient;
