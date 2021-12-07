<template>
  <div ref="container" class="pa-1 mh-100v">
    <a-row class='mb-1'>
      <a-col>
        <a-breadcrumb>
          <a-breadcrumb-item>
            <nuxt-link :to="localePath('/dashboard')">{{ $t('dashboard') }}</nuxt-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>Categories</a-breadcrumb-item>
        </a-breadcrumb>
      </a-col>
    </a-row>
    <a-row>
      <a-col :xs="24">
        <p class="h1 mb-1">Categories</p>
      </a-col>
      <a-col>
        <a-form ref="form" :form="form" @submit.prevent>
          <a-form-item class="mb-0">
            <a-input v-decorator="['category',
                  {
                    rules: [
                      { required: true, message: 'The category is required' },
                      { min: 2, message: 'Enter at least 2 characters' },
                      { max: 60, message: 'Enter maximum 60 characters' },
                    ]
                  }]" placeholder="Category Name"></a-input>
          </a-form-item>
          <a-form-item>
            <a-button v-if="id" type="danger" html-type="button" class="mr-1" @click="cancelUpdate">
              Cancel
            </a-button>
            <a-button :type="id ? 'primary' : 'raisin-black'" html-type="submit" @click="handleSubmit">
              <SpinOrText v-model="loadingAction">
                <span v-if="id">
                  Update Category
                </span>
                <span v-else>
                  Add Category
                </span>
              </SpinOrText>
            </a-button>
          </a-form-item>
        </a-form>
      </a-col>
      <a-col>
        <a-skeleton v-if="loading"></a-skeleton>
        <a-table v-else :columns="columns" :data-source="categories">
          <div slot='actions' slot-scope='text, record'>
            <span class='primary--text clickable' @click="update(record)">Update</span>
            <a-divider type="vertical"></a-divider>
            <span class='red--text clickable' @click="askDelete(record.cate_id)">Delete</span>
          </div>
        </a-table>
      </a-col>
    </a-row>
    <a-modal
      title="Confirm action"
      :visible="visible"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <p>
        Do you really want to delete this item?
      </p>
    </a-modal>
    <RequestModal ref="rmodal"></RequestModal>
  </div>
</template>

<script>
import SpinOrText from "~/components/SpinOrText";
import RequestModal from '~/components/RequestModal'
export default {
  name: "Categories",
  components: {SpinOrText, RequestModal},
  layout: 'dashboard',
  middleware: ['authenticated', 'verified', 'not-blocked', 'not-deleted', 'admin-or-super'],
  data() {
    return {
      visible: false,
      confirmLoading: false,
      loadingAction: false,
      loading: true,
      categories: [],
      form: this.$form.createForm(this),
      columns: [
        {
          title: 'Category',
          dataIndex: 'cate_category',
          key: 'cate_category',
          scopedSlots: { customRender: 'cate_category' }
        },
        {
          title: 'Actions',
          dataIndex: 'actions',
          key: 'actions',
          scopedSlots: { customRender: 'actions' }
        },
      ],
      id: null,
    }
  },
  mounted() {
    this.$api.get('/category').then(({ data }) => {
      this.loading = false
      this.$nextTick(()=>{
        if (data){
          this.categories = data
        }
      })
    })
  },
  methods: {
    handleOk(){
      this.confirmLoading = true
      this.$api.delete('/category/' + this.id).then(()=>{
        this.categories = this.categories.filter((cat)=>{
          return this.id !== cat.cate_id
        })
        this.$toast.success('Operation successful')
      }).catch((err)=>{
        this.$refs.rmodal.$emit('error', err)
      }).finally(()=>{
        this.visible = false
        this.confirmLoading = false
      })
    },
    handleCancel(){
      this.visible = false
      this.id = null
    },
    cancelUpdate(){
      this.id = null
      this.$nextTick(()=>{
        this.form.resetFields()
      })
    },
    askDelete(id){
      this.id = id
      this.visible = true
    },
    update(record){
      this.id = record.cate_id
      this.form.setFieldsValue({
        category: record.cate_category
      })
      if (process.browser){
        window.scrollTo(0,0)
      }
    },
    handleSubmit(){
      this.form.validateFields((err, values)=>{
        if (err){
          return 0
        }
        this.loadingAction = true
        if (this.id){
          this.$api.put('/category/' + this.id, values).then(({data})=>{
            this.categories = this.categories.map((cat)=>{
              if (cat.cate_id === this.id){
                cat.cate_category = values.category
              }
              console.log(cat)
              return cat
            })
            this.$nextTick(()=>{
              this.form.setFieldsValue({
                category: ''
              })
            })
            this.id = null
          }).catch(err=>{
            this.$refs.rmodal.$emit('error', err)
          }).finally(()=>{
            this.loadingAction = false
          })
        }else{
          this.$api.post('/category', values).then(({data})=>{
            this.categories.push(data)
            this.$nextTick(()=>{
              this.form.setFieldsValue({
                category: ''
              })
            })
          }).catch(err=>{
            this.$refs.rmodal.$emit('error', err)
          }).finally(()=>{
            this.loadingAction = false
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
