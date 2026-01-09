/**
 * Type declarations for playwright-extra and puppeteer-extra-plugin-stealth
 */

declare module 'playwright-extra' {
  import { Browser, BrowserType, LaunchOptions } from 'playwright';
  
  interface PlaywrightExtra extends BrowserType {
    use(plugin: unknown): void;
    launch(options?: LaunchOptions): Promise<Browser>;
  }
  
  export const chromium: PlaywrightExtra;
  export const firefox: PlaywrightExtra;
  export const webkit: PlaywrightExtra;
}

declare module 'puppeteer-extra-plugin-stealth' {
  interface StealthPlugin {
    (): unknown;
  }
  
  const StealthPlugin: StealthPlugin;
  export default StealthPlugin;
}
