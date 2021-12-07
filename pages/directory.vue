<template>
<div class="directory mh-100v mt-1">
  <div class="filters pa-1">
    <p class="h1">Filters</p>
    <hr>
    <p class="filter-name">
      Category
    </p>
    <div v-if="categories">
      <div v-for="(c,i) in categories" :key="i">
        <a-checkbox :ref="'checkbox-' + i" @change='categoryChanged(i)'>
          {{c.cate_category}}
        </a-checkbox>
      </div>
    </div>
    <p v-else class="text">
      No categories were found.
    </p>
    <!--
    <p class="filter-name mt-1">
      Country
    </p>
    <a-auto-complete placeholder="Country Name"></a-auto-complete>
    -->
  </div>
  <div class="content pa-1">
    <a-row>
      <a-col>
        <a-form-item>
          <a-input-search v-model="term" size="large" placeholder="Search by Professional Name" enter-button  @search="search">
          </a-input-search>
        </a-form-item>
      </a-col>
    </a-row>
    <a-row>
      <div v-if="loadingResults">
        <a-skeleton></a-skeleton>
      </div>
      <a-col v-else-if="searched">
        <h4>Search Results</h4>
        <hr class="mb-1">
        <div v-if="results.length > 0">
          <div v-for="(r, i) in results" :key="i" class="search-result">
            <p class="name">{{r.full_sname}}</p>
            <div class="info">
              <p v-if="r.category" class="category">
                {{r.category}}
              </p>
              <!--
              <p>
                -
              </p>
              <div class="country">
                Country Name
              </div>
              -->
            </div>
            <div class="mt-1">
              <a-button type="primary" @click="$router.push(localePath('/user/' + r.uuid))">View Profile</a-button>
            </div>
          </div>
        </div>
        <div v-else>
          <p class="h6">No results were found.</p>
        </div>
      </a-col>
      <a-col v-else>
        <a-alert message="You can use the filters to search by category and/or country." type="info" show-icon />
      </a-col>
    </a-row>
  </div>
</div>
</template>

<script>
export default {
  name: "Directory",
  data: ()=>({
    categories: [],
    term: '',
    results: '',
    searched: false,
    loadingResults: false,
  }),
  mounted(){
    this.$api.get('/category').then(({data})=>{
      if (data){
        this.categories = data
      }
    })
  },
  methods: {
    categoryChanged(i){
      this.$nextTick(()=>{
        const r = this.$refs['checkbox-' + i]
        if (r) {
          console.log(r)
        }
      })
    },
    search(){
      console.log('search', this.term);
      this.loadingResults = true
      this.$api.get('/user/search', {
        params: {
          searchTerm: this.term,
          type: 'MODERATOR',
        }
      }).then(({data})=>{
        if (data){
          this.results = data
        }
        this.searched = true
      }).catch((err)=>{
        this.$toast.error(err)
      }).finally(()=>{
        this.loadingResults = false
      })
    }
  }
}
</script>

<style scoped lang="sass">
.directory
  background: #eee
  .filters
    display: none
  .content
    width: 100%
    background: #fff

.filter-name
  font-size: 1.2rem
  margin-bottom: 0

.search-result
  margin: 1rem 0
  border: 1px solid #eee
  padding: 1rem
  box-shadow: 3px 6px 9px #ccc
  .name
    font-weight: bold
    color: #000
  .info
    display: flex
    p
      margin-bottom: 0
      margin-right: 1rem


@media screen and (min-width: $md)
  .directory
    display: flex
    padding: 1rem
    .filters
      display: block
      width: 300px
      border: 1px solid #eee
      background-color: #fff
      margin-right: 0.6rem


</style>
