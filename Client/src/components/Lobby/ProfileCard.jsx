import DropdownCard from "./DropdownCard";
import { useUser } from "@contexts/UserContext";
import { useNavigate } from "react-router-dom";

function ProfileCard({ profileMenuOpen, setProfileMenuOpen, disconnect }) {
    const { user } = useUser();
    const navigate = useNavigate();

    const PersonalDetailsMenuOptionString = user.guest === true ? "View & Edit Avatar" : "View & Edit Details";

    const menuItems = [
        { label: "My Stats", onClick: () => navigate("/stats") },
        { label: "Leaderboard", onClick: () => navigate("/leaderboard") },
        { label: PersonalDetailsMenuOptionString, onClick: () => navigate("/profile") },
        { label: "Disconnect", onClick: disconnect },
    ];

    return <DropdownCard isOpen={profileMenuOpen} setIsOpen={setProfileMenuOpen} buttonLabel="My Profile" buttonColor="light-green" menuItems={menuItems} />;
}

export default ProfileCard;
