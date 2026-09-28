import { ValidatorFn, AbstractControl, ValidationErrors } from "@angular/forms";

export function passwordsIncorrectas(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (control.value === 'nada'){
            return {errorValidacion: 'Contraseña incorrecta'};
        }else{
            return null;
        }
    }
}