export interface ForgotPassword {
    mobileNumber: string;
    newpassword: string;
    confirmnewpassword: string
  }


  export interface ForgotPsd {
    loginId?: number | string;
    mobile?:number
    user?:number |string
  }
  
  export interface MobileVerify  {
    userOtp?:number
    mobile?:number
    user?:number |string
  }

  export interface ForgotOtpModel {
    message: string;
    isVerified: boolean;
  }