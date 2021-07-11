const maxShownSkins = 200;

const Highlight = require('../models/highlightModel');
const Name = require('../models/nameModel');
const ServerInfo = require('../models/serverInfoModel');

module.exports.renderHome = async (req, res) => {
   const highlights = await Highlight.find({}).populate('orginalTrade');


   res.render('home', { highlights });
}

module.exports.renderMain = async (req, res, next) => {
   const researchesName = await Name.find({});
   const { skinsUpdateInfo } = await ServerInfo.findOne({});

   req.flash('info', `Dla Twojej wygody wyświetlone zostało niewięcej niż ${maxShownSkins} możliwych kontraktów`);

   res.render('main', { researchesName, skinsUpdateInfo });
};

module.exports.renderManagment = async (req, res) => {
   res.render('managment')
}