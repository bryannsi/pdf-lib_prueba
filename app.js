const pdf = require("./PdfDocument");
const express = require("express");
const app = express();
const port = 3000;

app.get("/", async (req, res) => {
  try {
    const document = await pdf.createPDF();
    res.statusCode = 200;

    res.type("pdf");
    res.set("Content-Length", String(Buffer.byteLength(document)));
    const pdfBuffer = Buffer.from(document.buffer, "binary");
    res.send(pdfBuffer);
  } catch (error) {
    res.contentType("json");
    res.json(error.message);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
