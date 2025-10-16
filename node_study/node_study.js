const express = require('express');
const { readFile } = require('fs');

const app = express();
/* Express Study 
app.get('URL', (request, response) => {
    });
request : incoming data from user
response: outgoing data
*/
app.get('/', (request, response) =>{
  readFile('./test.html', 'utf8', (err, html) => { 
        if (err) {
            response.status(500).send('sorry out of order')
        }
        response.send(html);
    })
});

app.listen(process.env.PORT || 3000, () => console.log('app available on http://localhost:3000'))