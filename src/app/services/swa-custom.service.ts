import swal from 'sweetalert2';
import { Injectable } from '@angular/core';
import { GlobalsConstantsForm } from '../constants/globals-constants-form';

@Injectable({
  providedIn: 'root'
})
export class SwaCustomService {

  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  constructor() { }

  swaConfirmation(title: string, text: string, icon: any) {
    return swal.fire({
      title: title,
      html: text,
      icon: icon,
      showConfirmButton: true,
      confirmButtonText: this.globalConstants.confirmButtonText,
      confirmButtonColor: '#3085d6',
      showCancelButton: true,
      cancelButtonText: this.globalConstants.cancelButtonText,
      cancelButtonColor: '#d33000',
    });
  }

  swaMixinConfirmation(title: string, text: string, icon: any, dom: string) {

    let swalWithBootstrapButtons = swal.mixin({
      customClass: {
        container: 'my-swal',
      },
      target: document.getElementById(dom)
    });

    return swalWithBootstrapButtons.fire({
      title: title,
      html: text,
      icon: icon,
      showConfirmButton: true,
      confirmButtonText: this.globalConstants.confirmButtonText,
      confirmButtonColor: '#3085d6',
      showCancelButton: true,
      cancelButtonText: this.globalConstants.cancelButtonText,
      cancelButtonColor: '#d33000',
    });
  }

  swaMsgExito(msgExitoDetail: string){
    return swal.fire(
      this.globalConstants.msgExitoSummary,
      msgExitoDetail === null || msgExitoDetail === undefined || msgExitoDetail === '' ? this.globalConstants.msgExitoDetail :  msgExitoDetail,
      this.globalConstants.icoSwalSuccess
    );
  }

  swaMixinMsgExito(msgExitoDetail: string, dom: string){
    let swalWithBootstrapButtons = swal.mixin({
      customClass: {
        container: 'my-swal'
      },
      target: document.getElementById(dom)
    });

    return swalWithBootstrapButtons.fire(
      this.globalConstants.msgExitoSummary,
      msgExitoDetail === null || msgExitoDetail === undefined || msgExitoDetail === '' ? this.globalConstants.msgExitoDetail :  msgExitoDetail,
      this.globalConstants.icoSwalSuccess
    );
  }

  swaMsgInfo(msgInfoDetail: string){
    return swal.fire(
      this.globalConstants.msgInfoSummary,
      msgInfoDetail === null || msgInfoDetail === undefined || msgInfoDetail === '' ? this.globalConstants.msgInfoDetail :  msgInfoDetail,
      this.globalConstants.icoSwalInfo
    );
  }

  swaMixinMsgInfo(msgInfoDetail: string, dom: string){
    let swalWithBootstrapButtons = swal.mixin({
      customClass: {
        container: 'my-swal'
      },
      target: document.getElementById(dom)
    });

    return swalWithBootstrapButtons.fire(
      this.globalConstants.msgInfoSummary,
      msgInfoDetail === null || msgInfoDetail === undefined || msgInfoDetail === '' ? this.globalConstants.msgInfoDetail :  msgInfoDetail,
      this.globalConstants.icoSwalInfo
    );
  }

  swaMsgWarning(msgWarningDetail: string){
    return swal.fire(
      this.globalConstants.msgInfoSummary,
      msgWarningDetail === null || msgWarningDetail === undefined || msgWarningDetail === '' ? this.globalConstants.msgInfoDetail :  msgWarningDetail,
      this.globalConstants.icoSwalWarning
    );
  }

  swaMixinMsgWarning(msgWarningDetail: string, dom: string){

    let swalWithBootstrapButtons = swal.mixin({
      customClass: {
        container: 'my-swal'
      },
      target: document.getElementById(dom)
    });

    return swalWithBootstrapButtons.fire(
      this.globalConstants.msgInfoSummary,
      msgWarningDetail === null || msgWarningDetail === undefined || msgWarningDetail === '' ? this.globalConstants.msgInfoDetail :  msgWarningDetail,
      this.globalConstants.icoSwalWarning
    );
  }

  swaMsgError(msgErrorDetail: string){
    return swal.fire(
      this.globalConstants.msgErrorSummary,
      msgErrorDetail,
      this.globalConstants.icoSwalError
    );
  }

  swaMixinMsgError(msgErrorDetail: string, dom: string){
    let swalWithBootstrapButtons = swal.mixin({
      customClass: {
        container: 'my-swal'
      },
      target: document.getElementById(dom)
    });

    return swalWithBootstrapButtons.fire(
      this.globalConstants.msgErrorSummary,
      msgErrorDetail,
      this.globalConstants.icoSwalError
    );
  }

  swaShowLoading(){
    return swal.showLoading();
  }

  swaHideLoading(){
    return swal.hideLoading();
  }

  swaClose(){
    swal.close();
  }
}
