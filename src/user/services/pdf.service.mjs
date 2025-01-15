
import puppeteer from "puppeteer";
import fs from "fs";
export const ConvertHtmlToPdf = async (htmlContent) => {
  let browser = null;
  try {
    console.log(htmlContent, '==========htmlContent')
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
      ],
      //   executablePath:process.env.NODE_ENV === "production" ? 
      //     process.env.PUPPETEER_EXECUTABLE_PATH
      //     : puppeteer.executablePath(),
    });
    const page = await browser.newPage();
    // await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });    // To load images
    const pdfbuffer = await page.pdf({ format: 'A4' });
    // await browser.close();
    return pdfbuffer;

  } catch (error) {
    console.error("Error converting HTML to PDF", error);
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing the browser:', closeError);
      }
    }
  }
}