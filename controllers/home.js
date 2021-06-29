const Highlight = require('../models/highlightModel');

module.exports.renderHome = async (req, res) => {
   const highlights = await Highlight.find({});


   res.render('home', { highlights });
}