const Highlight = require('../models/highlightModel');

module.exports.renderHome = async (req, res) => {
   const highlights = await Highlight.find({}).populate('orginalTrade');


   res.render('home', { highlights });
}