const   express     = require('express'),
        router      = express.Router(),
        auth        = require('../auth/auth'),
        db          = require('../database/database');

//GET about page
router.get('/', (req, res)=>{
    //find posts in database and send it to the about page
    db.one(`SELECT content, author_id, created, modified 
        FROM articles 
        WHERE type= $1`, 'about')
    .then(article => {
        res.render('about/index', { 
            article: article,
            user: req.user    
        });
    })
    .catch(error =>{
        console.log(error);
    });
     
});

//GET about/new page
router.get('/new', auth.checkAuthenticated, (req, res)=>{
    res.render('about/new', {
        csrfToken: req.csrfToken(),
        user: req.user //define to show correct login/logout button
    });
});

//UPDATE about content
router.put('/', auth.checkAuthenticated, (req, res)=>{
    const content = req.body.editor1; //retrieve the content of the editor
    //update database with new content
    db.none(`UPDATE articles SET content = $1, img_path = $2, intro = $3,
            author_id = $4, modified = NOW()
        WHERE type = $5`,
        [content, req.body.img_path, req.body.intro, req.user.id, 'about'])
        .then((data) =>{
            //success
            console.log("successfully updated: " + data);
            res.redirect('/about');
        })
        .catch((error) =>{
            //failure
            console.log("Error occured while updating about content: " + error);
            res.redirect('back');
        });
});

module.exports = router;