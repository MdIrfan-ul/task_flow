import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { Request } from "express"

interface JwtPayload {
    sub: string
    email: string
    role?: string
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_REFRESH_SECRET_KEY'),
            passReqToCallback: true,
        })
    }

    async validate(req: Request, payload: JwtPayload) {
        const refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req)
        // attach both payload and raw token to req.user, since the service needs the raw token to compare against the hash
        return { userId: payload.sub, email: payload.email, role: payload.role, refreshToken }
    }
}