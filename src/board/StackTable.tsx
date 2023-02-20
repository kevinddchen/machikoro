/**
 * Tables with a fixed number of columns but unfixed number of rows.
 * @param columns - Number of columns
 */
export default class StackTable {
  private numColumns: number;
  private tbody: JSX.Element[];
  private tr: JSX.Element[];

  constructor(numColumns: number) {
    this.numColumns = numColumns;
    this.tbody = [];
    this.tr = [];
  }

  /**
   * Push an element to the table. Automatically forms a new row if needed.
   * @param td - <td> element to insert into the table.
   */
  push(td: JSX.Element): void {
    this.tr.push(td);
    if (this.tr.length === this.numColumns) {
      this.pushRow();
    }
  }

  private pushRow(): void {
    this.tbody.push(<tr key={this.tbody.length}>{this.tr}</tr>);
    this.tr = [];
  }

  /**
   * Render the table.
   * @returns A JSX element.
   */
  render(): JSX.Element {
    this.pushRow();
    return (
      <table>
        <tbody>{this.tbody}</tbody>
      </table>
    );
  }
}
