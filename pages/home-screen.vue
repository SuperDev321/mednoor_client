<template>
  <div class='pa-1 mh-100v'>
    <a-row class='mb-1'>
      <a-col>
        <a-breadcrumb>
          <a-breadcrumb-item>
            <nuxt-link :to="localePath('/dashboard')">{{ $t('dashboard') }}</nuxt-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>{{ $t('home_screen') }}</a-breadcrumb-item>
        </a-breadcrumb>
      </a-col>
    </a-row>
    <a-row v-if='src === ""'>
      <a-col :md='{span: 12, offset: 6}' :lg='{span: 8, offset: 8}'>
        <h1 class='text-center mb-1'>{{ $t('home_screen') }}</h1>
        <a-form-item label='What screen do you want to replace?'>
          <a-select default-value='sign-up' style='width: 120px' class='mb-1' @change='setType'>
            <a-select-option value='sign-up'>
              {{$t('sign_up')}}
            </a-select-option>
            <a-select-option value='sign-in'>
              {{$t('sign_in')}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-upload-dragger
          name='file'
          :multiple='false'
          :action='computedAction'
          :headers='headers'
          list-type='picture'
          accept='image/*'
          :before-upload='beforeUpload'
          :remove='handleRemove'
          @change='handleChange'
        >
          <p class='ant-upload-drag-icon'>
            <a-icon type='inbox' />
          </p>
          <p class='ant-upload-text'>
            {{ $t('file_desc_drag') }}
          </p>
          <p class='ant-upload-hint'>
            {{ $t('file_desc_sel') }}
          </p>
        </a-upload-dragger>
      </a-col>
    </a-row>
    <a-card v-else class='mt-2'>
      <a-row class='mt-1'>
        <a-col :xs='{span: 24}' :sm='{span: 24}' :md='{span: 12}'>
          <background-item :file='src' source='empty' height='80vh'></background-item>
        </a-col>
        <a-col :xs='{span: 24}' :sm='{span: 24}' :md='{span: 12}' class='pa-1 pt-0'>
          <p class='h3'>
            {{ $t('prev_ex') }}
          </p>
          <a-skeleton />
          <div>
            <a-progress :percent='umUploadProgress'></a-progress>
          </div>
          <a-button type='danger' @click='handleRemove'>
            {{ $t('cancel') }}
          </a-button>
          <a-button type='primary' @click='handleUpload'>
            {{ $t('upl_repl') }}
          </a-button>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script>
import backgroundItem from '~/components/BackgroundItem.vue'
import breakpoints from '~/mixins/breakpoints'
import uploadMixin from '~/mixins/uploadMixin'

export default {
  components: {
    backgroundItem
  },
  mixins: [breakpoints, uploadMixin],
  layout: 'dashboard',
  middleware: ['authenticated', 'not-blocked', 'not-deleted'],
  data() {
    return {
      headers: {
        authorization: this.$auth.strategy.token.get()
      },
      fileList: [],
      uploading: false,
      src: '',
      type: 'sign-up',
    }
  },
  head(){
    return {
      title: this.$t('home_screen')
    }
  },
  computed: {
    computedAction() {
      return process.env.API_URL + '/home-screen'
    }
  },
  methods: {
    setType(t){
      this.type = t
    },
    handleChange(info) {
      const status = info.file.status
      if (status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (status === 'done') {
        this.$message.success(`${info.file.name} ` + this.$t('upl_succ'))
      } else if (status === 'error') {
        this.$message.error(`${info.file.name} ` + this.$t('upl_fail'))
      }
    },
    handleRemove(file) {
      const index = this.fileList.indexOf(file)
      const newFileList = this.fileList.slice()
      newFileList.splice(index, 1)
      this.fileList = newFileList
      this.src = ''
    },
    beforeUpload(file) {
      this.fileList = [...this.fileList, file]
      if (process.browser) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.src = e.target.result
        }
        reader.readAsDataURL(file)
      }
      return false
    },
    handleUpload() {
      const { fileList } = this
      const formData = new FormData()
      fileList.forEach(file => {
        formData.append('file', file)
      })
      formData.append('type', this.type)
      this.uploading = true
      console.log('Type --->', this.type)
      this.$api.post(this.computedAction, formData, {
        onUploadProgress: (evt) => {
          this.onProgress(evt)
        }
      }).then(() => {
        this.fileList = []
        this.$message.success(this.$t('upl_succ').toString())
        setTimeout(() => {
          this.handleRemove()
          this.umUploadProgress = 0
        }, 1000)

      }).catch(() => {
        this.$message.error(this.$t('upl_fail').toString())
      }).finally(() => {
        this.uploading = false
      })
    }
  }
}
</script>
