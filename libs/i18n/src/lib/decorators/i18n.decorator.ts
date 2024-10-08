import { createParamDecorator } from '@nestjs/common';
import { I18nError } from '../i18n.error';
import { I18nContext } from '../i18n.context';
import { logger } from '../i18n.module';

export const I18n = createParamDecorator((_, context) => {
  const i18n = I18nContext.current(context);

  if (i18n === undefined) {
    if (!i18n) {
      logger.error(
        'I18n context not found! Is this function triggered by a processor or cronjob? Please use the I18nService',
      );
    }
    throw new I18nError('I18n context undefined');
  }

  return i18n;
});
