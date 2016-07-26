'use strict';

const electron = require('electron');
const remote = electron.remote;
const mainProcess = remote.require('./index');

let selectedFile = '';

const showViolationsFromData = (data) => {
  let json_data = JSON.parse(data);
  let files_info = json_data.pmd.file;
  let violationsList = getAllViolations(files_info);
  let violationsTable = getViolationsTable(violationsList);
  document.getElementById('error-message-container').innerHTML = violationsTable;
}

window.onload = _ => {
  // call openLastFile
  mainProcess.openLastFile((data) => {
    showViolationsFromData(data);
  });
}

document.getElementById('chooseFile').addEventListener('click', _ => {
  mainProcess.chooseFile((fileName) => {
    selectedFile = fileName;
    if (selectedFile) {
      mainProcess.parseFile(selectedFile[0], (data) => {
        showViolationsFromData(data);
      }); 
    }
  });
});

/**
* A Violation class holds all the information about each error and/or warning generated by the Quality Check Plugin. 
*/
class Violation {
  constructor(fileName, className, beginningLine, description) {
    this.fileName = fileName;
    this.className = className;
    this.beginningLine = beginningLine;
    this.description = description;
  }
}

/**
* This method returns an Array of Violations.
*/
const getAllViolations = (fileInfoList) => {

  let violationsList = new Array();

  for (let fi in fileInfoList) {

      let fileName = fileInfoList[fi].$.name;
      let errorsInFile = fileInfoList[fi].violation;
      console.log("File ======= " + fileName);
      
      for (let i=0; i<errorsInFile.length;i++) {
        let error = errorsInFile[i];
        console.log(error);
        let violation = new Violation(fileName, error.$.class, error.$.beginline, error._);
        violationsList.push(violation);
      } 

  }

  return violationsList;
}

/*
  This method returns the completely built Violations Table from the Violations List
  passed to it. This method has been abstracted out in order to keep the view logic 
  separate.
*/
const getViolationsTable = (violationsList) => {
    let html = '';
    for (let i=0;i<violationsList.length;i++) {
      let violation = violationsList[i];
      html += '<div id="error-message">';
      html += '<h5>' + violation.fileName + '</h5>';
      html += '<table border="1" cellspacing="0" cellpadding="0"><tr><th>ClassName</th><th>Line Number</th><th>Error Message</th></tr>';
      html += '<tr>';
      html += '<td class="error-class">' + violation.className + '</td>';
      html += '<td class="error-beginline">' + violation.beginningLine + '</td>';
      html += '<td class="error-desc">' + violation.description + '</td>';
      html += '</tr>';
      html += '</table>';
      html += '</div>';
    }
    return html;
}
