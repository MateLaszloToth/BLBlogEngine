const   express = require('express'),
        router = express.Router(),
        db = require('../database/database'),
        htmlToText = require('html-to-text');

router.get('/', (req, res)=>{
    db.any(`SELECT art_id, users.f_name l_name, users.l_name f_name,
            content, TO_CHAR(created, 'yyyy mm dd') created
        FROM articles
        LEFT JOIN users ON articles.author_id = users.user_id   
        WHERE type = $1 
        ORDER BY created DESC`, 'blog') // first and last names are swapped because Hungarian names appear in reverse order
    .then(posts =>{
        posts.forEach(post => {
            console.log(post.created);
            let text = htmlToText.fromString(post.content, {
                ignoreHref: true,
                ignoreImage: true
            });
            post.intro = text.substring(0, 150);

        });
        res.render('blog/blog', {posts: posts});
    })
    .catch(error =>{
        console.log(error);
        res.redirect('back');
    }); 
});

router.get('/post/:id', (req, res)=>{
    db.one(`SELECT art_id, users.f_name l_name, users.l_name f_name,
            content, TO_CHAR(created, 'yyyy mm dd') created
        FROM articles
        LEFT JOIN users ON articles.author_id = users.user_id   
        WHERE type = $1 AND art_id = $2`, ['blog', req.params.id]) // first and last names are swapped because Hungarian names appear in reverse order
        .then(post =>{
            res.render('blog/post', {post: post});
        })
        .catch(error =>{
            console.log(error);
            res.redirect('back');
        });
});

module.exports = router;