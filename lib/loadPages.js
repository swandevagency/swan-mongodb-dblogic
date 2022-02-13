module.exports = (db) => {
    return new Promise ((resolve, reject) => {
        //requiring the load schema function for each model
        const loadSchema = require('./modules/loadSchema'); 
    
        //requiring path and fs modules
        const path = require('path');
        const fs = require('fs');
        
        //joining path of directory 
        const pagesDirectory = path.join(`${process.cwd()}/src/database`, '/pages');
        
        //passing directoryPath and callback function to create the db schemas
        fs.readdir(pagesDirectory, function (err, files) {
            
            //handling error
            if (err) {
                console.log('Pages directory is required to initiate swan cms');
                reject(err);
            }
            
            files.forEach(function (file) {
                if (file.split('.')[1] === 'js') {
                    loadSchema(file, db, 'pages');
                }
            });
            resolve();
        });
    })
    
}