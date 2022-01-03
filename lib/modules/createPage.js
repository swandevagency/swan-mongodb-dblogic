
module.exports = (query, queryName, langs) => {

    return new Promise (async(resolve, reject) => {

        const pageAlreadyExists = await query(queryName).countDocuments();

        if(!pageAlreadyExists){

            const content = {};

            langs.forEach((lang) => {
                try {
                    const LocaleContent = query(`${queryName}_content`);
                    const localeContent = new LocaleContent({locale: lang});
                    await localeContent().save();
                    content[lang] = localeContent._id
                } catch (error) {
                    reject(error)
                }
            });

            try {

                const Page = query(queryName);
                const page = new Page(content);
                await page.save();
                resolve();

            } catch (error) {

                reject(error);
                
            }
        }

        const page = await query(pageName).findOne();
        const newPage = {}

        langs.forEach((lang) => {
            if (!page[lang]) {
                try {
                    const LocaleContent = query(`${queryName}_content`);
                    const localeContent = new LocaleContent({locale: lang});
                    await localeContent().save();
                    newPage[lang] = localeContent._id;
                } catch (error) {
                    reject(error);
                }
            }else{
                newPage[lang] = page[lang];
            }
        });

        try {
            await query(pageName).updateOne({_id: page._id}, newPage);
            resolve();
        } catch (error) {
            reject(error);
        }
        
    })
    
}