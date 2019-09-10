const   express = require('express'),
        router = express.Router();

router.get('/', (req, res)=>{
    res.render('landing/index');
});

router.get('/new', (req, res)=>{
    res.render('landing/new');
});




module.exports = router;