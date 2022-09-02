const http = require("http");
const fs = require("fs");
const url = require("url");

const template = {
    html: function(title, list, control, body) {
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
                ${control}
                ${body}
            </body>
            </html>
        `;
    },
    list: function(fileList) {
        let list = "<ul>";
        let i = 0;
        while (i < fileList.length) {
            list += `<li><a href="/?id=${fileList[i]}">${fileList[i]}</a></li>`;
            ++i;
        }
        list += "</ul>";

        return list;
    }
}

const app = http.createServer((req, res) => {
    let _url = req.url;
    let queryData = url.parse(_url, true).query;
    let pathName = url.parse(_url, true).pathname;

    if (pathName === "/" && queryData.id === undefined) {
        // welcome page
        fs.readdir("./data", (err, fileList) => {
            let title = "Welcome";
            let description = "Hello, Node.js!";
            let body = `
                <h2>${title}</h2>
                <article>${description}</article>
            `;
            let list = template.list(fileList);
            let control = `
                <a href="/create">Create</a>
            `;

            let html = template.html(title, list, control, body);

            res.writeHead(200);
            res.end(html);
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
                let list = template.list(fileList);
                let control = `
                    <a href="/update?id=${title}">Update</a>
                    <form action="/delete_process" method="post">
                        <input type="hidden" name="id" value="${title}">
                        <input type="submit" value="Delete" style="all: unset; text-decoration: underline; color: blue; cursor: pointer">
                    </form>
                `;

                let html = template.html(title, list, control, body);
    
                res.writeHead(200);
                res.end(html);
            });
        });
    } else if (pathName === "/create") {
        // create page
        fs.readdir("./data", (err, fileList) => {
            let title = "Create";
            let body = `
                <h2>${title}</h2>
                <article>
                    <form action="/create_process" method="post">
                        <p><input type="text" name="title" placeholder="title"></input></p>
                        <p><textarea name="description" placeholder="description"></textarea></p>
                        <p><input type="submit" value="create"></input></p>
                    </form>
                </article>
            `;
            let list = template.list(fileList);
            let control = "";

            let html = template.html(title, list, control, body);

            res.writeHead(200);
            res.end(html);
        });
    } else if (pathName === "/create_process") {
        // create process
        let body = "";

        req.on("data", (data) => {
            body += data;
        });

        req.on("end", () => {
            let post = new URLSearchParams(body);
            let title = post.get("title");
            let description = post.get("description");
            
            fs.writeFile(`./data/${title}`, description, "utf8", (err) => {
                res.writeHead(302, {
                    Location: `/?id=${title}`
                });
                res.end();
            });
        });
    } else if (pathName === "/update") {
        // update page
        fs.readdir("./data", (err, fileList) => {
            fs.readFile(`./data/${queryData.id}`, "utf8", (err, description) => {
                let title = queryData.id;
                let body = `
                    <h2>${title}</h2>
                    <article>
                        <form action="/update_process" method="post">
                            <input type="hidden" name="old-title" value="${title}"></input>
                            <p><input type="text" name="new-title" value="${title}"></input></p>
                            <p><textarea name="description" placeholder="description">${description}</textarea></p>
                            <p><input type="submit" value="update"></input></p>
                        </form>
                    </article>
                `;
                let list = template.list(fileList);
                let control = `
                    <a href="/update?id=${title}">Update</a>
                `;

                let html = template.html(title, list, control, body);
    
                res.writeHead(200);
                res.end(html);
            });
        });
    } else if (pathName === "/update_process") {
        // update process
        let body = "";

        req.on("data", (data) => {
            body += data;
        });
        
        req.on("end", () => {
            let post = new URLSearchParams(body);
            let oldTitle = post.get("old-title");
            let newTitle = post.get("new-title");
            let description = post.get("description");
            
            fs.rename(`./data/${oldTitle}`, `./data/${newTitle}`, (err) => {
                fs.writeFile(`./data/${newTitle}`, description, "utf8", (err) => {
                    res.writeHead(302, {
                        Location: `/?id=${newTitle}`
                    });
                    res.end();
                });
            });
        });
    } else if (pathName === "/delete_process") {
        // delete process
        let body = "";

        req.on("data", (data) => {
            body += data;
        });
        
        req.on("end", () => {
            let post = new URLSearchParams(body);
            let id = post.get("id");
            
            fs.unlink(`./data/${id}`, (err) => {
                res.writeHead(302, {
                    Location: "/"
                });
                res.end();
            });
        });
    } else {
        // error page
        res.writeHead(404);
        res.end("Not found");
    }
});

app.listen(3000);