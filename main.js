const http = require("http");
const fs = require("fs");
const url = require("url");
const path = require("path");
const sanitizeHtml = require("sanitize-html");
const template = require("./lib/template");

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
            let filteredId = path.parse(queryData.id).base;
            fs.readFile(`./data/${filteredId}`, "utf8", (err, description) => {
                let title = queryData.id;
                let sanitizedTitle = sanitizeHtml(title);
                let sanitizedDescription = sanitizeHtml(description);

                let body = `
                    <h2>${sanitizedTitle}</h2>
                    <article>${sanitizedDescription}</article>
                `;
                let list = template.list(fileList);
                let control = `
                    <a href="/update?id=${sanitizedTitle}">Update</a>
                    <form action="/delete_process" method="post">
                        <input type="hidden" name="id" value="${sanitizedTitle}">
                        <input type="submit" value="Delete" style="all: unset; text-decoration: underline; color: blue; cursor: pointer">
                    </form>
                `;

                let html = template.html(sanitizedTitle, list, control, body);
    
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
            let filteredId = path.parse(queryData.id).base;
            fs.readFile(`./data/${filteredId}`, "utf8", (err, description) => {
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
            let filteredId = path.parse(id).base; 
            
            fs.unlink(`./data/${filteredId}`, (err) => {
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