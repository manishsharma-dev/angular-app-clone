export  function  getFileSize(data:{size:number,type:string}){
    var fileSize = Math.round((data.size / 1024));
    if (fileSize <= 5*1024) {
      return true;
  } 
  return false;

}