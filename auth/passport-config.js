const   localStrategy   = require('passport-local').Strategy,
        db              = require('../database/database'),
        bcrypt          = require('bcryptjs');

function initialize(passport){

    const authenticateUser = function(email, password, done){
        db.oneOrNone(`SELECT user_id id, f_name, l_name, email, pword_hash hash, TO_CHAR(bday, 'yyyy mm dd') bday, phone
    FROM users
    WHERE email = $1`, [email])
        .then(user =>{
            if(!user){
                console.log('Wrong email');
                return done(null, false, {message: 'The given email cannot be found'});
            }
            if(!bcrypt.compareSync(password, user.hash)){
                
                console.log("Wrong password");
                return done(null, false, {message: 'The password is incorrect'});
            }

            done(null, user);
        })
        .catch(error =>{
            if(error.code === 0){
                done(error);
            }
        })
    }

    passport.use(new localStrategy({usernameField: 'email'}, authenticateUser))
    passport.serializeUser((user, done) =>{
        done(null, user.id);
    });
    /*
    passport.deserializeUser is invoked on every request by passport.session.
    It enables us to load additional user information on every re
    This user object is attached to the request as req.user
      making it accessible in our request handling.
    */
    passport.deserializeUser((id, done) =>{ //populates the req.user object with the queried info
        //  capital letters are automatically decapitalized in the query
        db.oneOrNone(`SELECT f_name l_name, isadmin, user_id id
            FROM users
            WHERE user_id = $1`, [id]) // Hungarian names are in reverse order
        .then(user =>{
            if(!user){
                console.log('User not found by id during deserialization');
                return done(null, false);
            }
            console.log(user);
            done(null, user);
        })
        .catch(error =>{
            done(error);
        })
    });
}

module.exports = initialize;