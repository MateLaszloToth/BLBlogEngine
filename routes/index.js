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
        db.any(`SELECT f_name l_name, l_name f_name, content, title
            FROM recommendations`)
        .then(recs =>{
            res.render('landing/index', {
                article: article,
                user: req.user,
                recs: recs
            });
        })
        .catch(error =>{
            console.log("ERROR while query recommendations: " + error);
        })
        
    })
    .catch(error=>{
        console.log(error);
    })
});

// Render the editorial page for the landing page
router.get('/new', auth.checkAuthenticated, (req, res)=>{
    res.render('landing/new', {
        csrfToken: req.csrfToken(),
        user: req.user //define to show correct login/logout button
    });
});

//UPDATE landing page
router.put('/', auth.checkAuthenticated, (req, res) => {
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
    res.render('register', {
        csrfToken: req.csrfToken(),
        user: req.user //define to show correct login/logout button
    });
});

//POST registration page
router.post('/register', auth.checkNotAuthenticated,  (req, res)=>{
    let form = req.body; //shortens query
    if(form.bday === ''){
        form.bday = null; // incase the user didn't enter bday, db will store null intead of ''
    }
    
    let hash = bcrypt.hashSync(form.pword, 14); // hashing the password
    form.pword = hash;

    db.one(`INSERT INTO users(f_name, l_name, email, pword_hash, bday, phone, isadmin)
            VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING user_id id`, [form.f_name, form.l_name, 
                form.email, form.pword, form.bday, form.phone, true])
            
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
    res.render('login', {
        csrfToken: req.csrfToken(),
        user: req.user //define to show correct login/logout button
    });
});

//POST login page
router.post('/login', auth.checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: 'login',
    failureFlash: true
}));

//GET Logout page
router.get('/logout', auth.checkAuthenticated, (req, res)=>{
    res.render('logout', {
        csrfToken: req.csrfToken(),
        user: req.user //define to show correct login/logout button
    })
})
//DELETE Logout Page
router.delete('/logout', auth.checkAuthenticated, (req, res)=>{
    req.logOut();   // clearing out session
    res.redirect('/');
})


module.exports = router;