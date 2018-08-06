Vue.component('lost-passsword', {
  template: `
<div class="card-body">
<b-alert variant="success" :show="formResponse.success">{{formResponse.message}}</b-alert>
<div v-if="message"><b-alert variant="info" show>{{message}}</b-alert></div>
                                    <form class="form-horizontal" @submit.prevent="onSubmit" v-if="showForm">
                                    <b-alert :show="dismissCountDown"
             dismissible
             variant="warning"
             @dismissed="dismissCountDown=0"
             @dismiss-count-down="countDownChanged">
      {{formResponse.message}}
    </b-alert>
                                        <fieldset class="form-group position-relative has-icon-left">
                                            <input type="email" class="form-control form-control-lg input-lg" id="email"
                                                   v-model="formData.email"
                      required
                      placeholder="Your E-mail Address"
                      :class="{'is-invalid': formErrors.email }">
                                            <div class="form-control-position">
                                                <i class="ft-mail"></i>
                                            </div>
                                            <span class="invalid-feedback" v-if="formErrors.email">
                                        <strong>{{ formErrors.email }}</strong>
                                    </span>
                                        </fieldset>
                                        <button type="submit" class="btn btn-outline-info btn-lg btn-block" :disabled="isLoading"><i class="ft-unlock"></i> Recover Password</button>
                                    </form>
                                </div>
`,
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
