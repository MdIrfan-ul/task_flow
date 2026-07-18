import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
            scope: ['email', 'profile'],
        } as StrategyOptions);
    }
    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (err: any, user: any) => void,
    ) {
        return this.authService.findOrCreateOAuthUser({
            email: profile.emails[0].value,
            name: profile.name.givenName,
            picture: profile.photos?.[0]?.value,
        });
    }
}