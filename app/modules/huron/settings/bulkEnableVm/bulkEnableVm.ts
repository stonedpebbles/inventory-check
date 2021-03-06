export class BulkEnableVmError {
  private userId: string | null;
  private errorStatus: number | undefined;
  private statusText: string | null | undefined;
  public trackingID: string | null | undefined;
  constructor(userId: string,
              errorStatus: number ,
              statusText: string | null,
              trackingID: string | null,
  ) {
    this.userId =  userId;
    this.errorStatus = errorStatus;
    this.statusText = statusText;
    this.trackingID = trackingID;
  }
}

export class UsersInfo {
  public uuid: string ;
  public userName: string;
  public voicemailEnabled: boolean;
  constructor(uuid: string,
              userName: string ,
              voicemailEnabled: boolean,
  ) {
    this.uuid =  uuid ;
    this.userName = userName;
    this.voicemailEnabled = voicemailEnabled;
  }
}
