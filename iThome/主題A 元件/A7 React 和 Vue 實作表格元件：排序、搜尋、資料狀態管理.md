### 前言
此篇接續上篇：
[A6 React 和 Vue 實作表格元件：排序、搜尋與分頁功能詳解](https://ithelp.ithome.com.tw/articles/10354654)

### 靜態資料 columns

```javascript
const columns = [
    { accessor: 'price', label: '售價' },
    { accessor: 'name', label: '品名' },
    { accessor: 'onsale', label: '在架上', format: value => (value ? '✔️' : '  ') },
    //......
]
```

### 動態資料 rows

跟後端要資料：

```jsx
const [tableData, setTableData] = useState([]);
useEffect(() => {
    axios.get('http://url/api')
        .then(response => {
            const cookie = response.data.cookie;
            setTableData(cookie);
        })
        .catch(error => {
            console.error('Error gathering data:', error);
        });
}, []);
```

也可以繼續填充其他資料，進行拼接：

```jsx
const [rows, setRows] = useState([]);
useEffect(()=>{
    const newTableData = tableData.concat([
        { 
            id: 1, 
            name: "potatochip 洋芋片",
            price: '50',
            onsale: true,
            tag: 'salty crispy delicious',
            rate: '⭐️⭐️⭐️⭐️',
            expiryDate: '2025-01-01',
            category: 'snack',
            stock: 100 
        },
        { 
            id: 2, 
            name: "chocolate 巧克力" 
            //......
        },
        //......
    ])

    const newRows = newTableData.map((data, index) => {
        return { ...data, key: index }
    })
    setRows(newRows);
}, [tableData]);
```

> 最後為每筆資料添加 key 值

## React

為了讓模板盡量簡潔，我們可以分類，將標題、搜尋、排序、內容分開撰寫，直接的做法就是用組件的形式：
```jsx
<div style={{ overflow: 'auto' }}>
    <table className="table">
        <thead className="thead">
            <Title/>
            <FilterInput/>
            <SortBtn/>
        </thead>
        <tbody>
            <Content/>
        </tbody>
    </table>
</div>
```

但是這實際上會有一些問題，首先，我們渲染的對象分別有 column 和 row，在更新表格資料時 column 作為架構是不變的，只有 row 會影響內容，這就表示會浪費資源重複渲染一樣的內容。
> 更嚴重的是，搜尋功能會出bug！由於input重新渲染，使用者每輸入一個字就被強制失焦。

### useMemo
幸好，有 useMemo 來幫我們解決問題！例如，我希望標題是根據 column 來決定是否重新渲染：
```jsx
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
```

將模板作為變數儲存，useMemo 會幫你檢查 columns 是否更新，就能避免重新渲染。接著就能把 Table 元件改成以下形式：

```jsx
<div style={{ overflow: 'auto' }}>
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
```

### 搜尋元件－狀態處理
還記得昨天完成的排序和搜尋功能嗎？我們用到以下兩個參數來管理狀態：
```jsx
const [filters, setFilters] = useState({});
const [sort, setSort] = useState({ order: 'asc', orderBy: 'id' });
```
首先，我們實作搜尋元件的狀態管理：
```jsx
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
```
* filters 是一個物件，儲存每一欄搜尋的值
* onChange 觸發搜尋事件，用來更新 filters 狀態

在這裡，我們檢查是否有值，來決定加入或刪除搜尋項：
```jsx
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
```
* 新增：運用展開運算子 ...prevFilters 複製物件，然後覆蓋指定的 accessor
* 刪除：同樣地，複製物件後使用 delete 刪除指定屬性，達到清除搜尋條件的效果


### 排序元件－狀態處理
在這部分，我們同樣需要進行狀態管理，以實現排序功能：
```jsx
const SortBtn = useMemo(() => {
    return (
        <tr className="tr">
            {columns.map(column => {
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
```
* sort.orderBy：判斷排序的對象
* sort.order：決定升序或降序
* onClick 觸發排序事件

在這裡，我們將表格設定為第一頁，並指定新的排序對象：
```jsx
const handleSort = accessor => {
    setActivePage(1)
    setSort(prevSort => ({
        order: prevSort.order === 'desc' && prevSort.orderBy === accessor ? 'asc' : 'desc',
        orderBy: accessor,
    }))
}
```
> 如果排序對象相同（使用者點擊兩次），就改成升序排列

### 內容
最後的收尾，讓我們把內容完成吧！昨天我們經過搜尋、排序、分頁一系列操作後，得到了 calculatedRows，用來它渲染：
```jsx
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
```
* 伏筆回收！只要在 column 對應的欄位設置 format，就可以用來格式化資料，以符號或其他形式輸出，避免列出 true、false 等使用者看不懂的字眼囉！

## Vue

恭喜大家撐過以上嵌套地獄，輕鬆的要來啦！Vue 完全可以直接寫在 v-for 模板裡：
```vue
<template>
    <div style="overflow: auto; margin: 0">
        <table class="table">
            <thead>
                <tr>
                    <th v-for="column in columns" :key="column.accessor">{{ column.label }}</th>
                </tr>
                <tr>
                    <th v-for="column in columns" :key="column.accessor">
                        <label><input
                            class="input"
                            :key="'${column.accessor}-search'"
                            type="search"
                            :placeholder="`搜尋${column.label}`"
                            :value="filters[column.accessor] || ''"
                            @input="handleSearch($event.target.value, column.accessor)"
                        /></label>
                    </th>
                </tr>
                <tr>
                    <th v-for="column in columns" :key="column.accessor">
                        <button @click="handleSort(column.accessor)">{{ (column.accessor === sort.orderBy) ? ((sort.order === 'asc') ? '升序🟢': '降序🔴') : '️排序⚪'}}</button>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in calculatedRows" :key="row.id">
                    <td v-for="column in columns" :key="column">{{ (column.format) ? column.format(row[column.accessor]) : row[column.accessor] }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
```
很短吧！而且可讀性還蠻高的，接下來的邏輯和 React 完全一致，結合昨天的內容，這樣讓狀態管理就輕鬆解決拉！

### 總結

恭喜大家！透過本文學習了在 React 和 Vue 中實現一個完整的表格元件，並且具備排序、搜尋和分頁的功能，實作過程中也經歷了許多的挑戰，但最終獲得了成果。

如果感興趣，可以參考 Github 上的原始碼：
[Table.jsx](https://github.com/Jerry-the-potato/vite-deploy/blob/main/src/component/Table.jsx)
[Table.vue](https://github.com/Jerry-the-potato/vite-vue/blob/main/src/components/Table.vue)
[Pagination.vue](https://github.com/Jerry-the-potato/vite-vue/blob/main/src/components/Pagination.vue)

若對本文有興趣或有疑問，歡迎隨時提問喔！