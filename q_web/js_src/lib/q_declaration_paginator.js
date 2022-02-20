import {React} from "../react.js";
import ctx from "./q_ctx.js";

export default class Paginator extends React.Component {
    static contextType = ctx;

    constructor(props) {
        super(props);
    }

    render() {
        let pages = [];

        // Add first page
        if(this.props.currentPage - 2 > 1) {
            pages.push(<div className="paginatorItem"
                          onClick={(v) => {
                              this.props.onChange(1);
                          }}>
                {1}
            </div>);
        }

        // Add spacer
        if(this.props.currentPage - 2 > 2) {
            pages.push(<div className="paginatorDotDotDotItem">...</div>);
        }

        // Add current page - 2
        if(this.props.currentPage - 2 > 0) {
            pages.push(<div className="paginatorItem"
                      onClick={(v) => {
                          this.props.onChange(this.props.currentPage - 2);
                      }} >
                {this.props.currentPage - 2}
            </div>);
        }

        // Add current page - 1
        if(this.props.currentPage - 1 > 0) {
            pages.push(<div className="paginatorItem"
                      onClick={(v) => {
                          this.props.onChange(this.props.currentPage - 1);
                      }} >
                {this.props.currentPage - 1}
            </div>);
        }

        // Add current page
        pages.push(<div className="paginatorItem currentPaginatorItem"
                      onClick={(v) => {
                          this.props.onChange(this.props.currentPage);
                      }} >
            {this.props.currentPage}
        </div>);

        // Add current page + 1
        if(this.props.currentPage + 1 <= this.props.lastPage) {
            pages.push(<div className="paginatorItem"
                      onClick={(v) => {
                          this.props.onChange(this.props.currentPage + 1);
                      }} >
                {this.props.currentPage + 1}
            </div>);
        }

        // Add current page + 2
        if(this.props.currentPage + 2 <= this.props.lastPage) {
            pages.push(<div className="paginatorItem"
                      onClick={(v) => {
                          this.props.onChange(this.props.currentPage + 2);
                      }} >
                {this.props.currentPage + 2}
            </div>);
        }

        // Add spacer
        if(this.props.currentPage + 3 < this.props.lastPage) {
            pages.push(<div className="paginatorDotDotDotItem">...</div>);
        }

        // Add last page
        if(this.props.currentPage + 2 < this.props.lastPage) {
            pages.push(<div className="paginatorItem"
                      onClick={(v) => {
                          this.props.onChange(this.props.lastPage);
                      }} >
            {this.props.lastPage}
        </div>);
        }

        return <div className="paginator">
            {pages}
        </div>
    }
}
