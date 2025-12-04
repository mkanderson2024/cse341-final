const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const mongodb = require('./db');

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      const db = mongodb.getDb();
      const usersCollection = db.collection('users');
      
      // Check if user already exists
      let user = await usersCollection.findOne({ githubId: profile.id });
      
      if (!user) {
        // Create new user
        const newUser = {
          githubId: profile.id,
          username: profile.username,
          displayName: profile.displayName || profile.username,
          email: profile.emails?.[0]?.value || null,
          profileUrl: profile.profileUrl,
          avatarUrl: profile._json.avatar_url,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const result = await usersCollection.insertOne(newUser);
        user = { ...newUser, _id: result.insertedId };
        console.log('New user created:', user.username);
      } else {
        // Update existing user's info
        await usersCollection.updateOne(
          { githubId: profile.id },
          { 
            $set: { 
              displayName: profile.displayName || profile.username,
              avatarUrl: profile._json.avatar_url,
              updatedAt: new Date()
            } 
          }
        );
        console.log('Existing user logged in:', user.username);
      }
      
      return done(null, user);
    } catch (error) {
      console.error('Error in GitHub strategy:', error);
      return done(error, null);
    }
  }
));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const db = mongodb.getDb();
    const { ObjectId } = require('mongodb');
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;