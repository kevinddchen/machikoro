// class for managing tables with fixed number of columns but unfixed number of rows
export default class StackTable {
  constructor(columns) {
    this.columns = columns;
    this.tbody = [];
    this.tr = [];
  }

  push(td) {
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