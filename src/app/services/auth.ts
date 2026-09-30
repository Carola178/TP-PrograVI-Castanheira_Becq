import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { enviroment } from '../enviroments/enviroments';
import { Router } from '@angular/router';


@Injectable({
    providedIn: 'root'
    })
    export class Auth {
    public supabase: SupabaseClient;

    constructor(private router: Router) {
        this.supabase = createClient(enviroment.supabaseUrl, enviroment.supabasePublishableKey);
    }

    signIn(email: string, password: string) {
        return this.supabase.auth.signInWithPassword({ email, password });
    }

    signUp(
        nombre: string,
        apellido: string,
        email: string,
        fechaNacimiento: string,
        tipoSangre: string,
        colorOjos: string,
        diasVacaciones: number,
        password: string,
        rol: string = 'cliente' 
    ) {
        return this.supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
            nombre,
            apellido,
            fechaNacimiento,
            tipoSangre,
            colorOjos,
            diasVacaciones,
            rol 
            }
        }
        });
    }

    async registrarEventoSesion(authId: string, email: string, evento: 'LOGIN' | 'LOGOUT') {
    const { error } = await this.supabase
        .from('historialSesiones')
        .insert([
        {
            authId: authId,
            email: email,
            evento: evento
        }
        ]);
    if (error) {
        console.error(`Error al registrar ${evento}:`, error);
    }
}

    async signOut(): Promise<void> {
    const usuario = await this.getUsuarioActual();

    if (usuario) {
        await this.registrarEventoSesion(usuario.id, usuario.email || '', 'LOGOUT');
    }    const { error } = await this.supabase.auth.signOut();
    if (error) {
        console.error('Error al cerrar sesión:', error.message);
    } else {
        this.router.navigate(['/login']);
    }
}

    async getUsuarioActual() {
        const { data: { user }, error: authError } = await this.supabase.auth.getUser();
        if (authError || !user) {
            return null;
        }
        const { data: profile, error: profileError } = await this.supabase
            .from('Usuarios')
            .select('*')
            .eq('auth_id', user.id) 
            .maybeSingle();
        if (profileError) {
            console.error('Error al obtener el perfil:', profileError);
        }
        const fecha = profile ? (profile['fechaNacimiento'] || profile['FechaNacimiento'] || profile['fecha_nacimiento']) : null;
        return {
            ...user,
            fechaNacimiento: fecha
        };
    }
    
    async esAdmin(): Promise<boolean> {
    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) {
        console.log('No hay usuario autenticado en Supabase Auth');
        return false;
    }

    console.log('Usuario autenticado ID:', user.id);

    const { data: usuarioDB, error } = await this.supabase
        .from('Usuarios')
        .select('*')
        .eq('auth_id', user.id)
        .single();

    if (error) {
        console.error('Error al consultar la tabla Usuarios:', error);
        return false;
    }

    console.log('Datos traídos de la BD:', usuarioDB);
    return usuarioDB?.rol === 'admin';
    }
}