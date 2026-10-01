export interface Butaca {
    fila: string;
    columna: number;
    esVip: boolean;
    esDiscapacidad?: boolean;
    tipo?: 'COMUN' | 'VIP' | 'DISCAPACIDAD';
    precio?: number;
    ocupada: boolean;
    seleccionada?: boolean;
}