const {test, expect} = require('@playwright/test');

const baseUrl = 'http://localhost:3000'

test('Verify NavBar is visible', async ({page}) => {
    await page.goto(baseUrl);

    const navBar = await page.$('.navbar');
    const isNavBarVisible = await navBar.isVisible()

    expect(isNavBarVisible).toBe(true)
})

test('Verify "All Books" link is visible', async ({page}) => {
    await page.goto(baseUrl)
    const allBooksLink = await page.$('a[href="/catalog"]');
    const isLinkVisible = await allBooksLink.isVisible();

    expect(isLinkVisible).toBe(true)
})

test('Verify if Login Button is visible', async ({page}) => {
    await page.goto(baseUrl);
    const loginBtn = await page.$('a[href="/login"]');
    const isLoginBtnVisible = await loginBtn.isVisible()
    expect(isLoginBtnVisible).toBe(true)
})

test('Verify if Register Button is visible', async ({page}) => {
    await page.goto(baseUrl)
    const registerBtn = await page.$('a[href="/register"]');
    const isRegisterBtnVisible = await registerBtn.isVisible();

    expect(isRegisterBtnVisible).toBe(true);
})

test('Check if user logged in successfully', async ({page}) => {
    await page.goto(`${baseUrl}/login`)
    await page.fill('input[name="email"]', 'peter@abv.bg')
    await page.fill('input[name="password"]', '123456')


    await page.click('input[type="submit"]'),
    await page.waitForURL('http://localhost:3000/')


    expect(page.url()).toBe(`${baseUrl}/`)
})

test('Check if the form is empty', async ({page}) => {
    await page.goto(`${baseUrl}/login`);
    await page.click('input[type="submit"]');

    page.on('dialog', async dialog => {
        expect(dialog.type()).toContain('alert');
        expect(dialog.message()).toContain('All fields are required!');
        await dialog.accept()
    });

    expect(page.url()).toBe(`${baseUrl}/login`);
})


test('Verify "All Books" link is visible after login', async ({page}) => {
    await page.goto(`${baseUrl}/login`)

    await page.fill('input[name="email"]', 'peter@abv.bg')
    await page.fill('input[name="password"]', '123456')

    await Promise.all([
        page.click('input[type="submit"]'),
        page.waitForURL('http://localhost:3000/catalog')
    ])

    const allBooksLink = await page.$('a[href="/catalog"]');
    const logoutBtn = await page.$('a[href="javascript:void(0)"]')
    const isAllBooksLinkVisible = await allBooksLink.isVisible();
    const isLogoutButtonVisible = await logoutBtn.isVisible() ;

    expect(isLogoutButtonVisible).toBe(true)
    expect(isAllBooksLinkVisible).toBe(true)
})


test('No books message displayed', async ({page}) => {
    await page.goto(`${baseUrl}/login`)

    await page.fill('input[name="email"]', 'peter@abv.bg')
    await page.fill('input[name="password"]', '123456')

    await Promise.all([
        page.click('input[type="submit"]'),
        page.waitForURL('http://localhost:3000/catalog')
    ])


    const bookElements = await page.$$('.other-books-list li');

    if(bookElements.length> 0){
        expect(bookElements.length).toBeGreaterThan(0);

    }

    if(bookElements.length == 0){
       const noBooks = page.$('.no-books')
       const isNoBooksTextVisibel = await noBooks.isVisible()
       expect(isNoBooksTextVisibel).toBe(true)
       const noBooksMessage = await page.textContent('.no-books');
       expect(noBooksMessage).toBe('No books in database!')
    }
})

test('Add Book with correct data', async({page}) => {
    await page.goto(`${baseUrl}/login`)

    await page.fill('input[name="email"]', 'peter@abv.bg')
    await page.fill('input[name="password"]', '123456')

    await Promise.all([
        page.click('input[type="submit"]'),
        page.waitForURL('http://localhost:3000/catalog')
    ])

    await page.click('a[href="/create"]');
    await page.waitForSelector('#create-form')

    await page.fill('#title', 'Test Book');
    await page.fill('#description', 'This is a test book description')
    await page.fill('#image', 'https://example.com/book-image.jpg');
    await page.selectOption('#type', 'Fiction');

    await page.click('#create-form input[type="submit"]')

    await page.waitForURL(`${baseUrl}/catalog`);
    expect(page.url()).toBe(`${baseUrl}/catalog`)
})

test('Check if the create form is empty', async({page}) => {
    await page.goto(`${baseUrl}/login`)

    await page.fill('input[name="email"]', 'peter@abv.bg')
    await page.fill('input[name="password"]', '123456')

    await Promise.all([
        page.click('input[type="submit"]'),
        page.waitForURL('http://localhost:3000/catalog')
    ])

    await page.click('a[href="/create"]');
    await page.waitForSelector('#create-form');

    page.on('dialog', async dialog => {
        expect(dialog.type()).toContain('alert');
        expect(dialog.message()).toContain('All fields are required!');
        await dialog.accept()
    });

    expect(page.url()).toBe(`${baseUrl}/create`)
})

test('Check if title is empty', async({page}) => {
    await page.goto(`${baseUrl}/login`)

    await page.fill('input[name="email"]', 'peter@abv.bg')
    await page.fill('input[name="password"]', '123456')

    await Promise.all([
        page.click('input[type="submit"]'),
        page.waitForURL('http://localhost:3000/catalog')
    ])

    await page.click('a[href="/create"]');
    await page.waitForSelector('#create-form');

    await page.fill('#description', 'This is a test book description')
    await page.fill('#image', 'https://example.com/book-image.jpg');
    await page.selectOption('#type', 'Fiction');

    await page.click('#create-form input[type="submit"]')

    page.on('dialog', async dialog => {
        expect(dialog.type()).toContain('alert');
        expect(dialog.message()).toContain('All fields are required!');
        await dialog.accept()
    });

    expect(page.url()).toBe(`${baseUrl}/create`)
})

test('Show details page', async ({page})=> {
    await page.goto(`${baseUrl}/login`)

    await page.fill('input[name="email"]', 'peter@abv.bg')
    await page.fill('input[name="password"]', '123456')

    await Promise.all([
        page.click('input[type="submit"]'),
        page.waitForURL('http://localhost:3000/catalog')
    ])

    await page.click('.otherBooks a.button')
    await page.waitForSelector('.book-information')

    const detailsPageTitle = await page.textContent('.book-information h3');
    const detailsPageDescription = await page.textContent('.book-description p');

    expect(detailsPageDescription).toBe('This is a test book description')
    expect(detailsPageTitle).toBe('Test Book');
})





test('logout functionality', async({page}) => {
    await page.goto(`${baseUrl}/login`)

    await page.fill('input[name="email"]', 'peter@abv.bg')
    await page.fill('input[name="password"]', '123456')

    await Promise.all([
        page.click('input[type="submit"]'),
        page.waitForURL('http://localhost:3000/catalog')
    ])

    await page.click('a[href="javascript:void(0)"]');

    const loginBtn = await page.$('a[href="/login"]')
    const logoutBtn = await page.$('a[href="javascript:void(0)"]')
    const isLoginBtnVisible = await loginBtn.isVisible()
    const isLogoutVisible = await logoutBtn.isVisible()

    page.waitForURL(baseUrl)

    expect(page.url()).toBe(`${baseUrl}/`)
    expect(isLoginBtnVisible).toBe(true)
    expect(isLogoutVisible).toBe(false)
})