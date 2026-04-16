export class ApprovalStatusReportFilterModel {
  pending                                   : boolean;
  authorized                                : boolean;
  rejected                                  : boolean;
  createdBy                                 : boolean;
  createdByResponsibleAuthorization         : boolean;
  canceled                                  : boolean;

  startAuthorOf?                            : number;
  endAuthorOf?                              : number;
  startAuthorizerOf?                        : number;
  endAuthorizerOf?                          : number;
  startDate?                                : Date | null;
  endDate?                                  : Date | null;
  startCardCode                             : string;
  endCardCode                               : string;

  quotations                                : boolean;
  orders                                    : boolean;

  constructor(){
    this.pending                            = false;
    this.authorized                         = false;
    this.rejected                           = false;
    this.createdBy                          = false;
    this.createdByResponsibleAuthorization  = false;
    this.canceled                           = false;

    this.startAuthorOf                      = null;
    this.endAuthorOf                        = null;
    this.startAuthorizerOf                  = null;
    this.endAuthorizerOf                    = null;
    this.startDate                          = null;
    this.endDate                            = null;
    this.startCardCode                      = '';
    this.endCardCode                        = '';

    this.quotations                         = false;
    this.orders                             = false;
  }
}
