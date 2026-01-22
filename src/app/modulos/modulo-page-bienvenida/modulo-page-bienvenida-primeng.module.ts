import { NgModule } from '@angular/core';

// Module PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import {InputNumberModule} from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { FieldsetModule } from 'primeng/fieldset';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { TreeModule } from 'primeng/tree';
import { PickListModule } from 'primeng/picklist';
import { FileUploadModule } from 'primeng/fileupload';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CalendarModule } from 'primeng/calendar';
import { MessageModule } from 'primeng/message';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChartModule} from 'primeng/chart';
import { DialogModule } from 'primeng/dialog';


import { SelectButtonModule } from 'primeng/selectbutton';
import { MessagesModule } from 'primeng/messages';
import { InputMaskModule } from 'primeng/inputmask';
import { TabViewModule} from 'primeng/tabview';
import { StepsModule } from 'primeng/steps';
import { MultiSelectModule} from 'primeng/multiselect';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { MenubarModule} from 'primeng/menubar';


@NgModule({
    declarations: [],
    exports: [ InputTextModule,
            SelectButtonModule,
            MessagesModule,
            InputMaskModule,
            TabViewModule,
            StepsModule,
            MultiSelectModule,
            MenubarModule,


            InputNumberModule,
            ButtonModule,
            ToastModule,
            TableModule,
            ConfirmDialogModule,
            PanelModule,
            InputTextareaModule,
            InputSwitchModule,
            CheckboxModule,
            FieldsetModule,
            PasswordModule,
            DropdownModule,
            TreeModule,
            PickListModule,
            FileUploadModule,
            ToggleButtonModule,
            MessageModule,
            RadioButtonModule,
            CalendarModule,
            ProgressBarModule,
            ChartModule,
            DialogModule],
            providers: [MessageService, ConfirmationService],
})
export class PageBienvenidaPrimeNgModule {}
