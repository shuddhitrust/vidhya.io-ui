import { day, hour, minute, month, week, year } from '../../common/constants';
import { SdkTableColumn, ColWidth } from './table.model';
import { SearchParams } from './table.model';

/**
 * Takes in column width of newly resized column and
 * stores it in localStorage
 * @param colWidth
 */
export const updateColumnWidth = (colWidth: ColWidth): void => {
  const table = colWidth.table;
  const colId = colWidth.colId;
  const newWidth = colWidth.width;
  if (newWidth) {
    let tableWidths = JSON.parse(localStorage.getItem(table));
    if (tableWidths) {
      tableWidths[colId] = newWidth;
    } else {
      tableWidths = {};
      tableWidths[colId] = newWidth;
    }
    tableWidths = JSON.stringify(tableWidths);
    localStorage.setItem(table, tableWidths);
  }
};

/**
 * Takes in tableId and columns object and sets
 * custom widths to the columns, if it exists,
 * and returns resized columns.
 * @param table Table Id
 * @param columns columnns object
 */
export const setColumnWidthsFromLocalStorage = (
  table: string,
  columns: SdkTableColumn[]
): SdkTableColumn[] => {
  if (table) {
    const tableWidths = JSON.parse(localStorage.getItem(table));
    if (tableWidths) {
      const newColumns = columns.map((col) => {
        const colWidth = tableWidths[col.field];
        return { ...col, width: colWidth ? colWidth : null };
      });
      return newColumns;
    } else return [];
  } else {
    return columns;
  }
};

/**
 * Checks if custom widths exist in localStorage.
 * returns true if yes, false if no.
 * @param table unique table Id
 */
export const customWidthsExist = (table: string): boolean => {
  const tableWidths = JSON.parse(localStorage.getItem(table));
  if (tableWidths) {
    return true;
  } else {
    return false;
  }
};
