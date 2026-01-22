import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';
import { LoginRoutingModule } from './modulo-login-routing.module';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
    declarations: [LoginComponent],
    imports: [ CommonModule, LoginRoutingModule, ReactiveFormsModule, PasswordModule, InputTextModule, CheckboxModule, ButtonModule, ToastModule, MessagesModule, MessageModule, DropdownModule],
    exports: [],
    providers: [MessageService],
})
export class LoginModule {}