<template>
  <div class='pa-1 mh-100v'>
    <a-row class='mb-1'>
      <a-col>
        <a-breadcrumb>
          <a-breadcrumb-item>
            <nuxt-link :to="localePath('/dashboard')">{{ $t('dashboard') }}</nuxt-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>{{ $t('pages') }}</a-breadcrumb-item>
        </a-breadcrumb>
      </a-col>
    </a-row>
    <a-row>
      <a-col :xs='24'>
        <p class='h1'>{{ $t('Pages') }}</p>
        <a-button type='raisin-black' @click="$router.push(localePath('/new-page'))">{{ $t('new_page') }}</a-button>
        <a-skeleton v-if='loading' />
        <a-table v-else :columns='columns' :data-source='items'>
          <div slot='page_actions' slot-scope='text, record'>
            <nuxt-link :to="{path: localePath('/new-page'), query: {page: record.page_uuid}}">{{ $t('update') }}</nuxt-link>
            <a-divider type='vertical' />
            <span class='red--text clickable' @click='deleteItem(record.page_uuid)'>{{ $t('delete') }}</span>
          </div>
        </a-table>
      </a-col>
    </a-row>
  </div>
</template>
<script>
export default {
  layout: 'dashboard',
  middleware: ['authenticated', 'verified', 'not-blocked', 'not-deleted', 'admin-or-super'],
  data() {
    return {
      loading: true,
      items: [],
      columns: [
        {
          title: this.$t('title'),
          dataIndex: 'page_title',
          key: 'page_title',
          slots: { title: this.$t('title') },
          scopedSlots: { customRender: 'page_title' }
        },
        {
          title: this.$t('slug'),
          dataIndex: 'page_slug',
          key: 'page_slug',
          slots: { title: this.$t('slug') },
          scopedSlots: { customRender: 'page_slug' }
        },
        {
          title: this.$t('keywords'),
          dataIndex: 'page_keywords',
          key: 'page_keywords',
          slots: { title: this.$t('keywords') },
          scopedSlots: { customRender: 'page_keywords' }
        },
        {
          title: this.$t('actions'),
          dataIndex: 'page_actions',
          key: 'page_actions',
          slots: { title: this.$t('actions') },
          scopedSlots: { customRender: 'page_actions' }
        }
      ]
    }
  },
  head(){
    return {
      title: this.$t('pages')
    }
  },
  mounted() {
    this.$api.get('/page').then(({ data }) => {
      this.items = data
    }).finally(() => {
      this.loading = false
    })
  },
  methods: {
    deleteItem(v) {
      const that = this
      this.$confirm({
        content: this.$t('sure_del_item'),
        onOk() {
          return new Promise((resolve, reject) => {
            that.$api.delete('/page/' + v).then(() => {
              setTimeout(() => {
                that.items = that.items.filter((it) => {
                  return it.page_uuid !== v
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
    }
  }
}
</script>
