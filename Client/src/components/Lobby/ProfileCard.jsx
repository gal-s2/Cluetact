import DropdownCard from "./DropdownCard";
import { useUser } from "@contexts/UserContext";

function ProfileCard({ profileMenuOpen, setProfileMenuOpen, disconnect, onNavigateToStats, onNavigateToProfile }) {
    const { user } = useUser();
    const PersonalDetailsMenuOptionString = user.guest === true ? "View & Edit Avatar" : "View & Edit Details";

    const menuItems = [
        { label: "My Stats", onClick: onNavigateToStats },
        { label: PersonalDetailsMenuOptionString, onClick: onNavigateToProfile },
        { label: "Disconnect", onClick: disconnect },
    ];

    return <DropdownCard isOpen={profileMenuOpen} setIsOpen={setProfileMenuOpen} buttonLabel="My Profile" buttonColor="light-green" menuItems={menuItems} />;
}

export default ProfileCard;
