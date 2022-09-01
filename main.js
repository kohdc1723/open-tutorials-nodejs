const http = require("http");
const fs = require("fs");
const url = require("url");

const app = http.createServer((req, res) => {
    let _url = req.url;
    let queryData = url.parse(_url, true).query;
    let pathName = url.parse(_url, true).pathname;

    if (pathName === "/" && queryData.id === undefined) {
        // welcome page
        fs.readdir("./data", (err, fileList) => {
            let title = "Welcome";
            let description = "Hello, Node.js!"

            let list = "<ul>";
            let i = 0;
            while (i < fileList.length) {
                list += `<li><a href="/?id=${fileList[i]}">${fileList[i]}</a></li>`;
                ++i;
            }
            list += "</ul>"

            let template = `
                <!doctype html>
                <html>
                <head>
                    <title>WEB2 - Node.js - ${title}</title>
                    <meta charset="utf-8">
                </head>
                <body>
                    <h1><a href="/">Node.js</a></h1>
                    ${list}
                    <h2>${title}</h2>
                    <article>${description}</article>
                </body>
                </html>
            `;

            res.writeHead(200);
            res.end(template);
        });
    } else if (pathName === "/" && queryData.id !== undefined) {
        // contents page
        fs.readdir("./data", (err, fileList) => {
            let title = queryData.id;
            let list = "<ul>";
            let i = 0;
            while (i < fileList.length) {
                list += `<li><a href="/?id=${fileList[i]}">${fileList[i]}</a></li>`;
                ++i;
            }
            list += "</ul>"

            fs.readFile(`./data/${queryData.id}`, "utf8", (err, description) => {
                let template = `
                    <!doctype html>
                    <html>
                    <head>
                        <title>WEB2 - Node.js - ${title}</title>
                        <meta charset="utf-8">
                    </head>
                    <body>
                        <h1><a href="/">Node.js</a></h1>
                        ${list}
                        <h2>${title}</h2>
                        <article>${description}</article>
                    </body>
                    </html>
                `;
    
                res.writeHead(200);
                res.end(template);
            });
        });
    } else {
        // error page
        res.writeHead(404);
        res.end("Not found");
    }
});

app.listen(3000);