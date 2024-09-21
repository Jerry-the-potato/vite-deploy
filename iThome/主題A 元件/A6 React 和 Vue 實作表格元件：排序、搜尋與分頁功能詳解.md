### 用途

在前端開發中，表格元件（Table）通常是用來展示大量資料的最佳方式。特別是當資料需要被排序、搜尋或分頁顯示時，構建一個高效且可擴展的表格元件變得尤為重要。本文將介紹如何在 React 和 Vue 中實作一個具備排序與搜尋功能的表格元件。
> 之後會實作一個動畫管理員，管理所有section的動畫，我們可以嘗試調閱動畫播放紀錄，來追蹤和分析使用的資源

![https://ithelp.ithome.com.tw/upload/images/20240920/20135197A5brwKb1Jn.jpg](https://ithelp.ithome.com.tw/upload/images/20240920/20135197A5brwKb1Jn.jpg)

### 架構設計
在這個範例中，我們設計了一個名為 CookieTable 的元件，用於展示各類零食的詳細資訊。其資料由一組動態生成的JSON格式構成，搜尋、排序、分頁的功能則由 Table 元件完成：
```
function CookieTable(){
    const [rows, setRows] = useState([]);
    const columns = [
        { accessor: 'price', label: '售價' },
        { accessor: 'name', label: '品名' },
        { accessor: 'onsale', label: '在架上', 
            format: value => (value ? '✔️' : '  ')
        },
        //......
    ]
    //......
    return <section className="section" id="cookie">
            <Table columns={columns} rows={rows}/>
        </section>
}
```
* 表格資料（rows）：存儲每一列的零食資訊，例如名稱、售價、是否上架等。
* 欄位設定（columns）：定義每個欄位的屬性、標籤，以及格式化的方式（如onsale欄位的自訂符號顯示）
* 將參數傳入Table元件 ``` <Table columns={columns} rows={rows}/> ```

資料篩選、排序、分頁是依次進行的，範例中有 23 種餅乾，使用者可以篩選出在架上的 13 種，再進行排序與分頁。

### 搜尋功能實現
搜尋功能允許使用者根據特定欄位的內容來篩選顯示的表格列。filterRows 函數會接收現有的資料列和搜尋條件（filters），並根據條件逐個欄位進行篩選。這裡利用 lodash 來幫我們處理型別檢查和大小寫：
```javascript
function filterRows(rows, filters) {
  if (_.isEmpty(filters)) return rows;
  return rows.filter(row => {
    return Object.keys(filters).every(accessor => {
      const value = row[accessor];
      const searchValue = filters[accessor];
      if (_.isString(value))
        return _.toLower(value).includes(_.toLower(searchValue));
      if (_.isBoolean(value))
        return (searchValue === "true" && value) || (searchValue === "false" && !value);
      if (_.isNumber(value)) return value == searchValue;
        return false;
        });
    });
}
```
* isString：檢查字串是否包含搜尋詞，大小寫都可
* isBoolean：檢查布林值是否符合
* isNumber：檢查數字是否匹配

這樣的搜尋方式允許多欄位同時篩選，不論欄位類型是文字、布林值或數字，都可以靈活處理。
![https://ithelp.ithome.com.tw/upload/images/20240920/20135197XpcjjSlgvI.png](https://ithelp.ithome.com.tw/upload/images/20240920/20135197XpcjjSlgvI.png)

#### 排序功能實現
排序功能使得使用者可以依照任意欄位，升序或降序排列資料列。sortRows 函數負責實現較複雜的排序邏輯：

```javascript
function sortRows(rows, sort) {
    return rows.sort((a, b) => {
        const { order, orderBy } = sort;
        if (_.isNil(a[orderBy])) return 1;
        if (_.isNil(b[orderBy])) return -1;
        const aLocale = (a[orderBy]) + "";
        const bLocale = (b[orderBy]) + "";
        if (order === 'asc') {
            return aLocale.localeCompare(bLocale, 'en', 
                { numeric: _.isNumber(b[orderBy]) }
            );
        } else {
            return bLocale.localeCompare(aLocale, 'en', 
                { numeric: _.isNumber(a[orderBy]) }
            );
        }
    });
}
```
* 先用 orderBy 取得對應的 accessor
* 再用 order 判斷升序、降序 
* isNil：檢查是否為空值，空值一律往後排
* localeCompare：用於字串比對，支援數字與字串的排序。
* numeric：決定是否將資料作為數字大小比對

> 想了解更多可以看看 mdn 的文件： [localeCompare](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare)

### 分頁功能實現
表格的分頁功能透過 activePage 和每頁顯示資料數量來計算當前頁面應顯示的資料：
```
function Table({ columns, rows }){
    const [activePage, setActivePage] = useState(1);
    const [filters, setFilters] = useState({});
    const [sort, setSort] = useState({ order: 'asc', orderBy: 'id' });
    
    const filteredRows = useMemo(() => filterRows(rows, filters), [rows, filters])
    const sortedRows = useMemo(() => sortRows(filteredRows, sort), [filteredRows, sort])
    
    const rowsPerPage = 8;
    const calculatedRows = sortedRows.slice(
        (activePage - 1) * rowsPerPage,
        activePage * rowsPerPage
    )
    const count = filteredRows.length;
    const totalPages = Math.ceil(count / rowsPerPage);
    // ......
}
```
> 現在我們可以用 calculatedRows 來為表格填入資料了

但是我們還需要 Pagination 元件提供導航，讓使用者快速跳轉頁面。
```
<Pagination
    activePage={activePage}
    count={count}
    rowsPerPage={rowsPerPage}
    totalPages={totalPages}
    setActivePage={setActivePage}
/>
```
> 將狀態渲染 setActivePage 交給 Pagination 元件處理

Pagination 元件可以顯示分頁資訊並提供翻頁按鈕：
```
const Pagination = ({ activePage, count, rowsPerPage, totalPages, setActivePage }) => {
    const beginning = rowsPerPage * (activePage - 1) + 1;
    const end = activePage === totalPages ? count : beginning + rowsPerPage - 1;
    return (
        <>
        <div className="pagination">
            <div className="pagDescription">
                <p>Page {activePage} of {totalPages}</p>
                <p>Rows: {beginning === end ? end : `${beginning} - ${end}`} of {count}</p>
            </div>
            <button onClick={() => setActivePage(1)}>🢀🢀  First</button>
            <button onClick={() => setActivePage(activePage-1)}>🢀 Previous</button>
            <button onClick={() => setActivePage(activePage+1)}>Next 🢂</button>
            <button onClick={() => setActivePage(totalPages)}>Last 🢂🢂</button>
        </div>
        </>
    )
}
```

由於我們不希望跑到第０頁或超出頁面，還要適時地禁用按鈕：
```
<button disabled={activePage === 1}>First</button>
<button disabled={activePage === totalPages}>Last</button>
```

### 讓我們的Table落地！
完成以上大工程後，Table 元件已經具備基本功能，我們終於可以渲染資料了！不過，看到這大家應該也累了吧？讓我們稍作休息，明天再繼續完成渲染的部分。

> 最後的最後

### 附上 Vue 的對應版本

和 React 的片段擺一起比對的話，怕大家看不懂，所以全部放一起，邏輯是相同的：
```
const props = defineProps({
    rows: Array,
    columns: Array
});

const activePage = ref(1);
const filters = ref({});
const sort = ref({ order: 'asc', orderBy: 'id' });

const rowsPerPage = 8;
const filteredRows = computed(() => filterRows(props.rows, filters.value));
const sortedRows = computed(() => sortRows(filteredRows.value, sort.value));
const calculatedRows = computed(() => sortedRows.value.slice(
    (activePage.value - 1) * rowsPerPage,
    activePage.value * rowsPerPage
));
const count = computed(() => filteredRows.value.length);
const totalPages = computed(() => Math.ceil(count.value / rowsPerPage));
```

要向子元件傳遞函式，通過 emit 傳遞頁面更新，這邊取名為 update:activePage
```
<Pagination 
    @update:activePage="(page) => {activePage.value = page;}"
    :activePage="activePage"
    :rowsPerPage="rowsPerPage"
    :count="count"
    :totalPages="totalPages"
/>
```

然後就要在子元件中設置 emit，並使用相同名稱，相比 React 複雜了一丟丟：
```
const props = defineProps({
    activePage: Number,
    count: Number,
    rowsPerPage: Number,
    totalPages: Number,
});
const emit = defineEmits(['update:activePage']);
const setActivePage = (page) => {
    emit('update:activePage', page);
    console.log(props.rowsPerPage, props.activePage);
};
```

### 結語
表格元件真的是大工程哪！相較之下，我會推薦用 Vue，因為他有強大的 v-for 指令可以用，下一篇我們就會看出差異囉！

如果感興趣，可以參考 Github 上的原始碼：
[Table.jsx](https://github.com/Jerry-the-potato/vite-deploy/blob/main/src/component/Table.jsx)
[Table.vue](https://github.com/Jerry-the-potato/vite-vue/blob/main/src/components/Table.vue)
[Pagination.vue](https://github.com/Jerry-the-potato/vite-vue/blob/main/src/components/Pagination.vue)