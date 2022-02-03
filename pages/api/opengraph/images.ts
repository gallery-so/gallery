import chromium from 'chrome-aws-lambda';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Browser } from 'puppeteer';
import type { Browser as BrowserCore } from 'puppeteer-core';

const getBrowserInstance = async () => {
  const executablePath = await chromium.executablePath;

  if (!executablePath) {
    // running locally
    const puppeteer = await import('puppeteer');
    return puppeteer.launch({
      args: chromium.args,
      headless: true,
      ignoreHTTPSErrors: true,
    });
  }

  return chromium.puppeteer.launch({
    executablePath,
    args: chromium.args,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const path = req.query.path as string;
  if (!path) {
    res.status(400).json({ error: { code: 'MISSING_PATH' } });
    return;
  }

  const width = parseInt(req.query.width as string) || 600;
  const height = parseInt(req.query.height as string) || 300;
  const pixelDensity = parseInt(req.query.pixelDensity as string) || 2;

  // TODO: figure out whether the request is http or https instead of via env
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const url = new URL(path, `${protocol}://${req.headers.host}`);
  url.searchParams.set('width', width.toString());
  url.searchParams.set('height', height.toString());

  let browser: Browser | BrowserCore | null = null;

  try {
    browser = await getBrowserInstance();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: pixelDensity });
    await page.goto(url.toString());

    await page.waitForNetworkIdle();

    await page.waitForSelector('#opengraph-image');
    const element = await page.$('#opengraph-image');

    if (!element) {
      throw new Error('No #opengraph-image element found');
    }

    // await page.waitForNetworkIdle();

    const imageBuffer = await element.screenshot({ type: 'png' });

    res.setHeader('Content-Type', 'image/png');
    res.send(imageBuffer);
  } catch (error: any) {
    console.log(error);
    res.json({
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error.toString(),
      },
    });
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};
