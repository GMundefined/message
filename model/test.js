const db = require('./index');

// console.log(db);

const Message = db.Message;

// 删
db.del(Message,"5f2135a16c73e61500d24092",function(err,res){
  console.log(err)
  console.log(res)
})


// 查
// 1. 2参数
// db.find("model","function")
// 2. 3参数
// db.find("model",{name:"a"},"function")
// db.find("model",{page:2},"function")
// 3 4参数
// db.find("model",{name:"a"},{size:6},"function")

// 改
// var filter = {
//   username:"张三"
// }
// var data = {
//   message: "啊哈哈哈哈哈"
// }
// db.modify(Message,filter,data,function(err,res){
//   console.log(err)
//   console.log(res)
// })



// 增
// var data = {
//   username: "张三",
//   message: "我叫张三",
//   date: "2020-01-01 12:12:12"
// }
// db.add(Message,data,function(err){
//   console.log(err)
// })
