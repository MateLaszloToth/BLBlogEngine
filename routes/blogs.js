const   express     = require('express'),
        router      = express.Router(),
        auth        = require('../auth/auth'),
        db          = require('../database/database'),
        htmlToText  = require('html-to-text');

//GET Blog page
router.get('/', (req, res)=>{
    db.any(`SELECT art_id, users.f_name l_name, users.l_name f_name,
            content, TO_CHAR(created, 'yyyy mm dd') created
        FROM articles
        LEFT JOIN users ON articles.author_id = users.user_id   
        WHERE type = $1 
        ORDER BY created DESC`, 'blog') // first and last names are swapped because Hungarian names appear in reverse order
    .then(posts =>{
        posts.forEach(post => {
            let text = htmlToText.fromString(post.content, {
                ignoreHref: true,
                ignoreImage: true
            });
            post.intro = text.substring(0, 150);

        });
        res.render('blog/blog', {posts: posts, user: req.user});
    })
    .catch(error =>{
        console.log(error);
        res.redirect('back');
    }); 
});

//GET new post form
router.get('/new', (req, res)=>{
    res.render('blog/new', {csrfToken: req.csrfToken()})
});

//GET Individual post page
router.get('/:post_id', (req, res)=>{
    db.one(`SELECT art_id, users.f_name l_name, users.l_name f_name,
            content, TO_CHAR(created, 'yyyy mm dd') created
        FROM articles
        LEFT JOIN users ON articles.author_id = users.user_id   
        WHERE type = $1 AND art_id = $2`, ['blog', req.params.post_id]) // first and last names are swapped because Hungarian names appear in reverse order
        .then(post =>{
            db.any(`SELECT content, users.f_name l_name, users.l_name f_name,
                    TO_CHAR(created, 'yyyy mm dd') created
                FROM comments
                LEFT JOIN users ON comments.author_id = users.user_id
                WHERE article_id = $1
                ORDER BY created DESC`, [post.art_id]) // first and last names are swapped because Hungarian names appear in reverse order
            .then(comments => {
                if(req.user && req.user.id){
                    var id = req.user.id;
                }
                res.render('blog/post', {
                    post: post,
                    comments: comments,
                    user_id: req.user&&req.user.id ? req.user.id : null, // user exist only after authentication
                    csrfToken: req.csrfToken()
                });
            })
            .catch(error => {
                console.log("Something went wrong while querying comments");
                console.log(error);
                res.redirect('back');
            })    
        })
        .catch(error =>{
            console.log(error);
            res.redirect('back');
        });
});



//POST new comment
router.post('/:post_id/comments', auth.checkAuthenticated, (req, res)=>{
    console.log(req.user);
    db.none(`INSERT INTO comments(content, article_id, author_id)
            VALUES($1, $2, $3)`, [req.body.newComment, Number(req.body.article_id), req.user.id])
    .then(
        res.redirect('/blog/' + req.params.post_id)
    )
    .catch(error =>{
        console.log(error);
    })
});

module.exports = router;