const { PDFDocument } = require("pdf-lib");
const pdfData = require("./pdf.model");
const templateConfig = require("./template.json");

const fs = require("fs");
const path = require("path");
const file = "pdfeditable.pdf";

const createPDF = async () => {
  const filePath = path.normalize(path.join(__dirname, file));
  const formPdfBytes = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(formPdfBytes);
  const form = pdfDoc.getForm();

  let [detailData, headerData] = await Promise.all([pdfData.getDetail(5), pdfData.getHeader(5)]);

  const receiverId = headerData.idreceptor;
  const senderId = headerData.idemisor;

  let receiverData,
    senderData = null;
  if (receiverId && senderId) {
    [receiverData, senderData] = await Promise.all([
      pdfData.getReceiver(receiverId),
      pdfData.getSender(senderId),
    ]);
  }
  const fields = getAcroForm(form);

  setData(templateConfig.estructura.datos.encabezado, form, headerData, fields);
  setData(templateConfig.estructura.datos.emisor, form, senderData, fields);
  setData(templateConfig.estructura.datos.receptor, form, receiverData, fields);
  setData(templateConfig.estructura.datos.resumen, form, headerData, fields);
  setDetail(templateConfig.estructura.datos.detalle, form, detailData);

  flatAcroForm(fields);
  const pdfBytes = await pdfDoc.save();
  writeFile(pdfBytes, headerData.consecutivo);

  return pdfBytes;
};

const flatAcroForm = (fields) => {
  fields.forEach((field) => {
    field.enableReadOnly();
  });
};

const writeFile = (pdfBytes, name) => {
  const newFileName = `${name}_${new Date().getMilliseconds()}.pdf`;

  fs.writeFileSync(`./${newFileName}`, pdfBytes);
};

const getAcroForm = (form) => {
  const validTypes = ["PDFTextField"];
  const fields = form.getFields();
  const detailFields = [];
  let fieldList = [];
  let counter = 0;
  let obj = {};
  fields.forEach((field) => {
    if (field && validTypes.includes(field.constructor.name)) {
      // if (field.getName().toString().startsWith("detalle")) {
      //   detailFields.push(field);
      //   // obj[`l${counter}`].
      //   counter++;
      // } else {
      // }
      fieldList.push(field);
    }
    // console.log(field.getName());
  });
  return fieldList;
};

const setData = (struct, form, data, fields) => {
  for (const key in struct) {
    if (struct.hasOwnProperty(key)) {
      const element = struct[key];
      let field = form.getTextField(element);
      let value = data[element] || "";
      field.setText(value.toString());
    }
  }
};

const setDetail = (struct, form, data) => {
  for (let rowNumber = 0; rowNumber < data.length; rowNumber++) {
    const element = struct[rowNumber];
    for (const key in element) {
      if (element.hasOwnProperty(key)) {
        const propertyName = element[key];
        const field = form.getTextField(key);
        const row = data[rowNumber];
        const value = row[propertyName] || "";
        field.setText(value.toString());
        console.log(`Linea: ${rowNumber + 1} ${propertyName} ${value}`);
      }
    }
  }
};

exports.createPDF = createPDF;
