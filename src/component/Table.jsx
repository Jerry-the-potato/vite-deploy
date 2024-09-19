import {useState, useMemo} from "react";
import _ from "lodash";
const Pagination = ({ activePage, count, rowsPerPage, totalPages, setActivePage }) => {
    const beginning = rowsPerPage * (activePage - 1) + 1;
    const end = activePage === totalPages ? count : beginning + rowsPerPage - 1;
    const isDisabled = activePage === 1;
    const isLastDisabled = activePage === totalPages;
    return (
        <>
        <div className="pagination">
            <div className="pagDescription">
                <p>Page {activePage} of {totalPages}</p>
                <p>Rows: {beginning === end ? end : `${beginning} - ${end}`} of {count}</p>
            </div>
            <button className="button" disabled={isDisabled} style={{"opacity": isDisabled ? 0.2 : 1}} onClick={() => setActivePage(1)}>🢀🢀  First</button>
            <button className="button" disabled={isDisabled} style={{"opacity": isDisabled ? 0.2 : 1}} onClick={() => setActivePage(activePage-1)}>🢀 Previous</button>
            <button className="button" disabled={isLastDisabled} style={{"opacity": isLastDisabled ? 0.2 : 1}} onClick={() => setActivePage(activePage+1)}>Next 🢂</button>
            <button className="button" disabled={isLastDisabled} style={{"opacity": isLastDisabled ? 0.2 : 1}} onClick={() => setActivePage(totalPages)}>Last 🢂🢂</button>
        </div>
        </>
    )
}
// 搜尋功能
function filterRows(rows, filters) {
    if (_.isEmpty(filters)) return rows

    return rows.filter(row => {
        return Object.keys(filters).every(accessor => {
            const value = row[accessor]
            const searchValue = filters[accessor]

            if (_.isString(value)) {
            return _.toLower(value).includes(_.toLower(searchValue))
            }

            if (_.isBoolean(value)) {
            return (searchValue === "true" && value) || (searchValue === 'false' && !value)
            || (searchValue == true && value) || (searchValue == false && !value)
            }

            if (_.isNumber(value)) {
            return value == searchValue
            }

            return false
        })
    })
}
// 排序功能
function sortRows(rows, sort) {
    return rows.sort((a, b) => {
      const { order, orderBy } = sort
  
      if (_.isNil(a[orderBy])) return 1
      if (_.isNil(b[orderBy])) return -1
  
    //   const aLocale = convertType(a[orderBy])
    //   const bLocale = convertType(b[orderBy])
      const aLocale = (a[orderBy]) + "";
      const bLocale = (b[orderBy]) + "";
  
      if (order === 'asc') {
        return aLocale.localeCompare(bLocale, 'en', { numeric: _.isNumber(b[orderBy]) })
      } else {
        return bLocale.localeCompare(aLocale, 'en', { numeric: _.isNumber(a[orderBy]) })
      }
    })
}

function Table({ columns, rows }){
    const [activePage, setActivePage] = useState(1);
    const [filters, setFilters] = useState({});
    const [sort, setSort] = useState({ order: 'asc', orderBy: 'id' });

    const rowsPerPage = 8;
    // const filteredRows = filterRows(rows, filters)
    // const calculatedRows = filteredRows.slice(
    //   (activePage - 1) * rowsPerPage,
    //   activePage * rowsPerPage
    // )
    const filteredRows = useMemo(() => filterRows(rows, filters), [rows, filters])
    const sortedRows = useMemo(() => sortRows(filteredRows, sort), [filteredRows, sort])
    const calculatedRows = sortedRows.slice(
        (activePage - 1) * rowsPerPage,
        activePage * rowsPerPage
    )
    const count = filteredRows.length;
    const totalPages = Math.ceil(count / rowsPerPage);

    // 搜尋
    const handleSearch = (value, accessor) => {
        
        setActivePage(1)
        
        if (value) {
            setFilters(prevFilters => ({
                ...prevFilters,
                [accessor]: value,
            }))
        } else {
            setFilters(prevFilters => {
                const updatedFilters = { ...prevFilters }
                delete updatedFilters[accessor]
                return updatedFilters
            })
        }
    }

    // 排序
    const handleSort = accessor => {
        setActivePage(1)
        setSort(prevSort => ({
            order: prevSort.order === 'desc' && prevSort.orderBy === accessor ? 'asc' : 'desc',
            orderBy: accessor,
        }))
    }
    
    const Title = useMemo(() => {
        return (
            <tr className="tr">
                {columns.map(column => {
                    return (
                        <th className="th" key={column.accessor}>
                            <span>{column.label}</span>
                        </th>
                    )
                })}
            </tr>
        );
    }, [columns]);
    const FilterInput = useMemo(() => {
        return (
            <tr className="tr">
                {columns.map(column => {
                    return (
                        <th className="th" key={`${column.accessor}-search`}>
                            <label><input
                                className="input"
                                key={`${column.accessor}-search`}
                                type="search"
                                placeholder={`搜尋${column.label}`}
                                value={filters[column.accessor] || ""}
                                onChange={event => handleSearch(event.target.value, column.accessor)}
                            /></label>
                        </th>
                    )
                })}
            </tr>
        );
    }, [columns, filters]);
    const SortBtn = useMemo(() => {
        return (
            <tr className="tr">
                {columns.map(column => {
                    {/* const sortIcon = () => {
                        if (column.accessor === sort.orderBy) {
                            if (sort.order === 'asc') {
                                return '🟢'
                            }
                            return '🔴'
                        } else {
                            return '️⚪'
                        }
                    } */}
                    return (
                        <th className="th" key={`${column.accessor}-search`}>
                            <button className="button" onClick={() => handleSort(column.accessor)}>{
                                (column.accessor === sort.orderBy)
                                    ? (sort.order === 'asc' ? '升序🟢' : '降序🔴') : '️排序⚪'
                            }</button>
                        </th>
                    )
                })}
            </tr>
        );
    }, [columns, sort]);
    const Content = useMemo(() => {
        return (
            <>
                {calculatedRows.map(row => {
                    return (
                    <tr className="tr" key={row.key}>
                        {columns.map(column =>{
                            return (
                                <td className="td" key={column.accessor}>
                                    {(column.format) ? column.format(row[column.accessor]) : row[column.accessor]}
                                </td>
                            )
                        })}
                    </tr>
                    )
                })}
            </>
        )
    }, [columns, calculatedRows]);
    
    return (
        <>
            <div style={{ maxHeight:'90%', overflow: 'auto', margin: 0 }}>
                <table className="table">
                    <thead className="thead">
                        {Title}
                        {FilterInput}
                        {SortBtn}
                    </thead>
                    <tbody>
                        {Content}
                    </tbody>
                </table>
            </div>
            <Pagination
                activePage={activePage}
                count={count}
                rowsPerPage={rowsPerPage}
                totalPages={totalPages}
                setActivePage={setActivePage}
            />
        </>
    )
}

export default Table;