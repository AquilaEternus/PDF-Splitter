import { PDFDocument } from '../node_modules/pdf-lib/dist/pdf-lib.esm.js';
const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);

class HandlePDF {
   /*Copy a specified range of pages from a single PDF document*/
   static async copyPages(srcPdfName, pageIndex, range) {
      const srcPdfBytes = await readFile(srcPdfName);
      const pdfDoc = await PDFDocument.create();
      const srcPdf = await PDFDocument.load(srcPdfBytes);
      // Copy specified range of pages to pdfDoc
      const endIndex = pageIndex + range;
      for (let i = pageIndex; i < endIndex; i++) {
         let [srcPdfPage] = await pdfDoc.copyPages(srcPdf, [i]);
         pdfDoc.addPage(srcPdfPage);
      }
      const newPdfBytes = await pdfDoc.save();
      return newPdfBytes;
   }

   /*Merge the copies of two PDF files together*/
   static async mergePdfs(srcPdfName1, srcPdfName2) {
      const srcPdfBytes1 = await readFile(srcPdfName1);
      const srcPdfBytes2 = await readFile(srcPdfName2);
      const pdfDoc1 = await PDFDocument.load(srcPdfBytes1);
      const pdfDoc2 = await PDFDocument.load(srcPdfBytes2);
      const newPdfDoc = await PDFDocument.create();
      // Add all pages of first src pdf to new pdf
      let numOfPages = pdfDoc1.getPages().length;
      for (let i = 0; i < numOfPages; i++) {
         let [pdf1Page] = await newPdfDoc.copyPages(pdfDoc1, [i]);
         newPdfDoc.addPage(pdf1Page);
      }
      // Add all pages of first src pdf to new pdf
      numOfPages = pdfDoc2.getPages().length;
      for (let i = 0; i < numOfPages; i++) {
         let [pdf2Page] = await newPdfDoc.copyPages(pdfDoc2, [i]);
         newPdfDoc.addPage(pdf2Page);
      }
      const newPdfBytes = await newPdfDoc.save();
      return newPdfBytes;
   }
}

//HandlePDF.copyPages('sample.pdf', 0, 1).then((result) => {
   //fs.writeFileSync('newfile.pdf', result);
   //console.log(result)
//});
// HandlePDF.mergePdfs('newfile1.pdf', 'newfile2.pdf').then((result) => {
//    fs.writeFileSync('newfile.pdf', result);
// });

export default HandlePDF;
