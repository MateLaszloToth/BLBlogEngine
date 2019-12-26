const   express     = require('express'),
        auth        = require('../auth/auth'),
        db          = require('../database/database'),
        router      = express.Router();

// GET contacts page
router.get('/', (req, res)=>{
    db.one(`SELECT content, TO_CHAR(created, 'yyyy mm dd') created,
            TO_CHAR(modified, 'yyyy mm dd') modified 
        FROM articles 
        WHERE type = $1`, ['contacts'])
    .then(article =>{
        res.render('contacts/index', {
            article: article,
            user: req.user    
        })
    })
    .catch(error =>{
        console.log('Error while extracting contacts article: ' + error);
        res.redirect('back');
    });
});

// GET new page
router.get('/edit', auth.checkAuthenticated, (req, res)=>{
    res.render('contacts/edit', {
        csrfToken: req.csrfToken(),
        user: req.user //define to show correct login/logout button
    });
});

// UPDATE contacts page
router.put('/', auth.checkAuthenticated, (req, res) =>{
    let sanContent = req.body.editor1; // Sanitize content !!
    db.none(`UPDATE articles SET content = $1, author_id = $2, modified = NOW()
        WHERE type = $3`, [sanContent, Number(req.user.id), 'contacts'])
    .then(
        res.redirect('/contacts')
    )
    .catch(error =>{
        console.log('Error during updating contacts: ' + error);
    });
});

module.exports = router;