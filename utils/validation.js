class FormValidation {
  emailValidation(email){
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email));
  }
  //login fields validation
  validateLogin(valObj, callback){
    let errors = {};
    let hasErrors = false;

    let fields = valObj.fields;

    if(!fields.email.val || fields.email.val.trim() === ''){
      hasErrors = true;
      errors.email = fields.email.message
    }

    if(!fields.password.val || fields.password.val.trim() === ''){
      hasErrors = true;
      errors.password = fields.password.message
    }

    if(fields.email.val && fields.email.val.trim() !== ''){
      if(!this.emailValidation(fields.email.val.trim())){
        hasErrors = true;
        errors.email = 'Please enter a valid email address.'
      }
    }

    callback(hasErrors && errors)
  }

  validateSignup(valObj, callback){
    let errors = {};
    let hasErrors = false;

    let fields = valObj.fields;

    if(!fields.email.val || fields.email.val.trim() === ''){
      hasErrors = true;
      errors.email = fields.email.message
    }

    if(!fields.password.val || fields.password.val.trim() === ''){
      hasErrors = true;
      errors.password = fields.password.message
    }

    if(fields.email.val && fields.email.val.trim() !== ''){
      if(!this.emailValidation(fields.email.val.trim())){
        hasErrors = true;
        errors.email = 'Please enter a valid email address.'
      }
    }

    if(!fields.name.val || fields.name.val.trim() === ''){
      hasErrors = true;
      errors.name = fields.name.message
    }

    if(!fields.firstName.val || fields.firstName.val.trim() === ''){
      hasErrors = true;
      errors.firstName = fields.firstName.message
    }

    if(!fields.lastName.val || fields.lastName.val.trim() === ''){
      hasErrors = true;
      errors.lastName = fields.lastName.message
    }

    if(!fields.country.val || fields.country.val.trim() === ''){
      hasErrors = true;
      errors.country = fields.country.message
    }

    if(!fields.bitcoinAddress.val || fields.bitcoinAddress.val.trim() === ''){
      hasErrors = true;
      errors.bitcoinAddress = fields.bitcoinAddress.message
    }

    callback(hasErrors && errors)
  }

  validateLostPassword(valObj, callback){
    let errors = {};
    let hasErrors = false;

    let fields = valObj.fields;

    if(!fields.email.val || fields.email.val.trim() === ''){
      hasErrors = true;
      errors.email = fields.email.message
    }

    if(fields.email.val && fields.email.val.trim() !== ''){
      if(!this.emailValidation(fields.email.val.trim())){
        hasErrors = true;
        errors.email = 'Please enter a valid email address.'
      }
    }

    callback(hasErrors && errors)
  }

  validateResetPassword(valObj, callback){
    let errors = {};
    let hasErrors = false;

    let fields = valObj.fields;

    if(!fields.password.val || fields.password.val.trim() === ''){
      errors.email = fields.password.message
      hasErrors = true;
    }

    if ((!fields.confirmPassword.val || fields.confirmPassword.val.trim() === '') || fields.password.val !== fields.confirmPassword.val) {
      errors.password = 'Password and retyped password don\'t match';
      errors.password = 'Password and retyped password don\'t match';
      hasErrors = true;
    }

    callback(hasErrors && errors)
  }
}

module.exports = {
  validateForm: new FormValidation()
};
