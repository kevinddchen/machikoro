/**
 * Tables with a fixed number of columns but unfixed number of rows
 */
export default class StackTable {

  private columns: any;
  private tbody: any;
  private tr: any;

  constructor(columns: any) {
    this.columns = columns;
    this.tbody = [];
    this.tr = [];
  }

  push(td: any) {
    this.tr.push(td);
    if (this.tr.length === this.columns) {
      this._pushRow();
    }
  }

  _pushRow() {
    this.tbody.push(<tr key={this.tbody.length}>{this.tr}</tr>);
    this.tr = []
  }

  render() {
    this._pushRow();
    return <table><tbody>{this.tbody}</tbody></table>;
  }

}
