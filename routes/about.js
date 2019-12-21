const   express     = require('express'),
        router      = express.Router(),
        auth        = require('../auth/auth'),
        db          = require('../database/database');

// GET about page
router.get('/', (req, res)=>{
    //find posts in database and send it to the about page
    db.one('SELECT content FROM HTML WHERE title= $1', 'about')
    .then(about => {
        console.log("successfully retrieved about article");
        res.render('about/index', { 
            about: about.content,
            user: req.user    
        });
    })
    .catch(error =>{
        console.log(error);
    });
     
});

//GET about/new page
router.get('/new', auth.checkAuthenticated, (req, res)=>{
    res.render('about/new');
});

//UPDATE about content
router.put('/', auth.checkAuthenticated, (req, res)=>{
    const cKEditor = req.body.editor1; //retrieve the content of the editor
    console.log( "What up?\n" + cKEditor);
    
    //update database with new content
    db.none('UPDATE HTML SET content = $1 WHERE title = $2',
        [cKEditor, 'about'])
        .then((data) =>{
            //success
            console.log("successfully updated: " + data);
            res.redirect('/about');
        })
        .catch((error) =>{
            //failure
            console.log("Error occired while updating about content: " + error);
            res.redirect('back');
        });
});

module.exports = router;