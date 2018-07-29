Vue.component('tfa', {
  template: `<div>
<b-card title="Authentication Failed"
          style="max-width: 20rem;"
          class="mb-3">
    <b-alert variant="info" v-html="message" show></b-alert>
  </b-card>
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
      window.location = '/login';
    }, 4000)
  }
});
