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

const getCookie = async (page) => {
    const cookiesAcc = await page.cookies('https://facebook.com');
    await fs.writeFile('app/cookies.txt', JSON.stringify(cookiesAcc), (err) => { });
}

const isLoginFB = async (page) => {
    const response = await page.goto('https://facebook.com/settings');
    const chain = response.request().redirectChain();

    for (let i = 0, length = chain.length; i < length; i++) {
        const item = chain[i];
        const currentUrl = item.frame().url();
        if (currentUrl.indexOf('/login.php') !== -1) return false;
    }

    return true;
}

const loginFacebook = async (page) => {
    const cookies = await getCookiesFile();
    if (!!cookies) {
        const arrCookies = JSON.parse(cookies);
        await loginCookie(page, arrCookies);
    }

    const isLogin = await isLoginFB(page);

    if (!isLogin) {
        await page.goto('https://facebook.com');
        await loginAcc(page);
        await getCookie(page);
    } else {
        await page.goto('https://facebook.com');
    }
}


(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await loginFacebook(page);

    // const stories = await page.evaluate(() => {
    //     const profilePosts = Array.from(document.querySelectorAll(`.userContentWrapper span[data-ft='{"tn":"k"}'] a`));
    //     return profilePosts.dataset;
    // })

    await page.screenshot({
        path: screenshot,
        // fullPage: true
    })

    await browser.close();

    // await console.log(JSON.stringify(stories));
})();