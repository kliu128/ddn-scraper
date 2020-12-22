import puppeteer from "puppeteer";
import express from "express";
import { CronJob } from "cron";

let data = undefined as
  | {
      latestPage: string;
      likes: string;
    }
  | undefined;

async function updateData() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("https://tiktok.com/@dailydosenews");
  await page.waitForSelector("#verify-bar-close").then((el) => el.click());

  const latestPage: string = (await page
    .$(".video-feed-item-wrapper")
    .then((el) => el?.getProperty("href"))
    .then((attr) => attr?.jsonValue())) as string;

  const likes: string = (await page
    .$("[title=Likes]")
    .then((el) => el?.getProperty("textContent"))
    .then((attr) => attr?.jsonValue())) as string;

  console.log(latestPage, likes);

  data = { latestPage, likes };
  await browser.close();
}

const app = express();
const port = 3000;

app.get("/", (_, res) => res.send(data));
app.listen(port, () => {
  updateData();
  console.log("App listening");
});

const job = new CronJob("0 */6 * * *", () => {
  updateData();
});

job.start();
