import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export function validarFechaNacimiento(): ValidatorFn {

  return (control: AbstractControl): ValidationErrors | null => {

    const valor = control.value;

    if (!valor) return null;

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
      return { fechaInvalida: true };
    }

    const [dia, mes, anio] = valor.split('/').map(Number);

    if (anio < 1900) {
      return { fechaInvalida: true };
    }

    const fecha = new Date(anio, mes - 1, dia);

    const esValida =
      fecha.getFullYear() === anio &&
      fecha.getMonth() === mes - 1 &&
      fecha.getDate() === dia;

    if (!esValida) {
      return { fechaInvalida: true };
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fecha > hoy) {
      return { fechaFutura: true };
    }

    return null;
  };
}
