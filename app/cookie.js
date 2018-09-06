const fs = require('fs');

const getCookiesFile = async () => {
    return new Promise(resolve => {
        fs.readFile('app/cookies.txt', { encoding: 'utf8' }, (err, data) => {
            if (!err) resolve(data);
            resolve('');
        })
    })
}

const getCookie = async (page) => {
    const cookiesAcc = await page.cookies('https://facebook.com');
    await fs.writeFile('app/cookies.txt', JSON.stringify(cookiesAcc), (err) => { });
}

module.exports = {
    getCookie,
    getCookiesFile
}