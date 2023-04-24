const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 3001;

const app = express();

// Promise version of fs.readFile
const readFromFile = util.promisify(fs.readFile);

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// GET Route for homepage
app.get('/', (req, res) => 
    res.sendFile(path.join(__dirname, '/public/index.html')));

//Express.js route for '/notes'    
app.get('/notes', (req, res) => 
    res.sendFile(path.join(__dirname, '/public/notes.html')));

// GET request for notes
app.get('/api/notes', (req, res) => {
    const notes = readNotesFromDbFile();
    //Return notes array to the client
    res.json(notes);
});

//Post request to add a Note
app.post('/api/notes', (req, res) => {
    //Log that post request was received
    console.info(`${req.method} request received to add a note`);

    //Deconstructuring assignment for the items in req.body
    const { title, text } = req.body;

    //Check if there is anything in the response body
    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuidv4(),
        };

        //Obtain existing notes
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
            } else {

                console.log(req.body);

                //Convert string into JSON object
                const parsedNotes = JSON.parse(data);

                //Add new note
                parsedNotes.push(newNote);

                //Write updated notes back to the file
                fs.writeFile(
                    './db/db.json',
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
        res.status(201).json(newNote);
    } else {
        res.status(500).json('Must include a title and text!');
    }
});

// app.delete('/api/notes/:id', (req, res) => {
//     const noteId = req.params.id;
//     readFromFile('./db/db.json')
//       .then((data) => JSON.parse(data))
//       .then((json) => {
//       // Make a new array of all notes except the one with the ID provided in the URL
//       const result = json.filter((note) => note.id !== noteId);

//       // Save that array to the filesystem
//       readFromFile('./db/db.json', result);

//       // Respond to the DELETE request
//       res.sendStatus(204);
//       });
// });

app.delete('/api/notes/:id', (req, res) => {
    const { id } = req.params;

    let notes = readNotesFromDbFile();
    notes = notes.filter((note) => note.id !== id);
    writeNotesToDbFile(notes);

    res.sendStatus(204);
})

// Fallback route for when a user attempts to visit routes that don't exist
app.get('*', (req, res) => 
    res.sendFile(path.join(__dirname, '/public/index.html')));
    
    
//Read notes function
function readNotesFromDbFile() {
    //Read current notes from db.json file
    const dbFilePath = path.join(__dirname, './db/db.json');
    const dbContent = fs.readFileSync(dbFilePath, 'utf8');
    return JSON.parse(dbContent);
}

//Write notes function
function writeNotesToDbFile(notes) {
    const dbFilePath = path.join(__dirname, './db/db.json');
    fs.writeFileSync(dbFilePath, JSON.stringify(notes));
}

//Listener for incoming connections to the specified port
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}🚀`)
);