module.exports = (db, langs) => {

    const exec = db.Query.prototype.exec;

    db.Model.prototype.save = async function () {

        if (!this.schema.options.modelType) {

            console.log("Something went wrong ! Please delete the node_modules directory and run 'npm i' command");
            process.exit();

        }

        switch (this.schema.options.modelType) {

            case "page":

                const pageAlreadyExists = await db.model(this.schema.options.modelName).countDocuments();

                if (pageAlreadyExists) {
                    console.log("Swan cms already created an entity for each model you created in the page directory.");
                    console.log("You can not have more than one entity for the models you create in the page page directory");
                    process.exit();
                    return;
                }

                await this.$save();

                break;
                
            case "page_content":
            
                if (db.Query.prototype.pagesCreated) {

                    console.log("You can not create any entety for page_content model types !");
                    console.log("If you don't have page_content entity for each model you created in Pages directory (and also for each lang you put into your config file inside the model you created) one of the following is true :");
                    console.log("1. You created a required field into your model which you shouldn't have");
                    console.log("2. There is an internal error going with swan-cms : ");
                    console.log("   In that case you can owerwrite the database functions in to the /src/database/service and contact us for help and let us solve the issue for others as well :)");
                    process.exit();
                    
                }

                await this.$save();

                break;

            case "model_content": 

                const {refTo, locale} = this

                if (!locale && !langs.includes(locale)) {
                    console.log("this language is not valid !");
                    process.exit();
                }

                if (!refTo) {
                    console.log("You have to specify the entity you want the model_content to be refrenced to !");
                    process.exit();
                }

                const mainModel = this.schema.options.modelName.slice("_")[0];
                
                if (!db.model(mainModel)) {
                    console.log("You can only create model_content models while there is a valid model attached to id");
                    process.exit();
                }

                const modelRefrencedTo = await db.model(mainModel).findOne({_id: refTo});
                if (!modelRefrencedTo) {
                    console.log("All model_content model types should refrence to a valid model_type");
                }
                
                const contentModelAlreadyExists = await db.model(this.schema.options.modelName).findOne({
                    locale,
                    refTo
                })

                if (contentModelAlreadyExists) {
                    console.log("The entety you refrenced model_content to already has model_content with this locale attached to it");
                }

                await this.$save();

                const content = {...modelRefrencedTo.content} || {}
                content[locale] = {
                    _id: this._id
                };

                await db.model(mainModel).updateOne({_id: refTo}, {
                    content
                });

                break;

            case "model":

                if (this.content) {
                    console.log("Swan cms will automaticly add every dynamic content you create in to the model you specify and you can't save a model with dynamic content attached to it !");
                    process.exit();
                }

                await this.$save();

                break;
            
            default:

                console.log("Something went wrong ! Please delete the node_modules directory and run 'npm i' command");
                process.exit();
                break;

        }
    }

    db.Query.prototype.exec = async function () {

        const validOporations = [

            "updateOne",
            "countDocuments",
            "findOne",
            "find",
            "deleteOne",

        ]

        if (!validOporations.includes(this.op)) {

            console.log("Invalid Oporation !");
            process.exit();

        }

        // making sure that _userProvidedOptions is valid
        if (!this.schema._userProvidedOptions || !this.schema._userProvidedOptions.modelType){

            console.log("Something went wrong ! Please delete the node_modules directory and run 'npm i' command");
            process.exit();

        }

        

        switch (this.schema._userProvidedOptions.modelType) {

            case "page":

                if(db.Query.prototype.pagesCreated && this.op === "updateOne"){

                    console.log("You can not use any other functions than find for the models you create in page directory");
                    process.exit();

                }

                if (this.op !== "findOne" && this.op !== "countDocuments" && this.op !== "updateOne"){

                    console.log("You can not use any other functions than find for the models you create in page directory");
                    process.exit();

                }

                return exec.apply(this, arguments);

                break;

            case "page_content": 

                if (this.op === 'deleteOne') {

                    console.log("Swan cms will automaticly remove the unwanted content attached to a page");
                    console.log("The following happens if you remove a language form the application");
                    process.exit();

                }

                return exec.apply(this, arguments);

                break;
            
            case "model_content":

                if (this.op === 'deleteOne') {

                    if (!db.Query.prototype.canDeleteModelContent) {

                        console.log("Swan-cms will automaticly remove the unwanted content attached to a model");
                        console.log("If you delete an entity swan-cms will automaticly remove the dynamic contet atached to it as well");
                        process.exit();

                    }else{

                        db.Query.prototype.canDeleteModelContent = false;
                        return exec.apply(this, arguments);

                    }

                }

                return exec.apply(this, arguments);

                break;
            
            case "model":

                if (this.op === "find" || this.op === "findOne") {
                    this._filters.deleted = false;
                }

                if(this._fields.content && this.op === 'updateOne'){
                    console.log("You can't update any the content field attached to a medel !");
                    process.exit();
                }

                if(this._fields.deleted && this.op === 'updateOne' ){

                    if (!db.Query.prototype.canDeleteModel) {

                        console.log("Use the deleteOne method to delete an entity");
                        process.exit();

                    }else{

                        db.Query.prototype.canDeleteModel = false;
                        return exec.apply(this, arguments);

                    }
                    
                }

                // overwrite the delete method

                if (this.op === "deleteOne") {
                    
                    const model = await this.model(this.schema._userProvidedOptions.modelName).findOne(this._filters);
                    
                    langs.forEach(async(lang) => {
                        if(model.content[lang]){
                            db.Query.prototype.canDeleteModelContent = true;
                            await this.model(`${this.schema._userProvidedOptions.modelName}_content`).updateOne({_id: model.content[lang]}, {
                                deleted: true
                            })
                        }
                    })
                    
                    db.Query.prototype.canDeleteModel = true
                    await this.model(this.schema._userProvidedOptions.modelName).updateOne(this._filters, {
                        deleted: true
                    })

                }

                return exec.apply(this, arguments);

                break;
        
            default:

                console.log("Something went wrong ! Please delete the node_modules directory and run 'npm i' command");
                process.exit();

                break;
        }
    }

}