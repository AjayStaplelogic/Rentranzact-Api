
import puppeteer from "puppeteer";
import fs from "fs";
export const ConvertHtmlToPdf = async (htmlContent) => {
    const browser = await puppeteer.launch({
  args:[
    "--disable-setuid-sandbox",
    "--no-sandbox",
    "--single-process",
    "--no-zygote",
  ],
//   executablePath:process.env.NODE_ENV === "production" ? 
//     process.env.PUPPETEER_EXECUTABLE_PATH
//     : puppeteer.executablePath(),
});
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdfbuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    return pdfbuffer;
}