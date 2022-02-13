module.exports = (query, queryName, langs) => {

    return new Promise (async(resolve, reject) => {

        
        let page = await query(queryName).findOne();
        
        const PageContent = query(`${queryName}_content`);

        let content = {};

        // creating the page if it does not exists !

        if (!page) {
            const pageModel = query(queryName);
            const newPage = new pageModel({});
            await newPage.save();
            page = newPage;
        }

        langs.forEach(async(lang) => {
            if (!page[lang]) {
                const pageContent = new PageContent({locale: lang});
                content[lang] = pageContent._id
                await pageContent.save();
            }
        });

        await query(queryName).updateOne({_id: page._id}, {...content});
        resolve();
        
    })
    
}