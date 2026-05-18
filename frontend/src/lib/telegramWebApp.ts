import WebApp from '@twa-dev/sdk';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export function getTelegramUser(): TelegramUser | null {
  const user = WebApp.initDataUnsafe?.user;
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    photo_url: user.photo_url,
  };
}

const TG_THEME_VARS: Record<string, keyof typeof WebApp.themeParams> = {
  '--tg-theme-bg-color': 'bg_color',
  '--tg-theme-text-color': 'text_color',
  '--tg-theme-hint-color': 'hint_color',
  '--tg-theme-link-color': 'link_color',
  '--tg-theme-button-color': 'button_color',
  '--tg-theme-button-text-color': 'button_text_color',
  '--tg-theme-secondary-bg-color': 'secondary_bg_color',
  '--tg-theme-header-bg-color': 'header_bg_color',
  '--tg-theme-accent-text-color': 'accent_text_color',
  '--tg-theme-section-bg-color': 'section_bg_color',
  '--tg-theme-section-header-text-color': 'section_header_text_color',
  '--tg-theme-subtitle-text-color': 'subtitle_text_color',
  '--tg-theme-destructive-text-color': 'destructive_text_color',
};

function applyTelegramTheme(): void {
  const root = document.documentElement;
  const { themeParams } = WebApp;

  for (const [cssVar, paramKey] of Object.entries(TG_THEME_VARS)) {
    const value = themeParams[paramKey];
    if (value) {
      root.style.setProperty(cssVar, value);
    }
  }

  if (themeParams.bg_color) {
    root.style.setProperty('--ion-background-color', themeParams.bg_color);
  }
  if (themeParams.text_color) {
    root.style.setProperty('--ion-text-color', themeParams.text_color);
    root.style.setProperty('--ion-color-dark', themeParams.text_color);
  }
  if (themeParams.hint_color) {
    root.style.setProperty('--ion-color-medium', themeParams.hint_color);
  }
  if (themeParams.link_color) {
    root.style.setProperty('--ion-color-primary', themeParams.link_color);
  }
  if (themeParams.button_color) {
    root.style.setProperty('--ion-color-primary', themeParams.button_color);
  }
  if (themeParams.secondary_bg_color) {
    root.style.setProperty('--ion-card-background', themeParams.secondary_bg_color);
    root.style.setProperty('--ion-toolbar-background', themeParams.secondary_bg_color);
  }
  if (themeParams.bg_color) {
    root.style.setProperty('--ion-toolbar-background', themeParams.bg_color);
  }

  const colorScheme = WebApp.colorScheme === 'dark' ? 'dark' : 'light';
  root.style.setProperty('color-scheme', colorScheme);
}

export function initTelegramWebApp(): void {
  if (!WebApp.initData) {
    return;
  }

  WebApp.ready();
  WebApp.expand();
  WebApp.disableVerticalSwipes();
  WebApp.isClosingConfirmationEnabled = true;

  document.documentElement.classList.add('telegram-mini-app');
  applyTelegramTheme();

  WebApp.onEvent('themeChanged', applyTelegramTheme);
}
