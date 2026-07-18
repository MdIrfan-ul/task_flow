import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, StrategyOptions } from "passport-github2";
import { AuthService } from "../auth.service";

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(
        configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            clientID: configService.get<string>('GITHUB_CLIENT_ID'),
            clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
            callbackURL: configService.get<string>('GITHUB_CALLBACK_URL'),
            scope: ['user:email', 'read:user'],
        } as StrategyOptions);
    }
    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (err: any, user: any) => void,
    ) {
        const { username, displayName, photos, emails } = profile;
        const email = emails?.[0]?.value;

        // Even with the right scope, GitHub omits email entirely for users
        // who keep all their emails private. Fail clearly here instead of
        // letting `undefined` reach a Sequelize WHERE clause.
        if (!email) {
            return done(
                new UnauthorizedException(
                    'Your GitHub account has no public email. Please make an email public on GitHub, or sign in with Google instead.',
                ),
                null,
            );
        }

        try {
            const user = await this.authService.findOrCreateOAuthUser({
                email,
                name: displayName || username,
                picture: photos?.[0]?.value,
            });
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }
}