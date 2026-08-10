// @ts-ignore
import PdfPrinter from 'pdfmake';
import path from 'path';
import { customAlphabet } from 'nanoid';

// 1. Detección inteligente de entorno (Desarrollo vs Producción)
const isProd = process.env.NODE_ENV === 'production';

// 2. Rutas absolutas inmutables basadas en la raíz del proyecto
const baseResourcesPath = isProd ? path.join(process.cwd(), 'dist', 'resources', 'fonts') : path.join(process.cwd(), 'public', 'resources', 'fonts');

export const generateReportId = customAlphabet('0123456789', 10);
const getFontPath = (folder: string, filename: string) => path.join(baseResourcesPath, folder, filename);

const fonts = {
    Times: {
        normal: getFontPath('Times-New-Roman', 'TimesNewRoman.ttf'),
        bold: getFontPath('Times-New-Roman', 'TimesNewRoman-Bold.ttf'),
        italics: getFontPath('Times-New-Roman', 'TimesNewRoman-Italic.ttf'),
        bolditalics: getFontPath('Times-New-Roman', 'TimesNewRoman-BoldItalic.ttf'),
    },
    Inter: {
        normal: getFontPath('Inter', 'Inter-Regular.ttf'),
        bold: getFontPath('Inter', 'Inter-Bold.ttf'),
        italics: getFontPath('Inter', 'Inter-Italic.ttf'),
        bolditalics: getFontPath('Inter', 'Inter-BoldItalic.ttf'),
    },
    Ubuntu: {
        normal: getFontPath('Ubuntu', 'Ubuntu-Regular.ttf'),
        bold: getFontPath('Ubuntu', 'Ubuntu-Bold.ttf'),
        italics: getFontPath('Ubuntu', 'Ubuntu-Italic.ttf'),
        bolditalics: getFontPath('Ubuntu', 'Ubuntu-BoldItalic.ttf'),
    },
};

class PDFMakeDefinition {
    public reportId: string;
    public definitionFn: () => any;

    constructor(definitionFn: () => any = () => ({}), context: Record<string, any> = {}) {
        this.reportId = generateReportId();
        this.definitionFn = definitionFn;

        Object.assign(this, {
            reportId: this.reportId,
            ...context,
        });

        this.definitionFn = definitionFn.bind(this);
    }

    getDefinition() {
        const definition = this.definitionFn();

        if (definition.footer && typeof definition.footer === 'function') {
            definition.footer = definition.footer.bind(this);
        }
        if (definition.content) {
            this.bindFunctionsInContent(definition.content);
        }

        return definition;
    }

    private bindFunctionsInContent(obj: any) {
        if (!obj || typeof obj !== 'object') return;

        if (Array.isArray(obj)) {
            obj.forEach((item) => this.bindFunctionsInContent(item));
            return;
        }

        Object.keys(obj).forEach((key) => {
            const value = obj[key];
            if (typeof value === 'function') {
                obj[key] = value.bind(this);
            } else if (typeof value === 'object' && value !== null) {
                this.bindFunctionsInContent(value);
            }
        });
    }
}

export interface GeneratePDFOptions {
    font?: 'Times' | 'Inter' | 'Ubuntu';
}

export const generatePDF = (definition: any, options: GeneratePDFOptions = {}) => {
    const { font = 'Times' } = options;
    const isFunction = typeof definition === 'function';
    const pdfDefObj = isFunction ? new PDFMakeDefinition(definition) : null;
    const docDefinition = isFunction && pdfDefObj ? pdfDefObj.getDefinition() : definition;

    // Generar el PDF
    // @ts-ignore
    const printer = new PdfPrinter(fonts);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: any[] = [];

    return { chunks, pdfDoc, def: pdfDefObj, docDefinition };
};
