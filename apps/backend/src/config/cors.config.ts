import { ConfigService } from "@nestjs/config";

export const createCorsConfig = (
    configService: ConfigService,
) => ({
    origin: (origin, callback) => {
        const allowedOrigins =
            configService
                .get<string>('CORS_ORIGIN')
                ?.split(',')
                .map(o => o.trim()) || [];

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked for origin: ${origin}`));
        }
    },

    credentials: true,
});