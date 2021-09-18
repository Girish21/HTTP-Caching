const http = require("http");

const HTML =
  '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0">';

const generateJunk = (html) => {
  html += "<main><ul>";
  for (let i = 0; i < 10000; i++) {
    html += `<li>Item ${i + 1}</li>`;
  }
  html += "</ul></main>";

  return html;
};

const server = http.createServer((req, res) => {
  if (req.url === "/team") {
    let content =
      HTML +
      '<title>Home</title></head><body><header><nav><a href="/">Home</a><a href="/team">Team</a></nav></header>';
    content = generateJunk(content);
    content += "</body></html>";
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.write(content);
    res.end();
  } else {
    let content =
      HTML +
      '<title>Team</title></head><body><header><nav><a href="/">Home</a><a href="/team">Team</a></nav></header>';
    content = generateJunk(content);
    content += "</body></html>";
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.write(content);
    res.end();
  }
});

server.listen(8080, () => {
  console.log("🚀 server started at 8080");
});
