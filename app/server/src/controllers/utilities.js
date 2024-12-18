const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

function sanitizeError(error) {
  // noinspection JSUnresolvedFunction
  return DOMPurify.sanitize(error, null);
}

function getControlTechnologyDescription(controlTechnologyCode) {
  switch (controlTechnologyCode) {
    case 'BPT':
      return 'Best Practicable Control Technology Currently Available';
    case 'BCT':
      return 'Best Conventional Pollutant Control Technology';
    case 'BAT':
      return 'Best Available Technology Economically Achievable';
    case 'NSPS':
      return 'New Source Performance Standards';
    case 'PSES':
      return 'Pretreatment Standards for Existing Sources';
    case 'PSNS':
      return 'Pretreatment Standards for New Sources';
    default:
      return controlTechnologyCode;
  }
}

function parseIdAsInteger(id) {
  if (isNaN(id)) {
    return null;
  }

  if (Number.isInteger(Number(id))) {
    return Number(id);
  } else {
    return null;
  }
}

function parseDownload(download) {
  return download ? download === 'true' : false;
}

module.exports = {
  sanitizeError,
  getControlTechnologyDescription,
  parseIdAsInteger,
  parseDownload,
};
