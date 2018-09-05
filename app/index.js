const puppeteer = require('puppeteer');
const fs = require('fs');
const userNameFacebook = 'barry.alen.39142072';
const passwordFacebook = 'qwertyuiop0987654321';
const screenshot = 'demo_screenshot.png';

const randomTime = (min = 0, max = 1000) => {
    const resultTime = Math.random() * (max - min) + min;
    return Math.round(resultTime);
}

const getAllUrlParams = (url) => {
    var queryString = url ? url.split('?')[1] : '';
    var obj = {};

    if (queryString) {
        queryString = queryString.split('#')[0];
        var arr = queryString.split('&');

        for (var i = 0; i < arr.length; i++) {
            var a = arr[i].split('=');
            var paramNum = undefined;
            var paramName = a[0].replace(/\[\d*\]/, function (v) {
                paramNum = v.slice(1, -1);
                return '';
            });
            var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];
            paramName = paramName.toLowerCase();
            paramValue = paramValue.toLowerCase();

            if (obj[paramName]) {
                if (typeof obj[paramName] === 'string') {
                    obj[paramName] = [obj[paramName]];
                }
                if (typeof paramNum === 'undefined') {
                    obj[paramName].push(paramValue);
                } else {
                    obj[paramName][paramNum] = paramValue;
                }
            } else {
                obj[paramName] = paramValue;
            }
        }
    }

    return obj;
}

const loginAcc = async (page) => {
    await page.type('input#email', userNameFacebook, { delay: randomTime(100, 500) });
    await page.type('input#pass', passwordFacebook, { delay: randomTime(100, 500) });
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
        await page.goto('https://facebook.com', { waitUntil: ["networkidle2"] });
        await page.waitFor(randomTime(200, 700));
        await loginAcc(page);
        await getCookie(page);
    } else {
        await page.goto('https://facebook.com', { waitUntil: ["networkidle2"] });
    }
}


(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await loginFacebook(page);
    await page.waitFor(randomTime(200, 700));

    const hovercards = await page.evaluate(() => {
        const profilePosts = Array.from(document.querySelectorAll(".userContentWrapper span[data-ft='{\"tn\":\"k\"}'] a"));
        const hovercards = profilePosts.map(post => {
            return post.dataset.hovercard;
        });

        return hovercards;
    });


    const listIds = hovercards.map(hovercard => {
        const objUrl = getAllUrlParams(hovercard);
        if (hovercard.indexOf('/ajax/hovercard/page.php') !== -1 && typeof objUrl.id !== 'undefined') return objUrl.id;

        return '';
    })

    const ids = listIds.filter(id => !!id);

    await page.screenshot({
        path: screenshot,
        // fullPage: true
    })

    await browser.close();

    await console.log(JSON.stringify(ids));
})();