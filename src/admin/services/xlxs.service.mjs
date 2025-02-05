import XLSX from "xlsx";
export const generateXlxs = async (data, sheetName = "Sheet 1", columnWidths = null) => {
    const workSheet = XLSX.utils.json_to_sheet(data);
    const workBook = XLSX.utils.book_new();

    // Assign the column widths to the sheet
    if (columnWidths) {
        workSheet['!cols'] = columnWidths;
    }

    XLSX.utils.book_append_sheet(workBook, workSheet, sheetName);
    const buffer = await XLSX.write(workBook, {
        bookType: 'xlsx',
        type: 'buffer',
    });

    return buffer;
}