const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

let zipFiles = {}; 

app.post('/upload', upload.single('zipFile'), (req, res) => {
  const uniqueId = Date.now(); 
  zipFiles[uniqueId] = req.file.buffer; 

  const downloadUrl = `${req.protocol}://${req.get('host')}/download/${uniqueId}`;
  res.json({ downloadUrl });
});

app.get('/download/:id', (req, res) => {
  const fileId = req.params.id;

  if (zipFiles[fileId]) {
    res.setHeader('Content-Disposition', 'attachment; filename="downloaded_files.zip"');
    res.setHeader('Content-Type', 'application/zip');
    res.send(zipFiles[fileId]);
  } else {
    res.status(404).send('File not found');
  }
});

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
