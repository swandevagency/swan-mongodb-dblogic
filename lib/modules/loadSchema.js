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
            file.dynamic.refTo = {
                type: Schema.Types.ObjectId,
                ref: baseURI,
                required: true
            };
            file.dynamic.locale = {
                type: "String",
                required: true
            }
            file.dynamic.deleted = {
                type: "Boolean",
                default: false
            }
            const dynamicModelSchema = new Schema(file.dynamic, {modelType: 'model_content'});
            db.model(`${fileName.split('.')[0]}_content`, dynamicModelSchema)
            file.static.content = setDynamicContent(fileName);
        }

        file.static.deleted = {
            type: "Boolean",
            default: false
        }
        
        const modelSchema = new Schema(file.static, {modelType: 'model'});
        db.model(fileName.split('.')[0], modelSchema);

    }else{

        if(file.static || file.dynamic) return;

        file.locale = {
            type: "String",
            required: true
        }

        const pageContentSchema = new Schema(file, {modelType: 'page_content'});

        db.model(`${fileName.split('.')[0]}_content`, pageContentSchema)

        const pageSchema = new Schema(setDynamicContent(fileName), {modelType: 'page', modelName: fileName.split('.')[0]});

        db.model(fileName.split('.')[0], pageSchema);

    }
}