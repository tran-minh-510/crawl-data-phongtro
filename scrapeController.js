import {
  scrapeAside,
  scrapeMenu,
  scrapeLocation,
  scrapePage,
} from "./scraper.js";
import fs from "fs";

const scrapeController = async (browserInstance) => {
  const url = "https://phongtro123.com/";
  try {
    let browser = await browserInstance;
    const aside = await scrapeAside(browser, url);
    scrapeLocation();
    const menus = await scrapeMenu(browser, url);
    const nameFile = [
      "chothuephongtro",
      "nhachothue",
      "chothuecanho",
      "matbangvanphong",
      "timnguooghep",
    ];
    menus.forEach(async (element, index) => {
      if (index) {
        const dataPost = await scrapePage(
          browser,
          `https://phongtro123.com${element.link}`
        );
        fs.writeFile(
          `data/${nameFile[index - 1]}.json`,
          JSON.stringify(dataPost),
          (err) => {
            if (err) {
              console.log("Ghi data thất bại", err);
            }
            console.log(`Ghi data thành công ${element.title}`);
          }
        );
      }
    });
  } catch {}
};

export default scrapeController;
