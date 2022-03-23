const request = require("request-promise");
const cheerio = require("cheerio");
const cors = require("cors");

const express = require("express");
const bodyParser = require("body-parser");

const allowedOrigins = ["http://localhost:3001", "http://localhost:3000"];

const app = express();
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/searchPage", function (req, res) {
  const search = req.query.search;
  const URL = `https://www.amazon.com/s?k=${search}`;

  const fetchURL = async (URL) => {
    const response = await request({
      uri: URL,
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,bn;q=0.7",
      },
      gzip: true,
    });

    let $ = cheerio.load(response);

    let title = "";
    let allLinks = [];

    try {
      const linkList = $(
        'h2[class="a-size-mini a-spacing-none a-color-base s-line-clamp-2"]'
      ).children();

      for (let i = 0; i < linkList.length; i++) {
        let divHtml = cheerio.load(linkList[String(i)]);

        let link = divHtml(
          'a[class="a-link-normal s-underline-text s-underline-link-text s-link-style a-text-normal"]'
        )
          .text()
          .trim();

        let linkAddress = divHtml(
          'a[class="a-link-normal s-underline-text s-underline-link-text s-link-style a-text-normal"]'
        ).attr("href");

        linkAddress = "https://www.amazon.com" + linkAddress;

        let linkObj = {
          linkTitle: link,
          linkAddress: linkAddress,
        };

        allLinks.push(linkObj);
      }
    } catch (error) {}

    res.json({ allData: allLinks });
  };

  fetchURL(URL);
});

app.post("/", function (req, res) {
  const URL = req.body.link;

  const fetchURL = async (URL) => {
    const response = await request({
      uri: URL,
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,bn;q=0.7",
      },
      gzip: true,
    });

    let $ = cheerio.load(response);

    let title = "";
    let price = "";
    let rating = "";
    let img = "";
    let shippingFee = "";
    let stockLeft = "";
    let ALLREVIEWS = [];

    try {
      title = $('span[id="productTitle"]').text().trim();
    } catch (error) {}

    try {
      price = $(
        'span[class="a-price a-text-price a-size-medium apexPriceToPay"] > span[class="a-offscreen"]'
      )
        .text()
        .trim();
    } catch (error) {}

    try {
      rating = $('span[id="acrPopover"] > span > a > i > span').html().trim();
    } catch (error) {}

    try {
      img = $('img[id="landingImage"]')["0"].attribs.src;
    } catch (error) {}

    try {
      shippingFee = $(
        'div[id="exports_desktop_qualifiedBuybox_tlc_feature_div"] > span[class="a-size-base a-color-secondary"]'
      )
        .text()
        .trim();
    } catch (error) {}

    try {
      stockLeft = $('div[id="availability"] > span').text().trim();
    } catch (error) {}

    try {
      let reviewList = $("#cm-cr-dp-review-list").children();
      for (let i = 0; i < reviewList.length; i++) {
        let divHtml = cheerio.load(reviewList[String(i)]);

        let reviewrName = divHtml('span[class="a-profile-name"]').text().trim();
        let reviewrRating = divHtml('i.a-icon > span[class="a-icon-alt"]')
          .html()
          .trim();
        let reviewTitle = divHtml(
          'a[class="a-size-base a-link-normal review-title a-color-base review-title-content a-text-bold"] > span'
        )
          .html()
          .trim();
        let reviewDate = divHtml(
          'span[class="a-size-base a-color-secondary review-date"]'
        )
          .html()
          .trim();
        let reviewrReview = divHtml(
          'div[class="a-expander-content reviewText review-text-content a-expander-partial-collapse-content"] > span'
        )
          .html()
          .trim();

        let reviewerImage = divHtml(
          'div[class="review-image-tile-section"]'
        ).children();

        let reviewerImageList = [];

        if (reviewerImage.html()) {
          for (let j = 0; j < reviewerImage.length; j++) {
            let imgHtml = cheerio.load(reviewerImage[String(j)]);
            let img = imgHtml(
              'img[class="review-image-tile a-lazy-loaded"]'
            ).attr("data-src");
            reviewerImageList.push(img);
          }
        }

        let Review = {
          reviewrName,
          reviewrRating,
          reviewTitle,
          reviewDate,
          reviewrReview,
          reviewerImageList,
        };
        ALLREVIEWS.push(Review);
      }
    } catch (error) {}

    let ALLDATA = {
      title,
      price,
      rating,
      img,
      shippingFee,
      stockLeft,
      ALLREVIEWS,
    };
    res.json({ allData: ALLDATA });
  };

  fetchURL(URL);
});

app.listen(3000, function () {
  console.log("Server is listing in port 3000");
});
