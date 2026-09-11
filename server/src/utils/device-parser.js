import { UAParser } from 'ua-parser-js';

export class DeviceParser {
  static parse(userAgentHeader) {
    const uaString = userAgentHeader || '';
    const parser = new UAParser(uaString);
    const result = parser.getResult();

    const deviceType = result.device.type || (result.device.model ? 'mobile' : 'desktop');
    const browser = result.browser.name ? `${result.browser.name} ${result.browser.version || ''}`.trim() : 'Unknown Browser';
    const operatingSystem = result.os.name ? `${result.os.name} ${result.os.version || ''}`.trim() : 'Unknown OS';

    return {
      deviceType,
      browser,
      operatingSystem,
      userAgent: uaString,
    };
  }
}
