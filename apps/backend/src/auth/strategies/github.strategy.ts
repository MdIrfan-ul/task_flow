import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, StrategyOptions } from "passport-github2";
import { AuthService } from "../auth.service";

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(configService: ConfigService,
        private readonly authService: AuthService
    ) {
        super({
            clientID: configService.get<string>('GITHUB_CLIENT_ID'),
            clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
            callbackURL: configService.get<string>('GITHUB_CALLBACK_URL'),
            scope: ['email', 'profile'],
        } as StrategyOptions);
    }
    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (err: any, user: any) => void,
    ) {
        const { username, displayName, photos, emails } = profile;
        return this.authService.findOrCreateOAuthUser({
            email: emails?.[0]?.value,
            name: displayName || username,
            picture: photos?.[0]?.value
        });
    }
}