import Button from "../../UI/Button/Button";
import Modal from "../../UI/Modal/Modal";

function confirmModal({ handleCloseModal, handleConfirmExit }) {
    return (
        <Modal onClose={handleCloseModal}>
            <h3>Are you sure you want to quit the room?</h3>
            <div style={{ display: "flex", gap: "12px" }}>
                <Button type="danger" onClick={handleConfirmExit}>
                    Yes
                </Button>
                <Button type="cancel" onClick={handleCloseModal}>
                    Cancel
                </Button>
            </div>
        </Modal>
    );
}

export default confirmModal;
