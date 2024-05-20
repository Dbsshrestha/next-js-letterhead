const express = require('express');
const path = require('path');
const app = express();
const port = 5000;
const { jsPDF } = require('jspdf');
const fs = require('fs');
const QRCode = require('qrcode');
const cors = require('cors');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const axios = require('axios');
const multer = require('multer');
const upload = multer();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/Letterhead',)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// MongoDB schema
const LetterheadSchema = new Schema({
  referenceNo: String,
  companyName: String,
  address: String,
  phone: String,
  selectedTitle: String,
  subject: String,
  content: String,
  signerName: String,
  signerPosition: String,
  logoBlob: Buffer,
  signatureBlob: Buffer,
  qrCodeData: String
});

const Letterhead = mongoose.model('Letterhead', LetterheadSchema);

const LetterheadPdfSchema = new Schema({
  referenceNo: String,
  companyName: String,
  address: String,
  phone: String,
  selectedTitle: String,
  subject: String,
  content: String,
  signerName: String,
  signerPosition: String,
  logoBlob: Buffer,
  signatureBlob: Buffer,
  qrCodeData: String,
  pdfTemplateBlob: Buffer
});

const LetterheadPdf = mongoose.model('LetterheadPdf', LetterheadPdfSchema);

app.use(express.json());
app.use(cors());

app.get('/api/generateReferenceNumber', (req, res) => {
  const referenceNo = 'REF' + Math.floor(Math.random() * 1000000);
  res.json({ referenceNo });
});

app.get('/api/retrieveReferenceNumber', (req, res) => {
  const referenceNo = 'REF' + Math.floor(Math.random() * 1000000);
  res.json({ referenceNo });
});

app.post('/api/generatePDF', upload.fields([{ name: 'logoFile', maxCount: 1 }, { name: 'signatureFile', maxCount: 1 }]), async (req, res) => {

  const formData = req.body;

  // Save data to MongoDB
  const letterhead = new Letterhead({
    referenceNo: formData.referenceNo,
    companyName: formData.companyName,
    address: formData.address,
    phone: formData.phone,
    selectedTitle: formData.selectedTitle,
    subject: formData.subject,
    content: formData.content,
    signerName: formData.signerName,
    signerPosition: formData.signerPosition,
    logoBlob: req.files.logoFile ? req.files.logoFile[0].buffer : undefined,
    signatureBlob: req.files.signatureFile ? req.files.signatureFile[0].buffer : undefined,
    qrCodeData: JSON.stringify(formData)
  });


  const doc = new jsPDF();

  if (letterhead.logoBlob) {
    const logoData = letterhead.logoBlob.toString('base64');
    doc.addImage(logoData, 'JPEG', 10, 10, 40, 40);
  }

  doc.setFontSize(18);
  doc.text(formData.companyName, 69, 20, { align: 'center' });

  doc.setFontSize(14);
  doc.text(formData.address, 73, 29, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`Phone: ${formData.phone}`, 69, 35, { align: 'center' });

  doc.setFontSize(12);
  doc.text(formData.referenceNo, 10, 60);
  doc.text(`Title: ${formData.selectedTitle}`, 10, 70);
  doc.text(formData.today, 160, 60);

  doc.text(formData.subject, 90, 80);
  doc.text(formData.content, 10, 100);

  if (letterhead.signatureBlob) {
    const signatureData = letterhead.signatureBlob.toString('base64');
    doc.addImage(signatureData, 'JPEG', 10, 230, 40, 40);
  }
  
  doc.text(formData.signerName, 10, 215);
  doc.text(formData.signerPosition, 10, 225);

  const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(formData));
  doc.addImage(qrCodeDataUrl, 'PNG', 160, 15, 30, 30);

  const pdfDataUrl = doc.output('datauristring');

  letterhead.save()
    .then(() => console.log('Data saved to MongoDB'))
    .catch(err => console.log(err));

  res.json({ pdfDataUrl, referenceNo: req.body.referenceNo });
});

app.post('/api/sendFormDataToServer', upload.fields([{ name: 'logoFile', maxCount: 1 }, { name: 'signatureFile', maxCount: 1 }, { name: 'pdfTemplateFile', maxCount: 1 }]), async (req, res) => {
  const formData = req.body;

  // Save data to MongoDB
  const letterheadPdf = new LetterheadPdf({
    referenceNo: formData.referenceNo,
    companyName: formData.companyName,
    address: formData.address,
    phone: formData.phone,
    selectedTitle: formData.selectedTitle,
    subject: formData.subject,
    content: formData.content,
    signerName: formData.signerName,
    signerPosition: formData.signerPosition,
    logoBlob: req.files.logoFile ? req.files.logoFile[0].buffer : undefined,
    signatureBlob: req.files.signatureFile ? req.files.signatureFile[0].buffer : undefined,
    qrCodeData: JSON.stringify(formData),
    pdfTemplateBlob: req.files.pdfTemplateFile ? req.files.pdfTemplateFile[0].buffer : undefined
  });

  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text(formData.Name, {
    x: 10,
    y: doc.internal.pageSize.getHeight() - 180,
    align: 'center'
  });

  doc.setFontSize(12);
  doc.text(formData.today, {
    x: 10,
    y: doc.internal.pageSize.getHeight() - 200
  });

  doc.setFontSize(14);
  doc.text(`Title: ${formData.selectedTitle}`, {
    x: 10,
    y: doc.internal.pageSize.getHeight() - 160
  });

  doc.setFontSize(12);
  doc.text(formData.subject, {
    x: 150,
    y: doc.internal.pageSize.getHeight() - 250
  });

  doc.text(formData.content, {
    x: 10,
    y: doc.internal.pageSize.getHeight() - 350
  });

  if (letterheadPdf.signatureBlob) {
    const signatureData = letterheadPdf.signatureBlob.toString('base64');
    doc.addImage(signatureData, 'JPEG', 10, 230, 40, 40);
  }

  doc.text(formData.signerName, {
    x: 10,
    y: 215
  });

  doc.text(formData.signerPosition, {
    x: 10,
    y: 225
  });

  const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(formData));
  doc.addImage(qrCodeDataUrl, 'PNG', 450, 620, 80, 80);

  const pdfDataUrl = doc.output('datauristring');

  letterheadPdf.save()
    .then(() => console.log('PDF Template saved to MongoDB'))
    .catch(err => console.log(err));

  res.json({ pdfDataUrl, referenceNo: req.body.referenceNo });
});

app.get('/api/getLetterhead/:referenceNo', (req, res) => {
  Letterhead.findOne({ referenceNo: req.params.referenceNo })
    .then(letterhead => res.json(letterhead))
    .catch(err => console.log(err));
});

app.get('/api/getLetterheadPdf/:referenceNo', (req, res) => {
  LetterheadPdf.findOne({ referenceNo: req.params.referenceNo })
    .then(letterheadPdf => res.json(letterheadPdf))
    .catch(err => console.log(err));
});


console.log(`Attempting to listen on port ${port}`);
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
