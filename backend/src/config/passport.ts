
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import prisma from '@/models/client'
import { AuthHelper } from '@/helpers'

export const configurePassport = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID || '',
                clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
                callbackURL: `${process.env.BACKEND_URL || 'http://localhost:4001'}/api/${process.env.API_VERSION || 'v1'}/auth/google/callback`,
                passReqToCallback: true,
            },
            async (req, accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value
                    if (!email) {
                         return done(new Error("No email found in Google Profile"), undefined);
                    }
                    
                    let user = await prisma.user.findUnique({
                        where: { email },
                    })

                    if (!user) {
                        // Generate random password for google users
                        const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
                        const hashedPassword = await AuthHelper.hashPassword(randomPassword);

                        user = await prisma.user.create({
                            data: {
                                email,
                                name: profile.displayName || email.split('@')[0], 
                                password: hashedPassword,
                                avatarUrl: profile.photos?.[0]?.value
                            },
                        })
                    }
                    
                    return done(null, user);
                } catch (error) {
                    return done(error as any, undefined);
                }
            }
        )
    )
    
    // Serialization
    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });
    
    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await prisma.user.findUnique({ where: { id } });
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
}
