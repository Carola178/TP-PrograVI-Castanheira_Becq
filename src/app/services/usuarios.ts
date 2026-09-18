import { HttpClient } from '@angular/common/http';
import {inject, Service} from '@angular/core'

@Service()
export class User{
    http = inject(HttpClient);

    getUsuarios(){
        return this.http.get('https://jsonplaceholder.typicode.com/users');
        
    }
}
