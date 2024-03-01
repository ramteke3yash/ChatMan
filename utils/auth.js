exports.isAuthorised = (req, res, next) => {
  if (req.session.validated) next();
  else res.redirect("/login");
};

exports.isUnauthorised = (req, res, next) => {
  if (!req.session.validated) next();
  else res.redirect("/chat");
};
