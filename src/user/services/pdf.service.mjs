
import puppeteer from "puppeteer";
import fs from "fs";
export const ConvertHtmlToPdf = async (htmlContent) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdfbuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    return pdfbuffer;
}