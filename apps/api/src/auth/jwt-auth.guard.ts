import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = 'secretKey'; // Must match auth.module.ts

@Injectable()
export class JwtAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        // Support both REST and GraphQL contexts
        let request: any;
        
        // Try GraphQL context first
        try {
            const gqlCtx = GqlExecutionContext.create(context);
            const ctx = gqlCtx.getContext();
            if (ctx && ctx.req) {
                request = ctx.req;
            }
        } catch {
            // Not a GraphQL request
        }

        // Fallback to HTTP context
        if (!request) {
            request = context.switchToHttp().getRequest();
        }

        const authHeader = request?.headers?.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid Authorization header');
        }

        const token = authHeader.split(' ')[1];
        try {
            const payload: any = jwt.verify(token, JWT_SECRET);
            request.user = {
                userId: payload.sub,
                username: payload.username,
                role: payload.role,
            };
            return true;
        } catch (e) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
