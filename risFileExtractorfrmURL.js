import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import chalk from "chalk";

async function exportRIS(url) {
    console.log(chalk.yellow(`Opening: ${url}`));

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

    try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

        // Click on the "Cite" button
        await page.waitForSelector("#popover-trigger-export-citation-popover button", { timeout: 15000 });
        await page.click("#popover-trigger-export-citation-popover button");
        console.log("Cite button clicked");

        // Wait for the popover
        await page.waitForSelector("#popover-content-export-citation-popover", { visible: true, timeout: 15000 });

        // Click on "Export citation to RIS"
        const risSelector = 'form[action="/sdfe/arp/cite"] button[aria-label="ris"]';
        await page.waitForSelector(risSelector, { visible: true, timeout: 15000 });
        await page.click(risSelector);
        console.log(chalk.blue("RIS export initiated"));

        // Handle file download
        const downloadPath = path.resolve("./downloads");
        if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath);

        const client = await page.target().createCDPSession();
        await client.send("Page.setDownloadBehavior", {
            behavior: "allow",
            downloadPath: downloadPath,
        });

        console.log(chalk.green("Downloading RIS file..."));
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for download..

    } catch (error) {
        console.error("Error:", error.message);
    }

    await browser.close();
}

const articleURL = "https://www.sciencedirect.com/science/article/pii/S036012850500002X";
exportRIS(articleURL);