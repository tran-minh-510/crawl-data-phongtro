import puppeteer from "puppeteer";

const startBrowser = async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ["--disable-setuid-sandgox"],
      ignoreHTTPSErrors: true,
    });
  } catch (error) {
    console.log("Không tạo được browser" + error);
  }
  return browser;
};

export default startBrowser;
