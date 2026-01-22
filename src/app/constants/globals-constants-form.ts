export class GlobalsConstantsForm {
    // Variables Etiquetas
    cEditar: string;
    cBuscar: string;
    cRefrecar: string;
    cConsultar: string;
    cNuevo: string;
    cLiberar: string;
    cEliminar: string;
    cLimpiar: string;
    cGrabar: string;
    cCancelar: string;
    cRegresar: string;
    cVisualizar: string;
    cListar: string;
    cImprimir: string;
    cArchivo: string;
    cExportar: string;
    cExpExcel: string;
    cImpExcel: string;
    cImprimirComprobante: string;
    cImprimirVencimiento: string;
    cPdfElectronico: string;
    cCaja: string;
    cOpciones: string;
    cGenerico: string;
    cSimulacion: string;
    cAgregar: string;
    cAceptar: string;
    cCheck: string;
    cPedido: string;
    cReceta: string;
    cProcesar: string;
    cSalir: string;
    cAlternatico: string;
    cCopiar: string;
    cCerrar: string;
    cAnular: string;
    cFiltro: string;
    cDelivery: string;
    cHojaDatos: string;
    cToastPosition: string;
    cSalaOperacion: string;
    cCamposObligatorios: string;
    cDuplicar: string;
    cRechazar: string;
    cAprobar: string;
    cEnviar: string;
    cPDF: string;
    cEXCEL: string;
    // Modulos
    cModuloRequerimiento: string;

    // Style
    cStyleButtonPrimary: string
    cStyleButtonSecondary: string
    cStyleButtonSuccess: string
    cStyleButtonDanger: string;
    cStyleButtonInfo: string;
    cStyleButtonWarning: string;
    cStyleButtonHelp: string;
    cStyleTableGridLines: string;

    // Table
    currentPageReportTemplate: string;
    currentTableEmptyMessage: string;

    // Variables de Etiquetas para la Firma Digital
    cFirmaUsuario: string;


    // Variables Iconos
    icoEditar: string;
    icoNuevo: string;
    icoLiberar: string;
    icoBuscar: string;
    icoView: string;
    icoAnular: string;
    icoConsultar: string;
    icoGrabar: string;
    icoEliminar: string;
    icoLimpiar: string;
    icoCancelar: string;
    icoCerrar: string;
    icoCopiar: string;
    icoRegresar: string;
    icoPDF: string;
    icoCerrado: string;
    icoAbierto: string;
    icoGuiar: string;
    icoVizualizar: string;
    icoFirmaUsuario: string;
    icoListar: string;
    icoImprimir: string;
    icoArchivo: string;
    icoExcel: string;
    icoExpExcel: string;
    icoImpFile: string;
    icoImpExcel: string;
    icoCaja: string;
    icoGanancia: string;
    icoGenerico: string;
    icoSimulacion: string;
    icoAgregar: string;
    icoAceptar: string;
    icoCheck: string;
    icoPedido: string;
    icoProcesar: string;
    icoPlus: string;
    icoMinus: string;
    icoSalir: string;
    icoFiltro: string;
    icoDelivery: string;
    icoFilterClear: string;
    icoDuplicar: string;
    icoEmail: string;
    icoDataBase: string;
    icoUser: string;
    icoEnviar: string;

    // Icon SWAL
    icoSwalSuccess: any;
    icoSwalError: any;
    icoSwalWarning: any;
    icoSwalInfo: any;
    icoSwalQuestion: any;

    // Label Confirmacion
    confirmButtonText: string;
    cancelButtonText: string;

    // Variables titulos
    titleEliminar: string;
    subTitleEliminar: string;

    titleActualizarDeAlmacen: string;
    subTitleActualizarDeAlmacen: string;

    titleActualizarAAlmacen: string;
    subTitleActualizarAAlmacen: string;

    titleAddItemNotPicking: string;
    subTitleAddItemNotPicking: string;

    titleCerrar: string;
    subTitleCerrar: string;

    titleAnular: string;
    subTitleAnular: string;

    titleCierre: string;
    subTitleCierre: string;

    titleGrabar: string;
    subTitleGrabar: string;

    titleLiberar: string;
    subTitleLiberar: string;

    titleConfirmar: string;
    subTitleConfirmar: string;

    // Variables mensaje
    msgExitoSummary: string;
    msgExitoDetail: string;

    msgErrorSummary: string;

    msgCancelDetail: string;
    msgCancelSummary: string;

    msgInfoDetail: string;
    msgInfoSummary: string;

    // Variables size Page
    sizePage: number;
    sizePageModal: number;

    constructor() {
        // Etiqueta de Controles
        this.cNuevo = 'Nuevo';
        this.cLiberar = 'Liberar';
        this.cCaja = 'Caja';
        this.cBuscar = 'Buscar';

        this.cRefrecar = 'Refrescar';
        this.cConsultar = 'Consultar';
        this.cGrabar = 'Grabar';
        this.cCancelar = 'Cancelar';
        this.cEliminar = 'Eliminar';
        this.cLimpiar = 'Limpiar'
        this.cRegresar = 'Atrás';
        this.cVisualizar = 'Visualizar';
        this.cListar = 'Listar';
        this.cFirmaUsuario = 'Firma Paciente';
        this.cImprimir = 'Imprimir';
        this.cArchivo = 'Archivo';
        this.cExportar = 'Exportar';
        this.cExpExcel = 'Exportar';
        this.cImpExcel = 'Importar';
        this.cImprimirComprobante = 'Imp.Comprobante';
        this.cImprimirVencimiento = 'Imp.Vencimiento';
        this.cPdfElectronico = 'PDF Electronico';
        this.cOpciones = 'Opciones';
        this.cGenerico = 'Ver Genérico';
        this.cSimulacion = 'Simulación Venta';
        this.cAgregar = 'Agregar';
        this.cAceptar = 'Aceptar';
        this.cCheck = 'Check';
        this.cPedido = 'Pedido';
        this.cProcesar = 'Procesar';
        this.cSalir = 'Salir';
        this.cAlternatico = 'Ver Alternativo';
        this.cReceta = 'Receta';
        this.cCopiar = 'Copiar';
        this.cCerrar = 'Cerrar';
        this.cAnular = 'Anular';
        this.cFiltro = 'Limpiar';
        this.cDelivery = 'Vale Delivery';
        this.cEditar = 'Editar';
        this.cToastPosition = 'bottom-right';
        this.cHojaDatos = 'Hoja de Datos';
        this.cSalaOperacion = 'SOP';
        this.cCamposObligatorios = 'Campos Obligatorios (*)';
        this.cDuplicar = 'Duplicar';
        this.cRechazar = 'Rechazar';
        this.cAprobar = 'Aprobar';
        this.cEnviar = 'Enviar'
        this.cPDF = 'PDF';
        this.cEXCEL = 'Excel';
        // Módulos
        this.cModuloRequerimiento = 'Gestión Requerimiento';

        // style
        this.cStyleButtonPrimary = 'p-button-primary'
        this.cStyleButtonSecondary = 'p-button-secondary'
        this.cStyleButtonSuccess = 'p-button-success'
        this.cStyleButtonDanger = 'p-button-danger';
        this.cStyleButtonInfo = 'p-button-info';
        this.cStyleButtonWarning = 'p-button-warning';
        this.cStyleButtonHelp = 'p-button-help';
        this.cStyleTableGridLines = 'p-datatable-gridlines';
        // Table
        this.currentPageReportTemplate = 'Mostrando {first} a {last} de {totalRecords} registros';
        this.currentTableEmptyMessage = 'No se encontraron registros.';

        // Iconos
        this.icoEditar = 'pi pi-pencil';
        this.icoNuevo = 'pi pi-plus';
        this.icoLiberar = 'pi pi-eject';
        this.icoCaja = 'fa fa-credit-card';
        this.icoBuscar = 'pi pi-search';
        this.icoView = 'fa fa-eye';
        this.icoConsultar = 'pi pi-list';
        this.icoGrabar = 'pi pi-save';
        this.icoEliminar = 'pi pi-trash';
        this.icoLimpiar = 'pi pi-trash'
        this.icoAnular = 'pi pi-trash';
        this.icoCancelar = 'pi pi-times';
        this.icoCopiar = 'pi pi-copy';
        this.icoCerrar = 'pi pi-times';
        this.icoRegresar = 'pi pi-sign-out';
        this.icoFirmaUsuario = 'fa fa-user-circle-o'
        this.icoPDF = 'pi pi-file-pdf';
        this.icoCerrado = 'fa fa-lock';
        this.icoAbierto = 'fa fa-unlock';
        this.icoGuiar = 'pi pi-shopping-cart';
        this.icoVizualizar = 'pi pi-eye';
        this.icoListar = 'fa fa-list';
        this.icoImprimir = 'pi pi-print';
        this.icoArchivo = 'pi pi-file';
        this.icoExcel = 'pi pi-file-excel'
        this.icoExpExcel = 'pi pi-file-export'
        this.icoImpExcel = 'pi pi-upload'
        this.icoImpFile = 'pi pi-file-import'
        this.icoGanancia = 'fa fa-money';
        this.icoGenerico = 'fa fa-medkit';
        this.icoSimulacion = 'fa fa-shopping-basket';
        this.icoAgregar = 'pi pi-plus';
        this.icoAceptar = 'pi pi-check';
        this.icoCheck = 'fa fa-check';
        this.icoPedido = 'fa fa-list-ul';
        this.icoProcesar = 'pi pi-cog';
        this.icoPlus = 'fa fa-plus';
        this.icoMinus = 'fa fa-minus';
        this.icoSalir = 'pi pi-power-off';
        this.icoFiltro = 'fa fa-filter';
        this.icoDelivery = 'fa fa-medkit';
        this.icoFilterClear = 'pi pi-filter-slash';
        this.icoDuplicar = 'pi pi-copy';
        this.icoEmail = 'pi pi-envelope';
        this.icoDataBase = 'pi pi-database';
        this.icoUser = 'pi pi-user'
        this.icoEnviar = 'pi pi-send'

        // Icon Swal
        this.icoSwalSuccess = 'success';
        this.icoSwalError = 'error';
        this.icoSwalWarning = 'warning';
        this.icoSwalInfo = 'info';
        this.icoSwalQuestion = 'question';

        // Label Confirmacion
        this.confirmButtonText = 'SI';
        this.cancelButtonText = 'NO';

        // Titulo
        this.titleEliminar = 'Confirmación de eliminación';
        this.subTitleEliminar = '¿Seguro de eliminar el registro seleccionado?';

        this.titleActualizarDeAlmacen = 'Confirmación de actualización';
        this.subTitleActualizarDeAlmacen = '¿Desea actualizar el valor de <b>De almacén"</b> en las líneas existentes?';

        this.titleActualizarAAlmacen = 'Confirmación de actualización';
        this.subTitleActualizarAAlmacen = '¿Desea actualizar el valor de <b>Almacén destino"</b> en las líneas existentes?';

        this.titleAddItemNotPicking = 'Confirmación para agregar ítem';
        this.subTitleAddItemNotPicking = '¿Seguro de agregar ítem fuera de picking?';

        this.titleCerrar = 'Confirmación de cerrar';
        this.subTitleCerrar = '¿Seguro de cerrar el registro seleccionado?';

        this.titleAnular = 'Confirmación de anulación';
        this.subTitleAnular = '¿Seguro de anular el registro seleccionado?';

        this.titleCierre = 'Confirmación de cierre';
        this.subTitleCierre = '¿Seguro de cerrar el registro seleccionado?';

        this.titleGrabar = 'Confirmación de grabar';
        this.subTitleGrabar = '¿Seguro de grabar?';
        
        this.titleLiberar = 'Confirmación de liberación';
        this.subTitleLiberar = '¿Seguro de liberar?';

        this.titleConfirmar = 'Confirmacion de registro';
        this.subTitleConfirmar = '¿Seguro de confirmar VALE DE SALIDA, una vez confirmado no se podra anular?';

        // Msg Prime Ng
        this.msgExitoSummary = 'Mensaje de éxito : ';
        this.msgExitoDetail = 'Se realizo correctamente...!!!';

        this.msgErrorSummary = 'Mensaje de error';

        this.msgCancelSummary = 'Mensaje de cancelación : ';
        this.msgCancelDetail = 'Se cancelo la accion con éxito...!!!';

        this.msgInfoSummary = 'Mensaje de información : ';
        this.msgInfoDetail = 'Se informo con éxito...!!!';

        // Numero de Filas
        this.sizePage = 10;
        this.sizePageModal = 10;
    }
}
