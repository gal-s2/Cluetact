import useConnectionStatus from "@hooks/useConnectionStatus";
import DisconnectedPopup from "../../General/DisconnectModal/DisconnectModal";

export default function SocketPageWrapper({ children }) {
    const isDisconnected = useConnectionStatus();

    return (
        <>
            {isDisconnected && <DisconnectedPopup />}
            {children}
        </>
    );
}
