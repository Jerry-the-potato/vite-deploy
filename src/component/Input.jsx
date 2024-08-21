
export default function Input({text, type, id, value}){
    return <>
        <label className="label">{text}<input type={type} id={id} defaultValue={value}></input></label>
    </>
}