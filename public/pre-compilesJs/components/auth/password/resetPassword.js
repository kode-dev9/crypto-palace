Vue.component('reset-passsword', {
  template: `
<div class="card-body">
<b-alert variant="success" :show="formResponse.success">{{formResponse.message}}</b-alert>
                                    <form class="form-horizontal" @submit.prevent="onSubmit" v-if="showForm">
                                    <b-alert :show="dismissCountDown"
             dismissible
             variant="warning"
             @dismissed="dismissCountDown=0"
             @dismiss-count-down="countDownChanged">
      {{formResponse.message}}
    </b-alert>
                                        <fieldset class="form-group position-relative has-icon-left">
                                            <input type="password" class="form-control form-control-lg input-lg" id="password"
                                                   v-model="formData.password"
                      required
                      placeholder="New Password"
                      :class="{'is-invalid': formErrors.password }">
                                            <div class="form-control-position">
                                                <i class="la la-key"></i>
                                            </div>
                                            <span class="invalid-feedback" v-if="formErrors.password">
                                        <strong>{{ formErrors.password }}</strong>
                                    </span>
                                        </fieldset>
                                        <fieldset class="form-group position-relative has-icon-left">
                                            <input type="password" class="form-control form-control-lg input-lg" id="confirmPassword"
                                                   v-model="formData.confirmPassword"
                      required
                      placeholder="Retype Password"
                      :class="{'is-invalid': formErrors.confirmPassword }">
                                            <div class="form-control-position">
                                                <i class="la la-key"></i>
                                            </div>
                                            <span class="invalid-feedback" v-if="formErrors.confirmPassword">
                                        <strong>{{ formErrors.confirmPassword }}</strong>
                                    </span>
                                        </fieldset>
                                        <button type="submit" class="btn btn-outline-info btn-lg btn-block" :disabled="isLoading"><i class="ft-unlock"></i> Reset Password</button>
                                    </form>
                                </div>`,
  props: ['email'],
  data(){
    return {
      dismissSecs: 8,
      dismissCountDown: 0,
      showDismissibleAlert: false,
      formData: {
        email: this.email,
        password: '',
        confirmPassword: ''
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

      axios.post('/lost-password/reset', this.formData)
        .then(res => {
          this.isLoading = false
          this.showForm = false
          this.formResponse.message = res.data.response
          this.formResponse.success = true
          this.formData = []
          setTimeout(() => {
            window.location = '/signin'
          }, 10000)
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
