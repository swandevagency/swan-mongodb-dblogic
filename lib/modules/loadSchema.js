const {langs} = swan.keys.dbConfig ;
const { Schema } = require('mongoose');
// creating a function for accessing each file
const getFile = (fileName, baseURI) => {
    return require.main.require(`./src/database/${baseURI}/${fileName}`)
}

const setDynamicContent = (fileName) => {
    const model = fileName.split('.')[0];
    const dynamic = {}
    langs.forEach((item) => {
        dynamic[item] = {
            type: Schema.Types.ObjectId,
            ref: `${model}_content`,
        }
    });
    return dynamic;
}
module.exports = (fileName, db, baseURI) =>  {

    // Do whatever you want to do with the file
    if (fileName.split('.')[1] !== "json") {
        console.error(`You have to use json format in ${baseURI} directory`);
        process.exit();
    }
    
    const file = getFile(fileName, baseURI);
    
    if(baseURI === 'models'){

        if(!file.static) return;
        
        if(file.dynamic) {
            db.model(`${fileName.split('.')[0]}_content`, file.dynamic)
            file.static.content = setDynamicContent(fileName);
        }
        
        db.model(fileName.split('.')[0], file.static);

    }else{

        if(file.static || file.dynamic) return;

        db.model(`${fileName.split('.')[0]}_content`, file)

        const dynamicContent = setDynamicContent(fileName);

        db.model(fileName.split('.')[0], dynamicContent);

    }
}