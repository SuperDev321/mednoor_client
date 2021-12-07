const slugify = require('slugify')

export default {
  methods: {
    slugify(s){
      return slugify(s)
    }
  }
}
