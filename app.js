const   express         = require('express'),
        app             = express(),
        pgp             = require('pg-promise')(/* options */),
        db              = require('./database/database'),
        bodyParser      = require('body-parser')
        blogRoutes      = require('./routes/blogs'),
        indexRoutes     = require('./routes/index'),
        aboutRouter     = require('./routes/about'),
        contactsRouter  = require('./routes/contacts');

// db.one('SELECT *  ',)
//   .then(function (data) {
//     console.log('DATA:', data.value)
//   })
//   .catch(function (error) {
//     console.log('ERROR:', error)
//   })


app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public')); // set '...' directory to serve static assets

app.use(bodyParser.urlencoded({extended: true}));
app.use('/', indexRoutes);
app.use('/blog', blogRoutes);
app.use('/about', aboutRouter);
app.use('/contacts', contactsRouter);

app.get('/', (req, res)=>{
    res.render('landing/index');
});

app.listen(8080, ()=>{
    console.log("Levi's server is listening on PORT: 8080" );
});