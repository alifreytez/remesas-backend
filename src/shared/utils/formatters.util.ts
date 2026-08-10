import { dateHandler } from '@utils/date-handler.util.js';

const currencyFormats = {
    ves_ve: new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }),
    usd_us: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
};

export const getDateOn = (date: any, type: string): string => {
    const handler = dateHandler(date);
    if (!handler) return '';

    const lowerType = type.toLowerCase();
    if (lowerType === 'dmy') return handler.dmy;
    return handler.iso;
};

export const getBsFormat = (currency: number): string => {
    const formattedData = currencyFormats.ves_ve.format(currency);
    return formattedData.replace('Bs.S', 'Bs.').trim();
};

export const getRefFormat = (currency: number): string => {
    const formattedData = currencyFormats.usd_us.format(currency);
    return formattedData.replace('$', 'Ref. ').trim();
};

export const formatterDateTxt = (date: string): string => {
    const yy = date.substring(0, 2);
    const mm = date.substring(2, 4);
    const dd = date.substring(4, 6);
    const fullYear = `20${yy}`;
    return `${fullYear}-${mm}-${dd}`;
};
