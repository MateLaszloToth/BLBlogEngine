const   express = require('express'),
        router  = express.Router();

router.get('/', (req, res)=>{
    res.render('contacts/index');
});

module.exports = router;