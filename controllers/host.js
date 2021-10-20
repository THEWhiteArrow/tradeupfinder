const nodemailer = require("nodemailer");
const flash = require('connect-flash');


const Highlight = require('../models/highlightModel');
const Name = require('../models/nameModel');
const ServerInfo = require('../models/serverInfoModel');
const User = require('../models/userModel');
const Trade = require('../models/tradeModel');
const Skin = require('../models/skinModel');

module.exports.renderExplore = async (req, res) => {

   const researchesName = await Name.find({});
   const { skinsUpdateInfo } = await ServerInfo.findOne({});


   res.locals.info.push(`Skin Prices Updated Last Time : ${skinsUpdateInfo}`)
   res.render('explore', { researchesName });
}

module.exports.renderMain = async (req, res, next) => {
   const highlights = await Highlight.find({}).populate('orginalTrade');

   const tradesCount = await Trade.estimatedDocumentCount();
   const skinsCount = await Skin.estimatedDocumentCount();
   const serverInfo = await ServerInfo.findOne({});
   const visitorsCount = serverInfo.allVisitors;

   // req.flash('info', `For your comfort we have displayed no more than ${res.locals.maxShownTrades} trades on the page!`)
   res.render('main', { highlights, tradesCount, skinsCount, visitorsCount });
};



module.exports.renderAboutUs = async (req, res) => {
   res.render('about')
}
module.exports.renderGuide = async (req, res) => {
   res.render('guide')
}
module.exports.renderPolicy = async (req, res) => {
   res.render('policy')
}
module.exports.renderContactUs = async (req, res) => {
   res.render('contact')
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
         text: `Email : ${body.email} , \nName : ${body.name} , \nMessage : ${body.text}`, // plain text body
         html: `
         
            <h2>Email : ${body.email}</h2>
            <strong style="display:flex; margin-bottom:10px;">${body.name}</strong>
            <span>${body.text}</span>
         
         `, // html body
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