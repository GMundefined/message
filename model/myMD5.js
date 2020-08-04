//封装加密模块
const crypto=require('crypto')
/**
 * @method 对字符串进行加密
 * @param {String} str 加密的明文
 * @returns {String} pass 返回的密文
 */
exports.encrpyt=function(str){
  //第一次加密
  var pass=crypto.createHash('md5').update(str).digest('base64');
  //第一次对加密得到的密文做处理
  pass=pass.substring(0,18)+pass.substring(6,12);
  pass='jiami,'+pass+',jiami'
  return crypto.createHash('md5').update(pass).digest('base64')
}