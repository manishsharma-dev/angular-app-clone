export interface UserManual {
  videoList: List[];
  pdfList: List[];
}

export interface List {
  title: string;
  manualUrl: string;
}
