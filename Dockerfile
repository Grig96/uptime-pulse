FROM node:20-alpine

LABEL maintainer="devops"
LABEL description="Uptime Pulse - Service availability monitor"

# Install nginx
RUN apk add --no-cache nginx

# Setup nginx
RUN mkdir -p /run/nginx
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy static files
COPY html/ /usr/share/nginx/html/

# Copy proxy server
WORKDIR /app
COPY proxy/server.js .

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'nginx' >> /start.sh && \
    echo 'node /app/server.js' >> /start.sh && \
    chmod +x /start.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

CMD ["/start.sh"]
