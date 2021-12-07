<template>
  <div class="pa-1 mh-100v">
    <a-row>
      <a-col :xs="24">
        <p class="h1 mb-1">
          What do you want to do?
        </p>
      </a-col>
    </a-row>
    <a-row>
      <a-col xs:="24">
        <div class="card-deck">
          <a-card title="Patient" class="card-success">
            <a-button type="success" @click="$router.push(localePath('/professionals'))">
              Talk to a professional
            </a-button>
          </a-card>
          <a-card title="Professional" class="card-primary">
            <a-button type="primary" @click="$router.push(localePath('/join-professionals'))">
              Join the professional's directory.
            </a-button>
          </a-card>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script>
export default {
  name: "ViewMode",
  middleware: ['authenticated', 'verified', 'not-blocked', 'not-deleted'],
  mounted() {
    this.$api.get('/professional/my-record').then(({data})=> {
      if (data && data.profe_uuid) {
        if (data.profe_accepted){
          this.$router.push(this.localePath('/'))
        }else{
          this.$router.push(this.localePath('/thanks-for-applying'))
        }
      }
    })
  }
}
</script>

<style scoped>

</style>
