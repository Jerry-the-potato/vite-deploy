import { useEffect, useState } from 'react';
import axios from 'axios';
import Table from './Table.jsx'
function CookieTable(){
    const [tableData, setTableData] = useState([]);
    const [rows, setRows] = useState([]);
    const columns = [
        { accessor: 'price', label: '售價' },
        { accessor: 'name', label: '品名' },
        { accessor: 'onsale', label: '在架上', format: value => (value ? '✔️' : '  ') },
        { accessor: 'tag', label: '標籤' },
        { accessor: 'rate', label: '顧客評價' },
        { accessor: 'expiryDate', label: '有效期限' },
        { accessor: 'category', label: '類別' },
        { accessor: 'stock', label: '庫存' },
    ]
    useEffect(() => {
        axios.get('http://localhost:3000/cookie')
            .then(response => {
                const cookie = response.data.cookie;
                setTableData(cookie);
            })
            .catch(error => {
                console.error('Error gathering data:', error);
            });
    }, []);
    useEffect(()=>{
        const newTableData = tableData.concat([
            { id: 1, name: "potatochip 洋芋片", price: '50', onsale: true, tag: 'salty crispy delicious', rate: '⭐️⭐️⭐️⭐️', expiryDate: '2025-01-01', category: 'snack', stock: 100 },
            { id: 2, name: "chocolate 巧克力", price: '30', onsale: false, tag: 'sweet rich smooth', rate: '⭐️⭐️⭐️⭐️⭐️', expiryDate: '2024-12-15', category: 'dessert', stock: 150 },
            { id: 3, name: "biscuit 餅乾", price: '25', onsale: true, tag: 'crunchy light buttery', rate: '⭐️', expiryDate: '2024-11-30', category: 'snack', stock: 200 },
            { id: 4, name: "nuts 堅果", price: '60', onsale: true, tag: 'healthy crunchy tasty', rate: '⭐️⭐️⭐️⭐️', expiryDate: '2025-03-01', category: 'snack', stock: 180 },
            { id: 5, name: "driedfruit 果乾", price: '35', onsale: false, tag: 'sweet chewy fruity', rate: '⭐️⭐️⭐️', expiryDate: '2025-01-20', category: 'snack', stock: 220 },
            { id: 6, name: "candy 糖果", price: '40', onsale: true, tag: 'sweet colorful chewy', rate: '⭐️⭐️⭐️⭐️', expiryDate: '2024-10-05', category: 'dessert', stock: 250 },
            { id: 7, name: "popcorn 爆米花", price: '55', onsale: false, tag: 'salty sweet crispy', rate: '⭐️⭐️⭐️⭐️', expiryDate: '2024-09-15', category: 'snack', stock: 80 },
            { id: 8, name: "beefjerky 牛肉乾", price: '45', onsale: true, tag: 'savory chewy spicy', rate: '⭐️⭐️⭐️⭐️⭐️', expiryDate: '2024-11-10', category: 'snack', stock: 90 },
            { id: 9, name: "jelly 果凍", price: '20', onsale: false, tag: 'sweet fruity soft', rate: '⭐️⭐️⭐️', expiryDate: '2025-02-05', category: 'dessert', stock: 300 },
            { id: 10, name: "cracker 薄脆餅", price: '28', onsale: true, tag: 'light crispy savory', rate: '⭐️⭐️⭐️', expiryDate: '2025-01-15', category: 'snack', stock: 120 },
            { id: 11, name: "cookies 曲奇餅", price: '32', onsale: false, tag: 'sweet buttery soft', rate: '⭐️⭐️⭐️⭐️', expiryDate: '2024-12-20', category: 'dessert', stock: 170 },
            { id: 12, name: "seaweed 海苔", price: '38', onsale: true, tag: 'salty crispy healthy', rate: '⭐️⭐️⭐️⭐️', expiryDate: '2025-04-01', category: 'snack', stock: 140 },
            { id: 13, name: "mints 薄荷糖", price: '22', onsale: false, tag: 'refreshing sweet cool', rate: '⭐️⭐️', expiryDate: '2025-06-05', category: 'candy', stock: 160 },
            { id: 14, name: "cerealbar 穀物棒", price: '42', onsale: true, tag: 'healthy filling crunchy', rate: '⭐️⭐️⭐️⭐️', expiryDate: '2025-03-25', category: 'snack', stock: 130 },
            { id: 15, name: "pudding 布丁", price: '33', onsale: false, tag: 'sweet smooth creamy', rate: '⭐️⭐️⭐️', expiryDate: '2025-02-01', category: 'dessert', stock: 180 },
            { id: 16, name: "granola 格蘭諾拉", price: '50', onsale: true, tag: 'crunchy healthy sweet', rate: '⭐️⭐️⭐️⭐️', expiryDate: '2025-03-10', category: 'snack', stock: 90 },
            { id: 17, name: "trailmix 綜合果仁", price: '65', onsale: false, tag: 'savory sweet healthy', rate: '⭐️⭐️⭐️⭐️', expiryDate: '2025-01-25', category: 'snack', stock: 100 },
            { id: 18, name: "fruitchips 果片", price: '36', onsale: true, tag: 'crunchy fruity sweet', rate: '⭐️⭐️', expiryDate: '2024-09-30', category: 'snack', stock: 70 },
            { id: 19, name: "caramelpopcorn 焦糖爆米花", price: '58', onsale: false, tag: 'sweet crispy rich', rate: '⭐️⭐️⭐️⭐️', expiryDate: '2025-05-01', category: 'snack', stock: 200 },
            { id: 20, name: "yogurt 雪酪", price: '48', onsale: true, tag: 'creamy tangy sweet', rate: '⭐️⭐️⭐️⭐️', expiryDate: '2024-12-05', category: 'dessert', stock: 110 },
            { id: 21, name: "mochi 麻糬", price: '70', onsale: true, tag: 'chewy sweet soft', rate: '⭐️⭐️⭐️⭐️⭐️', expiryDate: '2024-10-01', category: 'dessert', stock: 150 },
            { id: 22, name: "ricecracker 米餅", price: '29', onsale: false, tag: 'crunchy salty light', rate: '⭐️⭐️⭐️', expiryDate: '2025-01-10', category: 'snack', stock: 200 },
            { id: 23, name: "energybar 能量棒", price: '55', onsale: true, tag: 'filling healthy chewy', rate: '⭐️⭐️⭐️⭐️', expiryDate: '2025-03-20', category: 'snack', stock: 100 }
        ])
        
        const newRows = newTableData.map((data, index) => {
            return { ...data, key: index }
        })
        setRows(newRows);
        
        // axios.post('http://localhost:3000/cookie/bulk', { cookies: newTableData })
        //     .then(response => {
        //         console.log('Data saved:', response.data);
        //     })
        //     .catch(error => {
        //         console.error('Error saving data:', error);
        //     });

    }, [tableData]);
    return <section className="section" id="CookieTable">
            <Table columns={columns} rows={rows}/>
        </section>
}

export default CookieTable;