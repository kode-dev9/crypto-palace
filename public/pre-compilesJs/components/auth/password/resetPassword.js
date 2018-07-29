Vue.component('reset-passsword', {
  template: `<div>
<b-card title="Lost Password"
          style="max-width: 20rem;"
          class="mb-3">
          <b-alert variant="success" :show="formResponse.success">{{formResponse.message}}</b-alert>
    <b-form @submit.prevent="onSubmit" v-if="showForm">
   
    <b-alert :show="dismissCountDown"
             dismissible
             variant="warning"
             @dismissed="dismissCountDown=0"
             @dismiss-count-down="countDownChanged">
      {{formResponse.message}}
    </b-alert>
      <b-form-group id="password"
                    label="Enter New Password:"
                    label-for="password">
        <b-form-input id="password"
                      type="password"
                      v-model="formData.password"
                      required
                      placeholder="New Password"
                      :class="{'is-invalid': formErrors.password }">
        </b-form-input>
        <span class="invalid-feedback" v-if="formErrors.password">
                                        <strong>{{ formErrors.password }}</strong>
                                    </span>
      </b-form-group>
      <b-form-group id="confirmPassword"
                    label="Retype Password:"
                    label-for="confirmPassword">
        <b-form-input id="confirmPassword"
                      type="password"
                      v-model="formData.confirmPassword"
                      required
                      placeholder="Retype Password"
                      :class="{'is-invalid': formErrors.confirmPassword }">
        </b-form-input>
        <span class="invalid-feedback" v-if="formErrors.confirmPassword">
                                        <strong>{{ formErrors.confirmPassword }}</strong>
                                    </span>
      </b-form-group>
      <b-button type="submit" variant="primary" :disabled="isLoading">Submit</b-button>
    </b-form>
  </b-card>
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
