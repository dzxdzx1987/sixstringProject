let express = require('express');
let router = express.Router();
let clog = require('clog');

router.get('/*.html', (req, res, next) => {
	let url = req.url.substring(1, req.url.indexOf('.html'));
  res.render(url);
});

module.exports = router;