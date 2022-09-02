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

module.exports = template;