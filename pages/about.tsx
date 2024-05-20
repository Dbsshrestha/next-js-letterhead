'use client';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Form, Button, ButtonGroup, Row, Col ,Modal} from 'react-bootstrap';
import { Editor } from '@tinymce/tinymce-react';
import QRCode from 'qrcode.react';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import '../style/about.css';
import { FaRegWindowClose } from "react-icons/fa";


interface FormData {
  [key: string]: string | File | undefined;
  referenceNo: string;
  companyName: string;
  address: string;
  phone: string;
  subject: string;
  content: string;
  signerName: string;
  signerPosition: string;
  today: string;
  selectedTitle: string;
  logoFile?: File;
  signatureFile?: File;
  pdfTemplateFile?: File;
}


const about = () => {
  const [referenceNo, setReferenceNo] = useState('null');
  const [logo, setLogo] = useState<File | undefined>(undefined);
  const [signature, setSignature] = useState<File | undefined>(undefined);  
  const [phone, setPhone] = useState('');
  const [signerName, setSignerName] = useState('');
  const [signerPosition, setSignerPosition] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pdfTemplate, setPdfTemplate] = useState<File | undefined>(undefined);
  
  useEffect(() => {
    const retrieveReferenceNumber = async () => {
      const response = await fetch('http://localhost:5000/api/generateReferenceNumber');
      const data = await response.json();
      setReferenceNo(data.referenceNo);
    };
  
    retrieveReferenceNumber();
  }, []);
  
const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files ? e.target.files[0] : null;
  if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
    setLogo(file);
  } else {
    alert('Please select a valid image file (JPEG or PNG)');
  }
};

const handleSignatureChange = (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files ? e.target.files[0] : null;
  if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
    setSignature(file);
  } else {
    alert('Please select a valid image file (JPEG or PNG)');
  }
};

const handlePDFTemplateChange = (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files ? e.target.files[0] : null;
  if (file && file.type === 'application/pdf') {
    setPdfTemplate(file);
  } else {
    alert('Please select a valid PDF file');
  }
};

  
const sendFormDataToServer = async () => {
  const formData = new FormData();
  formData.append('referenceNo', referenceNo);
  formData.append('companyName', companyName);
  formData.append('address', address);
  formData.append('phone', phone);
  formData.append('subject', subject);
  formData.append('content', content);
  formData.append('signerName', signerName);
  formData.append('signerPosition', signerPosition);
  formData.append('today', today);
  formData.append('selectedTitle', selectedTitle);
  if (logo) {
    formData.append('logoFile', logo);
  }
  if (signature) {
    formData.append('signatureFile', signature);
  }

  if (pdfTemplate) {
    formData.append('pdfTemplateFile', pdfTemplate);
  }

  const response = await fetch('http://localhost:5000/api/generatePDF', {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();

  // Handle server response here
  console.log('Server response:', data);

  const a = document.createElement('a');
  a.href = data.pdfDataUrl;
  a.download = `${data.referenceNo}.pdf`;
  a.click();
};
  
  
const handleGenerateQR = () => {
  const doc = new jsPDF();
  const formData: FormData = {
    referenceNo,
    logo: logo ? logo.name : '',
    companyName,
    address,
    phone,
    subject,
    content,
    signature: signature ? signature.name : '',
    signerName,
    signerPosition,
    today,
    selectedTitle
  };

  let textValue = '';
  for (const key in formData) {
    textValue += `${key}: ${formData[key]}\n`;
  }

  setQrValue(textValue);
  setShowDownloadButton(true);
  setShowModal(true);
};

  
  const today = new Date().toISOString().slice(0, 10);

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setPhone(value);
  };

  const [selectedTitle, setSelectedTitle] = useState("");

  const handleTitleButtonClick = (title: string) => {
    setSelectedTitle(title);
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted!');
  };

  return (
    <div className="form-container">
      <h1 className="text-center text-3xl font-bold text-gray-700">Letterhead Form</h1>
      <Form onSubmit={handleFormSubmit}>
        <br/>

        <div className="flex space-x-4">
          <div className="w-1/2">
            <Form.Group controlId="formHorizontalReferenceNo" className="mb-4">
              <Form.Label className="font-bold mb-2 text-lg text-gray-700">Reference No:</Form.Label>
              <br/>
              <Form.Control type="text" value={referenceNo} readOnly className="p-2 rounded border border-gray-300 text-lg" />
            </Form.Group>
          </div>
          <div className="w-1/2 pl-28">
            <Form.Group controlId="formHorizontalTimestamp" className="mb-4">
              <Form.Label className="font-bold mb-2 text-lg text-gray-700">Timestamp:</Form.Label>
              <br/>
              <Form.Control type="text" value={today} readOnly className="p-2 rounded border border-gray-300 text-lg" />
            </Form.Group>
          </div>
        </div>

        <Form.Group controlId="formHorizontalLogo" className="mb-4">
          <Form.Label className="font-bold mb-2 text-lg text-gray-700">Company Logo:</Form.Label>
          <br/>
          <Form.Control type="file" accept="image/jpeg, image/png" onChange={handleLogoChange} required className="p-2 rounded border border-gray-300 text-lg" />
          {logo && <img src={URL.createObjectURL(logo)} alt="Logo" className="logo-preview" />}
        </Form.Group>

          <div className="flex space-x-4">
          <div className="w-1/2">
            <Form.Group controlId="formHorizontalTitle" className="mb-4">
              <Form.Label className="font-bold mb-2 text-lg text-gray-700">Title:</Form.Label>
              <div className="button-group-horizontal">
                <Button onClick={() => handleTitleButtonClick("Mr")} className={`button-style ${selectedTitle === "Mr" ? 'active' : ''}`}>Mr</Button>
                <Button onClick={() => handleTitleButtonClick("Mrs")} className={`button-style ${selectedTitle === "Mrs" ? 'active' : ''}`}>Mrs</Button>
                <Button onClick={() => handleTitleButtonClick("Ms")} className={`button-style ${selectedTitle === "Ms" ? 'active' : ''}`}>Ms</Button>
              </div>
            </Form.Group>
          </div>
          <div className="w-1/2 pl-28">
            <Form.Group controlId="formHorizontalCompanyName" className="mb-4">
              <Form.Label className="font-bold mb-2 text-lg text-gray-700">Company Name:</Form.Label>
              <br/>
              <Form.Control type="text" placeholder="Enter company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="p-2 rounded border border-gray-300 text-lg" />
            </Form.Group>
          </div>
        </div>

        <div className="flex space-x-4">
            <div className="w-1/2">
              <Form.Group controlId="formHorizontalAddress" className="mb-4">
                <Form.Label className="font-bold mb-2 text-lg text-gray-700">Address:</Form.Label>
                <br/>
                <Form.Control type="text" placeholder="Enter address" value={address} onChange={(e) => setAddress(e.target.value)} className="p-2 rounded border border-gray-300 text-lg" />
              </Form.Group>
            </div>
            <div className="w-1/2 pl-28">
              <Form.Group controlId="formHorizontalPhone" className="mb-4">
                <Form.Label className="font-bold mb-2 text-lg text-gray-700">Phone:</Form.Label>
                <br/>
                <Form.Control type="tel" placeholder="Enter phone number" value={phone} onChange={handlePhoneChange} className="p-2 rounded border border-gray-300 text-lg" />
              </Form.Group>
            </div>
          </div>
  
          <div className="w-full mb-4">
            <label htmlFor="formHorizontalSubject" className="font-bold mb-2 text-lg text-gray-700">Subject:</label>
            <br/>
            <input type="text" id="formHorizontalSubject" placeholder="Enter subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="p-2 rounded border border-gray-300 text-lg w-full" />
          </div>

          <Form.Group controlId="formHorizontalContent">
          <Form.Label className="font-bold mb-2 text-lg text-gray-700">Description:</Form.Label>
            <Editor
              apiKey="an20wm2xrsiy2x8klldb9l7qgrtpiekr1yt03j55ekrjs2h1"
              initialValue=""
              init={{
                height: 300,
                menubar: false,
                plugins: [
                  'advlist autolink lists link image charmap print preview anchor',
                  'searchreplace visualblocks code fullscreen',
                  'insertdatetime media table paste code help wordcount',
                ],
                toolbar:
                  'undo redo | formatselect | ' +
                  'bold italic backcolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
              }}
              value={content}
              onEditorChange={(content) => setContent(content)}
            />
          </Form.Group>
          <br/>

          <Form.Group controlId="formHorizontalSignature" className="mb-4">
            <Form.Label className="font-bold mb-2 text-lg text-gray-700">Signature:</Form.Label>
            <br/>
            <Form.Control type="file" accept="image/jpeg, image/png" onChange={handleSignatureChange} required className="p-2 rounded border border-gray-300 text-lg" />
            {signature && <img src={URL.createObjectURL(signature)} alt="Signature" className="signature-preview" />}
          </Form.Group>

          <Form.Group controlId="formHorizontalPDFTemplate" className="mb-4">
            <Form.Label className="font-bold mb-2 text-lg text-gray-700">PDF Template:</Form.Label>
            <br/>
            <Form.Control type="file" accept="application/pdf" onChange={handlePDFTemplateChange} required className="p-2 rounded border border-gray-300 text-lg" />
          </Form.Group>
              
        <div className="flex space-x-4">
            <div className="w-1/2">
              <Form.Group controlId="formHorizontalSignerName" className="mb-4">
                <Form.Label className="font-bold mb-2 text-lg text-gray-700">Name:</Form.Label>
                <br/>
                <Form.Control type="text" placeholder="Enter signer's name" value={signerName} onChange={(e) => setSignerName(e.target.value)} className="p-2 rounded border border-gray-300 text-lg" />
              </Form.Group>
            </div>
            <div className="w-1/2 pl-28">
              <Form.Group controlId="formHorizontalSignerPosition" className="mb-4">
                <Form.Label className="font-bold mb-2 text-lg text-gray-700">Position:</Form.Label>
                <br/>
                <Form.Control type="text" placeholder="Enter signer's position" value={signerPosition} onChange={(e) => setSignerPosition(e.target.value)} className="p-2 rounded border border-gray-300 text-lg" />
              </Form.Group>
            </div>
          </div>

        <Form.Group as={Row}>
        <Button type="submit" className='button-17 mr-4'>Submit</Button>
        <Button onClick={handleGenerateQR} className='button-17 mr-4'>Generate QR Code</Button>
        {showDownloadButton && 
          <Button onClick={sendFormDataToServer} className='button-17 mr-4'>Generate PDF</Button>
        }
      </Form.Group>
            <Modal className="sky-modal side-modal" show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header>
          <FaRegWindowClose onClick={() => setShowModal(false)} style={{ cursor: 'pointer', position: 'absolute', right: 10, top: 10 }} />
        </Modal.Header>
        <Modal.Body style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <p><strong>Here is your QR Code:</strong></p>
          <QRCode id="qrcode" value={qrValue} />
        </Modal.Body>
      </Modal>
      
        </Form>
        </div>
 );
}
export default about;
