const   express         = require('express'),
        app             = express(),
        pgp             = require('pg-promise')(/* options */),
        db              = require('./database/database'),
        bodyParser      = require('body-parser')
        blogRouter      = require('./routes/blogs'),
        indexRouter     = require('./routes/index'),
        aboutRouter     = require('./routes/about'),
        contactsRouter  = require('./routes/contacts'),
        commentRouter   = require('./routes/comments');


app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public')); // set '...' directory to serve static assets

app.use(bodyParser.urlencoded({extended: true}));
app.use('/', indexRouter);
app.use('/blog', blogRouter);
app.use('/about', aboutRouter);
app.use('/contacts', contactsRouter);
app.use('/blog/:post_id/comments', commentRouter);

app.get('/', (req, res)=>{
    res.render('landing/index');
});

app.listen(8080, ()=>{
    console.log("Levi's server is listening on PORT: 8080" );
});