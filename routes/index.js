const   express     = require('express'),
        router      = express.Router(),
        bcrypt      = require('bcryptjs'),
        passport    = require('passport'),
        auth        = require('../auth/auth'),
        db          = require('../database/database');
        
router.get('/', (req, res)=>{
    res.render('landing/index', {user: req.user });
});

// Render the editorial page for the landing page
router.get('/new', auth.checkAuthenticated, (req, res)=>{
    res.render('landing/new');
});

//UPDATE landing page
router.post('/', (req, res) => {
    console.log(req.body); //req.body only contains textarea
    // fetch user_id
    //sanitize content before inserting
    db.none(`UPDATE articles (content, author_id, modified) VALUES( , , CURRENT_DATE
        WHERE type = $1 AND author_id = $2`, ['landing', ]) //FINISH QUERY
        .then()
        .catch()
});

//GET registration page
router.get('/register', auth.checkNotAuthenticated, (req, res)=>{
    res.render('register', {csrfToken: req.csrfToken()});
});

//POST registration page
router.post('/register', auth.checkNotAuthenticated,  (req, res)=>{
    let form = req.body;
    if(form.bday === ''){
        form.bday = null; // incase the user didn't enter bday, db will store null
    }
    form.isAdmin = form.admin_code === "Levi is awesome"? true: false;
    
    let hash = bcrypt.hashSync(form.password, 14); // hashing the password
    form.password = hash;

    db.one(`INSERT INTO users(f_name, l_name, email, pword_hash, bday, phone, isadmin)
            VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING user_id id`, [form.f_name, form.l_name, 
                form.email, form.password, form.bday, form.phone, form.isAdmin])
            
    .then(user => {
        req.login(user, error =>{
        if (error) {
            console.log(error);
            return; // done and next functions are not defined
        }
        return res.redirect('/');
       });
    })
    .catch(error => { 
        console.log(error);
    });

});

//GET login page
router.get('/login', auth.checkNotAuthenticated, (req, res)=>{
    res.render('login', { csrfToken: req.csrfToken()});
});

//POST login page
router.post('/login', auth.checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: 'login',
    failureFlash: true
}));

//GET Logout page
router.get('/logout', auth.checkAuthenticated, (req, res)=>{
    res.render('logout', {csrfToken: req.csrfToken()})
})
//DELETE Logout Page
router.delete('/logout', auth.checkAuthenticated, (req, res)=>{
    req.logOut();   // clearing out session
    res.redirect('/');
})


module.exports = router;