const express = require('express');
const router = express.Router();
const passport = require('passport');

// @route   GET /auth/github
// @desc    Authenticate with GitHub
router.get('/github', passport.authenticate('github', { 
  scope: ['user:email'] 
}));

// @route   GET /auth/github/callback
// @desc    GitHub auth callback
router.get('/github/callback',
  passport.authenticate('github', { 
    failureRedirect: '/auth/login-failed' 
  }),
  (req, res) => {
    // Successful authentication
    console.log('User authenticated:', req.user.username);
    res.redirect('/');
  }
);

// @route   GET /auth/logout
// @desc    Logout user
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.redirect('/');
    });
  });
});

// @route   GET /auth/status
// @desc    Check authentication status
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        displayName: req.user.displayName,
        avatarUrl: req.user.avatarUrl
      }
    });
  } else {
    res.json({
      authenticated: false,
      user: null
    });
  }
});

// @route   GET /auth/login-failed
// @desc    Login failure page
router.get('/login-failed', (req, res) => {
  res.status(401).json({ 
    message: 'GitHub authentication failed. Please try again.' 
  });
});

module.exports = router;