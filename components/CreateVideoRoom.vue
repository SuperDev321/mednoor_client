<template>
  <div class="w-100 d-flex f-center pa-1">
    <a-button type="default" @click="showModal">
      Create Media Room
    </a-button>
    <a-modal
      title="Title"
      :visible="visible"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <p>Create Video Room</p>
      <a-form>
        <a-form-item
          label="Room ID"
          :validate-status="status"
          :help="error"
        >
          <a-input id="room_id" placeholder="Room Id" @change="handleChange"  />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script>
export default {
  data() {
    return {
      ModalText: 'Content of the modal',
      visible: false,
      confirmLoading: false,
      status: null,
      error: '',
      mediaSocket: null,
      roomId: ''
    };
  },
  mounted() {
    this.mediaSocket = this.$nuxtSocket({
      name: 'media',
      persist: 'mediaSocket'
    })
  },
  methods: {
    showModal() {
      this.visible = true;
    },
    handleOk(e) {
      this.mediaSocket.emit('createRoom', {room_id: this.roomId}, (data) => {
        if (data === 'already exists') {
          this.error = 'Please use another unique name for room.'
          this.status = 'error';
        } else {
          this.visible = false;
          this.$router.push(this.localePath(`/video-room/${data}`));
        }
      });
    },
    handleCancel(e) {
      this.visible = false;
    },
    handleChange(e) {
      this.roomId = e.target.value;
    }
  },
};
</script>
