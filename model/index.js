// 负责连接数据库并对数据库进行增删改查的操作
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const url = "mongodb://localhost:27017/web"

const opt = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};
// 连接数据库
mongoose.connect(url,opt);


/**
 * 增
 * @param {*} model 保存的集合
 * @param {JSON} data 保存的数据
 * @param {Function} callback 回调函数
 */
function add(model,data,callback){
  var o = new model(data)
  o.save(function(err){
    callback(err);
  })
}

/**
 * 删除
 * @param {*} model 被删除数据的集合model
 * @param {JSON|String} filter 删除的条件,如果是string类型，则为ObjectId的字符串
 * @param {Function} callback 回调函数
 */
function del(model,filter,callback){
  if(typeof filter=="string"){
    // 将字符串转换为ObjectId类型
    filter = {_id: ObjectId(filter)};
  }
  model.deleteOne(filter,function(err,res){
    callback(err,res)
  })
}

/**
 * @param {*} model 修改的集合
 * @param {JSON|String} filter 修改的条件
 * @param {JSON} data 修改的数据
 * @param {Function} callback 回调
 */
function modify(model,filter,data,callback){
  if(typeof filter == 'string'){
    filter = {_id: ObjectId(filter)}
  }
  model.updateOne(filter,{$set:data},function(err,res){
    callback(err,res)
  })
}

/**
 * 
 * @param {*} model 查询的集合
 * @param {JSON} [filter] 查询的条件
 * @param {JSON} [opt] 查询选项
 * @param {Number} [opt.size] 每页显示的条数
 * @param {Number} [opt.page] 显示的第几页
 * @param {JSON} [opt.sort] 排序的依据
 * @param {Function} callback 回调
 */
function find(model,filter,opt,callback){
  if(arguments.length==2){
    callback = filter;
    filter = {};
    opt = {
      size: 50,
      page: 1,
      sort: {date: 1}
    }
  }
  if(arguments.length==3){
    callback = opt;
    // 判断第二个参数中的属性情况
    if(filter.hasOwnProperty("size") ||
       filter.hasOwnProperty("page") ||
       filter.hasOwnProperty("sort")){
      // 只要包含这三个参数中的任意一个或多个
      // 就说filter是选项，而不是条件
       opt = filter;
      //  重置filter
      filter = {}
    }else{
      // filter是条件，重置opt
      opt = {
        size: 50,
        page: 1,
        sort: {date: 1}
      }
    }
  }
  // 防止opt的属性不全(传参时只传了其中的一个或多个)
  var options = {}
  // 初始化opt中的值，如果有传入的值则使用传入的值，没有则使用默认值
  opt.size = opt.size || 50;
  opt.page = opt.page || 1;
  opt.sort = opt.sort || {date: 1};
  // 设置查询选项
  options.sort = opt.sort;
  options.limit = opt.size;
  options.skip = (opt.page-1)*opt.size;
  
  // 查询
  model.find(filter,null,options,function(err,docs){
    callback(err,docs);
  })
}

/**
 * 统计所有数据的条数
 * @param {*} model 
 * @param {*} callback 
 */
function total(model,callback){
  model.countDocuments(function(err,count){
    callback(err,count);
  })
}


module.exports = {
  ...require('./model.js'),
  add,
  del,
  modify,
  find,
  total
}




