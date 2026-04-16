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
  file                        : any

  constructor(){
    this.trgtPath             = '';
    this.fileName             = '';
    this.fileExt              = '';
    this.date                 = null;
    this.file                 = ''
  }
}
