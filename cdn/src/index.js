const express = require("express")();

express.get("/", async (_, res) => {
  console.log("🛠 Server wroking");

  let html =
    '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Caching</title></head><body>';

  html += "<h1>Hello from server!!!</h1>";
  html += "</body></html>";

  res
    .status(200)
    .setHeader("Cache-Control", "max-age=5, s-maxage=20")
    .setHeader("Content-Type", "text/html; charset=utf-8")
    .send(html)
    .end();
});

express.listen(8081, () => {
  console.log("🚀 server up on port 8081");
});
