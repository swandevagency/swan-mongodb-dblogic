module.exports = (fileName, db, baseURI) =>  {
    const {langs} = swan.keys.dbConfig ;
    const { Schema } = db;
    // creating a function for accessing each file
    const getFile = (fileName, baseURI) => {
        return require.main.require(`./src/database/${baseURI}/${fileName}`)(Schema);
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
            const dynamicModelSchema = new Schema(file.dynamic, {modelType: 'model_content', modelName: `${fileName.split('.')[0]}_content`});
            db.model(`${fileName.split('.')[0]}_content`, dynamicModelSchema)
            file.static.content = setDynamicContent(fileName);
        }
        
        const modelSchema = new Schema(file.static, {modelType: 'model', modelName: `${fileName.split('.')[0]}`});
        db.model(fileName.split('.')[0], modelSchema);

    }else{

        if(file.static || file.dynamic) return;

        file.locale = {
            type: "String",
            required: true
        }


        const pageContentSchema = new Schema(file, {modelType: 'page_content', modelName: `${fileName.split('.')[0]}_content`});

        db.model(`${fileName.split('.')[0]}_content`, pageContentSchema)

        const pageSchema = new Schema(setDynamicContent(fileName), {modelType: 'page', modelName: fileName.split('.')[0]});

        db.model(fileName.split('.')[0], pageSchema);

    }
}