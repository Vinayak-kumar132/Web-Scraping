import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";
import path from "path";
import 'dotenv/config';
import chalk from "chalk";

const API_KEY =process.env.PROXY_API_KEY;

puppeteer.use(StealthPlugin());



async function searchAndDownloadRIS(title) {
    console.log(chalk.yellow(`Searching ScienceDirect for: "${title}"`));

    const searchUrl = `https://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(
        `https://www.google.com/search?q=${title}+site:sciencedirect.com`
    )}`;

    // const browser = await puppeteer.launch({ headless: false });
    const browser = await puppeteer.launch({
        headless: false,
        protocolTimeout: 300000,  // Increase protocol timeout to 5 minutes
    });

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

    try {
        await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForSelector("div#search a", { timeout: 40000 });

        const links = await page.evaluate(() =>
            Array.from(document.querySelectorAll("div#search a"))
                .map(a => a.href)
                .filter(href => href.includes("sciencedirect.com"))
        );

        if (links.length === 0) {
            console.log(chalk.red(`Searching ScienceDirect for: "${title}"`));
            
            await browser.close();
            return;
        }

        const articleLink = links[0];
        // console.log(`Found article: ${articleLink}`);

        const proxiedUrl = `https://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(articleLink)}`;
        await page.goto(proxiedUrl, { waitUntil: "domcontentloaded", timeout: 60000 });


        // Set up download behavior before clicking
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
            console.log("Cite button clicked");

            
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds to open th e modal properly..



            // Wait for modal..
            await page.waitForSelector("#popover-content-export-citation-popover", { visible: true, timeout: 200000 });
            console.log("Modal appeared.");

            // Click "Export citation to RIS"
            const risSelector = 'form[action="/sdfe/arp/cite"] button[aria-label="ris"]';
            await page.waitForSelector(risSelector, { visible: true, timeout: 15000 });
            await page.click(risSelector);
            console.log(chalk.cyan(" RIS export initiated"));

            console.log(chalk.green("Downloading RIS file..."));
            await new Promise(resolve => setTimeout(resolve, 8000)); 
            // Wait for download

            console.log(chalk.bgBlue("Downloaded....."))



        } catch (error) {
            console.log(chalk.red("Error exporting RIS from ScienceDirect:", error.message));
        }
    } catch (error) {
        console.error(chalk.error);
    }

    await browser.close();
}

const title = "Progress in developing an innovative lean burn catalytic turbine technology for fugitive methane mitigation and utilization";
searchAndDownloadRIS(title);



// process.on("exit", () => {
//     if (notFoundArticles.length > 0) {
//         console.log(chalk.bgYellow(" Articles not found on ScienceDirect:", notFoundArticles));
//     }
// });

