import fetch from "node-fetch";
import fs from "fs";

let dataAside = {};
let dataMenu = {};

let provinces = [];
let districts = [];
let wards = [];

let images = [];

let id_post = 0;

const scrapeAside = (browser, url) =>
  new Promise(async (resolve, reject) => {
    {
      try {
        let page = await browser.newPage();
        await page.goto(url);
        await page.waitForSelector("#webpage");
        const result = await page.$$eval("aside > section", (els) => {
          const obj = {};

          // CATEGORIES
          const liCategories = els[0].querySelectorAll("ul li");
          const categories = Array.from(liCategories).map((item, index) => {
            const a_tag = item.querySelector("h2 a");
            return {
              id: index + 1,
              title: a_tag.getAttribute("title"),
              name: a_tag.innerText,
              parent_id: item.getAttribute("class") === "sub" ? 3 : 0,
            };
          });

          // PRICE
          const liPriceRange = els[1].querySelectorAll("ul li");
          const priceRange = Array.from(liPriceRange).map((item, index) => {
            const a_tag = item.querySelector("a");
            const text = a_tag.innerText;
            if (index === 0) {
              return {
                id: index + 1,
                title: text,
                min: 0,
                max: 1000000,
              };
            } else if (index === liPriceRange.length - 1) {
              return {
                id: index + 1,
                title: text,
                min: 15000000,
                max: Math.pow(10, 9),
              };
            } else {
              const [min, max] = text.replace(/[^0-9]/g, "").split("");
              return {
                id: index + 1,
                title: text,
                min: min * Math.pow(10, 6),
                max: max * Math.pow(10, 6),
              };
            }
          });

          // ACREAGE
          const liAcreageRange = els[2].querySelectorAll("ul li");
          const acreageRange = Array.from(liAcreageRange).map((item, index) => {
            const a_tag = item.querySelector("a");
            const text = a_tag.innerText;
            if (index === 0) {
              return {
                id: index + 1,
                title: text,
                min: 0,
                max: 20,
              };
            } else if (index === liAcreageRange.length - 1) {
              return {
                id: index + 1,
                title: text,
                min: 90,
                max: Math.pow(10, 9),
              };
            } else {
              const [min, max] = text.slice(3, 10).split(" - ");
              return {
                id: index + 1,
                title: text,
                min: Number(min),
                max: Number(max),
              };
            }
          });
          obj.categories = categories;
          obj.priceRange = priceRange;
          obj.acreageRange = acreageRange;
          dataAside = obj;
          return obj;
        });
        const { categories, priceRange, acreageRange } = result;
        fs.writeFile(
          `data/categories.json`,
          JSON.stringify(categories),
          (err) => {
            if (err) {
              console.log("Ghi data thất bại", err);
            }
            console.log("Ghi data thành công categories");
          }
        );
        fs.writeFile(
          `data/price_range.json`,
          JSON.stringify(priceRange),
          (err) => {
            if (err) {
              console.log("Ghi data thất bại", err);
            }
            console.log("Ghi data thành công price_range");
          }
        );
        fs.writeFile(
          `data/acreage_range.json`,
          JSON.stringify(acreageRange),
          (err) => {
            if (err) {
              console.log("Ghi data thất bại", err);
            }
            console.log("Ghi data thành công acreage_range");
          }
        );
        await page.close();
        console.log(`=>>> Website crawl xong aside `);
        resolve(result);
      } catch (error) {
        console.log("Lỗi ở scrape category: " + error);
        reject(error);
      }
    }
  });

const scrapeMenu = (browser, url) =>
  new Promise(async (resolve, reject) => {
    {
      try {
        let page = await browser.newPage();
        await page.goto(url);
        await page.waitForSelector("#webpage");
        let result = await page.$$eval("#menu-main-menu li", (els) => {
          return Array.from(els).map((item, index) => {
            if (index < els.length - 2) {
              return {
                id: index + 1,
                title: item.querySelector("a").innerText,
                link: item.querySelector("a").getAttribute("href").split("com")[
                  item.querySelector("a").getAttribute("href").split("com")
                    .length - 1
                ],
                category_id: index === 0 ? 0 : index,
              };
            }
          });
        });
        result = result.filter((item) => item);
        dataMenu = result;
        fs.writeFile(`data/menus.json`, JSON.stringify(result), (err) => {
          if (err) {
            console.log("Ghi data thất bại", err);
          }
          console.log("Ghi data thành công");
        });
        await page.close();
        console.log(`=>>> Website crawl xong menus `);
        resolve(result);
      } catch (error) {
        console.log("Lỗi ở scrape category: " + error);
        reject(error);
      }
    }
  });

const scrapeLocation = async () => {
  // PROVINCES
  const responseProvinces = await fetch("https://provinces.open-api.vn/api/p/");
  provinces = await responseProvinces.json();
  provinces = provinces.map((item, index) => {
    return {
      id: index + 1,
      code: item.code,
      title: item.name,
    };
  });
  fs.writeFile(`data/provinces.json`, JSON.stringify(provinces), (err) => {
    if (err) {
      console.log("Ghi data thất bại", err);
    }
    console.log("Ghi data thành công provinces");
  });

  // districts
  const responseDistricts = await fetch("https://provinces.open-api.vn/api/d/");
  districts = await responseDistricts.json();
  districts = districts.map((item, index) => {
    return {
      id: index + 1,
      code: item.code,
      title: item.name,
      province_code: item.province_code,
    };
  });

  fs.writeFile(`data/districts.json`, JSON.stringify(districts), (err) => {
    if (err) {
      console.log("Ghi data thất bại", err);
    }
    console.log("Ghi data thành công districts");
  });

  // PROVINCES
  const responseWards = await fetch("https://provinces.open-api.vn/api/w/");
  wards = await responseWards.json();
  wards = wards.map((item, index) => {
    return {
      id: index + 1,
      code: item.code,
      title: item.name,
      district_code: item.district_code,
    };
  });
  fs.writeFile(`data/wards.json`, JSON.stringify(wards), (err) => {
    if (err) {
      console.log("Ghi data thất bại", err);
    }
    console.log("Ghi data thành công wards");
  });
};

const scrapePage = (browser, url) =>
  new Promise(async (resolve, reject) => {
    try {
      let page = await browser.newPage();
      await page.goto(url, { timeout: 0 });
      await page.waitForSelector("#main");
      const result = {};
      let title = await page.$eval(".page-h1", (els) => {
        return els.innerText;
      });
      let desc = await page.$eval(".page-description", (els) => {
        return els.innerText;
      });
      let groups = await page.$$eval(".location-item", (els) => {
        const locationBg = ["hcm", "hn", "dn"];
        return Array.from(els).map((item, index) => {
          return {
            title: item.getAttribute("title"),
            name: item.querySelector(".location-cat").innerText,
            image: `https://phongtro123.com/images/location_${locationBg[index]}.jpg`,
          };
        });
      });
      let listLinkPosts = await page.$$eval(
        ".post-item .post-thumb a",
        (els) => {
          return Array.from(els).map((item) => item.getAttribute("href"));
        }
      );
      const posts = [];

      for (const link of listLinkPosts) {
        const detailPost = await crawlPost(
          browser,
          "https://phongtro123.com" + link
        );
        posts.push(detailPost);
      }
      result.title = title;
      result.description = desc;
      result.groups = groups;
      result.posts = posts;
      await page.close();
      console.log(`=>>> Website crawl xong ${url} `);
      resolve(result);
    } catch (error) {
      console.log("Lỗi ở scrape page: " + error);
      reject(error);
    }
  });

const crawlPost = (browser, url) =>
  new Promise(async (resolve, reject) => {
    try {
      let page = await browser.newPage();
      await page.goto(url);
      await page.waitForSelector("#main");
      const result = {};
      let title = await page.$eval(".page-h1 a", (els) => {
        return els.innerText;
      });
      const handleStar = async () => {
        try {
          await page.$eval(".page-h1 span", (els) => {
            const nameStar = els.getAttribute("class").split(" ")[1];
            return nameStar.split("-")[1];
          });
        } catch (error) {
          return 0;
        }
      };
      let star = await handleStar();
      let address = await page.$eval(".post-address", (els) => {
        return els.innerText.split(":")[1].trim();
      });
      let price = await page.$eval(".item.price span", (els) => {
        return Number(els.innerText.split(" ")[0]) * Math.pow(10, 6);
      });
      let acreage = await page.$eval(".item.acreage span", (els) => {
        return Number(els.innerText.split("m")[0]);
      });
      let infoPost = await page.$eval(".section-content", (els) => {
        const stringContentPost = els.innerHTML;
        return stringContentPost;
      });
      let infoUser = await page.$eval(".author-aside", (els) => {
        const name = els.querySelector(".author-name").innerText;
        const phone = els.querySelector(".author-phone").innerText;
        return {
          name,
          phone,
        };
      });
      let images = await page.$$eval(".swiper-slide", (els) => {
        return Array.from(els).map((item) => {
          const imgTag = item.querySelector("img");
          if (imgTag) {
            return {
              title: imgTag.getAttribute("alt"),
              link: imgTag.getAttribute("src"),
            };
          }
        });
      });
      let category = await page.$eval(
        ".page-header > p > a > strong",
        (els) => {
          return els.innerText;
        }
      );
      images = images.filter((item) => item);
      result.title = title;
      result.category = category;
      result.star = star;
      result.address = address;
      result.price = price;
      result.acreage = acreage;
      result.infoPost = infoPost;
      result.user = infoUser;
      result.images = images;
      await page.close();
      console.log(`=>>> Website crawl xong ${url} `);
      resolve(result);
    } catch (error) {
      console.log("Lỗi ở crawl post: " + error);
      reject(error);
    }
  });
export { scrapeAside, scrapeMenu, scrapeLocation, scrapePage };
