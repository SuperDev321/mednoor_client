<template>
  <div class="pa-1">
    <a-row class="mb-1">
      <a-col>
        <a-breadcrumb>
          <a-breadcrumb-item>
            <nuxt-link :to="localePath('/dashboard')">{{ $t('dashboard') }}</nuxt-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>{{ $t('list_usrs') }}</a-breadcrumb-item>
        </a-breadcrumb>
      </a-col>
    </a-row>
    <a-row class='pa-1'>
      <a-col>
        <h1 class='text-capitalize'>{{ view }} {{ $t('list') }}</h1>
        <div class="mb-1">
          <a-button type="aero-blue" @click='addUser'>{{ $t('add_urs') }}
            <a-icon type="user-add"></a-icon>
          </a-button>
        </div>
        <a-skeleton v-if='loading'/>
        <a-table v-else :columns='columns' :data-source='users'>
          <div slot='name' slot-scope='text, record'>
            <nuxt-link :to="localePath('/user/' + record.user_uuid)">
              {{ record.user_first_name }} {{ record.user_last_name }}
            </nuxt-link>
          </div>

          <div slot='user_date_of_birth' slot-scope="text, record">
            <span v-if='record && record.user_date_of_birth'>
              {{dateString(record.user_date_of_birth)}}
            </span>
          </div>

          <div slot='user_phone_no' slot-scope='text, record'>
            <span v-if='record && record.user_country_code'>
              +{{record.user_country_code}} {{record.user_phone_no}}
            </span>
          </div>

          <div slot='action' slot-scope='text, record'>
                <span v-if='isAdmin || isSuper'>
                  <!--
                  <a v-if="record.usro_key === 'USER'" @click='updateToProfessional(record.user_uuid)'>{{ $t('updt_prof') }}</a>
                  <a v-if="record.usro_key === 'MODERATOR'" @click='downgradeProfessional(record.user_uuid)'>{{ $t('rem_prof') }}</a>
                  <a-divider type='vertical'/>
                  -->
                  <a v-if='record.user_blocked' @click='unblock(record.user_uuid)'>
                    {{ $t('unblock') }}
                  </a>
                  <a v-else @click='block(record.user_uuid)'>
                    {{ $t('block') }}
                  </a>
                  <a-divider type='vertical'/>
                  <a v-if='(Boolean(record.user_deleted)) === false' @click='deleteUser(record.user_uuid)'>{{ $t('delete') }}</a>

                </span>
            <div v-else-if="isModerator">
                  <a v-if='record.user_blocked' @click='unblock(record.user_uuid)'>
                    {{ $t('unblock') }}
                  </a>
                  <a v-else @click='block(record.user_uuid)'>
                    {{ $t('block') }}
                  </a>
                  <a-divider type='vertical'/>
                  <a v-if='(Boolean(record.user_deleted)) === false' @click='deleteUser(record.user_uuid)'>{{ $t('delete') }}</a>
                </div>
          </div>
        </a-table>
      </a-col>
    </a-row>
    <RequestModal ref='rmodal'></RequestModal>
    <a-modal v-model='visible' :title="$t('conf_action')" ok-text='Ok' :confirm-loading='loadingModal' :cancel-text="$t('cancel')"
             @ok='confirmAction'>
      <p v-if="action === 'delete'">
        {{ $t('del_el') }}
      </p>
      <p v-else>
        {{ $t('conf_act') }}
      </p>
    </a-modal>
  </div>
</template>

<script>
import RequestModal from '~/components/RequestModal'
import userRoleMixin from '~/mixins/userRoleMixin'
import dateMixin from "~/mixins/dateMixin";

export default {
  name: 'UsersList',
  components: {
    RequestModal
  },
  mixins: [userRoleMixin, dateMixin],
  layout: 'dashboard',
  middleware: ['authenticated', 'moderator-or-higher', 'not-blocked', 'not-deleted'],
  data() {
    return {
      users: [],
      columns: [
        {
          title: 'First Name',
          dataIndex: 'user_first_name',
          key: this.$t('name'),
          slots: {title: this.$t('name')},
          scopedSlots: {customRender: 'first_name'}
        },
        {
          title: 'Last Name',
          dataIndex: 'user_last_name',
          key: 'user_last_name',
          slots: {title: this.$t('name')},
          scopedSlots: {customRender: 'first_name'}
        },
        {
          title: 'Email',
          dataIndex: 'user_email',
          key: 'Email',
          slots: {title: 'Email'},
          scopedSlots: {customRender: 'email'}
        },
        {
          title: 'DOB',
          dataIndex: 'user_date_of_birth',
          key: 'user_date_of_birth',
          scopedSlots: {customRender: 'user_date_of_birth'}
        },
        {
          title: 'Phone No.',
          dataIndex: 'user_phone_no',
          key: 'user_phone_no',
          scopedSlots: {customRender: 'user_phone_no'}
        },
        {
          title: this.$t('role'),
          dataIndex: 'usro_role',
          key: 'role'
        },
        {
          title: this.$t('action'),
          key: 'action',
          scopedSlots: {customRender: 'action'}
        }
      ],
      visible: false,
      action: '',
      loading: true,
      loadingModal: false,
      uuid: null,
      view: 'users'
    }
  },
  head() {
    return {
      title: this.$t('list_usrs'),
    }
  },
  computed: {
    query() {
      return this.$route.query
    }
  },
  watch: {
    query(v) {
      this.setView()
      this.loadItems()
    }
  },
  mounted() {
    this.setView()
    this.loadItems()
  },
  methods: {
    addUser() {
      this.$router.push(this.localePath('/add-user'))
    },
    loadItems() {
      this.loading = true
      this.$api.get('/user', {
        params: {
          view: this.view
        }
      }).then(({data}) => {
        this.users = data
      }).catch(err => {
        this.$refs.rmodal.$emit('error', err)
      }).finally(() => {
        this.loading = false
      })
    },
    setView() {
      if (this.$route.query) {
        const q = this.$route.query
        if (q.view && ['users', 'professionals'].includes(q.view.toLowerCase())) {
          this.view = q.view.toLowerCase()
        } else {
          this.view = 'users'
        }
      } else {
        this.view = 'users'
      }
    },
    askConfirmation(uuid) {
      this.uuid = uuid
      this.visible = true
    },
    block(uuid) {
      this.askConfirmation(uuid)
      this.action = 'block'
    },
    unblock(uuid) {
      this.askConfirmation(uuid)
      this.action = 'unblock'
    },
    downgradeProfessional(uuid) {
      this.askConfirmation(uuid)
      this.action = 'update-to-user'
    },
    confirmAction() {
      this.loadingModal = true
      if (this.action === 'delete') {
        this.$api.delete('/user/' + this.uuid).then(() => {
          this.users = this.users.filter((user) => {
            return user.user_uuid !== this.uuid
          })
          this.uuid = null
        }).catch((err) => {
          this.$refs.rmodal.$emit('error', err)
        }).finally(() => {
          this.visible = false
          this.loadingModal = false
        })
      } else if (this.action === 'update-to-professional' || this.action === 'update-to-user') {
        this.loadingModal = true
        this.$api.put('/user/role/' + this.uuid, {
          key: this.action === 'update-to-professional' ? 'MODERATOR' : 'USER'
        }).then(({data}) => {
          this.users = this.users.map((usr) => {
            if (usr.user_uuid === this.uuid) {
              usr.usro_id = data.usro_id
              usr.usro_key = data.usro_key
              usr.usro_role = data.usro_role
            }
            return usr
          })
        }).catch((err) => {
          this.$refs.rmodal.$emit('error', err)
        }).finally(() => {
          this.visible = false
          this.loadingModal = false
        })
      } else if (this.action === 'block' || this.action === 'unblock') {
        this.loadingModal = true
        const blocked = this.action === 'block'
        this.$api.put('/user/blocked/' + this.uuid, {
          blocked
        }).then(() => {
          this.users = this.users.map((user) => {
            if (user.user_uuid === this.uuid) {
              user.user_blocked = blocked
            }
            return user
          })
        }).catch((err) => {
          this.$refs.rmodal.$emit('error', err)
        }).finally(() => {
          this.loadingModal = false
          this.visible = false
          this.uuid = null
        })
      }
    },
    updateToProfessional(uuid) {
      this.uuid = uuid
      this.visible = true
      this.action = 'update-to-professional'
    },
    deleteUser(uuid) {
      this.uuid = uuid
      this.visible = true
      this.action = 'delete'
    }
  }
}
</script>
