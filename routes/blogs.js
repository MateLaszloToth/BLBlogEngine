const   express = require('express'),
        router = express.Router();

router.get('/', (req, res)=>{
    res.render('blog/blog');
});

module.exports = router;