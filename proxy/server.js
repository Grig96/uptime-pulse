const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3000;

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Health check
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
        return;
    }

    // Proxy endpoint: /check?url=https://example.com
    if (req.url.startsWith('/check')) {
        const parsedUrl = url.parse(req.url, true);
        const targetUrl = parsedUrl.query.url;

        if (!targetUrl) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing url parameter' }));
            return;
        }

        let parsedTarget;
        try {
            parsedTarget = new URL(targetUrl);
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid URL' }));
            return;
        }

        const client = parsedTarget.protocol === 'https:' ? https : http;
        const startTime = Date.now();

        const proxyReq = client.request(
            targetUrl,
            {
                method: 'HEAD',
                timeout: 10000,
                headers: {
                    'User-Agent': 'UptimePulse/1.0'
                }
            },
            (proxyRes) => {
                const responseTime = Date.now() - startTime;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: proxyRes.statusCode,
                    responseTime: responseTime,
                    headers: {
                        server: proxyRes.headers['server'] || null,
                        contentType: proxyRes.headers['content-type'] || null
                    }
                }));
            }
        );

        proxyReq.on('error', (err) => {
            const responseTime = Date.now() - startTime;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 0,
                responseTime: responseTime,
                error: err.code || err.message
            }));
        });

        proxyReq.on('timeout', () => {
            proxyReq.destroy();
            const responseTime = Date.now() - startTime;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 0,
                responseTime: responseTime,
                error: 'TIMEOUT'
            }));
        });

        proxyReq.end();
        return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Proxy server running on port ${PORT}`);
});
