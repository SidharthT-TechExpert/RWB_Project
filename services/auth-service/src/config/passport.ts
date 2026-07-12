import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { AuthRepository } from '../repositories/AuthRepository';
import { ROLES } from '@quickbite/shared';

const authRepo = new AuthRepository();

// Only configure Google OAuth if credentials are present
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/v1/auth/google/callback',
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('No email from Google'), false);

          let user = await authRepo.findUserByGoogleId(profile.id);
          if (!user) {
            user = await authRepo.findUserByEmail(email);
            if (user) {
              await authRepo.updateUser(user._id.toString(), { googleId: profile.id });
            } else {
              user = await authRepo.createUser({
                name: profile.displayName,
                email: email.toLowerCase(),
                googleId: profile.id,
                avatar: profile.photos?.[0]?.value,
                isEmailVerified: true,
                role: ROLES.CUSTOMER,
              });
            }
          }
          return done(null, {
            googleId: profile.id,
            email,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
          });
        } catch (err) {
          return done(err as Error, false);
        }
      }
    )
  );
}

export default passport;
