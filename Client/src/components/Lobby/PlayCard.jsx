import DropdownCard from "./DropdownCard";

function PlayCard({ playMenuOpen, setPlayMenuOpen, findGame, setShowJoinModal, handleCreateRoom }) {
    const menuItems = [
        { label: "Find Game", onClick: findGame },
        { label: "Join Room", onClick: setShowJoinModal },
        { label: "Create Room", onClick: handleCreateRoom },
    ];

    return <DropdownCard isOpen={playMenuOpen} setIsOpen={setPlayMenuOpen} buttonLabel="Play" menuItems={menuItems} />;
}

export default PlayCard;
