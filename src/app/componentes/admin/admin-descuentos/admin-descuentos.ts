// import { Injectable } from '@angular/core';
// import { createClient, SupabaseClient } from '@supabase/supabase-js';
// import { Cupon, ConfiguracionPuntos } from '../../../models/cuponData';
// import { enviroment} from '../../../enviroments/enviroments';

// @Injectable({
//   providedIn: 'root'
// })
// export class AdminDescuentos {
//   private supabase: SupabaseClient;

//   constructor() {
//     this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
//   }

//   async getConfiguracion(): Promise<ConfiguracionPuntos | null> {
//     const { data, error } = await this.supabase
//       .from('configuracion')
//       .select('*')
//       .single();

//     if (error) {
//       console.error('Error al obtener configuración:', error);
//       return null;
//     }
//     return data;
//   }

//   async actualizarConfiguracion(config: ConfiguracionPuntos): Promise<boolean> {
//     const { error } = await this.supabase
//       .from('configuracion')
//       .update(config)
//       .eq('id', config.id || 1);

//     if (error) {
//       console.error('Error al actualizar configuración:', error);
//       return false;
//     }
//     return true;
//   }

//   async getCupones(): Promise<Cupon[]> {
//     const { data, error } = await this.supabase
//       .from('cupones')
//       .select('*')
//       .order('created_at', { ascending: false });

//     if (error) {
//       console.error('Error al traer cupones:', error);
//       return [];
//     }
//     return data || [];
//   }

//   async crearCupon(cupon: Cupon): Promise<boolean> {
//     const { error } = await this.supabase
//       .from('cupones')
//       .insert([cupon]);

//     if (error) {
//       console.error('Error al crear cupón:', error);
//       return false;
//     }
//     return true;
//   }

//   async toggleEstadoCupon(id: number, activo: boolean): Promise<boolean> {
//     const { error } = await this.supabase
//       .from('cupones')
//       .update({ activo })
//       .eq('id', id);

//     return !error;
//   }
// }