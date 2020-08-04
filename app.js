const express = require('express');
const app = express();
const { message, checkIsLogin, user } = require('./router');
const session =require('express-session')
app.listen(4000);
app.use(session({
  secret:'aaa',
  resave:false,
  saveUninitialized:true
}))
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));

app.use(express.static('./public'));
app.use(express.static('./temp'));
app.use(express.static('./avatars'));

// 访问/请求
app.get('/',function(req,res){
  res.redirect('/message?page=1')
});
//验证是否已经登录
app.use(checkIsLogin)


// 处理/message开头的请求地址
app.use('/message', message)

//处理/user开头的请求地址
app.use('/user',user)
/*
不需要登录的请求
登录请求
注册请求
*/