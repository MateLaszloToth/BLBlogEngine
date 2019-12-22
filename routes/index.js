const   express     = require('express'),
        router      = express.Router(),
        bcrypt      = require('bcryptjs'),
        passport    = require('passport'),
        auth        = require('../auth/auth'),
        db          = require('../database/database');
        
router.get('/', (req, res)=>{
    db.one(`SELECT content, TO_CHAR(modified, 'yyyy mm dd') modified
        FROM articles
        WHERE type = $1`, ['landing'])
    .then(article => {
        res.render('landing/index', {
            article: article,
            user: req.user
        });
    })
    .catch(error=>{
        console.log(error);
    })
});

// Render the editorial page for the landing page
router.get('/new', auth.checkAuthenticated, (req, res)=>{
    res.render('landing/new');
});

//UPDATE landing page
router.put('/', auth.checkAuthenticated, (req, res) => {
    console.log(req.body); //req.body only contains textarea
    // fetch user_id
    //sanitize content before inserting
    db.none(`UPDATE articles SET content = $1, author_id = $2, modified = NOW()
        WHERE type = $3`, [req.body.editor1, req.user.id, 'landing']) 
        .then(
            res.redirect('/')
        )
        .catch(error => {
            console.log('Error occured while updating the landing page: ' + error);
        });
});

//GET registration page
router.get('/register', auth.checkNotAuthenticated, (req, res)=>{
    res.render('register', {csrfToken: req.csrfToken()});
});

//POST registration page
router.post('/register', auth.checkNotAuthenticated,  (req, res)=>{
    let form = req.body; //shortens query
    if(form.bday === ''){
        form.bday = null; // incase the user didn't enter bday, db will store null intead of ''
    }
    
    let hash = bcrypt.hashSync(form.password, 14); // hashing the password
    form.password = hash;

    db.one(`INSERT INTO users(f_name, l_name, email, pword_hash, bday, phone, isadmin)
            VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING user_id id`, [form.f_name, form.l_name, 
                form.email, form.password, form.bday, form.phone, true])
            
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