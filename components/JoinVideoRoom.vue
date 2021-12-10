<template>
  <div class="w-100 d-flex f-center pa-1">
    <a-button
      @click="showJoinModal"
    >
      Join Video Room
    </a-button>
    <a-modal
      title="Title"
      :visible="visible"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <p>{{ ModalText }}</p>
      <a-form>
        <a-form-item
          label="Room ID"
          :validate-status="status"
          :help="error"
        >
          <a-input
            id="room_id"
            placeholder="Room Id"
            @change="(e) => roomId = e.target.value"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script>
export default {
  data() {
    return {
      ModalText: 'Join Media Room',
      visible: false,
      confirmLoading: false,
      status: null,
      error: '',
      roomId: ''
    };
  },
  methods: {
    showJoinModal() {
      this.visible = true;
    },
    handleOk(e) {
      this.ModalText = 'The modal will be closed after two seconds';
      this.visible = false;
      this.confirmLoading = false;
      this.$router.push(this.localePath('/video-room/'+this.roomId))
    },
    handleCancel(e) {
      console.log('Clicked cancel button');
      this.visible = false;
    },
  },
};
</script>
