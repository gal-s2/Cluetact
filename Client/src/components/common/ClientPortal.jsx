import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ClientPortal({ children }) {
    const [container, setContainer] = useState(null);

    useEffect(() => {
        const el = document.createElement("div");
        el.setAttribute("data-portal-root", "");
        document.body.appendChild(el);
        setContainer(el);
        return () => {
            try {
                document.body.removeChild(el);
            } catch {}
        };
    }, []);

    if (!container) return null;
    return createPortal(children, container);
}
