const nodemailer = require("nodemailer");
const flash = require('connect-flash');

const maxShownSkins = 200;
const Highlight = require('../models/highlightModel');
const Name = require('../models/nameModel');
const ServerInfo = require('../models/serverInfoModel');

module.exports.renderExplore = async (req, res) => {

   const researchesName = await Name.find({});
   const { skinsUpdateInfo } = await ServerInfo.findOne({});

   res.render('explore', { researchesName, skinsUpdateInfo });
}

module.exports.renderMain = async (req, res, next) => {
   const highlights = await Highlight.find({}).populate('orginalTrade');


   req.flash('info', `For your comfort we have no displayed more than ${maxShownSkins} trades on the page!`)
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

module.exports.sendEmail = async (req, res) => {
   const { body } = req;
   console.log(body)


   const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
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
}