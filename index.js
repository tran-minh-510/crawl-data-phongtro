import startBrowser from "./browser.js";
import scrapeController from "./scrapeController.js";

let browser = startBrowser();
scrapeController(browser);
