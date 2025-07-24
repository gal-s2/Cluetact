export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            style={{
                textAlign: "center",
                padding: "0.5rem",
                fontSize: "0.85rem",
                color: "#888",
                borderTop: "1px solid #eee",
                background: "#fafafa",
                marginTop: "auto",
            }}
        >
            <p style={{ margin: 0 }}>© {currentYear} Cluetact. All rights reserved.</p>
        </footer>
    );
}
