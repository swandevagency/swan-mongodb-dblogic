module.exports = (db) => {
    return new Promise ( (resolve, reject ) => {
        //requiring the load schema function for each model
        const loadSchema = require('./modules/loadSchema'); 

        //requiring path and fs modules
        const path = require('path');
        const fs = require('fs');
        
        //joining path of directory 
        const modelsDirectory = path.join(`${process.cwd()}/src/database`, 'models');
        
        //passing directoryPath and callback function to create the db schemas
        fs.readdir(modelsDirectory, function (err, files) {
            //handling error
            if (err) {
                console.error('Models directory is required to initiate swan cms');
                reject(err);
            }
            files.forEach(function (file) {
                if (file.split('.')[1] === 'json') {
                    loadSchema(file, db, 'models');
                } 
            });
            resolve();
        });
    })
    
}