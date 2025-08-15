export default function Flag({ country = "us", size = 20 }) {
    const lower = country.toLowerCase();
    return <img src={`https://flagcdn.com/w${size}/${lower}.png`} width={size} height={size} alt={`${country}-flag`} style={{ verticalAlign: "middle" }} />;
}
