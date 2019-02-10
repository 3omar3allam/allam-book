import {AbstractControl} from '@angular/forms'

export function whiteSpaceValidator(control: AbstractControl){
  if(!control.value || !control.value.trim() || control.value.trim() == ""){
    return {invalid: true};
  }
  else return null;
}
