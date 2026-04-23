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
    u_FIB_Divi?: string;
    u_FIB_Sector?: string;
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
        this.u_FIB_Divi = '';
        this.u_FIB_Sector = '';
        this.addresses = [];
        this.contactEmployees = [];
    }
}
