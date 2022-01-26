const fetch = require('node-fetch');
const chokidar = require('chokidar');
require('dotenv').config();
const updateFunctions = async () => {
  try {
    fetch('http://localhost:9925', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Basic ${process.env.HDB_AUTH}`,
      },
      body: JSON.stringify({ operation: 'restart_service', service: 'custom_functions' }),
    });
    console.log('Custom Functions Updated');
  } catch (error) {
    console.error(error);
  }
};

chokidar.watch('./api/**/*.js').on('change', () => {
  updateFunctions();
});
