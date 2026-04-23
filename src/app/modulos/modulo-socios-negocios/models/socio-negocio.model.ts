export class AddressModel {
    addressName?: string;
    address?: string; // Para compatibilidad con Get
    addressType?: string;
    adresType?: string; // Para compatibilidad con Get
    street?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    glblLocNum?: string;
    taxCode?: string;
    lineNum?: number;

    constructor() {
        this.addressName = '';
        this.address = '';
        this.addressType = 'B';
        this.adresType = 'B';
        this.street = '';
        this.city = '';
        this.county = '';
        this.state = null;
        this.country = 'PE';
        this.glblLocNum = '';
        this.taxCode = '';
    }
}

export class ContactEmployeeModel {
    name?: string;
    firstName?: string;
    lastName?: string;
    position?: string; // Nuevo
    phone1?: string; // Nuevo
    mobilePhone?: string; // Nuevo
    e_Mail?: string;
    e_MailL?: string; // Para compatibilidad con Get

    constructor() {
        this.name = '';
        this.firstName = '';
        this.lastName = '';
        this.e_Mail = '';
    }
}

export class SocioNegocioModel {
    cardCode?: string;
    cardName?: string;
    cardType?: string;
    groupCode?: number;
    groupName?: string;
    licTradNum?: string;
    phone1?: string;
    emailAddress?: string;
    currency?: string;
    cellular?: string; // Nuevo
    slpCode?: number; // Nuevo
    cntctCode?: number; // Nuevo
    cntctPrsn?: string; // Nuevo
    groupNum?: number; // Nuevo
    creditLine?: number; // Nuevo
    notes?: string; // Nuevo
    u_BPP_BPAT?: string;
    u_BPP_BPTD?: string;
    u_BPP_BPTP?: string;
    u_BPP_BPNO?: string; // First Name (Persona Natural)
    u_BPP_BPAP?: string; // Last Name 1 (Persona Natural)
    u_BPP_BPAM?: string; // Last Name 2 (Persona Natural)
    u_FIB_Email2?: string; // Email 2
    u_FIB_Email3?: string; // Email 3
    u_FIB_Transp?: string; // Transportista (Y/N)
    u_FIB_Creed?: string; // Creedor (Y/N)
    u_FIB_Divi?: string;
    u_FIB_Sector?: string;
    validFor?: string; // Activo/Inactivo (Y/N)
    priceListNum?: number;
    addresses?: AddressModel[];
    linesPayAddress?: AddressModel[]; // Para facturación (Get)
    linesShipAddress?: AddressModel[]; // Para envío (Get)
    contactEmployees?: ContactEmployeeModel[];
    contactList?: ContactEmployeeModel[]; // Para contactos (Get - algunos casos)

    constructor() {
        this.cardCode = '';
        this.cardName = '';
        this.cardType = '';
        this.groupCode = null;
        this.licTradNum = '';
        this.phone1 = '';
        this.emailAddress = '';
        this.currency = '';
        this.u_BPP_BPAT = '';
        this.u_BPP_BPTD = '';
        this.u_BPP_BPTP = '';
        this.u_BPP_BPNO = '';
        this.u_BPP_BPAP = '';
        this.u_BPP_BPAM = '';
        this.u_FIB_Email2 = '';
        this.u_FIB_Email3 = '';
        this.u_FIB_Transp = 'N';
        this.u_FIB_Creed = 'N';
        this.u_FIB_Divi = '';
        this.u_FIB_Sector = '';
        this.validFor = 'Y';
        this.priceListNum = null;
        this.addresses = [];
        this.contactEmployees = [];
    }
}
