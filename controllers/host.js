const nodemailer = require("nodemailer");
const flash = require('connect-flash');


const Highlight = require('../models/highlightModel');
const Name = require('../models/nameModel');
const ServerInfo = require('../models/serverInfoModel');

module.exports.renderExplore = async (req, res) => {

   const researchesName = await Name.find({});
   const { skinsUpdateInfo } = await ServerInfo.findOne({});


   res.locals.info.push(`Skin Prices Updated Last Time : ${skinsUpdateInfo}`)
   res.render('explore', { researchesName });
}

module.exports.renderMain = async (req, res, next) => {
   const highlights = await Highlight.find({}).populate('orginalTrade');


   // req.flash('info', `For your comfort we have displayed no more than ${res.locals.maxShownTrades} trades on the page!`)
   res.render('main', { highlights });
};

module.exports.renderManagment = async (req, res) => {
   res.render('managment')
}

module.exports.renderAboutUs = async (req, res) => {
   res.render('about')
}
module.exports.renderGuide = async (req, res) => {
   res.render('guide')
}
module.exports.renderPolicy = async (req, res) => {
   res.render('policy')
}

module.exports.sendEmail = async (req, res) => {
   const { body } = req;
   console.log(body)

   if (res.locals.server != 'local') {



      const transporter = nodemailer.createTransport({
         service: 'gmail',
         port: 587,
         auth: {
            user: process.env.EMAIL_SENDER_NAME,
            pass: process.env.EMAIL_SENDER_PASSWORD
         }
      });



      const options = {
         from: body.email, // sender address
         to: "damian.trafialek@gmail.com", // list of receivers
         subject: "An Email From Kontrakciarze.com", // Subject line
         text: body.text, // plain text body
         html: `<b>${body.text}</b>`, // html body
         // replyTo: body.email,
      }
      const info = await transporter.sendMail(options);

      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

      req.flash('success', 'Successfully sent an email!')
      res.redirect('/')
   } else {
      req.flash('error', 'An email was not sent because you are on the local server!')
      res.redirect('/')

   }
}