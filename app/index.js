const puppeteer = require('puppeteer');
const fs = require('fs');
const userNameFacebook = 'barry.alen.39142072';
const passwordFacebook = 'qwertyuiop0987654321';
const screenshot = 'demo_screenshot.png';

const randomTime = (min = 0, max = 1000) => {
    const resultTime = Math.random() * (max - min) + min;
    return Math.round(resultTime);
}

const loginAcc = async (page) => {
    await page.type('input#email', userNameFacebook, { delay: 300 });
    await page.type('input#pass', passwordFacebook, { delay: 300 });
    await page.click('[data-testid="royal_login_button"]');
    await page.waitForNavigation();
    await page.goto('https://facebook.com');
}

const loginCookie = async (page, cookies) => {
    cookies.map(async cookie => {
        await page.setCookie(cookie);
    })
}

const getCookiesFile = async () => {
    return new Promise(resolve => {
        fs.readFile('app/cookies.txt', { encoding: 'utf8' }, (err, data) => {
            if (!err) resolve(data);
            resolve('');
        })
    })
}

const loginFacebook = async (page) => {
    const cookies = await getCookiesFile();
    if (!!cookies) {
        const arrCookies = JSON.parse(cookies);
        loginCookie(page, arrCookies);
    } else {
        loginAcc(page);
    }
}


(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://facebook.com');


    await page.goto('https://facebook.com');

    const cookiesAcc = await page.cookies('https://facebook.com');

    const stories = await page.evaluate(() => {
        const profilePosts = Array.from(document.querySelectorAll(`.userContentWrapper span[data-ft='{"tn":"k"}'] a`));
        return profilePosts.dataset;
    })

    await page.screenshot({
        path: screenshot,
        // fullPage: true
    })

    await browser.close();

    await console.log(JSON.stringify(stories));
    // await fs.writeFile('app/cookies.txt', JSON.stringify(cookiesAcc), (err) => {});
})();