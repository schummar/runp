# schummar-translate

TypeScript powered translation library for React and Node.js.

[![](https://badgen.net/npm/v/schummar-translate)](https://www.npmjs.com/package/schummar-translate)
[![](https://badgen.net/bundlephobia/minzip/schummar-translate)](https://bundlephobia.com/package/schummar-translate)

# Example

Given a translation file like this:

```ts
// en.ts
export default {
  welcomeMessage: 'Hi, {name}',
  currentTime: 'It is now {time, time, short}',
} as const;
```

schummar-translate is able to provide type checking and autocomplete/IntelliSense for both translation keys and parameters in ICU format:
![example](https://user-images.githubusercontent.com/2988557/123524539-45a3cd00-d6cb-11eb-9f02-6884b405dc75.gif)

# Getting started

Install `schummar-translate`.

```bash
npm install schummar-translate
```

## Create and export a translator instance

```ts
// translate.ts
import { createTranslator, TranslationContextProvider } from 'schummar-translate/react';
import en from './en.ts';
import de from './de.ts';

export const { t, useTranslator, getTranslator } = createTranslator({
  sourceDictionary: en,
  sourceLocale: 'en',
  dicts: { de },
});
```

## Use it everywhere in your app

```tsx
import { t } from './translate';

export App() {
  const [locale, setLocale] = useState('en');

  const toggleLocale = () => {
    setLocale((locale) => (locale === 'en' ? 'de' : 'en'));
  }

  return (
    <TranslationContextProvider locale={locale}>
      <div onClick={toggleLocale}>
        {t('welcomeMessage', { name: 'schummar' })}
      </div>
    </TranslationContextProvider>
  )
}
```

# API

### createTranslator

```ts
function createTranslator(options: Options): ReturnValue;

type Options = {
  sourceDictionary?: { [id: string]: Dict | string };
  sourceLocale: string;
  fallbackLocale?: string | readonly string[] | ((locale: string) => string | readonly string[]);
  dicts?:
    | { [locale: string]: PartialDict<D> | (() => MaybePromise<PartialDict<D>>) }
    | ((locale: string) => MaybePromise<PartialDict<D> | null>);
  warn?: (locale: string, id: string) => void;
  fallback?: string | ((id: string, sourceTranslation: string) => string);
  placeholder?: string | ((id: string, sourceTranslation: string) => string);
  cacheOptions?: CacheOptions;
  dateTimeFormatOptions?: Intl.DateTimeFormatOptions;
  displayNamesOptions?: Intl.DisplayNamesOptions;
  listFormatOptions?: Intl.ListFormatOptions;
  numberFormatOptions?: Intl.NumberFormatOptions;
  pluralRulesOptions?: Intl.PluralRulesOptions;
  relativeTimeFormatOptions?: Intl.RelativeTimeFormatOptions;
};

type CacheOptions = {
  maxEntries?: number;
  ttl?: number;
};

type ReturnValue = {
  getTranslator: GetTranslator;
  useTranslator: UseTranslator;
  t: ReactTranslator;
  clearDicts: () => void;
};
```

The are two versions of this function, depending on the used import. When importing `'schummar-translate'`, it creates a translator without React support (and therefore without the dependency on React). Then the last three parameters do not apply and the return value only contains `getTranslator`. When importing `'schummar-translate/react'` React support and the last three parameters are included.

- `createTranslator` creates and provides all the other functions and uses the passed in `sourceDictionary` to type them.
- `sourceDictionary` takes the source dictionary as seen above. If not provided, the dictionary for the source language will be loaded as any other. Also, if not provided, you will have to explicitly set the dictionary type: `createTranslator<typeof mySourceDict>(...)`.
- `sourceLocale` is the locale of the source dictionary as [ISO-639-1 code](https://de.wikipedia.org/wiki/Liste_der_ISO-639-1-Codes).
- `fallbackLocale` provides a locale that will be used as fallback if a translation key is not available for some locale.
- `dicts` provides all languages except the source language. It can either be an object with the locales as key and a dictionary or promise of a dictionary as value. Or it can be a function returning a dictionary or promise of a dictionary for a given locale. The last can be used to lazy load locales (expect source locale), for example with dynamic imports: `` dicts: (locale: string) => import(`./langs/${locale}`).then(mod => mod.default) `` or getting it from a cdn via `fetch`.
- `warn` lets you display warnings (e.g. to `console.warn`) when a translation key is missing in the active locale and no fallback is used.
- `fallback` lets you define you a static or dynamic string that will be displayed whenever a translation key is missing for the active locale.
- `fallbackElement` the same as `fallback` but also allows to pass a `ReactNode` to display more complex (e.g styled) fallbacks for translations embedded in JSX.
- `placeholder` lets you define a string that will be displayed in place of a translated string while the active locale is loading (when using promises)
- `placeholderElement` the same as `placeholder` but also allows to pass a `ReactNode` to display more complex (e.g styled) placeholders for translations embedded in JSX.
- `cacheOptions.maxEntries` the maximum amount of entries that are kept in cache. The cache is currently used to memoize Intl instances, since creating them is quite expensive.
- `cacheOptions.ttl` how long cache entries are kept, in milliseconds. Cleanup happens on next cache miss.
- `dateTimeFormatOptions` default options for `dateTimeFormat` calls.
- `displayNamesOptions` default options for `dateTimeFormat` calls.
- `listFormatOptions` default options for `dateTimeFormat` calls.
- `numberFormatOptions` default options for `dateTimeFormat` calls.
- `pluralRulesOptions` default options for `dateTimeFormat` calls.
- `relativeTimeFormatOptions` default options for `dateTimeFormat` calls.

The return value is meant to be exported so the provided functions can be used everywhere in your app: `export const { getTranslator, useTranslator, t } = createTranslator({ ... })`

### t

```ts
function t(id: K, values: V, options?: Options): ReactNode;

type Options = {
  locale?: string;
  fallback?: React.ReactNode;
  placeholder?: React.ReactNode;
  component?: React.ElementType;
};
```

- `locale` allows to override the active locale. If not defined, the active locale is used as provided with `TranslationContextProvider`.
- `fallback` allows to override the fallback that was passed to `createTranslator` for just this instance.
- `placeholder` allows to override the placeholder that was passed to `createTranslator` for just this instance.
- `component` let's you define a component that will wrap the translated string. E.g. `component: 'div'` will result in `<div>YOUR TEXT</div>`

`t` can be used to translate string withing JSX: `<div>{t('foo', { value: 42 })}</div>`. `id` has to be a flattened key from the source dictionary. `values` has to be an object containing the ICU paramters used in the string in the source dictionary. If there are no parameters, `values` is optional.

Of course if you don't like the minimally named `t` you can rename it in the export: `export const { getTranslator, useTranslator, t: translate } = ...`

### t.unknown

```ts
function t.unknown(id: string, values?: Record<string, unknown>, options?: Options): ReactNode;

type Options = {
  locale?: string;
  fallback?: React.ReactNode;
  placeholder?: React.ReactNode;
}
```

- `locale` allows to override the active locale. If not defined, the active locale is used as provided with `TranslationContextProvider`.
- `fallback` allows to override the fallback that was passed to `createTranslator` for just this instance.
- `placeholder` allows to override the placeholder that was passed to `createTranslator` for just this instance.

`t.unknown` does exactly the same as `t` but without type checking. This can be useful if if the translation is not necessarily available. E.g. `` t.unknown(`types.${currentType`, undefined, { fallback: currentType }) ``.

### t.format

```ts
function t.format(template: string, values: V): ReactNode;
```

`t.format` can be used to format something using ICU. E.g. `t.format('{d, date, short}', { d: new Date() })`.

### t.render

```ts
function t.render(renderFn: (t: HookTranslator<D>) => ReactNode, dependencies?: any[]): ReactNode;
```

`t.render` can be used to get access to a translator instance as you would get from `useTranslator`. That is useful e.g. when working on a class component, where the hook is otherwise not available: `<div>{t.render(t => <ComponentThatUsesStringProperty placeholder={t('key1')} />)}</div>`

- `renderFn` will be executed to render
- `dependencies` if provided, will memoize the result of renderFn as long as dependencies stay the same (shallow compare)
  A common example will be to use the Intl api like: `t.render(locale => new Intl.DateTimeFormat(locale).format(date), [date])`.

### t.locale

```ts
function f.locale: ReactNode;
```

`t.locale` returns the currently active locale. Mostly useful for `useTranslator`, to pass into another function.

### t.{dateTimeFormat, displayNames, listFormat, numberFormat, pluralRules, relativeTimeFormat}

E.g.

```ts
function f.dateTimeFormat(date?: Date | number | string, options?: Intl.DateTimeFormatOptions): ReactNode;
```

`t.dateTimeFormat` formats dates and times. It proxies Intl.DateTimeFormat.format but adds caching and inject the active locale. The same is true for displayNames, listFormat, numberFormat, pluralRules and relativeTimeFormat.
See [MDN: Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)

### useTranslator

```ts
function useTranslator(locale?: string): HookTranslator;

type HookTranslator = {
  (id: K, values: V, options?: Options): string | string[];
  unknow: (id: string, values?: Record<string, unknown>, options?: Options): string | string[];
  format: (template: string, values: V): string;
  locale: string;
}

type Options = {
  fallback?: string;
  placeholder?: string;
}
```

React hook that returns a translator that works very similarly to `t`, but being a hook itself, it does not need internal hooks and therefore returns a string instead of a ReactNode. That is useful in case you need to pass strings somewhere, e.g. as options to a select component etc.
If the dictionary value is an array, an array of translated string will be returned.
For more details see [t](#t), [t.unknown](#tunknown) and [t.format](#tformat).

### getTranslator

```ts
function getTranslator(locale: string): Promise<Translator>;

type Translator = {
  (id: K, values: V, options?: Options): string | string[];
  unknow: (id: string, values?: Record<string, unknown>, options?: Options): string | string[];
  format: (template: string, values: V): string;
  locale: string;
}

type Options = {
  fallback?: string;
}
```

Returns a promise of a translator object. That method can be used in the backend or in the frontend outside of React components. It loads the necessary locales first then resolves the promise. The resulting translator is again very similar to `t` but obviously returning string and not ReactNode.
If the dictionary value is an array, an array of translated string will be returned.
For more details see [t](#t), [t.unknown](#tunknown) and [t.format](#tformat).

### clearDicts

```ts
function clearDicts(): void;
```

Clears all dictionary and cache data. This will result in dictionaries being reloaded, as soon as they are used again. This allows loading new dictionary versions from a server, for example.
