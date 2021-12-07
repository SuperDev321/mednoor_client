<template>
  <div class='pa-1 mh-100v'>
    <a-row class='mb-1'>
      <a-col>
        <a-breadcrumb>
          <a-breadcrumb-item>
            <nuxt-link :to="localePath('/dashboard')">{{ $t('dashboard') }}</nuxt-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>{{ $t('emr') }}</a-breadcrumb-item>
        </a-breadcrumb>
      </a-col>
    </a-row>
    <a-row>
      <a-col :xs='24' :sm='24'>
        <p class='h1'>
          {{ $t('emr_lng') }}
        </p>
        <a-button type='success' class='mb-1' @click="$router.push(localePath('/new-emr'))">
          <a-icon type='medicine-box'></a-icon>
          New Encounter
        </a-button>
        <a-button type='raisin-black' class='mb-1'
                  @click="$router.push({path: localePath('/new-emr'), query: {type: 'template'}})">
          <a-icon type='medicine-box'></a-icon>
          {{ $t('new_template') }}
        </a-button>
      </a-col>
      <a-col :xs=24 class='mb-1'>
        <a-form layout='horizontal'>
          <a-row>
            <a-col :md='{span: 3}' :lg='{span: 2}'>
              <a-select v-model='type' style='width: 120px' @change='handleChange'>
                <a-select-option value='record'>
                  {{ $t('record') }}
                </a-select-option>
                <a-select-option value='template'>
                  {{ $t('template') }}
                </a-select-option>
              </a-select>
            </a-col>
            <a-col :md='{span: 6}'>
              <a-input v-model='searchTerm' :placeholder="type === 'record' ? $t('search_pl1') : $t('search_pl2')" />
            </a-col>
          </a-row>
        </a-form>
      </a-col>
      <a-col :xs='24' :sm='24'>
        <a-skeleton v-if='loadingData' />
        <a-table v-else :columns='columns' :data-source='items'>
          <div slot='patient' slot-scope='text, record'>
            <nuxt-link :to="localePath('/user/' + record.user_uuid)">
              {{ record.user_first_name }} {{ record.user_last_name }}
            </nuxt-link>
          </div>
          <div slot='actions' slot-scope='text, record'>
            <nuxt-link :to="{
                            path: localePath('/new-emr'),
                            query: {
                                mere: record.mere_uuid
                            }
                        }">{{ $t('edit') }}
            </nuxt-link>
            <span v-if='record.user_uuid && (isAdmin || isSuper || myUserId === record.mere_owner)'>
                            <a-divider type='vertical' />
                            <a href='javascript:void(0)' type='old-rose' @click='printRecord(record.mere_uuid)'>
                                <SpinOrText :value='isPdfLoading(record.mere_uuid)' dark>
                                    <a-icon type='file-pdf'></a-icon>{{ $t('print') }}
                                </SpinOrText>
                            </a>
                        </span>
            <a-divider type='vertical' />
            <span class='red--text clickable' @click='deleteItem(record.mere_uuid)'>{{ $t('delete') }}</span>
          </div>
          <div slot='owner_name' slot-scope='text, record'>
            <nuxt-link v-if='record && record.owner_uuid' :to="localePath('/user/' + record.owner_uuid)">
              {{ record.owner_name }} {{ record.owner_last_name }}
            </nuxt-link>
            <span v-else>
                            {{ record.owner_name }} {{ record.owner_last_name }}
            </span>
          </div>
          <div slot='mere_date' slot-scope='text, record'>
            {{ dateString(record.mere_date) }}
          </div>
        </a-table>
      </a-col>
    </a-row>
    <a ref='pdfDownload' :href='pdfFile' :download='pdfFile' class='d-none' target='_blank'></a>
  </div>
</template>

<script>
import authMixin from '~/mixins/authMixin'
import dateMixin from '~/mixins/dateMixin'
import userRoleMixin from '~/mixins/userRoleMixin'
import SpinOrText from '~/components/SpinOrText.vue'

const debounce = require('lodash.debounce')

export default {
  name: 'EMR',
  components: {
    SpinOrText
  },
  mixins: [dateMixin, userRoleMixin, authMixin],
  layout: 'dashboard',
  middleware: ['authenticated', 'not-blocked', 'not-deleted'],
  data: () => ({
    columns: [],
    items: [],
    type: 'record',
    pdfFile: '',
    loadingPdf: false,
    printing: null,
    searchTerm: '',
    loadingData: false
  }),
  head() {
    return {
      title: this.$t('emr')
    }
  },
  watch: {
    searchTerm: debounce(function(v) {
      this.$api.get('/medical-record', {
        params: {
          type: this.type,
          search: v
        }
      }).then(({ data }) => {
        this.items = data
      })
    }, 500)
  },
  mounted() {
    this.setColumns()
  },
  methods: {
    isPdfLoading(recordId) {
      return this.printing === recordId
    },
    printRecord(id) {
      this.printing = id
      this.loadingPdf = true
      this.$api.get('/medical-record/pdf/' + id).then(({ data }) => {
        this.$message.success(this.$t('pdf_gend').toString())
        this.pdfFile = process.env.API_URL + '/generated/record/' + data.file
        setTimeout(() => {
          this.$refs.pdfDownload.click()
        }, 500)
      }).catch(() => {
        this.$message.error(this.$t('pdf_fail').toString())
      }).finally(() => {
        this.loadingPdf = false
        this.printing = null
      })
    },
    deleteItem(v) {
      const that = this
      this.$confirm({
        content: this.$t('sure_del_item'),
        onOk() {
          return new Promise((resolve, reject) => {
            that.$api.delete('/medical-record/' + v).then(() => {
              setTimeout(() => {
                that.items = that.items.filter((it) => {
                  return it.mere_uuid !== v
                })
                resolve()
              }, 600)
            }).catch((err) => {
              resolve(err)
            })
          })
        },
        cancelText: this.$t('cancel'),
        onCancel() {
          that.$destroyAll()
        }
      })
    },
    handleChange(v) {
      this.setColumns()
    },
    setColumns() {
      if (this.type === 'record') {
        this.columns = [
          {
            title: this.$t('emr'),
            dataIndex: 'user_mrn',
            key: 'user_mrn',
            slots: { title: this.$t('emr') },
            scopedSlots: { customRender: 'user_mrn' }
          },
          {
            title: this.$t('patient'),
            dataIndex: 'patient',
            key: 'patient',
            slots: { title: this.$t('patient') },
            scopedSlots: { customRender: 'patient' }
          }
        ]
        this.columns.push(
          {
            title: this.$t('created_at'),
            dataIndex: 'mere_date',
            key: 'mere_date',
            slots: { title: this.$t('created_at') },
            scopedSlots: { customRender: 'mere_date' }
          },
          {
            title: this.$t('actions'),
            dataIndex: 'actions',
            key: 'actions',
            slots: { title: this.$t('actions') },
            scopedSlots: { customRender: 'actions' }
          })

      } else {
        this.columns = [
          {
            title: this.$t('template_name'),
            dataIndex: 'mere_name',
            key: 'mere_name',
            slots: { title: this.$t('template_name') },
            scopedSlots: { customRender: 'mere_name' }
          }
        ]

        if (this.isAdmin || this.isSuper) {
          this.columns.push(
            {
              title: this.$t('created_by'),
              dataIndex: 'owner_name',
              key: 'owner_name',
              slots: { title: this.$t('created_by') },
              scopedSlots: { customRender: 'owner_name' }
            })
        }

        this.columns.push(
          {
            title: this.$t('created_at'),
            dataIndex: 'mere_date',
            key: 'mere_date',
            slots: { title: this.$t('created_at') },
            scopedSlots: { customRender: 'mere_date' }
          },
          {
            title: this.$t('actions'),
            dataIndex: 'actions',
            key: 'actions',
            slots: { title: this.$t('actions') },
            scopedSlots: { customRender: 'actions' }
          })
      }
      this.loadingData = true
      this.$api.get('/medical-record', {
        params: {
          type: this.type
        }
      }).then(({ data }) => {
        this.items = data
      }).finally(() => {
        this.loadingData = false
      })
    }
  }
}
</script>
