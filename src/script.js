import HandlePDF from './handlepdf.js';
const { ipcRenderer } = require('electron');
const fs = require('fs');

// Materialize CSS initializtions
const instance = M.Tabs.init(document.querySelector('.tabs'), {
    swipeable: true
});

const downloadsDir = ipcRenderer.sendSync('get-downloads-path');
const splitFileInput = document.querySelector('#filePath');
const file1Input = document.querySelector('#file1Path');
const file2Input = document.querySelector('#file2Path');
const range = document.querySelector('#range');
const splitBtn = document.querySelector('#splitBtn');
const mergeBtn = document.querySelector('#mergeBtn');

/**
 * Splits a pdf into user defined ranges, and generates copies of these ranges.
 * @param {String} range Defines how to split the pdf.
 * @param {String} filePath Path of pdf to be split.
 */
function splitPdf(range, filePath) {
    createSpinner('split');
    const ranges = range.split(';')
    let count = 0;
    let milliSinceEpoch = new Date().valueOf()
    ranges.forEach((range) => {
        let [startIndex, end] = range.split('-');
        let currIndex = parseInt(startIndex, 10) - 1;
        let currRange = Math.abs(parseInt(end, 10) - currIndex);
        HandlePDF.copyPages(filePath, currIndex, currRange)
            .then((chunk) => {
                fs.writeFileSync(downloadsDir + '/' + `split_${count++}-${milliSinceEpoch}.pdf`, chunk);
            })
            .catch(err => {
                //console.log(err)
                removeSpinner();
                generateError("Invalid range given.", 'split');
            })
    })
    removeSpinner();
}

/**
 * Merges copies of two PDF files together and generates a new file based on the result.
 * @param {String} file1Path 
 * @param {String} file2Path 
 */
function mergePdf(file1Path, file2Path) {
    createLoader('merge');
    let milliSinceEpoch = new Date().valueOf()
    HandlePDF.mergePdfs(file1Path, file2Path)
        .then((result) => {
          fs.writeFileSync(downloadsDir + '/' + `merge-${milliSinceEpoch}.pdf`, result);
        })
        .catch(err => {
            //console.log(err);
            removeSpinner();
            generateError("Failed to merge documents.", 'merge');
        });
    removeSpinner();
}

/**
 * Adds a spinner to tab indicating that the split/merge is currently being processed.
 * @param {String} tabId 
 */
function createSpinner(tabId) {
    const loader = document.createElement('div');
    loader.id = 'loader';
    loader.className = "row center-align";
    loader.innerHTML = `
    <div class="preloader-wrapper big active">
        <div class="spinner-layer spinner-green-only">
        <div class="circle-clipper left">
            <div class="circle"></div>
        </div><div class="gap-patch">
            <div class="circle"></div>
        </div><div class="circle-clipper right">
            <div class="circle"></div>
        </div>
        </div>
    </div>`
    const tab = document.querySelector(`#${tabId}`);
    tab.append(loader);
}

/**
 * Removes spinner from dom if it exists.
 */
function removeSpinner() {
    setTimeout(() => {
        const loader = document.querySelector('#loader');
        if (loader) {
            loader.remove();
        } 
    }, 1500);  
}

/**
 * Returns true if a file or multiple files are of type pdf.
 * @param {Array} fileArr 
 */
function validatePDF(fileArr) {
    for (let file of fileArr) {
        if(file.type !== "application/pdf") {
            return false;
        }
    }
    return true;
}

/**
 * Dispplays to user a generic error banner when the program encounters an issue.
 * @param {String} message 
 * @param {String} tabId 
 */
function generateError(message, tabId) {
    const errorBanner = document.getElementById(`${tabId}Error`);
    errorBanner.innerText = message;
    errorBanner.classList.add('show');
    setTimeout(() => {
        errorBanner.innerText = '';
        errorBanner.classList.remove('show');
    }, 6000)
}

splitBtn.addEventListener('click', e => {
    e.preventDefault();
    if (validatePDF(splitFileInput.files)) {
        splitPdf(range.value, splitFileInput.files[0].path); 
    } else {
        generateError("Input file needs to be of type PDF.", 'split');
    }
})

mergeBtn.addEventListener('click', e => {
    e.preventDefault();
    if (validatePDF(file1Input.files) && validatePDF(file2Input.files)) {
        mergePdf(file1Input.files[0].path, file2Input.files[0].path)
    } else {
        generateError("Both input files need to be of type PDF.", 'merge');
    }
})