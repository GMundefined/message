// 处理留言的路由
const express = require('express');
const sd = require('silly-datetime')
const Route = express.Router();
const db = require('../model')
const Message = db.Message;
const User = db.User;

// /message请求
Route.get('/',function(req,res){
  //获取登录信息
  var username=req.session.username
  // 获取页码
  var page = parseInt(req.query.page);
  if(page<1){
    page = 1
  }
  // 获取数据的总条数
  db.total(Message,function(err,count){
    if(err){
      console.log(err);
      res.render('error',{errMsg:"服务器故障"});
      return ;
    }
    // 总页数
    var allPages = Math.ceil(count/5);
    // 当前页超过总页数，调整为最后一页
    if(page>allPages){
      page = allPages;
    }
    var opt = {page:page,size:5}
    // 查询数据库中的数据，传递给index页面解析
    db.find(Message,opt,function(err,docs){
      if(err){
        console.log(err);
        res.render("error",{errMsg:"网络错误，稍后再试"});
        return ;
      }
      //获取所有用户的基本信息
      //可以使用自己封装的db.find方法
      //第二个代表 查询的属性
      User.find({},"username nickname avatar",function(err,users){
        if(err){
          console.log(err)
          res.render('error',{errMsg:"获取用户信息失败"})
          return ;
        }
        // 取到数据，传递给页面
        // 传递的数据：留言信息，总页数，当前页 登录的用户名
        res.render("index",{msg: docs,pages:allPages,current:page,username:username,users:users})
      })
    })
  })
})

// post - /message/tijiao
Route.post('/tijiao',function(req,res){
  //获取登录的信息
  var username=req.session.username
  //获取表单发送的信息
  var query = req.body;
  //添加留言时间
  query.date = sd.format(new Date())
  //添加留言者的用户名
  query.username=username;
  db.add(Message,query,function(err){
    if(err){
      console.log(err);
      res.render("error",{errMsg:"提交留言失败"});
      return ;
    }
    // 提交成功，回到首页
    res.redirect('/');
  })
})

// /message/del删除留言(ajax发送的请求)
Route.get('/del',function(req,res){
  var id = req.query.id;
  db.del(Message,id,function(err,result){
    if(err){
      console.log(err);
      res.send({status:1, msg:"网络波动"});
      return ;
    }
    if(result.deletedCount==0){
      res.send({status:1, msg:"删除失败"});
    }else{
      res.send({status:0, msg:"删除成功"});
    }
  })
})

// post - /message/modify(Ajax发送的请求)
Route.post('/modify',function(req,res){
  var id = req.body.id;
  var newMsg = req.body.message;

  var data = {message: newMsg}
  db.modify(Message,id,data,function(err,result){
    if(err){
      console.log(err);
      res.send({status:1,msg:"网络波动"});
      return ;
    }
    if(result.nModified==0){
      res.send({status:1,msg:"数据未修改"})
    }else{
      res.send({status:0,msg:"修改成功"})
    }
  })
})

module.exports = Route;


