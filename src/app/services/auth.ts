import { Service } from "@angular/core";
import { createClient, SupabaseClient } from "@supabase/supabase-js/dist/index.cjs";
import { enviroment } from '../enviroments/enviroments';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class Auth {
    public supabase: SupabaseClient;

    constructor(){
        this.supabase = createClient(enviroment.supabaseUrl, enviroment.supabasePublishableKey)
    }

    signIn(email: string, password: string){
        return this.supabase.auth.signInWithPassword({email, password});

    }
    signUp(nombre: string, apellido: string, email: string, fechaNacimiento: String, tipoSangre: string, colorOjos: string, diasVacaciones: number, password: string) {
    return this.supabase.auth.signUp({email, password,
        options: {
            data: {nombre, apellido, fechaNacimiento, tipoSangre, colorOjos, diasVacaciones}}});
            }
    signOut(){
        return this.supabase.auth.signOut();
    }
    getUser(){
        return this.supabase.auth.getUser();
    }
    getUsers(){
        return this.supabase.auth.admin.listUsers();
    }
}