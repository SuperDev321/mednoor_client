<template>
  <div>
    <a-modal v-model="localValue" :title="title" on-ok="handleOk">
      <template slot="footer">
        <a-button key="submit" type="primary" @click="handleOk">
          Ok
        </a-button>
      </template>
      <p>{{description}}</p>
    </a-modal>
  </div>
</template>

<script>
import vModelMixin from '~/mixins/vmodelMixin'

export default {
  name: 'RequestModal',
  mixins: [vModelMixin],
  data: ()=>({
    title: 'Error',
    description: 'Oops! Something has happened here', // Default message
  }),
  mounted() {
    this.$on('error', (err) => {
      if (err !== null && err !== undefined){
        if (err.response){
          const r = err.response
          let d = {}
          if (r.data){
            d = r.data
          }
          if (r){
            if (r.status === 404){
              this.title = this.$t('not_found') + ' - ' + r.status
              this.description = this.$t('endp_not_found')
            }else if (r.status === 500){
              this.title = this.$t('int_srv_err') + ' ' + r.status
              this.description = this.$t('isnt_flt')
            }else if (r.msg){
              this.description = r.msg
            }else if (d.msg) {
              this.description = d.msg
            }
          }else if (d.msg){
            this.description = d.msg
          }else{
            this.description = this.$t('un_err')
          }
        }else if (typeof err === 'string'){
          this.description = err
        }else if (!err.status){
          this.description = this.$t('un_conn')
        }
      }else{
        console.log('no error?')
      }
      this.localValue = true
    })
  },
  methods: {
    handleOk(){
      this.localValue = false
      this.$emit('ok')
    },
  }
}
</script>
