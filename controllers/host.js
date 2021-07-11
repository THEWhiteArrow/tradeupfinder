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