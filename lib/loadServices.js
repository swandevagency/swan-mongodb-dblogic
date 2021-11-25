module.exports = () => {

    return new Promise ((resolve, reject) => {
        //requiring path and fs modules
        const path = require('path');
        const fs = require('fs');
        
        //joining path of directory 
        const modelsDirectory = path.join(`${process.cwd()}/src/database`, 'services');
        
        //passing directoryPath and callback function to require the services
        fs.readdir(modelsDirectory, function (err, files) {
            //handling error
            if (err) {
                console.log('Services directory is required to initiate swan cms');
                reject(err);
            }
            files.forEach(function (file) {
                if (file.split('.')[1] === 'js') {
                    require.main.require(`./src/database/services/${file}`);
                }
            });
            resolve();
        });
    })
    
}