const User = require('../models/userModel');

module.exports.renderRegister = (req, res) => {
   res.render('users/register');
};

module.exports.register = async (req, res) => {
   try {
      const { username, email, password } = req.body;
      const role = 'guest';
      const user = new User({ email, username, role, steam: null });
      const registeredUser = await User.register(user, password);
      req.login(registeredUser, err => {
         if (err) {
            next(err)
            // throw new ExpressError('Error occured during automatic attempt to log you in. Please do it by yourself.', 500);
         } else {
            req.flash('success', 'Właśnie założyłeś nowe konto na Kontrakciarze CS:GO! Witamy nowego kontrakciarza');
            res.redirect('/skins')
         }

      })

   } catch (e) {
      req.flash('error', e.message);
      res.redirect('/user/register')
   }
};

module.exports.renderLogin = (req, res) => {
   res.render('users/login');
};

module.exports.login = async (req, res) => {
   const { user } = req;
   console.log(user)
   req.flash('success', `Welcome back ${user.username}! We have been waiting for your comeback and are content to have you here :) `);
   // const redirectUrl = req.session.returnTo || '/skins';
   const redirectUrl = '/skins';
   delete req.session.returnTo;
   res.redirect(redirectUrl)
};

module.exports.logout = async (req, res) => {
   await req.logout();
   req.flash('success', 'Goodbye! It was an honour to have you here!')
   res.redirect('/skins');
};
