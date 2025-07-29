import Modal from "../../UI/Modal/Modal";

export default function DisconnectedPopup() {
    return (
        <Modal>
            <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                <h2 className="text-xl font-semibold mb-2">Connection Lost</h2>
                <p className="text-gray-600">Trying to reconnect...</p>
            </div>
        </Modal>
    );
}
