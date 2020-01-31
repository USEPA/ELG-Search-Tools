const PointSourceCategory = require('../models').PointSourceCategory;
const PointSourceSubcategory = require('../models').PointSourceSubcategory;
const Op = require('sequelize').Op;

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

function sanitizeError(error) {
  return DOMPurify.sanitize(error);
}

module.exports = {
  list(req, res) {
    try {
      return PointSourceCategory.findAll({
        attributes: ['pointSourceCategoryCode', 'pointSourceCategoryName'],
        where: {
          includeInSearchTool: { [Op.eq]: true },
        },
        order: ['pointSourceCategoryCode'],
      })
        .then((pointSourceCategories) => {
          res.status(200).send(pointSourceCategories);
        })
        .catch((error) => res.status(400).send('Error! ' + sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + sanitizeError(err.toString()) + typeof req.query.keyword);
    }
  },
  /**
   * @param {
   *          {id:number}
   * } req.params
   */
  read(req, res) {
    // check for required query attributes and replace with defaults if missing
    try {
      let pointSourceCategoryCode = req.params.id ? req.params.id : 0;

      return PointSourceCategory.findAll({
        attributes: ['pointSourceCategoryCode', 'pointSourceCategoryName'],
        where: {
          pointSourceCategoryCode: { [Op.eq]: pointSourceCategoryCode },
        },
      })
        .then((pointSourceCategory) => {
          let result = new Map();
          result['pointSourceCategoryCode'] = pointSourceCategory[0].pointSourceCategoryCode;
          result['pointSourceCategoryName'] = pointSourceCategory[0].pointSourceCategoryName;

          PointSourceSubcategory.findAll({
            attributes: ['id', 'pointSourceSubcategoryCode', 'pointSourceSubcategoryTitle', 'comboSubcategory'],
            where: {
              pointSourceCategoryCode: { [Op.eq]: pointSourceCategoryCode },
            },
            order: ['pointSourceSubcategoryCode'],
          })
            .then((pointSourceSubcategories) => {
              result['pointSourceSubcategories'] = pointSourceSubcategories;

              res.status(200).send(result);
            })
            .catch((error) => res.status(400).send('Error! ' + sanitizeError(error)));
        })
        .catch((error) => res.status(400).send('Error! ' + sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + sanitizeError(err.toString()) + typeof req.query.keyword);
    }
  },
};
