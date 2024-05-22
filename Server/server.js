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

app.use(express.json());
app.use(cors());

let referenceNumbers = [];

app.get('/api/generateReferenceNumber', (req, res) => {
  let referenceNo = 'REF' + Math.floor(Math.random() * 1000000);

  // Check if the generated reference number already exists
  while (referenceNumbers.includes(referenceNo)) {
    // Generate a new reference number if it already exists
    referenceNo = 'REF' + Math.floor(Math.random() * 1000000);
  }

  // Store the new unique reference number
  referenceNumbers.push(referenceNo);

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

app.get('/api/getLetterhead/:referenceNo', (req, res) => {
  Letterhead.findOne({ referenceNo: req.params.referenceNo })
    .then(letterhead => res.json(letterhead))
    .catch(err => console.log(err));
});

console.log(`Attempting to listen on port ${port}`);
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
