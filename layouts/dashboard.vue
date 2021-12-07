<template>
    <div>
        <Navbar></Navbar>
        <div :class="sidebarClassess">
            <div class="sidebar">
                <div class="indicators">
                    <a-icon type="left" class="close" @click="close"></a-icon>
                    <a-icon type="right" class="open" @click="open"></a-icon>
                </div>
                <ul>
                    <li v-for="(o, i) in dashboardItems" :key="'it-' + i"><nuxt-link :to="localePath(o.to)"><span>{{o.shortTitle}}</span> <a-icon :type="o.icon"></a-icon></nuxt-link></li>
                </ul>
            </div>
            <div class="content">
                <nuxt/>
            </div>
        </div>
    </div>
</template>
<script>

import Navbar from '~/components/Navbar.vue'
import dashboardOptionsList from '~/mixins/dashboardOptionsList'

export default {
    components: {
        Navbar
    },
    mixins: [dashboardOptionsList],
    data (){
        return {
            path: '',
            opened: false,
        }
    },
    computed: {
        sidebarClassess(){
            const c = []
            if (this.opened){
                c.push('opened')
            }
            return c.join(' ')
        }
    },
    mounted(){
        this.path = this.$route.path
    },
    methods: {
        close(){
            this.opened = false
        },
        open(){
            console.log('Open!', this.opened)
            this.opened = true
        }
    }
}
</script>
<style scoped lang="sass">
    .sidebar
        transition: all 500ms ease
        background: $mdn-raisin-black
        color: #fff
        height: 100vh
        position: fixed
        left: 0
        top: 50px
        bottom: 0
        width: 40px
        overflow-y: auto
        display: none
        ul
            padding: 0
            margin: 0
            li
                padding: 0
                margin: 0
                list-style: none
                a
                    color: #fff
                    padding: 0.7rem 0.5rem
                    display: flex
                    border-bottom: 1px solid $mdn-sun
                    &:hover
                        background: #333
                        cursor: pointer
                    span
                        margin-right: 6px
                        display: none
                        flex: 1
                        text-align: center
        .indicators
            display: flex
            padding: 0.7rem 0.5rem
            color: $mdn-sun

            .close
                display: none
    .opened
        .sidebar
            width: 200px
            ul
                li
                    a
                        span
                            display: flex
            .indicators
                .close
                    display: block
                    margin-left: auto
                .open
                    display: none
        .content
            left: 200px


    .content
        position: fixed
        left: 0
        bottom: 0
        top: 50px
        right: 0
        overflow-y: auto
        transition: all 500ms ease
    @media screen and (min-width: $md)
        .sidebar
            display: block
        .content
            left: 40px

</style>
