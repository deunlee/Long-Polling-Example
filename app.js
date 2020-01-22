const fs   = require('fs');
const http = require('http');

let sessions = [];

const webHandler = (req, res) => {
    console.log(req.url);

    if (req.url.startsWith('/long-polling')) {
        pollingHandler(req, res);
    } else {
        fileHandler(req, res);
    }
};

const fileHandler = (req, res) => {
    let path = req.url;

    if (path.indexOf('..') !== -1) {
        errorHandler(req, res);
        return;
    }

    if (path.split('/').pop() === '') {
        path += 'index.html';
    }

    fs.readFile('.' + path, 'utf8', (err, data) => {
        if (err) {
            errorHandler(req, res);
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
}

const pollingHandler = (req, res) => {
    sessions.push(res);
}

const errorHandler = (req, res) => {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found\n');
}


const server = http.createServer(webHandler);

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (data) => {
    const oldSessions = sessions;
    sessions = [];

    oldSessions.forEach((res) => {
        try {
            res.writeHead(200, {
                'Content-Type': 'text/plain',
                // 'Access-Control-Allow-Origin': '*',
            });
            res.end(data);
        } catch (e) {
            console.error(e);
        }
    });
});

server.listen(8080, 'localhost', function () {
    console.log();
    console.log('>>> Server is running at http://localhost:8080/');
    console.log();
});
