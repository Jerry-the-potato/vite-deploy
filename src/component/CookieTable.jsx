import { useEffect, useState } from 'react';
import Table from './Table.jsx'
function CookieTable(){
    const [tableData, setTableData] = useState([]);
    const columns = [
        { accessor: 'price', label: '售價' },
        { accessor: 'name', label: '品名' },
        { accessor: 'onsale', label: '在架上', format: value => (value ? '✔️' : '  ') },
        { accessor: 'tag', label: '標籤' },
        { accessor: 'rate', label: '顧客評價' },
    ]
    const rows = tableData.map((data, index) => {
        // return data; 需要ID作為Table取得key的手段
        return {url: data.url, id: index, price: data.price, name: data.name, onsale: data.onsale, tag: data.tag, rate: data.rate}
    })
    useEffect(()=>{
        const newTableData = tableData.concat([
            { id: 1, price: '50', name: "potatochip 洋芋片", onsale: true, tag: 'salty crispy delicious', rate: '⭐️⭐️⭐️⭐️' },
            { id: 2, price: '30', name: "chocolate 巧克力", onsale: false, tag: 'sweet rich smooth', rate: '⭐️⭐️⭐️⭐️⭐️' },
            { id: 3, price: '25', name: "biscuit 餅乾", onsale: true, tag: 'crunchy light buttery', rate: '⭐️' },
            { id: 4, price: '60', name: "nuts 堅果", onsale: true, tag: 'healthy crunchy tasty', rate: '⭐️⭐️⭐️⭐️' },
            { id: 5, price: '35', name: "driedfruit 果乾", onsale: false, tag: 'sweet chewy fruity', rate: '⭐️⭐️⭐️' },
            { id: 6, price: '40', name: "candy 糖果", onsale: true, tag: 'sweet colorful chewy', rate: '⭐️⭐️⭐️⭐️' },
            { id: 7, price: '55', name: "popcorn 爆米花", onsale: false, tag: 'salty sweet crispy', rate: '⭐️⭐️⭐️⭐️' },
            { id: 8, price: '45', name: "beefjerky 牛肉乾", onsale: true, tag: 'savory chewy spicy', rate: '⭐️⭐️⭐️⭐️⭐️' },
            { id: 9, price: '20', name: "jelly 果凍", onsale: false, tag: 'sweet fruity soft', rate: '⭐️⭐️⭐️' },
            { id: 10, price: '28', name: "cracker 薄脆餅", onsale: true, tag: 'light crispy savory', rate: '⭐️⭐️⭐️' },
            { id: 11, price: '32', name: "cookies 曲奇餅", onsale: false, tag: 'sweet buttery soft', rate: '⭐️⭐️⭐️⭐️' },
            { id: 12, price: '38', name: "seaweed 海苔", onsale: true, tag: 'salty crispy healthy', rate: '⭐️⭐️⭐️⭐️' },
            { id: 13, price: '22', name: "mints 薄荷糖", onsale: false, tag: 'refreshing sweet cool', rate: '⭐️⭐️' },
            { id: 14, price: '42', name: "cerealbar 穀物棒", onsale: true, tag: 'healthy filling crunchy', rate: '⭐️⭐️⭐️⭐️' },
            { id: 15, price: '33', name: "pudding 布丁", onsale: false, tag: 'sweet smooth creamy', rate: '⭐️⭐️⭐️' },
            { id: 16, price: '50', name: "granola 格蘭諾拉", onsale: true, tag: 'crunchy healthy sweet', rate: '⭐️⭐️⭐️⭐️' },
            { id: 17, price: '65', name: "trailmix 綜合果仁", onsale: false, tag: 'savory sweet healthy', rate: '⭐️⭐️⭐️⭐️' },
            { id: 18, price: '36', name: "fruitchips 果片", onsale: true, tag: 'crunchy fruity sweet', rate: '⭐️⭐️' },
            { id: 19, price: '58', name: "caramelpopcorn 焦糖爆米花", onsale: false, tag: 'sweet crispy rich', rate: '⭐️⭐️⭐️⭐️' },
            { id: 20, price: '48', name: "yogurt 雪酪", onsale: true, tag: 'creamy tangy sweet', rate: '⭐️⭐️⭐️⭐️' }
        ])
        setTableData(newTableData);
    }, [])
    return <section className="section" id="cookie">
            <Table columns={columns} rows={rows}/>
        </section>
}

export default CookieTable;