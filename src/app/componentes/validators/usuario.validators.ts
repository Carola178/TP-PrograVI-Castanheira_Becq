import { ValidatorFn, AbstractControl, ValidationErrors } from "@angular/forms";

export function passwordsIncorrectas(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (control.value === 'pepe'){
            return {errorValidacion: 'Contraseña incorrecta'};
        }else{
            return null;
        }
    }
}