"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.sequelize.query("drop schema if exists elg_search cascade; create schema elg_search;").then(() => {
      queryInterface.createTable({ schema: "elg_search", tableName: "PointSourceCategory" }, {
        pointSourceCategoryCode: {
          type: Sequelize.INTEGER,
          allowNull: false,
          field: "psc_code",
          primaryKey: true
        },
        cfrPart: {
          type: Sequelize.STRING,
          allowNull: false,
          field: "cfr_part"
        },
        pointSourceCategoryName: {
          type: Sequelize.STRING,
          allowNull: false,
          field: "psc_name"
        },
        cfrNotes: {
          type: Sequelize.STRING,
          allowNull: true,
          field: "cfr_notes"
        },
        narrativeHistory: {
          type: Sequelize.STRING,
          allowNull: true,
          field: "narrative_history"
        },
        sourceId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          field: "source_id"
        },
        initialPromulgationDate: {
          type: Sequelize.INTEGER,
          allowNull: false,
          field: "initial_promulgation_date"
        },
        includeInSearchTool: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          field: "IncludeInSearchTool",
          defaultValue: false
        }
      });
    }),
  down: (queryInterface) => queryInterface.dropTable({ schema: "elg_search", tableName: "PointSourceCategory" })
};
