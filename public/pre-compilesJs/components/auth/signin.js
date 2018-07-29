Vue.component('signin', {
  template: `<div>
<b-card title="SignIn"
          style="max-width: 20rem;"
          class="mb-3">
          <b-alert variant="success" :show="formResponse.success" v-html="formResponse.message"></b-alert>
    <b-form @submit.prevent="onSubmit" v-if="showForm">
   
    <b-alert :show="dismissCountDown"
             dismissible
             variant="warning"
             @dismissed="dismissCountDown=0"
             @dismiss-count-down="countDownChanged" v-html="formResponse.message">
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
      <b-form-group id="password"
                    label="Password:"
                    label-for="password">
        <b-form-input id="password"
                      type="password"
                      v-model="formData.password"
                      
                      placeholder="Enter password"
                      :class="{'is-invalid': formErrors.password }">
        </b-form-input>
        <span class="invalid-feedback" v-if="formErrors.password">
                                        <strong>{{ formErrors.password }}</strong>
                                    </span>
      </b-form-group>
      <b-button type="submit" variant="primary" :disabled="isLoading">Submit</b-button>
    </b-form>
  </b-card>
    </div>`,
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
