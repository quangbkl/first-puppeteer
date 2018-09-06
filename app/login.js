const { getCookie, getCookiesFile } = require('./cookie');
const { randomTime } = require('./helper');

const userNameFacebook = 'barry.alen.39142072';
const passwordFacebook = 'qwertyuiop0987654321';

const loginAcc = async (page) => {
    await page.click('input#email', { clickCount: 3, delay: 100 });
    await page.keyboard.press('Backspace');
    await page.type('input#email', userNameFacebook, { delay: randomTime(50, 300) });
    await page.click('input#pass', { clickCount: 3, delay: 100 });
    await page.keyboard.press('Backspace');
    await page.type('input#pass', passwordFacebook, { delay: randomTime(50, 300) });
    await page.waitFor(randomTime(200, 500));
    await page.click('[data-testid="royal_login_button"]');
    await page.waitForNavigation();
    await page.goto('https://facebook.com', { waitUntil: ["networkidle2"] });
}

const loginCookie = async (page, cookies) => {
    cookies.map(async cookie => {
        await page.setCookie(cookie);
    })
}

const isLoginFB = async (page) => {
    await page.goto('https://facebook.com/settings', { waitUntil: ["networkidle2"] });
    const currentUrl = page.url();

    if (currentUrl.indexOf('/login.php') !== -1) return false;
    return true;
}

const loginFacebook = async (page) => {
    const cookies = await getCookiesFile();

    if (!!cookies) {
        const arrCookies = JSON.parse(cookies);
        await loginCookie(page, arrCookies);
    }

    const isLogin = await isLoginFB(page);
    await page.waitFor(randomTime(200, 700));

    if (!isLogin) {
        await page.goto('https://facebook.com');
        await page.waitFor(randomTime(200, 700));
        await loginAcc(page);
        await getCookie(page);
    } else {
        await page.goto('https://facebook.com', { waitUntil: ["networkidle2"] });
    }
}

module.exports.loginFacebook = loginFacebook;