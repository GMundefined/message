// 创建message对应的Model对象
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const msgSchema = new Schema({
  username: String,
  message: String,
  date: String
},{
  collection: "message" // 指定集合名称
});
const userSchema=new Schema({
  username:String,
  nickname:String,
  password:String,
  avatar:{type:String,default:'/imgs/avatar.jpg'}
})

module.exports = {
  Message: mongoose.model('msg',msgSchema),
  User:mongoose.model('user',userSchema)
}

