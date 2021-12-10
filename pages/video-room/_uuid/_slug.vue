<template>
  <a-spin
    tip="Loading..."
    :spinning="loading"
    wrapper-class-name="w-100 h-100 video-spin">
    <div class="h-100 w-100 d-flex f-center flex-col spin-content">
      <!-- <div v-if="loading">Loading</div> -->
      <div class="flex-grow-1 w-100 overflow-y-auto overflow-x-hidden d-flex flex-col">
        <!-- <div ref="localVideo"></div>
        <div ref="remoteVideos"></div>
        <div ref="remoteAudios"></div> -->
        <div class="zoom-peer">
          <peer-view
            v-if="zoomMedia"
            :name="zoomMedia.userId"
            :audio="null"
            :video="zoomMedia.video"
          />
        </div>
        <div class="peers-container">
          <div class="peer-container" @click="() => changeZoomMedia(localMedia)">
            <peer-view
              v-if="localMedia"
              :name="localMedia.userId"
              :audio="localMedia.audio"
              :video="localMedia.video"
            />
          </div>
          <div
            v-for="remoteMedia in remoteMedias"
            :key="remoteMedia.userId"
            class="peer-container"
            @click="() => changeZoomMedia(remoteMedia)"
          >
            <peer-view
              :name="remoteMedia.userId"
              :audio="remoteMedia.audio"
              :video="remoteMedia.video"
            />
          </div>
        </div>
      </div>
      <div class="video-actions">
        <div id="devicesList" class="d-flex">
          <div>
            <span>Audio:</span>
            <a-select
              ref="audioSelect"
              placeholder="select audio device"
              style="width: 120px"
              :value="audioVal"
              @change="(value) => audioVal = value"
            >
              <a-select-option v-for="{value, text} in audioDevices" :key="value" :value="value">
                {{text}}
              </a-select-option>
            </a-select>
          </div>
          <a-button v-if="localMedia && localMedia.audio" type="danger" @click="stopAudio">Stop Audio</a-button>
          <a-button v-else type="primary" :loading="isLoadingAudio" @click="startAudio">Start Audio</a-button>
          <div>
            <span>Video:</span>
            <a-select
              style="width: 120px"
              :value="videoVal"
              @change="(value) => videoVal = value"
            >
              <a-select-option v-for="{value, text} in videoDevices" :key="value" :value="value" >
                {{text}}
              </a-select-option>
            </a-select>
          </div>
        </div>
        <a-button v-if="localMedia && localMedia.video" type="danger" @click="stopVideo">Stop Video</a-button>
        <a-button v-else type="primary" :loading="isLoadingVideo" @click="startVideo" >Start Video</a-button>

      </div>
    </div>
  </a-spin>
</template>

<script>
import * as mediasoupClient from 'mediasoup-client';
import MediaClient from '~/utils/MediaClient.js';
import PeerView from '~/components/Peer/PeerView';
import { removeTracksFromStream } from '~/utils/media.js';

export default {
  name: 'VideoRoom',
  components: {
    PeerView
  },
  layout: 'videoChat',
  data () {
    return {
      loading: true,
      socket: null,
      mediaClient: null,
      roomId: '',
      isEnumerateDevices: false,
      videoDevices: [],
      audioDevices: [],
      videoVal: '',
      audioVal: '',
      userId: '',
      remoteVideos: [],
      localMedia: null,
      remoteMedias: [],
      zoomMedia: null,
      isLoadingVideo: null,
      isLoadingAudio: null,
    }
  },
  mounted () {
    this.roomId = this.$route.params.uuid;
    this.socket = this.$nuxtSocket({
      name: 'media',
      persist: 'mediaSocket'
    });

    this.initEnumerateDevices();
    const localEl = this.$refs.localVideo;
    const remoteEl = this.$refs.remoteVideos;
    const remoteAudioEl = this.$refs.remoteAudios;
    const roomOpen = () => {
      this.loading = false;
      this.addListeners();
    }
    this.userId = 'user_' + Math.round(Math.random() * 1000);
    this.mediaClient = new MediaClient(localEl, remoteEl, remoteAudioEl, mediasoupClient, this.socket, this.userId, this.roomId, roomOpen);
  },
  methods: {
    async initEnumerateDevices() {
  // Many browsers, without the consent of getUserMedia, cannot enumerate the devices.
      if (this.isEnumerateDevices) return

      const constraints = {
        audio: true,
        video: true
      }
      await navigator.mediaDevices
        .getUserMedia(constraints)
        .then(async (stream) => {
          await this.enumerateDevices()
          stream.getTracks().forEach(function (track) {
            track.stop()
          })
        })
        .catch((err) => {
          console.error('Access denied for audio/video: ', err)
        })
    },
    async enumerateDevices() {
      // Load mediaDevice options
      await navigator.mediaDevices.enumerateDevices().then((devices) => {
        const audioDevices = [];
        const videoDevices = [];
        devices.forEach((device) => {
          if (device.kind === 'audioinput') {
            audioDevices.push({value: device.deviceId, text: device.label});
          } else if (device.kind === 'videoinput') {
            videoDevices.push({value: device.deviceId, text: device.label});
          }
        })
        this.audioDevices = audioDevices
        this.videoDevices = videoDevices
      });
    },
    addListeners() {
      this.mediaClient.on(MediaClient.EVENTS.stopAudio, () => {
        this.removeLocalPeer('audio')
      })
      this.mediaClient.on(MediaClient.EVENTS.startAudio, (stream) => {
        this.addLocalPeer({
          kind: 'audio',
          stream
        });
        this.isLoadingAudio= false
      })

      this.mediaClient.on(MediaClient.EVENTS.startRemoteMedia, (data) => {
        this.addNewPeer(data);
      })

      this.mediaClient.on(MediaClient.EVENTS.stopRemoteMedia, (data) => {
        this.removePeer(data)
      })

      this.mediaClient.on(MediaClient.EVENTS.startVideo, (stream) => {
        this.addLocalPeer({
          kind: 'video',
          stream
        });
        this.isLoadingVideo = false
      })

      this.mediaClient.on(MediaClient.EVENTS.stopVideo, () => {
        this.removeLocalPeer('video')
      })
      this.mediaClient.on(MediaClient.EVENTS.exitRoom, () => {
        console.log('exit room');
        this.removeAllPeers();
        this.$router.push(this.localePath(`/video-chat`));
      })
    },
    async startVideo () {
      if (this.mediaClient) {
        this.isLoadingVideo = true
        await this.mediaClient.produce(MediaClient.mediaType.video, this.videoVal, this.userId)
      }
    },
    stopVideo () {
      if (this.mediaClient) {
        this.mediaClient.closeProducer(MediaClient.mediaType.video)
      }
    },
    async startAudio () {
      if (this.mediaClient) {
        this.isLoadingAudio= true
        await this.mediaClient.produce(MediaClient.mediaType.audio, this.audioVal, this.userId)
      }
    },
    stopAudio () {
      if (this.mediaClient) {
        this.mediaClient.closeProducer(MediaClient.mediaType.audio)
      }
    },
    addLocalPeer (data) {
      const { kind, stream } = data;
      if ((kind === 'video' || kind === 'audio') && stream) {
        if (this.localMedia) {
          const { audio, video } = this.localMedia;
          if (kind === 'video' && video) {
            video.getTracks().forEach(function (track) {
              track.stop();
            });
          } else if (kind === 'audio' && audio) {
            audio.getTracks().forEach(function (track) {
              track.stop();
            });
          }
          this.localMedia = {
            ...this.localMedia,
            [kind]: stream
          };
        } else {
          this.localMedia = {
            userId: this.userId,
            [kind]: stream
          }
        }
      }
    },
    removeLocalPeer (kind) {
      if (this.localMedia && this.localMedia[kind]) {
        let newMedia = {...this.localMedia};
        const { userId } = newMedia;
        const stream = newMedia[kind];
        stream.getTracks().forEach(function (track) {
          track.stop();
        });
        delete newMedia[kind];
        if (!newMedia.video && !newMedia.audio)
          newMedia = null
        this.localMedia = newMedia
        if (this.zoomMedia && this.zoomMedia.userId === userId) {
          this.zoomMedia = newMedia
        }
      }
    },
    /*
      add a new local media
      @params: stream
      @return: null
    */
    addNewPeer (data) {
      if (data && data.kind && data.stream && data.producerUserId && (data.kind === 'video' || data.kind === 'audio')) {
        const newMedias = [...this.remoteMedias];
        const oldMedia = newMedias.find(({ userId, audio, video }) => userId === data.producerUserId);
        if (oldMedia) {
          const { video, audio } = oldMedia;
          if (data.kind === 'video') {
            if (video) {
              video.getTracks().forEach(function (track) {
                track.stop();
              });
            }
            oldMedia.video = data.stream;
          } else {
            if (audio) {
              audio.getTracks().forEach(function (track) {
                track.stop();
              });
            }
            oldMedia.audio = data.stream;
          }
        } else {
          newMedias.push({
            userId: data.producerUserId,
            [data.kind]: data.stream
          })
        }
        this.remoteMedias = newMedias;
      }
    },
    /// ////////////////////
    /*
      remote a remote media
      @params: userId
      @return: void
    */
    removePeer ({userId, kind}) {
      const media = this.remoteMedias.find(({ userId: id }) => id === userId );
      let removeMedia = false
      if (media) {
        const { audio, video } = media;
        if (kind === 'video' && video) {
          removeTracksFromStream(video);
          if (!audio) removeMedia = true
        }
        if (kind === 'audio' && audio) {
          removeTracksFromStream(audio);
          if (!video) removeMedia = true
        }
      }
      if (removeMedia) {
        this.remoteMedias = this.remoteMedias.filter(({ userId: id}) => (id !== userId))
        if (this.zoomMedia.userId === userId) {
          this.zoomMedia = null
        }
      } else {
        this.remoteMedias = this.remoteMedias.map(({ video, audio, userId: id}) => {
            if (id === userId) {
              if (this.zoomMedia && this.zoomMedia.userId === id) {
                this.zoomMedia = {
                  userId: id,
                  video
                }
              }
              if (kind === 'video') {
                return {
                  audio,
                  userId: id
                }
              } else {
                return {
                  video,
                  userId: id
                }
              }
            } else {
              return {
                video,
                audio,
                userId: id
              }
            }
        })
      }
    },
    /// ////////////////////
    /*
      remvoe all medias
      @params: null
      @return: null
    */
    removeAllPeers() {
      if (this.localMedia) {
        const { audio, video } = this.localMedia;
        if (audio) removeTracksFromStream(audio);
        if (video) removeTracksFromStream(video);
        this.localMedia = null
      }
      this.remoteMedias.forEach(({ audio, video }) => {
        if (audio) removeTracksFromStream(audio);
        if (video) removeTracksFromStream(video);
      });
      this.remoteVideos = [];
    },
   /// /////////////////////
    changeZoomMedia (media) {
      console.log(media);
      this.zoomMedia = media;
    }
  }
}
</script>

<style lang="sass" scoped>
.video-actions
  min-height: 50px
  display: flex
  justify-content: center
  align-items: center

.peers-container
  display: flex

.zoom-peer
  flex-grow: 1
  overflow: hidden

.video-spin
  ::v-deep
    .ant-spin-container
      height: 100%
      width: 100%
.peer-container
  height: 150px
</style>
