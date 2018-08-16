Vue.component('tfa', {
  template: `<div>
<b-alert variant="info" v-html="message" show></b-alert>
    </div>`,
  props: ['message'],
  data(){
    return {


    }
  },
  methods: {

  },
  mounted(){
    setTimeout(() =>{
      window.location = '/signin';
    }, 4000)
  }
});
