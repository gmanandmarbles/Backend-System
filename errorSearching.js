const express = require('express');
const fs = require('fs');
const path = require('path');

// Specify the root directory you want to serve files from
const rootDirectoryPath = path.join(__dirname, 'errorreports');

module.exports = function (app) {
  // Serve static files from the specified directory
  app.use(express.static(rootDirectoryPath));

  // Serve an index page that includes files from subdirectories
  app.get('/browse', (req, res) => {
    // Function to recursively scan a directory and collect file paths
    function getFiles(dir, files_) {
      files_ = files_ || [];
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const name = path.join(dir, file);
        if (fs.statSync(name).isDirectory()) {
          getFiles(name, files_);
        } else {
          files_.push(name.replace(rootDirectoryPath, ''));
        }
      }
      return files_;
    }

    // Get all files in the root directory and its subdirectories
    const allFiles = getFiles(rootDirectoryPath);
    const filesByDate = {};
    allFiles.forEach(file => {
      const [date, filename] = file.split(path.sep).slice(1); // Use path.sep for cross-platform compatibility
      if (!filesByDate[date]) {
        filesByDate[date] = [];
      }
      filesByDate[date].push(filename);
    });
    const dateList = Object.keys(filesByDate).map(date => {
      const fileList = filesByDate[date].map(file => `<li><a href="/json/${date}/${file}">${file}</a></li>`).join('');
      return `<li>
                <span class="collapsible">${date}</span>
                <ul class="content">${fileList}</ul>
              </li>`;
    }).join('');
    // Send the HTML response
    res.send(`
  <!DOCTYPE html>
  <html>
    <head>
      <title>File List</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        h1 {
          color: #333;
        }
        label {
          margin-right: 10px;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          margin-bottom: 5px;
        }
        a {
          color: #0066cc;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        .collapsible {
          cursor: pointer;
          user-select: none;
        }
        .content {
          display: none;
          padding-left: 20px;
        }
        .active {
          display: block;
        }
      </style>
      <script>
        document.addEventListener("DOMContentLoaded", function() {
          var coll = document.getElementsByClassName("collapsible");
          var i;

          for (i = 0; i < coll.length; i++) {
            coll[i].addEventListener("click", function() {
              this.classList.toggle("active");
              var content = this.nextElementSibling;
              if (content.style.display === "block") {
                content.style.display = "none";
              } else {
                content.style.display = "block";
              }
            });
          }

          // Search functionality
          document.getElementById("searchBtn").addEventListener("click", function() {
            var errorId = document.getElementById("errorId").value;
            var fileLink = document.querySelector('a[href="/json/' + errorId + '"]');
            
            if (fileLink) {
              // Scroll to the found link or handle it as needed
              fileLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
              alert("Function not implemented properly yet!");
            }
          });
        });
      </script>
    </head>
    <body>
      <h1>Error searching endpoint.</h1>
      <label for="errorId">Search by Error ID:</label>
      <input type="text" id="errorId" name="errorId">
      <button id="searchBtn">Search</button>
      <ul>${dateList}</ul>
    </body>
  </html>
`);
  });

  app.get('/json/:date/:filename', (req, res) => {
    const { date, filename } = req.params;
    const filePath = path.join(rootDirectoryPath, date, filename);

    // Check if the file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).send('File not found');
      }

      // Read the file and send its content as JSON
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          return res.status(500).send('Error reading file');
        }

        try {
          const jsonData = JSON.parse(data);
          // Make the JSON response more human-readable with indentation
          const prettyJson = JSON.stringify(jsonData, null, 2);
          res.type('application/json').send(prettyJson);
        } catch (e) {
          res.status(500).send('Error parsing JSON');
        }
      });
    });
  });
};
