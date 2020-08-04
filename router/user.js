//处理user开头的请求
const router=require('express').Router();
const db=require('../model')
const {encrpyt}=require('../model/myMD5.js')
const fd=require('formidable')
const User=db.User;
const fs=require('fs')
const gm=require('gm')
// /user 请求
router.get('/',function(req,res){
  res.redirect('/user/login')
})
// /user/login 请求 get方式 是上面的重定向发送的请求 显示登录页面
router.get('/login',function(req,res){
  res.render('login')
})

//post 方式的/user/login 处理登录请求
router.post('/login',function(req,res){
  var body=req.body;
  var username=body.username;
  var password=body.password;
  var remember=body.remember;
  var filter={username:username,password:encrpyt(password)};
  //到数据库查询
  db.find(User,filter,function(err,result){
    if(err){
      console.log(err)
      res.render('error',{errMsg:"网络波动 稍后再试"})
      return ;
    }
    if(result.length==0){//没有结果
      res.send('<h1>用户名或密码错误,点击<a href="/user/login">返回</a>跳转回登录页面</h1>')
      return ;
    }
    //用户名密码正确 登录成功
    req.session.username=username;
    if(remember){
      req.session.cookie.maxAge=1000*60*60*24*30;
    }
    //登录成功 跳转到留言板页面
    res.redirect('/')
  })
  
})

//get 方式的/user/register跳转注册页面
router.get('/register',function(req,res){
  res.render('register')
})
//post /user/register 注册请求
router.post('/register',function(req,res){
  var username=req.body.username
  var password=req.body.password
  //需要要去做用户名重复的验证 
  var data={
    username:username,
    password:encrpyt(password),
    nickname:username
  }  
  db.add(User,data,function(err){
    if(err){
      console.log(err)
      res.render('error',{msg:"网络错误 注册失败"})
      return;
    }
    //注册成功 设置登录状态 非长时间
    req.session.username=username;
    //跳转到首页
    res.redirect('/')
    // res.render('index')
  })
})


//post /user/check 检查用户名是否存在
router.post('/check',function(req,res){
  var username=req.body.username
  //检查
  db.find(User,{username:username},function(err,result){
    if(err){
      console.log(err)
      res.send({status:1,msg:"网络错误"})
      return ;
    }
    if(result.length>0){
      res.send({status:1,msg:'用户名已存在'})
    }else{
      res.send({status:0,msg:"用户名可以使用"})
    }
  })
})
// get /user/logout 退出登录
router.get('/logout',function(req,res){
  //退出登录实际上就是删除保存的登录信息
  req.session.destroy(function(err){
    if(err){
     console.log(err)
     res.render('error',{errMsg:"退出登录失败"}) 
     return ;
    }
    res.redirect('/')
  })

})
// get /user/center 跳转到个人中心页面
router.get('/center',function(req,res){
  //登录的用户名
  var username=req.session.username;
  //根据用户名 获取登录用户的信息
  var filter={username:username}
  User.find(filter,"username nickname avatar",function(err,user){
    if(err){
      console.log(err)
      res.render('error',{errMsg:'获取数据错误'})
      return ;
    }
    if(user.length==0){
      res.render('error',{errMsg:'获取数据错误'})
      return ;
    }
    res.render('center',{user:user[0]})
  })
})

// get /user/changePwd 跳转到修改密码的页面
router.get('/changePwd',function(req,res){
  res.render('changePwd')
})

//get /user/checkPwd 验证原密码是否正确
router.get('/checkPwd',function(req,res){
  //获取输入的密码
  var password=req.query.oldPwd
  //获取当前登录用户的用户名
  var username=req.session.username
  //查询的条件：加密后的密码 用户名
  var fliter={
    username:username,
    password:encrpyt(password)
  }
  //查询密码是否存在
  db.find(User,fliter,function(err,users){
    if(err){
      console.log(err)
      res.send({status:1,msg:"验证失败"})
      return ;
    }
    if(users.length==0){
      //没有查到数据 密码错误
      res.send({status:1,msg:"原密码错误"})
      return ;
    }
    res.send({status:0,msg:"原密码正确"})
  })
})

//post /user/changePwd 修改数据库中的密码
router.post('/changePwd',function(req,res){
  //获取当前登录用户的信息
  var username=req.session.username;
  //获取修改的新密码
  var password=req.body.newPwd;
  //修改的条件
  var filter={username:username}
  //修改的数据
  var data={
    password:encrpyt(password)
  }
  db.modify(User,filter,data,function(err,result){
    if(err){
      console.log(err)
      res.render('error',{errMsg:"修改失败"})
      return ;
    }
    if(result.nModified==0){
      //修改0条
      res.render('error',{errMsg:"新密码与旧密码相同"})
      return ;
    }
    //修改成功后 重新登录
    req.session.destroy(function(err){
      if(err){
        console.log(err)
        res.render('error',{errMsg:"请退出重新登录"})
        return ;
      }
      res.redirect('/')
    })
    //修改成功 回到用户中心
    // res.redirect('/user/center')
  })
})

//get /user/changeNick 修改数据库中的昵称
router.get('/changeNick',function(req,res){
  //获取当前登录用户的用户名
  var username=req.session.username;
  //获取新昵称
  var nickname=req.query.nickname;
  var fliter={
    username:username
  }
  var data={
    nickname:nickname
  }
  db.modify(User,fliter,data,function(err,result){
    if(err){
      console.log(err)
      res.send({status:1,msg:"修改失败"})
      return ;
    }
    if(result.nModified==0){
      res.send({status:1,emsg:"修改失败"})
      return ;
    }
    res.send({status:0,msg:"修改成功"})
  })
})

// get /user/upload 跳转到上传页面
router.get('/upload',function(req,res){
  res.render('upload')
})

//post /user/upload 处理图片上传
router.post('/upload',function(req,res){
  //创建表单对象
  var form=new fd.IncomingForm();
  //设置临时保存路径
  form.uploadDir='./temp';
  //解析请求对象
  form.parse(req,function(err,fields,files){
    if(err){
      console.log(err)
      res.render('error',{errMsg:"上传头像失败"})
      return ;
    }
    //获取图片对象
    var pic=files.pic
    //对图片的操作
    var oldPath=pic.path
    var name=pic.name
    var newPath='./temp/'+name;
    fs.rename(oldPath,newPath,function(err){
      if(err){
        console.log(err)
        res.render('error',{errMsg:"上传失败"})
        return ;
      }
      //上传成功 跳转到剪切图片的界面
      res.render('cut',{path:name})
    });
  })
})

//get /user/cut 剪切图片
router.get('/cut',function(req,res){
  var username=req.session.username
  //获取参数
  var w=req.query.w
  var h=req.query.h
  var x=req.query.x
  var y=req.query.y
  var img=req.query.img //  /xxx.jpg 
  var i=img.substring(1);// xxx.jpg 把/ 去掉
  //剪切图片
  //保存的路径 ./avatar/username/xxx.jpg
  var avatar='./avatars/'+username+i
  gm('./temp'+img).crop(w,h,x,y).write(avatar,function(err){
    if(err){
      console.log(err)
      res.send({status:1,msg:'剪切失败'})
      return ;
    }
    //剪切成功 将新头像的路径保存到数据库 跳回到个人中心 
    var filter={username:username}
    var data={avatar:username+i}
    db.modify(User,filter,data,function(err,raw){
      if(err){
        console.log(err)
        res.send({status:1,msg:"修改失败"})
        return ;
      }
      if(raw.nModified==0){
        res.send({status:1,msg:"修改失败"})
        return ;
      }
      //修改成功
      res.send({status:0,msg:"修改成功"})
    })
  })




})


module.exports=router;