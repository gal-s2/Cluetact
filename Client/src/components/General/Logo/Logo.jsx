import logo from "@assets/Cluetact.jpeg";

export default function Logo({ className = "", ...props }) {
    return <img src={logo} alt="Cluetact Logo" className={className} {...props} />;
}
