<template>
<div class="pa-1 mh-100v">
    <!-- eslint-disable vue/no-v-html -->
    <pre v-html="content"></pre>
    <!--eslint-enable-->
</div>
</template>

<script>
export default {
    data() {
        return {
            title: this.$t('terms_cond')
        }
    },
    mounted(){
        this.$api.get('/content/terms-conditions').then(({data})=>{
            if (data && data.teco_text){
                this.content = data.teco_text
            }
        })
    }
}
</script>
