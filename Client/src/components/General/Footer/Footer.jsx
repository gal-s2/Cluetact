export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "20px",
                textAlign: "center",
                padding: "0.5rem",
                fontSize: "0.85rem",
                color: "#888",
                borderTop: "1px solid #eee",
                background: "#fafafa",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <p style={{ margin: 0 }}>© {currentYear} Cluetact. All rights reserved.</p>
        </footer>
    );
}
