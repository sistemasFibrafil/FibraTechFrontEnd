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
    e_MailL?: string; // Para compatibilidad con Get

    constructor() {
        this.name = '';
        this.firstName = '';
        this.lastName = '';
        this.e_MailL = '';
    }
}

export class SocioNegocioCreateModel {
  cardCode?                           : string;
  cardName?                           : string;
  cardType?                           : string;
  groupCode?                          : number;
  licTradNum?                         : string;
  currency?                           : string;

  u_BPP_BPTP?                         : string;
  u_BPP_BPTD?                         : string;
  u_FIB_Divi                          : string;
  u_FIB_Sector                        : string;

  phone1?                             : string;
  phone2?                             : string;
  cellular?                           : string;
  email?                              : string;
  validFor?                           : string;
  slpCode?                            : number;
  notes?                              : string;

  cntctPrsn?                          : string;
  contactEmployeesLines?              : ContactEmployeeModel[];

  address?                            : string;
  billToDef?                          : string;
  addressesLines?                     : AddressModel[];
  shipToDef?                          : string;
  mailAddres?                         : string;
  shipAddressLines?                   : AddressModel[];

  groupNum?                           : number;
  listNum?                            : number;
  creditLine?                         : number;
  debitLine?                          : number;

  u_BPP_BPAT?                         : string;
  u_FIB_EMAIL2?                       : string;
  u_FIB_EMAIL3?                       : string;
  u_BPP_BPNO?                         : string;
  u_BPP_BPAP?                         : string;
  u_BPP_BPAM?                         : string;

  constructor() {
      this.cardCode                 = '';
      this.cardName                 = '';
      this.cardType                 = '';
      this.groupCode                = 0;
      this.licTradNum               = '';
      this.currency                 = '';

      this.u_BPP_BPTP               = '';
      this.u_BPP_BPTD               = '';
      this.u_FIB_Divi               = '';
      this.u_FIB_Sector             = '';

      this.phone1                   = '';
      this.phone2                   = '';
      this.cellular                 = '';
      this.email                    = '';
      this.validFor                 = 'Y';
      this.slpCode                  = 0;
      this.notes                    = '';

      this.cntctPrsn                = '';
      this.contactEmployeesLines    = [];

      this.address                  = '';
      this.billToDef                = '';
      this.addressesLines           = [];
      this.shipToDef                = '';
      this.mailAddres               = '';
      this.shipAddressLines         = [];

      this.groupNum                 = 0;
      this.listNum                  = 0;
      this.creditLine               = 0;
      this.debitLine                = 0;

      this.u_BPP_BPAT               = '';
      this.u_FIB_EMAIL2             = '';
      this.u_FIB_EMAIL3             = '';
      this.u_BPP_BPNO               = '';
      this.u_BPP_BPAP               = '';
      this.u_BPP_BPAM               = '';

  }
}


export class SocioNegocioUpdateModel {
  cardCode?                           : string;
  cardName?                           : string;
  cardType?                           : string;
  groupCode?                          : number;
  licTradNum?                         : string;
  currency?                           : string;

  u_BPP_BPTP?                         : string;
  u_BPP_BPTD?                         : string;
  u_FIB_Divi                          : string;
  u_FIB_Sector                        : string;

  phone1?                             : string;
  phone2?                             : string;
  cellular?                           : string;
  email?                              : string;
  validFor?                           : string;
  slpCode?                            : number;
  notes?                              : string;

  cntctPrsn?                          : string;
  contactEmployeesLines?              : ContactEmployeeModel[];

  address?                            : string;
  billToDef?                          : string;
  addressesLines?                     : AddressModel[];
  shipToDef?                          : string;
  mailAddres?                         : string;
  shipAddressLines?                   : AddressModel[];

  groupNum?                           : number;
  listNum?                            : number;
  creditLine?                         : number;
  debitLine?                          : number;

  u_BPP_BPAT?                         : string;
  u_FIB_EMAIL2?                       : string;
  u_FIB_EMAIL3?                       : string;
  u_BPP_BPNO?                         : string;
  u_BPP_BPAP?                         : string;
  u_BPP_BPAM?                         : string;

  constructor() {
      this.cardCode                 = '';
      this.cardName                 = '';
      this.cardType                 = '';
      this.groupCode                = 0;
      this.licTradNum               = '';
      this.currency                 = '';

      this.u_BPP_BPTP               = '';
      this.u_BPP_BPTD               = '';
      this.u_FIB_Divi               = '';
      this.u_FIB_Sector             = '';

      this.phone1                   = '';
      this.phone2                   = '';
      this.cellular                 = '';
      this.email                    = '';
      this.validFor                 = 'Y';
      this.slpCode                  = 0;
      this.notes                    = '';

      this.cntctPrsn                = '';
      this.contactEmployeesLines    = [];

      this.address                  = '';
      this.billToDef                = '';
      this.addressesLines           = [];
      this.shipToDef                = '';
      this.mailAddres               = '';
      this.shipAddressLines         = [];

      this.groupNum                 = 0;
      this.listNum                  = 0;
      this.creditLine               = 0;
      this.debitLine                = 0;

      this.u_BPP_BPAT               = '';
      this.u_FIB_EMAIL2             = '';
      this.u_FIB_EMAIL3             = '';
      this.u_BPP_BPNO               = '';
      this.u_BPP_BPAP               = '';
      this.u_BPP_BPAM               = '';

  }
}
