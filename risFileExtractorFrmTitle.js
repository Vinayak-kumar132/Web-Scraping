import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import chalk from "chalk";



// const notFoundArticles = [];

async function searchAndDownloadRIS(title) {
    console.log(chalk.yellow(`Searching ScienceDirect for: "${title}"`));

    const searchUrl = `https://www.sciencedirect.com/search?qs=${encodeURIComponent(title)}`;

    const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

    try {
        // Go to ScienceDirect search results page
        await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 60000 });

        // Wait for at least two <h2> elements with links
        await page.waitForSelector("h2 a", { timeout: 40000 });

        // Extract the second article link
        const articleLink = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll("h2 a"));
            return links.length > 1 ? links[0].href : null; // Select second h2
        });

        if (!articleLink) {
            console.log(chalk.red(` article not found for: ${title}`));
            // notFoundArticles.push(title);
            await browser.close();
            return;
        }

        // console.log(`Clicking on the article: ${articleLink}`);
        await page.goto(articleLink, { waitUntil: "domcontentloaded", timeout: 60000 });

        // Set up download behavior before clicking the RIS btn
        const downloadPath = path.resolve("./downloads");
        if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath);

        const client = await page.target().createCDPSession();
        await client.send("Page.setDownloadBehavior", {
            behavior: "allow",
            downloadPath: downloadPath,
        });

        try {

            await page.waitForSelector("#popover-trigger-export-citation-popover button", { timeout: 15000 });
            await page.click("#popover-trigger-export-citation-popover button");
            // console.log("Cite button clicked");

            await new Promise(resolve => setTimeout(resolve, 3000));

            // Wait for the modal to appear
            await page.waitForSelector("#popover-content-export-citation-popover", { visible: true, timeout: 90000 });
            // console.log(" Citation modal appeared.");


            const risSelector = 'form[action="/sdfe/arp/cite"] button[aria-label="ris"]';
            await page.waitForSelector(risSelector, { visible: true, timeout: 15000 });
            await page.click(risSelector);
            console.log(chalk.cyan("RIS export initiated"));


            console.log(chalk.green("Downloading RIS file..."));
            await new Promise(resolve => setTimeout(resolve, 8000)); // Wait for download
            console.log(chalk.bgBlue("Downloaded...."))

        } catch (error) {
            console.log(chalk.red("Error exporting RIS:", error.message));
        }

    } catch (error) {
        console.error(chalk.red("Error:", error.message));
    }

    await browser.close();
}

function main() {
    const title = "Progress in developing an innovative lean burn catalytic turbine technology for fugitive methane mitigation and utilization";
    searchAndDownloadRIS(title);
}
main()

