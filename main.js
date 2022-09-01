const http = require("http");
const fs = require("fs");
const url = require("url");

function templateHTML(title, list, body) {
    return `
        <!doctype html>
        <html>
        <head>
            <title>WEB2 - Node.js - ${title}</title>
            <meta charset="utf-8">
        </head>
        <body>
            <h1><a href="/">Node.js</a></h1>
            ${list}
            ${body}
        </body>
        </html>
    `;
}

function templateList(fileList) {
    let list = "<ul>";
    let i = 0;
    while (i < fileList.length) {
        list += `<li><a href="/?id=${fileList[i]}">${fileList[i]}</a></li>`;
        ++i;
    }
    list += "</ul>";

    return list;
}

const app = http.createServer((req, res) => {
    let _url = req.url;
    let queryData = url.parse(_url, true).query;
    let pathName = url.parse(_url, true).pathname;

    if (pathName === "/" && queryData.id === undefined) {
        // welcome page
        fs.readdir("./data", (err, fileList) => {
            let title = "Welcome";
            let description = "Hello, Node.js!"
            let body = `
                <h2>${title}</h2>
                <article>${description}</article>
            `;
            let list = templateList(fileList);

            let template = templateHTML(title, list, body);

            res.writeHead(200);
            res.end(template);
        });
    } else if (pathName === "/" && queryData.id !== undefined) {
        // contents page
        fs.readdir("./data", (err, fileList) => {
            fs.readFile(`./data/${queryData.id}`, "utf8", (err, description) => {
                let title = queryData.id;
                let body = `
                    <h2>${title}</h2>
                    <article>${description}</article>
                `;
                let list = templateList(fileList);
                
                let template = templateHTML(title, list, body);
    
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