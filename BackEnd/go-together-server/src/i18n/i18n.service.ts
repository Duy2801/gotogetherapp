import { Injectable } from "@nestjs/common";
import { i18n, Locale } from "./index";

@Injectable()
export class I18nService {
  getLocaleFromRequest(locale?: string): Locale {
    return locale === "en" ? "en" : "vi";
  }

  translate(
    key: string,
    locale?: string,
    params?: Record<string, string>,
  ): string {
    return i18n(locale, key, params);
  }

  /**
   * Get error message
   * Usage: this.i18nService.getErrorMessage('user.not_found', req.headers['x-locale'])
   */
  getErrorMessage(
    errorKey: string,
    locale?: string,
    params?: Record<string, string>,
  ): string {
    return this.translate(`errors.${errorKey}`, locale, params);
  }

  /**
   * Get success message
   * Usage: this.i18nService.getSuccessMessage('created', req.headers['x-locale'], { resource: 'Trip' })
   */
  getSuccessMessage(
    messageKey: string,
    locale?: string,
    params?: Record<string, string>,
  ): string {
    return this.translate(`messages.${messageKey}`, locale, params);
  }
}
