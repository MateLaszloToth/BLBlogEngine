
let auth = {};



/**
 * This middleware checks to see if a user is available in the request. If not,
 * it will redirect the visitor to the login page.
 */
auth.loginRequired = function(req, res, next){
    if(!req.user){
        console.log("not logged in, redirect to login");
        return res.redirect('/login');
    }
    next();
}

auth.checkAuthenticated = (req, res, next)=>{
    console.log("checkAuth");
    console.log('req.isAuthenticated(): ' + req.isAuthenticated());
    if(!req.isAuthenticated()){
        return res.redirect('/login'); // next('/login')
    }
    next();
}

auth.checkNotAuthenticated = (req, res, next)=>{
    console.log("checkNotA");
    console.log('req.isAuthenticated(): ' + req.isAuthenticated());
    if(req.isAuthenticated()){
        return res.redirect('/');
    }
    next();
}

module.exports = auth;