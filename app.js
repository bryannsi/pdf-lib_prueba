const pdf = require("./PdfDocument");
const express = require("express");
const  bodyParser = require('body-parser')
const app = express();
app.use(bodyParser.json())

const port = 3000;

app.get("/api/create/receipt/:id", async (req, res) => {
  try {
    // const id = req.body.id;
    const id = req.params.id;
    const document = await pdf.createPDF(id);
    res.statusCode = 200;
    res.type("pdf");
    res.set("Content-Length", String(Buffer.byteLength(document)));
    const pdfBuffer = Buffer.from(document.buffer, "binary");
    res.send(pdfBuffer);
  } catch (error) {
    res.contentType("json");
    res.statusCode = 500;
    res.json(error.message);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
