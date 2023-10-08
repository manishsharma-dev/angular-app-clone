export interface CommonRes<T> {
  flg: boolean;
  data: T;
  msg: Msg;
}

export interface Msg {
  msgCode: number;
  msgDesc: string;
}
