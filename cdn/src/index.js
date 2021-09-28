const express = require("express")();

express.get("/", async (_, res) => {
  console.log("🛠 Server wroking");

  await new Promise((resolve) => setTimeout(resolve, 5000));

  let html =
    '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="color-scheme" content="dark"><title>Caching</title></head><body>';

  html += "<h1>Hello from server!!!</h1><ul>";

  for (let i = 0; i < 1000; i++) {
    html += `<li>Item ${i + 1}</li>`;
  }

  html += "</ul></body></html>";

  console.log("✨ Server - Done");

  res
    .status(200)
    .setHeader(
      "Cache-Control",
      "max-age=5, s-maxage=20, stale-while-revalidate=20"
    )
    .setHeader("Content-Type", "text/html; charset=utf-8")
    .send(html)
    .end();
});

express.listen(8081, () => {
  console.log("🚀 server up on port 8081");
});
