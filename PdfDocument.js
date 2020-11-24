const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const uri = "/var/www/html/pdf-lib_prueba/dod_character.pdf";

const createPDF = async () => {
  const formPdfBytes = fs.readFileSync(uri);
  const pdfDoc = await PDFDocument.load(formPdfBytes);
  const form = pdfDoc.getForm();
  const nameField = form.getTextField("CharacterName 2");
  const ageField = form.getTextField("Age");
  const weightField = form.getTextField("Weight");

  nameField.setText("Bryan");
  ageField.setText("26");
  weightField.setText("83");

  const pdfBytes = pdfDoc.save();
  const name = `test${Date.now()}.pdf`;

  fs.writeFileSync(`./${name}`, pdfBytes);

  return pdfBytes;
};

exports.createPDF = createPDF;
