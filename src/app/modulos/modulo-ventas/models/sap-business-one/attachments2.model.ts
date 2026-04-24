export class Attachments2CreateModel {
  absEntry                    : number;
  lines                       : Attachments2LinesCreateModel[]

  constructor(){
    this.absEntry             = 0;
    this.lines                = [];
  }
}


export class Attachments2LinesCreateModel {
  trgtPath                    : string;
  fileName                    : string;
  fileExt                     : string;
  date                        : Date;

  constructor(){
    this.trgtPath             = '';
    this.fileName             = '';
    this.fileExt              = '';
    this.date                 = null;
  }
}



export class Attachments2UpdateModel {
  absEntry                    : number;
  lines                       : Attachments2LinesUpdateModel[]

  constructor(){
    this.absEntry             = 0;
    this.lines                = [];
  }
}


export class Attachments2LinesUpdateModel {
  absEntry                    : number;
  trgtPath                    : string;
  fileName                    : string;
  fileExt                     : string;
  date                        : Date;
  record?                     : number;

  constructor(){
    this.absEntry             = 0;
    this.trgtPath             = '';
    this.fileName             = '';
    this.fileExt              = '';
    this.date                 = null;
    this.record               = 0;
  }
}
