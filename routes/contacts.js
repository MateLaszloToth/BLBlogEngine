const   express     = require('express'),
        auth        = require('../auth/auth'),
        db          = require('../database/database'),
        router      = express.Router();

// GET contacts page
router.get('/', (req, res)=>{
    db.one(`SELECT content, created FROM articles WHERE type = $1`, ['contacts'])
    .then(article =>{
        res.render('contacts/index', {
            article: article,
            user: req.user    
        })
    })
    .catch(error =>{
        console.log('Something went wrong while extracting contacts article: ' + error);
        res.redirect('back');
    });
});

// GET new page
router.get('/new', auth.checkAuthenticated, (req, res)=>{
    res.render('contacs/new');
});

// UPDATE contacts page
router.put('/', auth.checkAuthenticated, (req, res) =>{
    let sanContent = req.body.editor1; // Sanitize content !!
    db.none(`UPDATE articles SET content = $1, author_id = $2
            WHERE type = $3`, [sanContent, Number(req.body.id), 'contacts'])
        .then(
            res.redirect('/contacts')
        )
        .catch(error =>{
            console.log('Erro during updating contacts: ' + error);
        });
});

module.exports = router;