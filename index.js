class dbLogic {

    constructor(dbConfig) {
        // connecting to the database (mongodb)
        const mongoose = require('mongoose');
        this.db = mongoose;
        this.dbConfig = dbConfig;
    }

    testDbConfig(){
        if (!this.dbConfig.dbURI) return false;
        return true;
    }

    loadSchemas(){

        return new Promise( async(resolve, reject) => {

            try {

                await require('./lib/loadModels')(this.db);
                await require('./lib/loadPages')(this.db);
                resolve();

            } catch (error) {

                reject(error);

            }
        });
        
    }

    loadDbLogic() {
        return new Promise(async(resolve, reject) => {

            try {

                await require("./lib/loadDbLogic")(db);
                resolve();

            } catch (error) {

                reject(error);

            }

        })
        
    }
    
    loadServices(){

        return new Promise(async(resolve, reject) => {

            try {

                await require('./lib/loadServices')();
                resolve();

            } catch (error) {

                reject(error);

            }

        })

    }

    connectToDb (){

        return new Promise(async(resolve, reject) => {

            try {

                // validating database configurations
                if(!this.testDbConfig) process.exit();
        
                //loading the schemas
                await this.loadSchemas();

                //connecting to the database
                const db = this.db;
                db.Promise = global.Promise;
                db.Query.prototype.pagesCreated = false;
                
                //loading swan cms database logic
                await this.loadDbLogic(db, swan.config.langs);
                //loading the services
                await this.loadServices(db);
                
                await db.connect(this.dbConfig.dbURI);
                
                //loading the models specified in pages directory
                await this.createPages(this.query, swan.config.langs);
                db.Query.prototype.pagesCreated = true;

                resolve();

            } catch (error) {

                reject(error);

            }

        });
    }

    query(query){
        const mongoose = require('mongoose');
        return mongoose.model(query);
    }

}
module.exports = dbLogic
