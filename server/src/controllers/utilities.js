const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

function sanitizeError(error) {
  return DOMPurify.sanitize(error);
}

function getControlTechnologyDescription(controlTechnologyCode)  {
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

module.exports = {
  sanitizeError,
  getControlTechnologyDescription
};
