Vue.component('signin', {
  template: `<div class="card-body">
<b-alert variant="success" :show="formResponse.success" v-html="formResponse.message"></b-alert>
                                    <form class="form-horizontal form-simple" @submit.prevent="onSubmit" v-if="showForm">
                                    <b-alert :show="dismissCountDown"
             dismissible
             variant="warning"
             @dismissed="dismissCountDown=0"
             @dismiss-count-down="countDownChanged" v-html="formResponse.message">
    </b-alert>
                                        <fieldset class="form-group position-relative has-icon-left mb-0">
                                            <input type="email" class="form-control form-control-lg input-lg half" id="email" v-model="formData.email" :class="{'is-invalid': formErrors.email }" placeholder="E-mail Address"
                                                   required>
                                            <div class="form-control-position">
                                                <i class="ft-user"></i>
                                            </div>
                                            <span class="invalid-feedback" v-if="formErrors.email">
                                        <strong>{{ formErrors.email }}</strong>
                                    </span>
                                        </fieldset>
                                        <fieldset class="form-group position-relative has-icon-left">
                                            <input type="password" class="form-control form-control-lg input-lg half" id="user-password"
                                                   v-model="formData.password" placeholder="Enter Password" :class="{'is-invalid': formErrors.password }">
                                            <div class="form-control-position">
                                                <i class="la la-key"></i>
                                            </div>
                                            <span class="invalid-feedback" v-if="formErrors.password">
                                        <strong>{{ formErrors.password }}</strong>
                                    </span>
                                        </fieldset>
                                        <div class="form-group row">
             
                                            <div class="col-md-12 col-12 text-center text-md-right"><a href="/lost-password" class="card-link">Lost Password?</a></div>
                                        </div>
                                        <button type="submit" class="btn btn-info btn-lg btn-block" :disabled="isLoading"><i class="ft-unlock"></i> Sign In</button>
                                    </form>
                                </div>
`,
  props: [],
  data(){
    return {
      dismissSecs: 8,
      dismissCountDown: 0,
      showDismissibleAlert: false,
      formData: {
        email: '',
        password: ''
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

      axios.post('/signin', this.formData)
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
