const   express     = require('express'),
        router      = express.Router(),
        db          = require('../database/database');

router.get('/', (req, res)=>{
    //find posts in database and send it to the about page
    db.one('SELECT content FROM HTML WHERE title= $1', 'about')
    .then(about => {
        console.log("successfully retrieved about article:: " + about.content);
        res.render('about/index', { about: about.content});
    })
    .catch(error =>{
        console.log(error);
    });
     
});

router.get('/new', (req, res)=>{
    res.render('about/new');
});

router.post('/', (req, res)=>{
    // update about page
    const cKEditor = req.body.editor1;
    console.log( " what up " + cKEditor);
    
    db.none('UPDATE HTML SET content = $1 WHERE title = $2',
        [cKEditor, 'about'])
        .then((data) =>{
            //success
            console.log("successfully updated: " + data);
            res.redirect('/about');
        })
        .catch((error) =>{
            //failure
            console.log(" error: " + error);
            res.redirect('back');
        });
});

module.exports = router;