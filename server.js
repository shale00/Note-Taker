const express = require('express');
const path = require('path');
const fs = require('fs');
const { error } = require('console');

const PORT = process.env.PORT || 3001;

const app = express();

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static('public'));


//Express.js route for '/notes'    
app.get('/notes', (req, res) => 
    res.sendFile(path.join(__dirname, '/public/notes.html')));

// Fallback route for when a user attempts to visit routes that don't exist
app.get('*', (req, res) => 
    res.sendFile(path.join(__dirname, '/public/index.html')));    


//Post request to add a Note
app.post('/notes', (req, res) => {
    //Log that post request was received
    console.info(`${req.method} request received to add a note`);

    //Deconstructuring assignment for the items in req.body
    const { title, text } = req.body;

    // Prepare a response object to send back to the client
    // let response;

    //Check if there is anything in the response body
    if (title && text) {
        const newNote = {
            title,
            text
        };

        //Obtain existing notes
        fs.readFile('./db/notes.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
            } else {

                console.log(req.body);

                //Convert string into JSON object
                const parsedNotes = JSON.parse(data);

                // Convert the data to a string so we can save it
                // const noteString = JSON.stringify(newNote);

                //Add new note
                parsedNotes.push(newNote);

                //Write updated notes back to the file
                fs.writeFile(
                    './db/notes.json',
                    JSON.stringify(parsedNotes, null, 2),
                    (writeErr) =>
                      writeErr
                      ? console.error(err)
                      : console.log('Successfully added note!')
                );
            }
        });
        
        const response = {
            status: 'success',
            body: newNote,
        };

        console.log(response);
        res.status(201).json(response);
    } else {
        res.status(500).json('Must include a title and text!');
    }
});


//Listener for incoming connections to the specified port
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}🚀`)
);