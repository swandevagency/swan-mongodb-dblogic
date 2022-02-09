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

    loadDbLogic(db, langs) {
        return new Promise(async(resolve, reject) => {

            try {

                await require("./lib/loadDbLogic")(db, langs);
                resolve();

            } catch (error) {

                reject(error);

            }

        })
        
    }

    createPages(query, langs, db) {
        
        return new Promise(async(resolve, reject) => {

            try {
                
                await require("./lib/createPages")(db, query, langs);
                
                resolve();

            } catch (error) {

                reject(error);

            }

        })
        
    }
    
    loadServices(db){

        return new Promise(async(resolve, reject) => {

            try {

                require.main.require(`./src/database/services/index.js`)(db);
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
                
                //loading swan cms database logic
                await this.loadDbLogic(db, swan.keys.dbConfig.langs);
                //loading the services
                await this.loadServices(db);
                
                await db.connect(this.dbConfig.dbURI);
                
                //loading the models specified in pages directory
                await this.createPages(this.query, swan.keys.dbConfig.langs, db);

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
