const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const file = "dod_character.pdf";

const createPDF = async () => {
  const formPdfBytes = fs.readFileSync(path.resolve(__dirname, `.\\${file}`));
  const pdfDoc = await PDFDocument.load(formPdfBytes);
  const form = pdfDoc.getForm();

  const ageField = form.getTextField("Age");
  const weightField = form.getTextField("Weight");

  const nameField = form.getTextField("CharacterName 2");
  nameField.setText("Bryan");
  ageField.setText("26");
  weightField.setText("83");

  const fields = getAcroForm(form);
  flatAcroForm(fields);

  const pdfBytes = await pdfDoc.save();
  const name = `test${Date.now()}.pdf`;

  fs.writeFileSync(`./${name}`, pdfBytes);

  return pdfBytes;
};

const flatAcroForm = (fields) => {
  fields.forEach((field) => {
    //let type = field.constructor.name;
    // let name = field.getName();
    field.enableReadOnly();
  });
};

const getAcroForm = (form) => {
  const validTypes = ["PDFTextField"];
  const fields = form.getFields();
  let fieldList = [];
  fields.forEach((field) => {
    if (field && validTypes.includes(field.constructor.name))
      fieldList.push(field);
  });
  return fieldList;
};

exports.createPDF = createPDF;
