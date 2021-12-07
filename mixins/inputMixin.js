export default {
  data (){
    return {
      allowed: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    }
  },
  methods: {
    addCharacter(str, newChar){
      if (str ){
        const last = str.charAt(str.length - 1)
        if (this.allowed.includes(last)) {
          return str.substr(0, str.length - 1) + newChar + last
        }
      }
      return str
    },
    addSlash(str) {
      return this.addCharacter(str, '/')
    },
    prependCharacter(str, character){
      if (str){
        if (str.length > 0 && str.charAt(0) !== character){
          str = character + str
        }else{
          str = character
        }
      }
      return str
    },
    numbersOnly(str){
      let result = ''
      if (str){
        for(let i = 0; i<str.length; i++){
          const char = str.charAt(i)
          if (this.allowed.includes(char)){
            result+= char.toString()
          }
        }
      }
      return result
    }
  },
}
