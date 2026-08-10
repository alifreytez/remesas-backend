export interface OrganizerDataItem {
    mainHeader?: string[];
    mainData?: any[];
    subHeaders?: string[][];
    subData?: any[][];
}

export function generateContentFile(data: OrganizerDataItem[]): string {
    const lines: string[] = [];

    // Función interna para agregar headers
    function addHeader(fields: string[]) {
        lines.push(`H;${fields.join(';')}`);
    }

    // Función interna para agregar datos
    function addData(values: string[]) {
        lines.push(`D;${values.join(';')}`);
    }

    // Función para formatear valores (maneja valores undefined/null)
    function formatValue(value: any): string {
        if (value === null || value === undefined) {
            return '';
        }
        return String(value);
    }

    // Procesar cada elemento del array de datos
    data.forEach((item) => {
        // Header principal (si existe en el item)
        if (item.mainHeader && item.mainData) {
            addHeader(item.mainHeader);
            addData(item.mainData.map(formatValue));
        }

        // Headers y datos secundarios (si existen)
        if (item.subHeaders && item.subData) {
            item.subHeaders.forEach((subHeader, subIndex) => {
                // Agregar header secundario (con tabulación para indentación)
                lines.push(`\tH;${subHeader.join(';')}`);

                // Agregar datos correspondientes al header secundario
                const dataGroup = item.subData?.[subIndex];
                if (dataGroup) {
                    dataGroup.forEach((dataRow) => {
                        lines.push(`\tD;${dataRow.map(formatValue).join(';')}`);
                    });
                }
            });
        }
    });

    return lines.join('\n');
}
