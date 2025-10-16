const express = require('express');
const { readFile } = require('fs').promises;

const app = express();
/* Express Study 
app.get('URL', (request, response) => {
    });
request : incoming data from user
response: outgoing data
*/
app.get('/', async (request, response) =>{ 
    try{
    response.send( await  readFile('./test.html', 'utf8'));
    }    
    catch(err) {
    console.error('Error reading file:', err.message);
    response.status(500).send('sorry out of order')
    }
    });

app.listen(process.env.PORT || 3000, 
    () => console.log('app available on http://localhost:3000'))