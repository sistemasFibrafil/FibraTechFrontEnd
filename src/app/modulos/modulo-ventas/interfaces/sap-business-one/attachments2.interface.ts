export interface IAttachments2Query {
  absEntry?           : number;
  lines               : IAttachments2LinesQuery[];
}

export interface IAttachments2LinesQuery {
  absEntry?           : number;
  trgtPath            : string;
  fileName            : string;
  fileExt             : string;
  date?               : Date;
  file                : any,
  record?             : number,
}
