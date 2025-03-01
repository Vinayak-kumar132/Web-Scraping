const axios = require("axios"); // Request send karne ke liye
const cheerio = require("cheerio"); // HTML parse karne ke liye

async function scrapeWikipedia() {
  try {
    // Wikipedia ke homepage ka HTML fetch karna
    const { data } = await axios.get("https://en.wikipedia.org/wiki/Main_Page");
    
    // HTML ko parse karna
    const $ = cheerio.load(data);
    const title = $("title").text(); // Page ka title extract karna
    
    console.log("Page Title:", title); // Output dikhana
  } catch (error) {
    console.error("Error fetching page:", error);
  }
}

scrapeWikipedia();
