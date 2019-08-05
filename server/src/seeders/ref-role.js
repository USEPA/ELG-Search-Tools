module.exports = {
  up: (queryInterface) => {
    const records = [];
    records.push({
      code: 'PM',
      label: 'Project Manager',
    });
    records.push({
      code: 'MPC',
      label: 'Monitoring Program Coordinator',
    });
    records.push({
      code: 'PQAO',
      label: 'Program Quality Assurance Officer',
    });
    records.push({
      code: 'PFC',
      label: 'Project Field Coordinator',
    });
    records.push({
      code: 'PLC',
      label: 'Project Lab Coordinator',
    });
    records.push({
      code: 'DMC',
      label: 'Data Management Coordinator',
    });
    records.push({
      code: 'TAC',
      label: 'Technical Advisory Committee',
    });
    records.push({
      code: 'VOL',
      label: 'Volunteers',
    });
    return queryInterface.bulkInsert('RefRoles', records);
  },

  down: (queryInterface) => queryInterface.bulkDelete('RefRoles', null, {}),
};
