var fs = require('fs');

exports.userLoginCheck = function(req, res){  
    if(!req.user){res.redirect('/auth/login');}
    else{
        if(req.user.user_check == "admin"){
            res.redirect('/admin');
        }
    }
};
exports.adminLoginCheck = function(req, res){
    if(!req.user){res.redirect('/auth/login');}
    else{
        if(req.user.user_check == "user"){
            res.redirect('/');
        }
    }
};

exports.fileinput = function(path){
    var data = fs.readFileSync(path,'utf-8');
    return data;
};

exports.fileoutput = function(path,data){
    try {
        fs.writeFileSync(path,data,'utf-8');
    }catch(e)
    {console.log(e);}
}