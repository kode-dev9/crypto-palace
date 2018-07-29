Vue.component('lost-passsword', {
  template: `<div>
<b-card title="Lost Password"
          style="max-width: 20rem;"
          class="mb-3">
          <b-alert variant="success" :show="formResponse.success">{{formResponse.message}}</b-alert>
          <div v-if="message"><b-alert variant="info" show>{{message}}</b-alert></div>
          
    <b-form @submit.prevent="onSubmit" v-if="showForm">
   
    <b-alert :show="dismissCountDown"
             dismissible
             variant="warning"
             @dismissed="dismissCountDown=0"
             @dismiss-count-down="countDownChanged">
      {{formResponse.message}}
    </b-alert>
      <b-form-group id="email"
                    label="Email address:"
                    label-for="email">
        <b-form-input id="email"
                      type="email"
                      v-model="formData.email"
                      required
                      placeholder="Enter email"
                      :class="{'is-invalid': formErrors.email }">
        </b-form-input>
        <span class="invalid-feedback" v-if="formErrors.email">
                                        <strong>{{ formErrors.email }}</strong>
                                    </span>
      </b-form-group>
      <b-button type="submit" variant="primary" :disabled="isLoading">Submit</b-button>
    </b-form>
  </b-card>
    </div>`,
  props: ['message'],
  data(){
    return {
      dismissSecs: 8,
      dismissCountDown: 0,
      showDismissibleAlert: false,
      formData: {
        email: ''
      },
      formErrors: [],
      isLoading: false,
      formResponse: {
        success: false,
        message: ''
      },
      showForm: true
    }
  },
  methods: {
    countDownChanged (dismissCountDown) {
      this.dismissCountDown = dismissCountDown
    },
    onSubmit: function(){
      this.showDismissibleAlert=true
      this.isLoading = true

      axios.post('/lost-password', this.formData)
        .then(res => {
          this.isLoading = false
          this.showForm = false
          this.formResponse.message = res.data.response
          this.formResponse.success = true
          this.formData = []
        }).catch(err => {
        this.isLoading = false;
        let formResponse = err.response.data.response

        if(typeof formResponse === 'object'){
          this.formErrors = formResponse
        }else {
          this.formResponse.message = formResponse
          this.dismissCountDown = this.dismissSecs
        }
      })
    }
  }
});
