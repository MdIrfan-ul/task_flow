import { Request } from 'express';
import { UAParser } from 'ua-parser-js';

export interface DeviceInfo {
    device_name: string | null;
    browser: string | null;
    os: string | null;
    ip_address: string | null;
    user_agent: string | null;
}

function getClientIp(req: Request): string | null {
    // Behind a reverse proxy / load balancer (nginx, ALB, Vercel, etc.) the
    // real client IP is in x-forwarded-for, not req.socket.remoteAddress
    // (which would just be the proxy's own IP). x-forwarded-for can be a
    // comma-separated chain ("client, proxy1, proxy2") — the first entry is
    // the original client.
    const forwardedFor = req.headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
        return forwardedFor.split(',')[0].trim();
    }
    if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
        return forwardedFor[0];
    }
    return req.ip ?? req.socket?.remoteAddress ?? null;
}

export function parseDeviceInfo(req: Request): DeviceInfo {
    const userAgent = req.headers['user-agent'] ?? null;
    const parser = new UAParser(userAgent ?? '');
    const { browser, os, device } = parser.getResult();

    const browserLabel = browser.name
        ? `${browser.name}${browser.version ? ` ${browser.version.split('.')[0]}` : ''}`
        : null;
    const osLabel = os.name ? `${os.name}${os.version ? ` ${os.version}` : ''}` : null;

    // e.g. "iPhone", "iPad", "Samsung SM-G991B" for mobile/tablet; fall back
    // to "<OS> Desktop" (e.g. "Windows Desktop") when it's a regular computer,
    // since ua-parser-js only names the device for mobile/tablet/console/etc.
    const deviceName =
        device.vendor || device.model
            ? [device.vendor, device.model].filter(Boolean).join(' ')
            : os.name
                ? `${os.name} Desktop`
                : null;

    return {
        device_name: deviceName,
        browser: browserLabel,
        os: osLabel,
        ip_address: getClientIp(req),
        user_agent: typeof userAgent === 'string' ? userAgent : null,
    };
}