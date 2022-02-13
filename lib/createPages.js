const createPage = require("./modules/createPage");
module.exports = async (db, query, langs) => {
    return new Promise ((resolve, reject) => {
        
        //requiring path and fs modules
        const path = require('path');
        const fs = require('fs');
        
        //joining path of directory 
        const pagesDirectory = path.join(`${process.cwd()}/src/database`, '/pages');
        
        //passing directoryPath and callback function to create the db schemas
        fs.readdir(pagesDirectory, async(err, files) => {
            
            //handling error
            if (err) {
                console.log('Pages directory is required to initiate swan cms');
                reject(err);
            }
            try {
                
                files.forEach(async (file) => {
                    if (file.split('.')[1] === 'json') {
                        db.Query.prototype.pagesCreated = false;
                        await createPage(query, file.split('.')[0], langs);
                        db.Query.prototype.pagesCreated = true;
                    }
                });
                
                resolve();

            } catch (error) {
                reject(error);
            }
        });
    })
    
}