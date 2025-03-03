//  Basic Scraping..
//  This script Extract the data of Coronavirus cases and related data..



import axios from "axios";
import * as cheerio from "cheerio";
import chalk from "chalk";

const scrape = async () => {
    try {
        console.log("before")
        // const response = await axios.get("https://www.worldometers.info/coronavirus/");
        // const data = response.data;


        console.log("Processing...")
        const {data} = await axios.get("https://www.worldometers.info/coronavirus/");

      
        // handleHtml(data)
        handleHtml2(data)
        console.log("Information fetched successfully!!")

    } catch (error) {
        console.log("Error:", error.message);
    }
}
scrape();

function handleHtml(html){   //html contains the raw HTML source code of the webpage fetched using Axios.
   let Page= cheerio.load(html); //The Page variable now acts as a virtual DOM that we can search within.It returns a function so Page is a function
   let h1tag=Page("h1");  //  Same as document.querySelectorAll("h1")
   console.log(h1tag.length);
}

function handleHtml2(html){ 
    // If i want to extract the perticular data  
    let $= cheerio.load(html); 
    let contentArray=$("#maincounter-wrap span");  
    
    // for(let i=0;i<contentArray.length;i++){
    //    let data= $(contentArray[i]).text();
    //    console.log("Data: ",data)
    // }

    // To make it more clear using chalk
    //$(contentArray[i]) is required because contentArray[i] is just an HTML element, and Cheerio methods (like .text()) only work on Cheerio-wrapped elements.
    let total=$(contentArray[0]).text();
    let Deaths=$(contentArray[1]).text();
    let Recovery=$(contentArray[2]).text();

    console.log(chalk.yellow("Total Cases: "+total));
    console.log(chalk.red("Death: "+Deaths));
    console.log(chalk.green("Recovered: "+Recovery));
 
}



