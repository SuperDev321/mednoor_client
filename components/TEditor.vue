<template>
<div>
    <div v-if="editor" class="editor-contols">
        <button v-if="showH1" type="button" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()">
            h1
        </button>
        <button type="button" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">
            h2
        </button>
        <button type="button" :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()">
            h3
        </button>
        <button type="button" :class="{ 'is-active': editor.isActive('paragraph') }" @click="editor.chain().focus().setParagraph().run()">
            {{$t('paragraph')}}
        </button>
        <button type="button" :class="{ 'is-active': editor.isActive('bold') }" @click="editor.chain().focus().toggleBold().run()">
            <a-icon type="bold" />
        </button>
        <button type="button" :class="{ 'is-active': editor.isActive('italic') }" @click="editor.chain().focus().toggleItalic().run()">
            <a-icon type="italic" />
        </button>
        <button type="button" :class="{ 'is-active': editor.isActive('strike') }" @click="editor.chain().focus().toggleStrike().run()">
            <a-icon type="strikethrough" />
        </button>
        <button type="button" :class="{ 'is-active': editor.isActive('highlight') }" @click="editor.chain().focus().toggleHighlight().run()">
            <a-icon type="highlight" />
        </button>
        <button type="button" @click="addImage">
            <a-icon type="file-image" />
        </button>
        <button type="button" :class="{ 'is-active': editor.isActive('bulletList') }" @click="editor.commands.toggleBulletList()">
          <a-icon type="unordered-list" />
        </button>
        <button type="button" :class="{ 'is-active': editor.isActive('orderedList') }" @click="editor.commands.toggleOrderedList()">
          <a-icon type="ordered-list" />
        </button>
    </div>
    <editor-content v-model="localValue" :editor="editor" class="TEditor">
    <div class="content">
        <pre><code>{{ localValue }}</code></pre>
    </div>
    </editor-content>
</div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import StarterKit from '@tiptap/starter-kit'
// eslint-disable-next-line import/no-named-as-default
import TextAlign from '@tiptap/extension-text-align'
// eslint-disable-next-line import/no-named-as-default
import Highlight from '@tiptap/extension-highlight'
// eslint-disable-next-line import/no-named-as-default
import Image from '@tiptap/extension-image'
// eslint-disable-next-line import/no-named-as-default
import BulletList from '@tiptap/extension-bullet-list'
// eslint-disable-next-line import/no-named-as-default
import OrderedList from '@tiptap/extension-ordered-list'
import vmodelMixin from '~/mixins/vmodelMixin'


export default {
  name: "TEditor",
  components: {
    EditorContent,
  },
  mixins: [vmodelMixin],

  props: {
    enableH1: {
      type: Boolean,
      default: true,
    }
  },

  data() {
    return {
      editor: null,
    }
  },

  computed :{
    showH1(){
      return this.$props.enableH1
    },
    content (){
      if (this.editor){
        return this.editor.getHTML()
      }
      return ''
    }
  },
  watch: {
    content(v){
      this.localValue = v
    }
  },
  mounted() {

    this.editor = new Editor({
      content: '',
      extensions: [
        StarterKit,
        TextAlign,
        Highlight,
        Image,
        BulletList,
        OrderedList
      ],
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
  methods: {
    setHTML(data){
      this.editor.setHTML(data)
    },
     addImage() {
      const url = window.prompt('URL')
      if (url) {
        this.editor.chain().focus().setImage({ src: url }).run()
      }
    },
  },
}
</script>

<style lang="sass">

.TEditor
  div
    margin-top: 0
    border: 2px solid $mdn-raisin-black
    border-top: 0
    min-height: 300px


.ProseMirror
  margin-top: 1rem

  > * + *
    margin-top: 0.75em

  ul,
  ol
    padding: 0 1rem



  code
    background-color: rgba(#616161, 0.1)
    color: #616161

  p
    margin-top: 0
    margin-bottom: 0
  pre
    background: #0D0D0D
    color: #FFF
    font-family: 'JetBrainsMono', monospace
    padding: 0.75rem 1rem
    border-radius: 0.5rem

    code
      color: inherit
      padding: 0
      background: none
      font-size: 0.8rem



  mark
    background-color: #FAF594


  img
    max-width: 100%
    height: auto


  blockquote
    padding-left: 1rem
    border-left: 2px solid rgba(#0D0D0D, 0.1)


  hr
    border: none
    border-top: 2px solid rgba(#0D0D0D, 0.1)
    margin: 2rem 0


.editor-contols
  border: 2px solid $mdn-raisin-black
  margin-bottom: 0
  display: flex
  button
    margin: 0
    display: inline-flex
    outline: 0
    border: 0
    background: #fff
    justify-content: center
    align-items: center
  button.is-active
    background: #011F4B
    color: #fff
</style>
