const   express         = require('express'),
        app             = express(),
        db              = require('./database/database'),
        bcrypt          = require('bcryptjs'),
        csurf           = require('csurf'),
        bodyParser      = require('body-parser'),
        flash           = require('express-flash'),
        session         = require('client-sessions'),
        passport        = require('passport'),
        methodOverride  = require('method-override'),
        helmet          = require('helmet'),
        blogRouter      = require('./routes/blogs'),
        indexRouter     = require('./routes/index'),
        aboutRouter     = require('./routes/about'),
        contactsRouter  = require('./routes/contacts'),
        commentRouter   = require('./routes/comments');


app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public')); // set '...' directory to serve static assets
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(session({
    cookieName: 'session',
    secret: 'this is a beautiful day',
    duration: 24 * 60 * 60 * 1000, // milliseconds (1 day)
    cookie: {
        ephemeral: true, // erease cookies when browser is closed
        httpOnly: true, // no scripts are allowed
        secure: false // value true works only with https
    }
}));

app.use(helmet());
app.use(csurf());
//Init passport
const initPassport = require('./auth/passport-config');
initPassport(passport);
app.use(passport.initialize());
app.use(passport.session());


app.use(flash());
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